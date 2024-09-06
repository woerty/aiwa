import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

function WorkflowDesigner({ loadedWorkflow }) {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Neuer Ladezustand

  // Effekt, um die geladenen Workflow-Daten zu setzen
  useEffect(() => {
    if (loadedWorkflow) {
      setWorkflowName(loadedWorkflow.name);
      setWorkflowDescription(loadedWorkflow.description);
      setSteps(JSON.parse(loadedWorkflow.steps));  // Falls die Schritte als JSON gespeichert sind
    }
  }, [loadedWorkflow]);

  const handleAddStep = () => {
    if (currentStep.trim()) {
      setSteps([...steps, currentStep]);
      setCurrentStep('');
    }
  };

  const handleInsertSymbol = (index) => {
    const updatedSteps = [...steps];
    const newText = `${updatedSteps[index]} 📄`;
    updatedSteps[index] = newText;
    setSteps(updatedSteps);
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Ladezustand aktivieren
    try {
      const response = await axios.post('http://wodv.de:5000/submit_workflow', { steps });
      setResults(response.data.results);
    } catch (error) {
      console.error('Error submitting workflow:', error);
    }
    setIsLoading(false); // Ladezustand deaktivieren
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

      {/* Eingabe für Workflow-Name */}
      <TextField
        fullWidth
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        label="Name"
        variant="outlined"
        sx={{ mb: 2 }}
      />

      {/* Eingabe für Workflow-Beschreibung */}
      <TextField
        fullWidth
        value={workflowDescription}
        onChange={(e) => setWorkflowDescription(e.target.value)}
        label="Beschreibung"
        variant="outlined"
        sx={{ mb: 2 }}
      />

      {/* Schritte */}
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
            Vorherigen Output einfügen
          </Button>
        </Box>
      ))}

      {/* Neuen Schritt hinzufügen */}
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

      {/* Workflow speichern */}
      <Button variant="contained" color="secondary" onClick={handleSaveWorkflow} sx={{ mr: 2 }}>
        Save
      </Button>

      {/* Workflow ausführen */}
      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Running..." : "Run! 🚀"}
      </Button>

      {/* Ladeanimation anzeigen */}
      {isLoading && (
        <Box sx={{ mt: 4 }}>
          <CircularProgress />
          <Typography variant="body1">Processing workflow...</Typography>
        </Box>
      )}

      {/* Ergebnisse anzeigen */}
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
