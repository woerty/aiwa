import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, List, ListItem, ListItemText, IconButton, Grid2, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import MessageList from './MessageList'; // Import the MessageList component

function WorkflowDesigner({ loadedWorkflow }) {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [serverFiles, setServerFiles] = useState([]);
  const [messages, setMessages] = useState([]); // State for the messages

  useEffect(() => {
    if (loadedWorkflow) {
      setWorkflowName(loadedWorkflow.name);
      setWorkflowDescription(loadedWorkflow.description);
      setSteps(JSON.parse(loadedWorkflow.steps));
    }
    fetchServerFiles();
  }, [loadedWorkflow]);

  const fetchServerFiles = async () => {
    try {
      const response = await axios.get('http://wodv.de:5000/list_files');
      setServerFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleAddStep = () => {
    if (currentStep.trim()) {
      setSteps([...steps, currentStep]);
      setCurrentStep('');
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setIsLoading(true);
      const response = await axios.post('http://wodv.de:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedFiles([...uploadedFiles, { name: selectedFile.name, path: response.data.file_path }]);
      setSelectedFile(null);
      alert('File uploaded successfully!');
      fetchServerFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFileFromList = (fileName) => {
    setUploadedFiles(uploadedFiles.filter(file => file.name !== fileName));
  };
  const handleDeleteFile = async (filename) => {
    try {
      await axios.post('http://wodv.de:5000/delete_file', { filename });
      alert('File deleted successfully!');
      fetchServerFiles(); // Refresh the server files list
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://wodv.de:5000/process', {
        steps,
        file_path: uploadedFiles.length > 0 ? uploadedFiles[0].path : '',
      });

      const newMessages = [];
      steps.forEach((step, index) => {
        newMessages.push({ sender: 'user', text: `${step}` });
        newMessages.push({ sender: 'assistant', text: `${response.data.results[index]}` });
      });

      setMessages([...messages, ...newMessages]); // Add the new messages to the message list
      setResults(response.data.results);
    } catch (error) {
      console.error('Error submitting workflow:', error);
    }
    setIsLoading(false);
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim() || steps.length === 0) {
      alert("Please provide a name and at least one step.");
      return;
    }

    try {
      await axios.post('http://wodv.de:5000/create_workflow', {
        name: workflowName,
        description: workflowDescription,
        steps: JSON.stringify(steps),
      });
      alert("Workflow saved successfully!");
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  return (
    <Grid2 container spacing={4}>
      {/* Left Column */}



      {/* Right Column */}
      <Grid2 item xs={12} md={8}>
        {/* Message List Section */}

        {/* Workflow Steps */}<Grid2 item xs={12} md={8}>
          {/* Steps Section */}
          <Paper sx={{ padding: 2, mb: 4 }}>
            <Typography variant="h6">Workflow Steps</Typography>
            {steps.map((step, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  value={step}
                  onChange={(e) => {
                    const updatedSteps = [...steps];
                    updatedSteps[index] = e.target.value;
                    setSteps(updatedSteps);
                  }}
                  label={`Step ${index + 1}`}
                  variant="outlined"
                />
              </Box>
            ))}
            <TextField
              fullWidth
              value={currentStep}
              onChange={(e) => setCurrentStep(e.target.value)}
              label="New Step"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Grid2 container spacing={2}>
              <Button variant="contained" onClick={handleAddStep}>
                Add Step
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : "Run! 🚀"}
              </Button>
            </Grid2>

          </Paper>

          <Paper sx={{ padding: 2, mb: 4 }}>
            <Typography variant="h6">Messages</Typography>
            <MessageList messages={messages} /> {/* Display the list of messages */}
          </Paper>
        </Grid2>


        <Grid2 item xs={12} md={4}>
          {/* File Upload Section */}
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">Upload a File</Typography>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label htmlFor="fileInput">
              <Button variant="contained" component="span">
                Select File
              </Button>
            </label>
            <Button
              variant="contained"
              onClick={handleFileUpload}
              sx={{ ml: 2 }}
              disabled={!selectedFile}
            >
              Upload File
            </Button>

            {/* Display list of files on server */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Files on Server:</Typography>
              <List>
                {serverFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={file} />
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file)}>
                      <DeleteIcon />
                    </IconButton>
                    <Button variant="contained" onClick={() => setUploadedFiles([...uploadedFiles, { name: file, path: `uploads/${file}` }])} sx={{ ml: 2 }}>
                      Add to Workflow
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Display list of uploaded files */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Uploaded Files:</Typography>
              <List>
                {uploadedFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={file.name} />
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFileFromList(file.name)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid2>

      </Grid2>
      <Grid2 item xs={12} md={4}>
        {/* Workflow details */}
        <Paper sx={{
          padding: 2, mb: 4
        }}>
          <Typography variant="h6">Workflow Information</Typography>
          <TextField
            fullWidth
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            label="Workflow Name"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            label="Description"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="secondary" onClick={handleSaveWorkflow}>
            Save Workflow
          </Button>
        </Paper>
      </Grid2>
    </Grid2>
  );
}

export default WorkflowDesigner;
