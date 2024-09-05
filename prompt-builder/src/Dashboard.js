import React, { useState } from 'react';
import { Box } from '@mui/material';
import ThreadsList from './ThreadsList';
import Chat from './Chat';
import SavedPrompts from './SavedPrompts';
import API_BASE_URL from './apiConfig';

function Dashboard() {
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  const handleSelectThread = (threadId) => {
    setSelectedThreadId(threadId);
  };

  const handleDeleteThread = (deletedThreadId) => {
    // Wenn der gelöschte Thread der ausgewählte Thread ist, setze den ausgewählten Thread auf null
    if (deletedThreadId === selectedThreadId) {
      setSelectedThreadId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', p: 4 }}>
      {/* Left section: Threads and Saved Prompts */}
      <Box sx={{ width: '25%', mr: 4 }}>
        <ThreadsList onSelectThread={handleSelectThread} onDeleteThread={handleDeleteThread} />
        <SavedPrompts />
      </Box>

      {/* Right section: Chat */}
      <Box sx={{ width: '75%' }}>
        {selectedThreadId ? <Chat threadId={selectedThreadId} /> : <p>Please select a thread to start chatting.</p>}
      </Box>
    </Box>
  );
}

export default Dashboard;
