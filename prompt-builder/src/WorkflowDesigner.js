import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

function WorkflowDesigner({ loadedWorkflow }) {
  const [steps, setSteps] = useState(loadedWorkflow ? loadedWorkflow.steps : []);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState([]);

  const handleAddStep = () => {
    if (currentStep.trim()) {
      setSteps([...steps, currentStep]);
      setCurrentStep('');
    }
  };

  const handleInsertSymbol = (index) => {
    const updatedSteps = [...steps];
    updatedSteps[index] += ' ⬤';  // Symbol für den Output des vorherigen Schritts
    setSteps(updatedSteps);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://wodv.de:5000/submit_workflow', { steps });
      setResults(response.data.results);
    } catch (error) {
      console.error('Error submitting workflow:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Create or Edit Workflow</Typography>

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
          <Button onClick={() => handleInsertSymbol(index)} sx={{ ml: 2 }}>
            Insert Previous Output
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
        Add Step
      </Button>

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Run Workflow
      </Button>

      {/* Ergebnisse anzeigen */}
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Results</Typography>
          {results.map((result, index) => (
            <Typography key={index} variant="body1">
              Step {index + 1} Result: {result}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default WorkflowDesigner;
