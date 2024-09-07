import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PromptInput from './PromptInput';
import PromptButtons from './PromptButtons';
import axios from 'axios';
import API_BASE_URL from '../../hooks/apiConfig';

function PromptDesigner() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    try {
      const result = await axios.post(API_BASE_URL + '/submit', {
        prompt,
      });
      setResponse(result.data.response);
    } catch (error) {
      console.error('Error sending prompt:', error);
    }
  };

  const handleSavePrompt = async () => {
    if (!prompt) {
      alert("Please enter a prompt before saving.");
      return;
    }
    try {
      await axios.post(API_BASE_URL + '/save_prompt', { prompt });
      alert("Prompt saved successfully!");
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Prompt Designer</Typography>
      <PromptInput prompt={prompt} setPrompt={setPrompt} />
      <PromptButtons handleSubmit={handleSubmit} handleSavePrompt={handleSavePrompt} />
      {response && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Response from OpenAI</Typography>
          <Typography>{response}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default PromptDesigner;
