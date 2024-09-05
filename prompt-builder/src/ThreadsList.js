import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, List, ListItem, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function ThreadsList({ onSelectThread, onDeleteThread }) {
  const [threads, setThreads] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  useEffect(() => {
    axios.get('http://wodv.de:5000/get_threads')
      .then((response) => setThreads(response.data))
      .catch((error) => console.error('Error fetching threads:', error));
  }, []);

  const handleCreateThread = () => {
    if (newThreadTitle.trim() === '') return;
    
    axios.post('http://wodv.de:5000/create_thread', { title: newThreadTitle })
      .then((response) => {
        setThreads([...threads, { id: response.data.thread_id, title: newThreadTitle }]);
        setNewThreadTitle('');
      })
      .catch((error) => console.error('Error creating thread:', error));
  };

  const handleDeleteThread = (threadId) => {
    axios.delete(`http://wodv.de:5000/delete_thread/${threadId}`)
      .then(() => {
        setThreads(threads.filter((thread) => thread.id !== threadId));
        onDeleteThread(threadId); // Notify parent that the thread was deleted
      })
      .catch((error) => console.error('Error deleting thread:', error));
  };

  return (
    <Box>
      <Typography variant="h6">Threads</Typography>
      <TextField
        label="New Thread Title"
        value={newThreadTitle}
        onChange={(e) => setNewThreadTitle(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleCreateThread} fullWidth>
        Create Thread
      </Button>
      <List>
        {threads.map((thread) => (
          <ListItem
            key={thread.id}
            button
            onClick={() => onSelectThread(thread.id)}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{thread.title}</span>
            <IconButton onClick={() => handleDeleteThread(thread.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default ThreadsList;
