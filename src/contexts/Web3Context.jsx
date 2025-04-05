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

  const clearError = () => {
    setError(null);
  };

  const CONTRACT_ADDRESS = '0xa131AD247055FD2e2aA8b156A11bdEc81b9eAD95';

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

  const detectContractNetwork = async () => {
    for (const network of supportedNetworks) {
      try {
        const networkProvider = new ethers.providers.JsonRpcProvider(network.rpcUrls[0]);
        
        const code = await networkProvider.getCode(CONTRACT_ADDRESS);
        
        if (code.length > 2) {
          console.log(`Contract found on ${network.name} network`);
          setRequiredNetwork(network);
          return network;
        }
      } catch (err) {
        console.error(`Error checking contract on ${network.name}:`, err);
      }
    }
    
    console.error("Contract not found on any supported network");
    return null;
  };

  const switchToNetwork = async (targetNetwork) => {
    if (!window.ethereum) return false;
    
    try {
      setLoading(true);
      clearError();
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
      
      setLoading(false);
      return true;
    } catch (switchError) {
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

  async function initializeEthers() {
    if (window.ethereum || window.rabby) {
      try {
        setLoading(true);
        clearError();
        
        const provider = new ethers.providers.Web3Provider(window.ethereum || window.rabby);
        setProvider(provider);
        
        const network = await provider.getNetwork();
        setNetworkName(network.name);
        
        const contractNetwork = await detectContractNetwork();
        
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NotesContractABI,
          provider
        );
        
        try {
          await contract.getUserNotes();
          setIsContractValid(true);
        } catch (contractErr) {
          console.error('Contract validation failed:', contractErr);
          
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

  async function connectWallet(walletType = 'metamask') {
    try {
      setLoading(true);
      clearError();

      const selectedProvider = walletType === 'rabby' ? window.rabby : window.ethereum;
      
      if (!selectedProvider) {
        throw new Error(`${walletType === 'rabby' ? 'Rabby' : 'MetaMask'} is not installed`);
      }
      
      const accounts = await selectedProvider.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const provider = new ethers.providers.Web3Provider(selectedProvider);
        setProvider(provider);
        
        const signer = provider.getSigner();
        setSigner(signer);
        
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NotesContractABI,
          signer
        );
        
        try {
          await contract.getUserNotes();
          setIsContractValid(true);
        } catch (contractErr) {
          console.error('Contract validation failed:', contractErr);
          
          const network = await provider.getNetwork();
          
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

  const handleSwitchNetwork = async () => {
    if (requiredNetwork) {
      setLoading(true);
      const success = await switchToNetwork(requiredNetwork);
      if (success) {
        window.location.reload();
      } else {
        setError(`Failed to switch to ${requiredNetwork.name} network. Please try manually switching in your wallet.`);
      }
      setLoading(false);
    }
  };

  function disconnectWallet() {
    setAccount(null);
    setSigner(null);
  }

  useEffect(() => {
    function handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
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