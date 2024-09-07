import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Paper, List, ListItem, ListItemText, IconButton, Grid2 } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import StepsSection from './StepsSection';
import WorkflowVisualization from './WorkflowVisualization';
import MessageList from './MessageList'; // Assuming you have a message list component

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
  const [messages, setMessages] = useState([]);

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
      setSteps([
        ...steps,
        { text: currentStep, outputId: `output-${steps.length + 1}`, inputs: [] }
      ]);
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
      // Prepare the steps and file paths for submission
      const filePath = uploadedFiles.length > 0 ? uploadedFiles[0].path : '';

      // Send the workflow steps and file path to the backend
      const response = await axios.post('http://wodv.de:5000/process', {
        steps,
        file_path: filePath,
      });

      // Add each step and its corresponding result to the message list
      const newMessages = [];
      steps.forEach((step, index) => {
        newMessages.push({ sender: 'user', text: step.text });
        if (response.data.results[index]) {
          newMessages.push({ sender: 'assistant', text: response.data.results[index] });
        }
      });

      setMessages([...messages, ...newMessages]);
      setResults(response.data.results); // Save the result from backend processing
    } catch (error) {
      console.error('Error processing workflow:', error);
    } finally {
      setIsLoading(false);
    }
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

  const handleClearMessages = () => {
    setMessages([]);
  };

  const handleClearWorkflow = () => {
    setWorkflowName('');
    setWorkflowDescription('');
    setSteps([]);
    setCurrentStep('');
  };

  // Handle inserting an output into a step
  const handleInsertOutput = (index, outputId) => {
    const updatedSteps = [...steps];
    updatedSteps[index].text += ` 📄${outputId}`;
    updatedSteps[index].inputs.push(outputId);
    setSteps(updatedSteps);
  };

  // Handle inserting a file into a step
  const handleInsertFile = (index, fileId) => {
    const updatedSteps = [...steps];
    updatedSteps[index].text += ` 🗄️${fileId}`;
    updatedSteps[index].inputs.push(fileId);
    setSteps(updatedSteps);
  };

  return (
    <Grid2 container spacing={4}>
      {/* Left Column: Steps, Inputs, and Buttons */}
      <Grid2 item xs={12} md={8}>
        <Paper sx={{ padding: 2, mb: 4 }}>
          <Typography variant="h6">Workflow Steps</Typography>
          <StepsSection
            steps={steps}
            currentStep={currentStep}
            setSteps={setSteps}
            setCurrentStep={setCurrentStep}
            handleAddStep={handleAddStep}
            handleInsertOutput={handleInsertOutput}
            handleInsertFile={handleInsertFile}
            outputOptions={steps.map((step, index) => `output-${index + 1}`)}
            fileOptions={uploadedFiles.map(file => file.name)}
          />
          <Button variant="contained" color="secondary" onClick={handleSaveWorkflow}>
            Save Workflow
          </Button>

        </Paper>

        <Paper sx={{ padding: 2, mb: 4 }}>
          <Typography variant="h6">Messages</Typography>
          <MessageList messages={messages} />
          <Button variant="contained" color="secondary" onClick={handleClearMessages} sx={{ mt: 2 }}>
            Clear Messages
          </Button>
        </Paper>

        <Paper sx={{ padding: 2, mb: 4 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Run! 🚀"}
          </Button>
        </Paper>
      </Grid2>

      {/* Right Column: File Upload, Workflow Details, Visualization */}
      <Grid2 item xs={12} md={4}>
        {/* File Upload Section */}
        <Paper sx={{ padding: 2, mb: 4 }}>
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

          {/* Display list of server files */}
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

        {/* Workflow Details */}
        <Paper sx={{ padding: 2, mb: 4 }}>
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
          <Grid2 container spacing={2}>
            <Button variant="contained" color="secondary" onClick={handleSaveWorkflow}>
              Save Workflow
            </Button>
            <Button variant="contained" color="secondary" onClick={handleClearWorkflow}>
              Clear Workflow
            </Button>
          </Grid2>
        </Paper>

        {/* Workflow Visualization */}
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h6">Workflow Visualization</Typography>
          <WorkflowVisualization steps={steps} uploadedFiles={uploadedFiles} />
        </Paper>
      </Grid2>
    </Grid2>
  );
}

export default WorkflowDesigner;
