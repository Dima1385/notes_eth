import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Container, Alert, Paper, Typography, Button } from '@mui/material'
import { useWeb3 } from './contexts/Web3Context'
import Sidebar from './components/Sidebar'
import ConnectWallet from './components/ConnectWallet'
import Home from './pages/Home'
import Notes from './pages/Notes'
import NoteEditor from './pages/NoteEditor'

function App() {
  const { account, error, isContractValid } = useWeb3();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {account ? (
        <>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Container maxWidth="xl">
              {!isContractValid && (
                <Alert 
                  severity="error" 
                  variant="filled" 
                  sx={{ 
                    mb: 4, 
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Smart Contract Not Accessible
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    The Notes contract could not be found on this network. Please switch to a network where the contract is deployed.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    color="inherit" 
                    onClick={() => window.location.reload()}
                    sx={{ mt: 1 }}
                  >
                    Refresh Page
                  </Button>
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/notes/new" element={<NoteEditor />} />
                <Route path="/notes/:id" element={<NoteEditor />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </Box>
        </>
      ) : (
        <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ConnectWallet />
        </Container>
      )}
    </Box>
  )
}

export default App 