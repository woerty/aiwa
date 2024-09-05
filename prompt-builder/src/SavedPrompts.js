import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function SavedPrompts({ onLoadPrompt }) {
  const [prompts, setPrompts] = useState([]);

  // Fetch saved prompts when the component mounts
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = () => {
    axios.get('http://wodv.de:5000/get_prompts')
      .then((response) => setPrompts(response.data))
      .catch((error) => console.error('Error fetching saved prompts:', error));
  };

  const handleDeletePrompt = (promptId) => {
    axios.delete(`http://wodv.de:5000/delete_prompt/${promptId}`)
      .then(() => {
        setPrompts(prompts.filter((prompt) => prompt.id !== promptId));
      })
      .catch((error) => console.error('Error deleting prompt:', error));
  };

  const handleLoadPrompt = (promptText) => {
    onLoadPrompt(promptText);  // Load the selected prompt into the Chat input
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Saved Prompts</Typography>
      {prompts.length > 0 ? (
        <List>
          {prompts.map((prompt) => (
            <ListItem
              key={prompt.id}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span onClick={() => handleLoadPrompt(prompt.prompt_text)} style={{ cursor: 'pointer' }}>
                {prompt.prompt_text}
              </span>
              <IconButton onClick={() => handleDeletePrompt(prompt.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No saved prompts yet.</Typography>
      )}
    </Box>
  );
}

export default SavedPrompts;
