import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';

function PromptsList({ prompts, onDelete, onLoad }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Saved Prompts
      </Typography>
      {prompts.length > 0 ? (
        prompts.map((prompt) => (
          <Card key={prompt.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="body1">
                {prompt.prompt_text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Saved at: {new Date(prompt.timestamp).toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mr: 1 }}
                  onClick={() => onLoad(prompt.prompt_text)}
                >
                  Load
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => onDelete(prompt.id)}
                >
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>No saved prompts yet.</Typography>
      )}
    </Box>
  );
}

export default PromptsList;
