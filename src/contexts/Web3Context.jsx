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

  // Contract address - this should be updated with the actual deployed contract address
  const CONTRACT_ADDRESS = '0xa131AD247055FD2e2aA8b156A11bdEc81b9eAD95'; // Replace with actual address after deployment

  // Initialize ethers provider and contract
  async function initializeEthers() {
    if (window.ethereum || window.rabby) {
      try {
        setLoading(true);
        
        // Use the available provider
        const provider = new ethers.providers.Web3Provider(window.ethereum || window.rabby);
        setProvider(provider);
        
        // Get the network name
        const network = await provider.getNetwork();
        setNetworkName(network.name);

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
          setError('Unable to connect to the Notes contract. Make sure you are on the correct network.');
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
      setError(null);

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
          setError('Contract not accessible. Please check if you are on the correct network where the contract is deployed.');
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
        disconnectWallet
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context; 