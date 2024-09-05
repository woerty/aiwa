import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Card, CardContent } from '@mui/material';

axios.defaults.withCredentials = true;

function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [apiKey, setApiKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://wodv.de:5000/api/user-info')
      .then((response) => {
        setApiKey(response.data.api_key);
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
    } catch (error) {
      console.error('Error sending prompt:', error);
    }
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Submit Prompt
        </Button>
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
  );
}

export default Dashboard;
