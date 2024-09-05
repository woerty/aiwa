import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextareaAutosize, Button, Box, Typography, Card, CardContent, Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SavedPrompts from './SavedPrompts'; // Import the new component
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon for the "X" button

axios.defaults.withCredentials = true;

function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [prompts, setPrompts] = useState([]); // State to store the list of saved prompts
  const navigate = useNavigate();

  // Fetch the saved prompts
  const fetchPrompts = () => {
    axios.get('http://wodv.de:5000/get_prompts')
      .then((response) => {
        setPrompts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching prompts:', error);
      });
  };

  useEffect(() => {
    axios.get('http://wodv.de:5000/api/user-info')
      .then((response) => {
        setApiKey(response.data.api_key);
        fetchPrompts(); // Fetch prompts on component mount
      })
      .catch((error) => {
        console.error('Error fetching API key:', error);
      });
  }, []);

  const handleLogout = () => {
    axios.post('http://wodv.de:5000/logout')
      .then((response) => {
        if (response.data.success) {
          navigate('/login');
        }
      })
      .catch((error) => {
        console.error('Error during logout:', error);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post('http://wodv.de:5000/submit', {
        prompt,
      });
      setResponse(result.data.response);
      fetchPrompts(); // Fetch prompts after submitting
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
      await axios.post('http://wodv.de:5000/save_prompt', {
        prompt,
      });
      alert("Prompt saved successfully!");
      fetchPrompts(); // Fetch prompts after saving
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      await axios.delete(`http://wodv.de:5000/delete_prompt/${promptId}`);
      alert("Prompt deleted successfully!");
      fetchPrompts(); // Fetch prompts after deleting
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const handleLoadPrompt = (loadedPrompt) => {
    setPrompt(loadedPrompt); // Load the selected prompt into the input field
  };

  const handleClearPrompt = () => {
    setPrompt(''); // Clear the input field
  };

  return (
    <Box sx={{ display: 'flex', p: 4 }}>
      {/* Saved Prompts on the left side */}
      <Box sx={{ width: '25%', mr: 4 }}>
        <SavedPrompts prompts={prompts} onDelete={handleDeletePrompt} onLoad={handleLoadPrompt} />
      </Box>

      {/* Main content (input form) */}
      <Box sx={{ width: '75%' }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Your OpenAI API Key</Typography>
            <Typography>{apiKey}</Typography>
          </CardContent>
        </Card>
        <form onSubmit={handleSubmit}>
          <Box sx={{ position: 'relative' }}>
            <TextareaAutosize
              aria-label="Enter your prompt"
              minRows={1}
              maxRows={10} // Dynamically grow up to 10 rows
              placeholder="Enter your prompt"
              style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', borderColor: 'rgba(0, 0, 0, 0.23)' }}
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
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button
                type="submit"
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
        </form>
        {response && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6">Response from OpenAI</Typography>
              <Typography>{response}</Typography>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handleLogout}
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mt: 4 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default Dashboard;
