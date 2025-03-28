import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NotesContractABI from '../contracts/NotesContractABI.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [notesContract, setNotesContract] = useState(null);
  const [networkName, setNetworkName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isContractValid, setIsContractValid] = useState(false);
  const [requiredNetwork, setRequiredNetwork] = useState(null);

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Contract address - this should be updated with the actual deployed contract address
  const CONTRACT_ADDRESS = '0xa131AD247055FD2e2aA8b156A11bdEc81b9eAD95'; // Replace with actual address after deployment

  // Networks where the contract might be deployed
  const supportedNetworks = [
    {
      name: 'Sepolia',
      chainId: '0xaa36a7',
      chainIdDecimal: 11155111,
      chainName: 'Sepolia Testnet',
      nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'SEP',
        decimals: 18
      },
      rpcUrls: ['https://sepolia.infura.io/v3/'],
      blockExplorerUrls: ['https://sepolia.etherscan.io']
    },
    {
      name: 'Goerli',
      chainId: '0x5',
      chainIdDecimal: 5,
      chainName: 'Goerli Testnet',
      nativeCurrency: {
        name: 'Goerli Ether',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://goerli.infura.io/v3/'],
      blockExplorerUrls: ['https://goerli.etherscan.io']
    }
  ];

  // Detect which network the contract is deployed on
  const detectContractNetwork = async () => {
    for (const network of supportedNetworks) {
      try {
        // Create a provider for the network
        const networkProvider = new ethers.providers.JsonRpcProvider(network.rpcUrls[0]);
        
        // Check if contract exists on this network
        const code = await networkProvider.getCode(CONTRACT_ADDRESS);
        
        // If code length > 2 ('0x'), contract exists on this network
        if (code.length > 2) {
          console.log(`Contract found on ${network.name} network`);
          setRequiredNetwork(network);
          return network;
        }
      } catch (err) {
        console.error(`Error checking contract on ${network.name}:`, err);
      }
    }
    
    // If we get here, contract wasn't found on any network
    console.error("Contract not found on any supported network");
    return null;
  };

  // Switch to a specific network
  const switchToNetwork = async (targetNetwork) => {
    if (!window.ethereum) return false;
    
    try {
      setLoading(true);
      clearError();
      
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
      
      setLoading(false);
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetNetwork.chainId,
              chainName: targetNetwork.chainName,
              nativeCurrency: targetNetwork.nativeCurrency,
              rpcUrls: targetNetwork.rpcUrls,
              blockExplorerUrls: targetNetwork.blockExplorerUrls
            }],
          });
          setLoading(false);
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          setError(`Unable to add ${targetNetwork.name} network to your wallet. Try adding it manually.`);
          setLoading(false);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      setError(`Unable to switch to ${targetNetwork.name} network. Try switching manually in your wallet.`);
      setLoading(false);
      return false;
    }
  };

  // Initialize ethers provider and contract
  async function initializeEthers() {
    if (window.ethereum || window.rabby) {
      try {
        setLoading(true);
        clearError();
        
        // Use the available provider
        const provider = new ethers.providers.Web3Provider(window.ethereum || window.rabby);
        setProvider(provider);
        
        // Get the network details
        const network = await provider.getNetwork();
        setNetworkName(network.name);
        
        // Detect which network the contract is on
        const contractNetwork = await detectContractNetwork();
        
        // Create contract instance
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NotesContractABI,
          provider
        );
        
        // Verify if contract is valid by calling a method
        try {
          await contract.getUserNotes();
          setIsContractValid(true);
        } catch (contractErr) {
          console.error('Contract validation failed:', contractErr);
          
          // Check if we're on the wrong network and should show the prompt
          if (contractNetwork && network.chainId !== contractNetwork.chainIdDecimal) {
            setError(`Contract is deployed on ${contractNetwork.name} network. Please switch your network.`);
          } else {
            setError('Unable to connect to the Notes contract. Make sure you are on the correct network.');
          }
          
          setIsContractValid(false);
        }
        
        setNotesContract(contract);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize ethers', err);
        setError('Failed to connect to the blockchain');
        setLoading(false);
      }
    } else {
      setError('Please install MetaMask or Rabby to use this app');
    }
  }

  // Connect wallet
  async function connectWallet(walletType = 'metamask') {
    try {
      setLoading(true);
      clearError();

      // Determine which provider to use
      const selectedProvider = walletType === 'rabby' ? window.rabby : window.ethereum;
      
      if (!selectedProvider) {
        throw new Error(`${walletType === 'rabby' ? 'Rabby' : 'MetaMask'} is not installed`);
      }
      
      // Request account access
      const accounts = await selectedProvider.request({ method: 'eth_requestAccounts' });
      
      // Get the connected account
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        // Update provider and signer
        const provider = new ethers.providers.Web3Provider(selectedProvider);
        setProvider(provider);
        
        const signer = provider.getSigner();
        setSigner(signer);
        
        // Update contract with signer
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NotesContractABI,
          signer
        );
        
        // Verify if contract is valid by calling a method
        try {
          await contract.getUserNotes();
          setIsContractValid(true);
        } catch (contractErr) {
          console.error('Contract validation failed:', contractErr);
          
          // Get the current network
          const network = await provider.getNetwork();
          
          // If we have detected the contract network, prompt to switch
          if (requiredNetwork && network.chainId !== requiredNetwork.chainIdDecimal) {
            setError(`Contract is deployed on ${requiredNetwork.name} network. Please switch your network.`);
          } else {
            setError('Contract not accessible. Please check if you are on the correct network where the contract is deployed.');
          }
          
          setIsContractValid(false);
        }
        
        setNotesContract(contract);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      setLoading(false);
    }
  }

  // Handle network switch request
  const handleSwitchNetwork = async () => {
    if (requiredNetwork) {
      setLoading(true);
      const success = await switchToNetwork(requiredNetwork);
      if (success) {
        // Reload the page to reinitialize with the new network
        window.location.reload();
      } else {
        setError(`Failed to switch to ${requiredNetwork.name} network. Please try manually switching in your wallet.`);
      }
      setLoading(false);
    }
  };

  // Disconnect wallet
  function disconnectWallet() {
    setAccount(null);
    setSigner(null);
    // We keep the provider for reconnection
  }

  // Handle account changes
  useEffect(() => {
    function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
      } else if (accounts[0] !== account) {
        // User switched accounts
        setAccount(accounts[0]);
      }
    }

    function handleChainChanged() {
      window.location.reload();
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  // Initialize on load
  useEffect(() => {
    initializeEthers();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        notesContract,
        networkName,
        loading,
        error,
        isContractValid,
        connectWallet,
        disconnectWallet,
        requiredNetwork,
        handleSwitchNetwork,
        clearError
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context; 