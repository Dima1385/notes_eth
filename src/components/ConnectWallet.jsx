import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { 
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';

export default function ConnectWallet() {
  const { connectWallet, loading, error } = useWeb3();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [network, setNetwork] = useState('sepolia'); // Default to Sepolia testnet

  const handleConnect = async (walletType) => {
    setSelectedWallet(walletType);
    
    try {
      // First check if we need to request network switch
      if (window.ethereum) {
        const networkParams = getNetworkParams(network);
        if (networkParams) {
          try {
            // Try to switch to the network
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: networkParams.chainId }],
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [networkParams],
                });
              } catch (addError) {
                console.error('Error adding network:', addError);
              }
            }
          }
        }
      }
      
      // Now connect the wallet
      await connectWallet(walletType);
    } catch (err) {
      console.error('Error during wallet connection process:', err);
    }
  };

  // Get network parameters for different networks
  const getNetworkParams = (networkName) => {
    switch(networkName) {
      case 'sepolia':
        return {
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'SEP',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        };
      case 'goerli':
        return {
          chainId: '0x5',
          chainName: 'Goerli Testnet',
          nativeCurrency: {
            name: 'Goerli Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://goerli.infura.io/v3/'],
          blockExplorerUrls: ['https://goerli.etherscan.io']
        };
      default:
        return null;
    }
  };

  const handleNetworkChange = (event) => {
    setNetwork(event.target.value);
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="network-select-label" sx={{ color: '#bbb' }}>Network</InputLabel>
            <Select
              labelId="network-select-label"
              id="network-select"
              value={network}
              label="Network"
              onChange={handleNetworkChange}
              sx={{ 
                backgroundColor: '#252525',
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#444',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#666',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#90caf9',
                },
                '& .MuiSvgIcon-root': {
                  color: '#999',
                }
              }}
            >
              <MenuItem value="sepolia">Sepolia Testnet</MenuItem>
              <MenuItem value="goerli">Goerli Testnet</MenuItem>
            </Select>
            <FormHelperText sx={{ color: '#aaa' }}>Select the network where the contract is deployed</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
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
            {loading && selectedWallet === 'metamask' ? (
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
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Divider sx={{ flexGrow: 1, backgroundColor: '#333' }} />
            <Typography variant="body2" sx={{ mx: 2, color: '#999' }}>OR</Typography>
            <Divider sx={{ flexGrow: 1, backgroundColor: '#333' }} />
          </Box>
        </Grid>
        
        <Grid item xs={12}>
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
            {loading && selectedWallet === 'rabby' ? (
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
        </Grid>
      </Grid>
      
      <Alert severity="info" sx={{ mt: 3 }}>
        Make sure you're using test ETH. This app is configured to work with testnet networks only.
      </Alert>
      
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#999' }}>
        By connecting, you agree to the terms and conditions
      </Typography>
    </Paper>
  );
} 