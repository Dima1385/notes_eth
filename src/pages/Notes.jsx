import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  CircularProgress, 
  Alert, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon 
} from '@mui/icons-material';
import { useNotes } from '../contexts/NotesContext';
import { useWeb3 } from '../contexts/Web3Context';

export default function Notes() {
  const { notes, loading, error: notesError, deleteNote, loadUserNotes, clearError } = useNotes();
  const { error: web3Error, isContractValid } = useWeb3();
  const [localError, setLocalError] = useState(null);
  
  // Use only one error source - prioritize local errors, then notes errors, then web3 errors
  const error = localError || (isContractValid ? notesError : null) || (isContractValid ? web3Error : null);
  
  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      setLocalError(null);
    };
  }, [clearError]);
  
  const handleDelete = async (id, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
      } catch (err) {
        setLocalError(`Failed to delete note: ${err.message || 'Unknown error'}`);
      }
    }
  };
  
  if (!isContractValid) {
    return null; // Don't show notes if contract is not valid - App.jsx will show appropriate message
  }

  if (loading && notes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Your Notes
        </Typography>
        
        <Button
          component={Link}
          to="/notes/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          New Note
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setLocalError(null)}
        >
          {error}
        </Alert>
      )}
      
      {notes.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            You don't have any notes yet
          </Typography>
          <Button
            component={Link}
            to="/notes/new"
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
          >
            Create Your First Note
          </Button>
        </Box>
      ) : (
        <List sx={{ width: '100%' }}>
          {notes.map((note) => (
            <React.Fragment key={note.id}>
              <ListItem 
                component={Link} 
                to={`/notes/${note.id}`}
                sx={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={note.title}
                  secondary={note.content ? note.content.substring(0, 60) + (note.content.length > 60 ? '...' : '') : 'No content'}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    component={Link} 
                    to={`/notes/${note.id}`}
                    color="primary" 
                    aria-label="view"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    component={Link} 
                    to={`/notes/${note.id}`}
                    state={{ edit: true }}
                    color="secondary" 
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={(e) => handleDelete(note.id, e)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
      
      {loading && notes.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Paper>
  );
} 