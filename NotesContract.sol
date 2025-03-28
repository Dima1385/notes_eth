// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NotesContract {
    struct Note {
        string title;
        string content;
        bool exists;
    }
    
    // Mapping from user address to array of note IDs
    mapping(address => uint[]) private userNotes;
    // Mapping from note ID to Note
    mapping(uint => Note) private notes;
    // Mapping from note ID to owner address
    mapping(uint => address) private noteOwners;
    
    uint private nextNoteId = 1;
    
    // Fees (in wei)
    uint public createNoteFee = 0.00001 ether;
    uint public saveNoteFee = 0.00001 ether;
    uint public editNoteFee = 0.00001 ether;
    uint public saveEditFee = 0.00001 ether;
    
    event NoteCreated(uint noteId, address owner);
    event NoteSaved(uint noteId);
    event NoteEdited(uint noteId);
    event NoteDeleted(uint noteId);
    
    // Payable constructor to allow receiving ETH when deploying
    constructor() payable {}
    
    modifier onlyNoteOwner(uint _noteId) {
        require(noteOwners[_noteId] == msg.sender, "Not the note owner");
        _;
    }
    
    function createNote(string memory _title) external payable returns (uint) {
        require(msg.value >= createNoteFee, "Insufficient fee for creating note");
        
        uint noteId = nextNoteId++;
        notes[noteId] = Note(_title, "", true);
        noteOwners[noteId] = msg.sender;
        userNotes[msg.sender].push(noteId);
        
        emit NoteCreated(noteId, msg.sender);
        return noteId;
    }
    
    function saveNote(uint _noteId, string memory _content) external payable onlyNoteOwner(_noteId) {
        require(msg.value >= saveNoteFee, "Insufficient fee for saving note");
        require(notes[_noteId].exists, "Note does not exist");
        
        notes[_noteId].content = _content;
        
        emit NoteSaved(_noteId);
    }
    
    function startEditNote(uint _noteId) external payable onlyNoteOwner(_noteId) {
        require(msg.value >= editNoteFee, "Insufficient fee for editing note");
        require(notes[_noteId].exists, "Note does not exist");
        
        emit NoteEdited(_noteId);
    }
    
    function saveEditedNote(uint _noteId, string memory _title, string memory _content) external payable onlyNoteOwner(_noteId) {
        require(msg.value >= saveEditFee, "Insufficient fee for saving edited note");
        require(notes[_noteId].exists, "Note does not exist");
        
        notes[_noteId].title = _title;
        notes[_noteId].content = _content;
        
        emit NoteSaved(_noteId);
    }
    
    function deleteNote(uint _noteId) external onlyNoteOwner(_noteId) {
        require(notes[_noteId].exists, "Note does not exist");
        
        notes[_noteId].exists = false;
        
        emit NoteDeleted(_noteId);
    }
    
    function getUserNotes() external view returns (uint[] memory) {
        return userNotes[msg.sender];
    }
    
    function getNote(uint _noteId) external view onlyNoteOwner(_noteId) returns (string memory, string memory) {
        require(notes[_noteId].exists, "Note does not exist");
        return (notes[_noteId].title, notes[_noteId].content);
    }
} 