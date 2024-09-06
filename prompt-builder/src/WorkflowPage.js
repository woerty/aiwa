import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import WorkflowDesigner from './WorkflowDesigner';
import WorkflowsList from './WorkflowsList';

function WorkflowPage() {
  const [loadedWorkflow, setLoadedWorkflow] = useState(null);

  // Funktion zum Laden eines Workflows
  const handleLoadWorkflow = (workflow) => {
    setLoadedWorkflow(workflow);  // Übergibt den geladenen Workflow an den Designer
  };

  const handleDeleteWorkflow = (workflowId) => {
    if (loadedWorkflow && loadedWorkflow.id === workflowId) {
      setLoadedWorkflow(null); // Wenn der geladene Workflow gelöscht wurde, zurücksetzen
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        Workflow Manager
      </Typography>

      {/* Workflow Designer Section */}
      <Box sx={{ mb: 6 }}>
        <WorkflowDesigner loadedWorkflow={loadedWorkflow} /> {/* Übergeben des geladenen Workflows */}
      </Box>

      {/* List of Saved Workflows */}
      <Box>
        <Typography variant="h4" gutterBottom>
          Saved Workflows
        </Typography>
        <WorkflowsList onLoadWorkflow={handleLoadWorkflow} onDeleteWorkflow={handleDeleteWorkflow} />
      </Box>
    </Box>
  );
}

export default WorkflowPage;
