import React from 'react';
import { Paper, Typography, TextField, Button, Grid2 } from '@mui/material';

function WorkflowDetails({
  workflowName,
  setWorkflowName,
  workflowDescription,
  setWorkflowDescription,
  handleSaveWorkflow,
  handleClearWorkflow
}) {
  return (
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
  );
}

export default WorkflowDetails;
