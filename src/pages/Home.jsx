import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Divider,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import { 
  NoteAdd as NoteAddIcon, 
  Notes as NotesIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useNotes } from '../contexts/NotesContext';
import { useWeb3 } from '../contexts/Web3Context';
import NoteCard from '../components/NoteCard';

export default function Home() {
  const { notes, loadNotes } = useNotes();
  const { account, networkName } = useWeb3();
  
  // Get the latest 3 notes
  const recentNotes = notes.slice(0, 3);
  
  useEffect(() => {
    loadNotes();
  }, []);

  // Abbreviate the wallet address for display
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box sx={{ pt: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ color: '#90caf9', fontWeight: 'bold', mb: 2 }}>
          Welcome to ETH Notes
        </Typography>
        <Typography variant="h6" sx={{ color: '#aaa', mb: 3 }}>
          Your decentralized note-taking app powered by Ethereum
        </Typography>
        <Button 
          component={RouterLink} 
          to="/notes/new" 
          variant="contained" 
          size="large"
          startIcon={<NoteAddIcon />}
          sx={{ 
            mb: 2,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          Create New Note
        </Button>
      </Box>

      <Divider sx={{ my: 4, backgroundColor: '#333' }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              backgroundColor: '#1e1e1e',
              borderRadius: 2,
              border: '1px solid #333'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WalletIcon sx={{ color: '#90caf9', mr: 1, fontSize: 28 }} />
              <Typography variant="h6" component="h2" sx={{ color: '#fff' }}>
                Wallet Info
              </Typography>
            </Box>
            <Divider sx={{ my: 2, backgroundColor: '#333' }} />
            <Typography variant="body1" sx={{ color: '#ddd', mb: 1 }}>
              <strong>Address:</strong> {shortenAddress(account)}
            </Typography>
            <Typography variant="body1" sx={{ color: '#ddd', mb: 2 }}>
              <strong>Network:</strong> {networkName}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              backgroundColor: '#1e1e1e',
              borderRadius: 2,
              border: '1px solid #333'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NotesIcon sx={{ color: '#90caf9', mr: 1, fontSize: 28 }} />
                <Typography variant="h6" component="h2" sx={{ color: '#fff' }}>
                  Recent Notes
                </Typography>
              </Box>
              <Button 
                component={RouterLink} 
                to="/notes" 
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none', borderColor: '#666', color: '#90caf9' }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ my: 2, backgroundColor: '#333' }} />
            
            {recentNotes.length > 0 ? (
              <Grid container spacing={2}>
                {recentNotes.map(note => (
                  <Grid item xs={12} sm={6} md={4} key={note.id}>
                    <NoteCard note={note} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Card sx={{ backgroundColor: '#252525', border: '1px dashed #444' }}>
                <CardActionArea component={RouterLink} to="/notes/new">
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <NoteAddIcon sx={{ fontSize: 60, color: '#666', mb: 2 }} />
                    <Typography variant="h6" component="p" sx={{ color: '#bbb' }}>
                      You don't have any notes yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
                      Click here to create your first note
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 