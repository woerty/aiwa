import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, List, ListItem, ListItemText, IconButton, Grid, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

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

  const handleInsertOutputSymbol = (index) => {
    const updatedSteps = [...steps];
    const newText = `${updatedSteps[index]} 📄`;
    updatedSteps[index] = newText;
    setSteps(updatedSteps);
  };

  const handleInsertFileSymbol = (index) => {
    const updatedSteps = [...steps];
    const newText = `${updatedSteps[index]} 🗄️`;
    updatedSteps[index] = newText;
    setSteps(updatedSteps);
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

  const handleDeleteFile = async (filename) => {
    try {
      await axios.post('http://wodv.de:5000/delete_file', { filename });
      alert('File deleted successfully!');
      fetchServerFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleRemoveFileFromList = (fileName) => {
    setUploadedFiles(uploadedFiles.filter(file => file.name !== fileName));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://wodv.de:5000/process', {
        steps,
        file_path: uploadedFiles.length > 0 ? uploadedFiles[0].path : '',
      });
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
    <Box sx={{ padding: 4 }}>
      <Grid container spacing={4}>
        {/* Workflow details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
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
        </Grid>

        {/* Steps Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
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
                <Button onClick={() => handleInsertOutputSymbol(index)} sx={{ ml: 2 }}>
                  Insert Output 📄
                </Button>
                <Button onClick={() => handleInsertFileSymbol(index)} sx={{ ml: 2 }}>
                  Insert File 🗄️
                </Button>
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
            <Button variant="contained" onClick={handleAddStep}>
              Add Step
            </Button>
          </Paper>
        </Grid>

        {/* File Upload Section */}
        <Grid item xs={12} md={6}>
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
            {selectedFile && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
            <List>
              {uploadedFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText primary={file.name} />
                  <IconButton edge="end" onClick={() => handleRemoveFileFromList(file.name)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Server Files Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">Files on Server</Typography>
            <List>
              {serverFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText primary={file} />
                  <IconButton edge="end" onClick={() => handleDeleteFile(file)}>
                    <DeleteIcon />
                  </IconButton>
                  <Button
                    variant="contained"
                    onClick={() => setUploadedFiles([...uploadedFiles, { name: file, path: `uploads/${file}` }])}
                    sx={{ ml: 2 }}
                  >
                    Add to Workflow
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12}>
          <Paper sx={{ padding: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : "Run! 🚀"}
            </Button>
            {results.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Results</Typography>
                {results.map((result, index) => (
                  <Typography key={index} variant="body1">
                    Step {index + 1}: {steps[index]} <br />
                    Result: {result}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default WorkflowDesigner;
