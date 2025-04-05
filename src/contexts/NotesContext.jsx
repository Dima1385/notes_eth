import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';

const NotesContext = createContext();

export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  const { notesContract, account, signer, isContractValid, error: web3Error } = useWeb3();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => {
    setError(null);
  };

  const loadNotes = async () => {
    if (!notesContract || !account || !isContractValid) {
      if (!isContractValid) {
        return;
      }
      return;
    }
    
    try {
      setLoading(true);
      clearError();
      
      const noteIds = await notesContract.getUserNotes();
      
      const notesData = await Promise.all(
        noteIds.map(async (id) => {
          try {
            const [title, content] = await notesContract.getNote(id);
            return {
              id: id.toString(),
              title,
              content,
            };
          } catch (err) {
            console.error(`Error fetching note ${id}:`, err);
            return null;
          }
        })
      );
      
      setNotes(notesData.filter(note => note !== null));
      setLoading(false);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const createNote = async (title) => {
    if (!notesContract || !signer || !isContractValid) {
      setError('Contract is not accessible. Please check your network connection.');
      return null;
    }
    
    try {
      setLoading(true);
      clearError();
      
      let createFee;
      try {
        createFee = await notesContract.createNoteFee();
      } catch (feeErr) {
        console.error('Error getting createNoteFee:', feeErr);
        setError('Failed to get creation fee. The contract may not be accessible on this network.');
        setLoading(false);
        return null;
      }
      
      const tx = await notesContract.createNote(title, { value: createFee });
      
      const receipt = await tx.wait();
      
      const event = receipt.events.find(e => e.event === 'NoteCreated');
      if (event) {
        const noteId = event.args.noteId.toString();
        
        const newNote = {
          id: noteId,
          title,
          content: '',
        };
        
        setNotes(prevNotes => [...prevNotes, newNote]);
        setLoading(false);
        return noteId;
      }
      
      setLoading(false);
      return null;
    } catch (err) {
      console.error('Error creating note:', err);
      setError(err.message || 'Failed to create note');
      setLoading(false);
      return null;
    }
  };

  const saveNote = async (noteId, content) => {
    if (!notesContract || !signer || !isContractValid) {
      setError('Contract is not accessible. Please check your network connection.');
      return false;
    }
    
    try {
      setLoading(true);
      clearError();
      
      let saveFee;
      try {
        saveFee = await notesContract.saveNoteFee();
      } catch (feeErr) {
        console.error('Error getting saveNoteFee:', feeErr);
        setError('Failed to get save fee. The contract may not be accessible on this network.');
        setLoading(false);
        return false;
      }
      
      const tx = await notesContract.saveNote(noteId, content, { value: saveFee });
      
      await tx.wait();
      
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { ...note, content } : note
        )
      );
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err.message || 'Failed to save note');
      setLoading(false);
      return false;
    }
  };

  const startEditNote = async (noteId) => {
    if (!notesContract || !signer || !isContractValid) {
      setError('Contract is not accessible. Please check your network connection.');
      return false;
    }
    
    try {
      setLoading(true);
      clearError();
      
      let editFee;
      try {
        editFee = await notesContract.editNoteFee();
      } catch (feeErr) {
        console.error('Error getting editNoteFee:', feeErr);
        setError('Failed to get edit fee. The contract may not be accessible on this network.');
        setLoading(false);
        return false;
      }
      
      const tx = await notesContract.startEditNote(noteId, { value: editFee });
      
      await tx.wait();
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error starting note edit:', err);
      setError(err.message || 'Failed to start editing note');
      setLoading(false);
      return false;
    }
  };

  const saveEditedNote = async (noteId, title, content) => {
    if (!notesContract || !signer || !isContractValid) {
      setError('Contract is not accessible. Please check your network connection.');
      return false;
    }
    
    try {
      setLoading(true);
      clearError();
      
      let saveEditFee;
      try {
        saveEditFee = await notesContract.saveEditFee();
      } catch (feeErr) {
        console.error('Error getting saveEditFee:', feeErr);
        setError('Failed to get save edit fee. The contract may not be accessible on this network.');
        setLoading(false);
        return false;
      }
      
      const tx = await notesContract.saveEditedNote(noteId, title, content, { value: saveEditFee });
      
      await tx.wait();
      
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === noteId ? { ...note, title, content } : note
        )
      );
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error saving edited note:', err);
      setError(err.message || 'Failed to save edited note');
      setLoading(false);
      return false;
    }
  };

  const deleteNote = async (noteId) => {
    if (!notesContract || !signer) return false;
    
    try {
      setLoading(true);
      clearError();
      
      const tx = await notesContract.deleteNote(noteId);
      
      await tx.wait();
      
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err.message || 'Failed to delete note');
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (account && notesContract && isContractValid) {
      loadNotes();
    } else {
      setNotes([]);
    }
  }, [account, notesContract, isContractValid]);
  
  useEffect(() => {
    if (web3Error) {
      clearError();
    }
  }, [web3Error]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,
        clearError,
        loadNotes,
        createNote,
        saveNote,
        startEditNote,
        saveEditedNote,
        deleteNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export default NotesContext; 