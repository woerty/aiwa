import React from 'react';
import { Box, TextField, Button } from '@mui/material';

function StepsSection({
  steps,
  currentStep,
  setSteps,
  setCurrentStep,
  handleAddStep,
  handleInsertOutputSymbol,
  handleInsertFileSymbol,
}) {
  return (
    <Box>
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
          {/* Buttons to insert symbols */}
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
    </Box>
  );
}

export default StepsSection;
