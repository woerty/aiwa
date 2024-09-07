import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import ThreadsList from './ThreadsList';
import axios from "axios";
import Chat from './Chat';
import SavedPrompts from './SavedPrompts';
import API_BASE_URL from '../../hooks/apiConfig';

axios.defaults.baseURL = API_BASE_URL;

function Dashboard() {
  const [userInfo, setUserInfo] = useState({ username: "", api_key: "" });
  useEffect(() => {
    // Fetch user info from backend
    axios.get("/api/user-info")
      .then(response => {
        setUserInfo(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the user info!", error);
      });
  }, []);

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
        {/*<Typography variant="h4" gutterBottom>
          OpenAI-Key: {userInfo.api_key}
        </Typography>*/}
        {selectedThreadId ? <Chat threadId={selectedThreadId} /> : <p>Please select a thread to start chatting.</p>}
      </Box>
    </Box>
  );
}

export default Dashboard;
