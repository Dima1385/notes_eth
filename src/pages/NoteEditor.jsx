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
  DialogActions,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon
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
    createNote, 
    saveNote, 
    startEditNote, 
    saveEditedNote, 
    deleteNote,
    loading,
    error: notesError,
    clearError: clearNotesError
  } = useNotes();
  const { isContractValid, error: web3Error } = useWeb3();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editMode, setEditMode] = useState(id ? false : true);
  const [viewOnly, setViewOnly] = useState(location.state?.viewOnly || false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentFee, setCurrentFee] = useState('0');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feesInfo, setFeesInfo] = useState({
    createFee: '',
    saveFee: '',
    editFee: '',
    saveEditFee: ''
  });

  // Single error handling for the component
  const error = errorMessage || notesError || web3Error;
  
  // Handle errors from context or local state
  useEffect(() => {
    if (notesError) {
      setErrorMessage(notesError);
    } else if (web3Error && isContractValid) {
      setErrorMessage(web3Error);
    }
  }, [notesError, web3Error, isContractValid]);

  // Find the note if we're editing an existing one
  useEffect(() => {
    if (id && notes.length > 0) {
      const note = notes.find(note => note.id === parseInt(id));
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      }
    }
  }, [id, notes]);

  // Clear any error when component unmounts
  useEffect(() => {
    return () => {
      clearNotesError();
      setErrorMessage('');
    };
  }, [clearNotesError]);

  // Format fee amounts for display
  const formatFee = (feeInEth) => {
    return `${feeInEth} ETH`;
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a title for your note');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      
      if (!id) {
        // Creating a new note
        await createNote(title);
        navigate('/notes');
      } else if (editMode) {
        // Saving edits
        await saveEditedNote(parseInt(id), title, content);
        setEditMode(false);
      } else {
        // Just saving content
        await saveNote(parseInt(id), content);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setErrorMessage(error.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      await startEditNote(parseInt(id));
      setEditMode(true);
    } catch (error) {
      console.error('Error starting edit:', error);
      setErrorMessage(error.message || 'Failed to enter edit mode');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        setSaving(true);
        setErrorMessage('');
        await deleteNote(parseInt(id));
        navigate('/notes');
      } catch (error) {
        console.error('Error deleting note:', error);
        setErrorMessage(error.message || 'Failed to delete note');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/notes');
  };

  const isNew = !id;
  const pageTitle = isNew ? 'Create New Note' : (editMode ? 'Edit Note' : 'View Note');
  const actionText = isNew ? 'Create' : (editMode ? 'Save Changes' : 'Save');

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
            {pageTitle}
          </Typography>
        </Box>
        
        <Box>
          {!isNew && !editMode && !viewOnly && (
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
          
          {!isNew && !viewOnly && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{ mr: 2, borderColor: '#d32f2f', borderRadius: 2 }}
            >
              Delete
            </Button>
          )}
          
          {(isNew || editMode) && !viewOnly && (
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || (isNew && !title) || (!isNew && !editMode && content === notes.find(n => n.id === parseInt(id))?.content)}
              sx={{ borderRadius: 2 }}
            >
              {saving ? 'Processing...' : actionText}
            </Button>
          )}
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
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
          onChange={handleTitleChange}
          disabled={!isNew && !editMode || saving}
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
            onChange={handleContentChange}
            modules={quillModules}
            formats={quillFormats}
            readOnly={!editMode && !isNew || viewOnly}
          />
        </Box>
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Divider>
          <Chip 
            icon={<InfoIcon />} 
            label="Transaction Fees" 
            variant="outlined" 
          />
        </Divider>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Tooltip title="Fee for creating a new note">
            <Chip 
              label={`Create: ${formatFee('0.00001')}`}
              variant="outlined"
              color="primary"
            />
          </Tooltip>
          
          <Tooltip title="Fee for saving content">
            <Chip 
              label={`Save: ${formatFee('0.00001')}`}
              variant="outlined"
              color="primary"
            />
          </Tooltip>
          
          <Tooltip title="Fee for starting edit mode">
            <Chip 
              label={`Edit: ${formatFee('0.00001')}`} 
              variant="outlined"
              color="primary"
            />
          </Tooltip>
          
          <Tooltip title="Fee for saving edited note">
            <Chip 
              label={`Save Edits: ${formatFee('0.00001')}`}
              variant="outlined"
              color="primary"
            />
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
} 