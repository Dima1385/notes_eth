import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';

export default function ConnectWallet() {
  const { connectWallet, loading, error, clearError, requiredNetwork } = useWeb3();
  const [walletType, setWalletType] = useState('metamask');
  const [localError, setLocalError] = useState(null);
  
  // Determine which error to display (prioritize local over context error)
  const displayError = localError || error;
  
  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (clearError) clearError();
      setLocalError(null);
    };
  }, [clearError]);
  
  const handleConnect = async (type) => {
    try {
      setWalletType(type);
      setLocalError(null);
      await connectWallet(type);
    } catch (err) {
      setLocalError(err.message || 'Error connecting wallet');
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        width: '100%', 
        maxWidth: 450, 
        borderRadius: 2,
        backgroundColor: '#1e1e1e',
        border: '1px solid #333'
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <WalletIcon sx={{ fontSize: 60, color: '#90caf9', mb: 2 }} />
        <Typography variant="h4" component="h1" sx={{ color: '#fff', fontWeight: 'bold' }}>
          Connect Wallet
        </Typography>
        <Typography variant="body1" sx={{ color: '#aaa', mt: 1 }}>
          Connect your wallet to access ETH Notes
        </Typography>
      </Box>

      {displayError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => {
            if (localError) setLocalError(null);
            if (error && clearError) clearError();
          }}
        >
          <AlertTitle>Connection Error</AlertTitle>
          {displayError}
        </Alert>
      )}

      {requiredNetwork && !displayError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Contract detected on {requiredNetwork.name} network
          </Typography>
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={() => handleConnect('metamask')}
        disabled={loading}
        sx={{
          py: 1.5,
          textTransform: 'none',
          borderRadius: 2,
          backgroundColor: '#FF9800',
          '&:hover': {
            backgroundColor: '#F57C00',
          },
        }}
      >
        {loading && walletType === 'metamask' ? (
          <CircularProgress size={24} sx={{ color: '#fff', mr: 1 }} />
        ) : (
          <>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
              alt="MetaMask" 
              width="24" 
              height="24" 
              style={{ marginRight: '10px' }} 
            />
            Connect with MetaMask
          </>
        )}
      </Button>
      
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Divider sx={{ flexGrow: 1, backgroundColor: '#333' }} />
        <Typography variant="body2" sx={{ mx: 2, color: '#999' }}>OR</Typography>
        <Divider sx={{ flexGrow: 1, backgroundColor: '#333' }} />
      </Box>
      
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={() => handleConnect('rabby')}
        disabled={loading}
        sx={{
          py: 1.5,
          textTransform: 'none',
          borderRadius: 2,
          backgroundColor: '#6E56CF',
          '&:hover': {
            backgroundColor: '#5A46AF',
          },
        }}
      >
        {loading && walletType === 'rabby' ? (
          <CircularProgress size={24} sx={{ color: '#fff', mr: 1 }} />
        ) : (
          <>
            <img 
              src="https://rabby.io/assets/logo-sq-ce3387d9.svg" 
              alt="Rabby" 
              width="24" 
              height="24" 
              style={{ marginRight: '10px' }} 
            />
            Connect with Rabby
          </>
        )}
      </Button>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        Make sure you're using test ETH. This app is configured to work with testnet networks only.
      </Alert>
      
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#999' }}>
        By connecting, you agree to the terms and conditions
      </Typography>
    </Paper>
  );
} 