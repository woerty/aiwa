import React from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

function StepsSection({
  steps,
  currentStep,
  setSteps,
  setCurrentStep,
  handleAddStep,
  handleInsertOutput,
  handleInsertFile,
  outputOptions,
  fileOptions
}) {
  // Helper to handle changes to a specific step
  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  return (
    <Box>
      {/* Existing Steps */}
      {steps.map((step, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          {/* Step Text Input */}
          <TextField
            fullWidth
            value={step.text}
            onChange={(e) => handleStepChange(index, 'text', e.target.value)}
            label={`Step ${index + 1}`}
            variant="outlined"
          />
          
          {/* Output Reference Section */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Output to Insert</InputLabel>
            <Select
              value={''}  // This resets the select after selection
              onChange={(e) => handleInsertOutput(index, e.target.value)}
              label="Output to Insert"
            >
              {outputOptions.map((output) => (
                <MenuItem key={output} value={output}>
                  {output}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* File Reference Section */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>File to Insert</InputLabel>
            <Select
              value={''}  // This resets the select after selection
              onChange={(e) => handleInsertFile(index, e.target.value)}
              label="File to Insert"
            >
              {fileOptions.map((file) => (
                <MenuItem key={file} value={file}>
                  {file}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Output ID */}
          <TextField
            fullWidth
            value={step.outputId}
            onChange={(e) => handleStepChange(index, 'outputId', e.target.value)}
            label={`Output ID for Step ${index + 1}`}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </Box>
      ))}

      {/* Input for Adding a New Step */}
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
    </Box>
  );
}

export default StepsSection;
