import React from 'react';
import { Button, Grid } from '@mui/material';
import API_BASE_URL from '../../hooks/apiConfig';

function PromptButtons({ handleSubmit, handleSavePrompt }) {
  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          fullWidth
        >
          Submit Prompt
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          onClick={handleSavePrompt}
          variant="outlined"
          color="secondary"
          fullWidth
        >
          Save Prompt
        </Button>
      </Grid>
    </Grid>
  );
}

export default PromptButtons;
