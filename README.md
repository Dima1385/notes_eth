# ETH Notes - Decentralized Note-Taking App

A decentralized note-taking application powered by Ethereum smart contracts. Store your notes securely on the blockchain with a beautiful and minimalist UI.

## Features

- Create, edit, and delete notes stored on the Ethereum blockchain
- Rich text editor with formatting options
- Dark-themed minimalist UI
- Connect with either MetaMask or Rabby wallet
- Responsive design for all devices

## Smart Contract

The application uses a Solidity smart contract to manage notes with various fees:
- Creating a note: 0.001 ETH
- Saving a note: 0.0005 ETH
- Editing a note: 0.0005 ETH
- Saving an edited note: 0.0005 ETH

## Tech Stack

- **Blockchain**: Ethereum, Solidity
- **Frontend**: React, Vite
- **State Management**: React Context API
- **UI Library**: Material UI
- **Ethereum Integration**: ethers.js
- **Rich Text Editor**: React Quill

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd eth-notes
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Deploy the NotesContract on Ethereum (testnet recommended):
   - Use Remix, Truffle, or Hardhat to deploy the NotesContract.sol
   - Update the CONTRACT_ADDRESS in src/contexts/Web3Context.jsx with your deployed contract address

4. Start the development server:
   ```
   npm run dev
   ```

5. Connect with MetaMask or Rabby wallet to interact with the application

## Building for Production

```
npm run build
```

## Usage

1. Connect your wallet (MetaMask or Rabby)
2. Create a new note (requires a small fee in ETH)
3. Edit your notes with rich text formatting
4. View, manage and organize your notes

## Note

This application is designed to work with test ETH on testnets. Make sure your wallet is connected to the appropriate network (Goerli, Sepolia, etc.). 