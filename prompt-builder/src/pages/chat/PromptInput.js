import React from 'react';
import { TextareaAutosize, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import API_BASE_URL from '../../hooks/apiConfig';

function PromptInput({ prompt, setPrompt, handleClearPrompt }) {
  return (
    <Box sx={{ position: 'relative' }}>
      <TextareaAutosize
        aria-label="Enter your prompt"
        minRows={1}
        maxRows={10}
        placeholder="Enter your prompt"
        style={{
          width: '100%',
          padding: '10px',
          paddingRight: '40px', // Leave space for the "X" button
          fontSize: '16px',
          borderRadius: '4px',
          borderColor: 'rgba(0, 0, 0, 0.23)',
          resize: 'none', // Disable manual resizing
        }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        required
      />
      {prompt && (
        <IconButton
          onClick={handleClearPrompt}
          sx={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
}

export default PromptInput;
