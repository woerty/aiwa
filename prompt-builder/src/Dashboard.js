import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SavedPrompts from './SavedPrompts'; // Import the new component

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
      //alert("Prompt saved successfully!");
      fetchPrompts(); // Fetch prompts after saving
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const handleDeletePrompt = async (promptId) => {
    try {
      await axios.delete(`http://wodv.de:5000/delete_prompt/${promptId}`);
      //alert("Prompt deleted successfully!");
      fetchPrompts(); // Fetch prompts after deleting
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const handleLoadPrompt = (loadedPrompt) => {
    setPrompt(loadedPrompt); // Load the selected prompt into the input field
  };

  return (
    <Box sx={{ p: 4 }}>
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
        <TextField
          label="Enter your prompt"
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
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

      {/* Pass prompts state, handleDeletePrompt, and handleLoadPrompt to SavedPrompts component */}
      <SavedPrompts prompts={prompts} onDelete={handleDeletePrompt} onLoad={handleLoadPrompt} />

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
  );
}

export default Dashboard;
