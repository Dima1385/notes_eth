import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNotes } from '../contexts/NotesContext';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

// Custom Quill editor modules
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link',
  'color', 'background'
];

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    notes, 
    loading, 
    error: notesError, 
    clearError,
    createNote, 
    saveNote, 
    startEditNote, 
    saveEditedNote, 
    deleteNote 
  } = useNotes();
  const { 
    notesContract, 
    error: web3Error, 
    isContractValid 
  } = useWeb3();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditMode, setIsEditMode] = useState(id ? false : true);
  const [viewOnly, setViewOnly] = useState(location.state?.viewOnly || false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentFee, setCurrentFee] = useState('0');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  // Determine which error to display (priority: local error, notes error, web3 error if contract is valid)
  const displayError = localError || notesError || (isContractValid ? web3Error : null);
  
  // Clean up errors when component unmounts
  useEffect(() => {
    return () => {
      if (clearError) clearError();
      setLocalError(null);
    };
  }, [clearError]);
  
  // Check if we're editing an existing note or creating a new one
  const isNewNote = !id;
  
  // Find the current note if we're editing
  const currentNote = id ? notes.find(note => note.id === id) : null;

  // Load the note data if we're editing an existing note
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    }
  }, [currentNote]);

  // Get fee amount for the specified action
  const getFeeAmount = async (action) => {
    if (!notesContract) {
      setLocalError('Contract not accessible');
      return '0';
    }
    
    try {
      let fee;
      switch(action) {
        case 'create':
          fee = await notesContract.createNoteFee();
          break;
        case 'save':
          fee = await notesContract.saveNoteFee();
          break;
        case 'edit':
          fee = await notesContract.editNoteFee();
          break;
        case 'saveEdit':
          fee = await notesContract.saveEditFee();
          break;
        default:
          fee = '0';
      }
      
      return ethers.utils.formatEther(fee);
    } catch (err) {
      console.error('Error getting fee:', err);
      setLocalError(`Error getting fee information: ${err.message}`);
      return '0';
    }
  };

  // Handle starting edit mode
  const handleStartEdit = async () => {
    setLocalError(null);
    const fee = await getFeeAmount('edit');
    if (localError) return; // If there was an error getting fee, stop here
    
    setCurrentFee(fee);
    setCurrentAction('edit');
    setFeeDialogOpen(true);
  };

  // Handle confirming edit mode
  const handleConfirmEdit = async () => {
    setFeeDialogOpen(false);
    
    try {
      const success = await startEditNote(id);
      if (success) {
        setIsEditMode(true);
        setSnackbarMessage('Edit mode activated');
        setSnackbarOpen(true);
      } else {
        setLocalError('Failed to enter edit mode');
      }
    } catch (err) {
      setLocalError(`Error: ${err.message || 'Unknown error'}`);
    }
  };

  // Handle saving the note
  const handleSave = async () => {
    if (!title.trim()) {
      setLocalError('Please enter a title');
      return;
    }
    
    setLocalError(null);
    let fee;
    let action;
    
    if (isNewNote) {
      fee = await getFeeAmount('create');
      action = 'create';
    } else if (isEditMode) {
      fee = await getFeeAmount('saveEdit');
      action = 'saveEdit';
    } else {
      fee = await getFeeAmount('save');
      action = 'save';
    }
    
    if (localError) return; // If there was an error getting fee, stop here
    
    setCurrentFee(fee);
    setCurrentAction(action);
    setFeeDialogOpen(true);
  };

  // Handle confirming the save
  const handleConfirmSave = async () => {
    setFeeDialogOpen(false);
    
    try {
      if (isNewNote) {
        // Create a new note
        const noteId = await createNote(title);
        if (noteId) {
          // Save the content
          await saveNote(noteId, content);
          setSnackbarMessage('Note created successfully');
          setSnackbarOpen(true);
          navigate(`/notes/${noteId}`);
        } else {
          setLocalError('Failed to create note');
        }
      } else if (isEditMode) {
        // Save edited note with new title and content
        const success = await saveEditedNote(id, title, content);
        if (success) {
          setIsEditMode(false);
          setSnackbarMessage('Note updated successfully');
          setSnackbarOpen(true);
        } else {
          setLocalError('Failed to update note');
        }
      } else {
        // Just save the content
        const success = await saveNote(id, content);
        if (success) {
          setSnackbarMessage('Note saved successfully');
          setSnackbarOpen(true);
        } else {
          setLocalError('Failed to save note');
        }
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setLocalError(`Error: ${err.message || 'Unknown error'}`);
    }
  };

  // Handle deleting the note
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      const success = await deleteNote(id);
      if (success) {
        setDeleteDialogOpen(false);
        setSnackbarMessage('Note deleted successfully');
        setSnackbarOpen(true);
        navigate('/notes');
      } else {
        setLocalError('Failed to delete note');
      }
    } catch (err) {
      setLocalError(`Error: ${err.message || 'Unknown error'}`);
    }
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };
  
  // Clear local error
  const handleClearError = () => {
    setLocalError(null);
  };

  return (
    <Box sx={{ pt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={handleBack} 
            sx={{ mr: 2, color: '#fff' }}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ color: '#fff', fontWeight: 'bold' }}
          >
            {isNewNote ? 'Create New Note' : (isEditMode ? 'Edit Note' : 'View Note')}
          </Typography>
        </Box>
        
        <Box>
          {!isNewNote && !isEditMode && !viewOnly && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={handleStartEdit}
              sx={{ mr: 2, borderColor: '#444', borderRadius: 2 }}
            >
              Edit
            </Button>
          )}
          
          {!isNewNote && !viewOnly && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              sx={{ mr: 2, borderColor: '#d32f2f', borderRadius: 2 }}
            >
              Delete
            </Button>
          )}
          
          {(isNewNote || isEditMode) && !viewOnly && (
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {loading ? 'Processing...' : 'Save'}
            </Button>
          )}
        </Box>
      </Box>
      
      {displayError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={handleClearError}
        >
          {displayError}
        </Alert>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          border: '1px solid #333'
        }}
      >
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isEditMode && !isNewNote || viewOnly || loading}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#252525',
              '& fieldset': {
                borderColor: '#444',
              },
              '&:hover fieldset': {
                borderColor: '#666',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#90caf9',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#bbb',
            },
            '& .MuiInputBase-input': {
              color: '#fff',
            },
          }}
          InputProps={{
            sx: { borderRadius: 2 }
          }}
        />
        
        <Divider sx={{ my: 2, backgroundColor: '#333' }} />
        
        <Box sx={{ mt: 2 }}>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={quillModules}
            formats={quillFormats}
            readOnly={!isEditMode && !isNewNote || viewOnly || loading}
          />
        </Box>
      </Paper>
      
      {/* Fee confirmation dialog */}
      <Dialog
        open={feeDialogOpen}
        onClose={() => setFeeDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#282828',
            color: '#fff',
            border: '1px solid #333',
          }
        }}
      >
        <DialogTitle sx={{ color: '#90caf9' }}>Confirm Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#ddd' }}>
            This action requires a fee of {currentFee} ETH to be paid.
            {currentAction === 'create' && ' This fee is for creating a new note.'}
            {currentAction === 'save' && ' This fee is for saving note content.'}
            {currentAction === 'edit' && ' This fee is for entering edit mode.'}
            {currentAction === 'saveEdit' && ' This fee is for saving the edited note.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeeDialogOpen(false)} sx={{ color: '#bbb' }}>Cancel</Button>
          <Button 
            onClick={currentAction === 'edit' ? handleConfirmEdit : handleConfirmSave} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Pay & Continue'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#282828',
            color: '#fff',
            border: '1px solid #333',
          }
        }}
      >
        <DialogTitle sx={{ color: '#f44336' }}>Delete Note</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#ddd' }}>
            Are you sure you want to delete this note? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#bbb' }}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Backdrop for loading state */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading && !feeDialogOpen && !deleteDialogOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
} 