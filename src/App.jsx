import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Container, Alert, AlertTitle, Paper, Typography, Button, CircularProgress } from '@mui/material'
import { useWeb3 } from './contexts/Web3Context'
import Sidebar from './components/Sidebar'
import ConnectWallet from './components/ConnectWallet'
import Home from './pages/Home'
import Notes from './pages/Notes'
import NoteEditor from './pages/NoteEditor'

function App() {
  const { 
    account, 
    error, 
    isContractValid, 
    clearError,
    requiredNetwork,
    handleSwitchNetwork,
    loading
  } = useWeb3();

  // Handle showing contract error - only show if there's no other error
  const showContractError = !isContractValid && !error;
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {account ? (
        <>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Container maxWidth="xl">
              {/* Show contract error only if it's the only error */}
              {showContractError && (
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
                  <AlertTitle>Smart Contract Not Accessible</AlertTitle>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    The Notes contract could not be found on this network. Please switch to a network where the contract is deployed.
                  </Typography>
                  {requiredNetwork && (
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="inherit" 
                      onClick={handleSwitchNetwork}
                      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                      disabled={loading}
                      sx={{ mr: 2, mt: 1 }}
                    >
                      {loading ? 'Switching...' : `Switch to ${requiredNetwork.name}`}
                    </Button>
                  )}
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

              {/* Show Web3 error only if there is one */}
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  onClose={clearError}
                >
                  <AlertTitle>Error</AlertTitle>
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