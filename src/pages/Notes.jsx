import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  IconButton
} from '@mui/material';
import { 
  NoteAdd as NoteAddIcon, 
  Search as SearchIcon,
  SortByAlpha as SortIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNotes } from '../contexts/NotesContext';
import { useWeb3 } from '../contexts/Web3Context';
import NoteCard from '../components/NoteCard';

export default function Notes() {
  const { notes, loading, error: notesError, loadNotes, clearError } = useNotes();
  const { error: web3Error, isContractValid } = useWeb3();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
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

  // Load notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        await loadNotes();
      } catch (err) {
        setLocalError(`Failed to load notes: ${err.message || 'Unknown error'}`);
      }
    };
    
    if (isContractValid) {
      fetchNotes();
    }
  }, [loadNotes, isContractValid]);

  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort notes by title
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Clear error handler
  const handleClearError = () => {
    setLocalError(null);
    if (clearError) clearError();
  };
  
  // Don't show notes page at all if contract is invalid
  if (!isContractValid) {
    return null; // Let the main App component handle this case
  }

  return (
    <Box sx={{ pt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#fff', fontWeight: 'bold' }}>
          My Notes
        </Typography>
        <Button 
          component={RouterLink} 
          to="/notes/new" 
          variant="contained" 
          startIcon={<NoteAddIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          New Note
        </Button>
      </Box>
      
      {displayError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClearError}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {displayError}
        </Alert>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          backgroundColor: '#1e1e1e',
          borderRadius: 2,
          border: '1px solid #333'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#999' }} />
                </InputAdornment>
              ),
              sx: { 
                backgroundColor: '#252525', 
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#444',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#666',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#90caf9',
                },
                color: '#fff'
              }
            }}
          />
          <Button 
            variant="outlined" 
            onClick={toggleSortOrder}
            startIcon={<SortIcon />}
            sx={{ 
              minWidth: 130, 
              height: 56, 
              borderColor: '#444',
              color: '#90caf9',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#666',
                backgroundColor: '#252525'
              }
            }}
          >
            Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Button>
        </Box>
      </Paper>
      
      {loading && notes.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {sortedNotes.length > 0 ? (
            <Grid container spacing={3}>
              {sortedNotes.map(note => (
                <Grid item xs={12} sm={6} md={4} key={note.id}>
                  <NoteCard note={note} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card sx={{ backgroundColor: '#252525', border: '1px dashed #444' }}>
              <CardActionArea component={RouterLink} to="/notes/new">
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <NoteAddIcon sx={{ fontSize: 80, color: '#666', mb: 2 }} />
                  {searchTerm ? (
                    <>
                      <Typography variant="h6" component="p" sx={{ color: '#bbb' }}>
                        No notes match your search
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                        Try a different search term or clear the search
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" component="p" sx={{ color: '#bbb' }}>
                        You don't have any notes yet
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                        Click here to create your first note
                      </Typography>
                    </>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          )}
        </>
      )}
      
      {loading && notes.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
} 