import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  IconButton, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNotes } from '../contexts/NotesContext';

export default function NoteCard({ note }) {
  const navigate = useNavigate();
  const { deleteNote } = useNotes();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Strip HTML tags for preview
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };
  
  const noteContent = stripHtml(note.content || '');
  const previewContent = noteContent.substring(0, 100) + (noteContent.length > 100 ? '...' : '');
  
  const handleEdit = () => {
    navigate(`/notes/${note.id}`);
  };
  
  const handleView = () => {
    navigate(`/notes/${note.id}`, { state: { viewOnly: true } });
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    await deleteNote(note.id);
    setDeleteDialogOpen(false);
  };
  
  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          border: '1px solid #333',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
            border: '1px solid #555',
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" sx={{ color: '#90caf9', mb: 1, fontWeight: 'bold' }}>
            {note.title}
          </Typography>
          <Divider sx={{ my: 1, backgroundColor: '#333' }} />
          <Typography variant="body2" sx={{ color: '#bbb', mt: 2 }}>
            {previewContent || 'No content yet'}
          </Typography>
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: 'flex-end', p: 1, backgroundColor: '#252525' }}>
          <Box>
            <IconButton 
              aria-label="view" 
              onClick={handleView}
              sx={{ color: '#9575cd' }}
            >
              <ViewIcon />
            </IconButton>
            <IconButton 
              aria-label="edit" 
              onClick={handleEdit}
              sx={{ color: '#4fc3f7' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              aria-label="delete" 
              onClick={handleDeleteClick}
              sx={{ color: '#ef5350' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </CardActions>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
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
            Are you sure you want to delete "{note.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: '#bbb' }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 