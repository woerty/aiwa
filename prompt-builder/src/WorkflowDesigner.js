import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

function WorkflowDesigner({ loadedWorkflow }) {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file
  const [uploadedFilePath, setUploadedFilePath] = useState(''); // State for uploaded file path

  useEffect(() => {
    if (loadedWorkflow) {
      setWorkflowName(loadedWorkflow.name);
      setWorkflowDescription(loadedWorkflow.description);
      setSteps(JSON.parse(loadedWorkflow.steps));
    }
  }, [loadedWorkflow]);

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
    if (!selectedFile) return;
  
    const formData = new FormData();
    formData.append('file', selectedFile);
  
    try {
      setIsLoading(true);
      const response = await axios.post('http://wodv.de:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadedFilePath(response.data.file_path);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://wodv.de:5000/process', {
        steps,
        file_path: uploadedFilePath,
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
    <Box>
      <TextField
        fullWidth
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        label="Name"
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        value={workflowDescription}
        onChange={(e) => setWorkflowDescription(e.target.value)}
        label="Beschreibung"
        variant="outlined"
        sx={{ mb: 2 }}
      />
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
            Vorherigen Output einfügen
          </Button>
          <Button onClick={() => handleInsertFileSymbol(index)} sx={{ ml: 2 }}>
            Datei Output einfügen
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
      <Button variant="contained" onClick={handleAddStep} sx={{ mr: 2 }}>
        Step hinzufügen
      </Button>
      <Button variant="contained" color="secondary" onClick={handleSaveWorkflow} sx={{ mr: 2 }}>
        Save
      </Button>
      <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="fileInput" />
      <label htmlFor="fileInput">
        <Button variant="contained" component="span" onClick={handleFileUpload} sx={{ mr: 2 }}>
          Upload File
        </Button>
      </label>
      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Running..." : "Run! 🚀"}
      </Button>
      {isLoading && (
        <Box sx={{ mt: 4 }}>
          <CircularProgress />
          <Typography variant="body1">Processing workflow...</Typography>
        </Box>
      )}
      {!isLoading && results.length > 0 && (
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
    </Box>
  );
}

export default WorkflowDesigner;