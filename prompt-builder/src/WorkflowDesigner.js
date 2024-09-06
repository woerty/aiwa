import React, { useState, useEffect } from 'react';
import { Grid2, Paper, Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import MessageList from './MessageList';
import FileUploadSection from './FileUploadSection';
import StepsSection from './StepsSection';
import WorkflowDetails from './WorkflowDetails';
import WorkflowVisualization from './WorkflowVisualization';

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
  const handleDeleteFile = async (filename) => {
    try {
      await axios.post('http://wodv.de:5000/delete_file', { filename });
      alert('File deleted successfully!');
      fetchServerFiles(); // Refresh the server files list
    } catch (error) {
      console.error('Error deleting file:', error);
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

      setMessages([...messages, ...newMessages]);
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

  const handleInsertOutputSymbol = (index) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = `${updatedSteps[index]} 📄`;
    setSteps(updatedSteps);
  };

  const handleInsertFileSymbol = (index) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = `${updatedSteps[index]} 🗄️`;
    setSteps(updatedSteps);
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

  return (
    <Grid2 container spacing={4}>
      {/* Left Column */}

      <Grid2 item xs={12} md={4}>
        <WorkflowDetails
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
          workflowDescription={workflowDescription}
          setWorkflowDescription={setWorkflowDescription}
          handleSaveWorkflow={handleSaveWorkflow}
          handleClearWorkflow={handleClearWorkflow}
        />
      </Grid2>

      {/* Steps Section */}
      <Grid2 item xs={12} md={8}>
        <StepsSection
          steps={steps}
          currentStep={currentStep}
          setSteps={setSteps}
          setCurrentStep={setCurrentStep}
          handleAddStep={handleAddStep}
          handleInsertOutputSymbol={handleInsertOutputSymbol}
          handleInsertFileSymbol={handleInsertFileSymbol}
        />
      </Grid2>

      {/* File Upload Section */}
      <Grid2 item xs={12} md={4}>
        <FileUploadSection
          serverFiles={serverFiles}
          uploadedFiles={uploadedFiles}
          handleFileChange={handleFileChange}
          handleFileUpload={handleFileUpload}
          handleDeleteFile={handleDeleteFile}
          handleRemoveFileFromList={handleRemoveFileFromList}
          selectedFile={selectedFile}
          setUploadedFiles={setUploadedFiles}
        />
      </Grid2>

      {/* Message List Section */}
      <Grid2 item xs={12} md={8}>
        <Paper sx={{ padding: 2, mb: 4 }}>
          <Typography variant="h6">Messages</Typography>
          <MessageList messages={messages} /> {/* Display the list of messages */}
          <Button variant="contained" color="secondary" onClick={handleClearMessages} sx={{ mt: 2 }}>
            Clear Messages
          </Button>
        </Paper>

        {/* Run Button */}
        <Paper sx={{ padding: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : "Run! 🚀"}
          </Button>
        </Paper>
      </Grid2>

      <Grid2 item xs={12} md={8}>
        <Paper sx={{ padding: 2, mb: 4 }}>
          <Typography variant="h6">Workflow Visualization</Typography>
          <WorkflowVisualization steps={steps} uploadedFiles={uploadedFiles} />
        </Paper>
      </Grid2>
    </Grid2>
  );
}

export default WorkflowDesigner;
