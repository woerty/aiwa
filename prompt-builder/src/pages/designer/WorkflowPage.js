import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import WorkflowDesigner from './WorkflowDesigner';

function WorkflowPage() {

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        Workflow Manager
      </Typography>

      {/* Workflow Designer Section */}
      <Box sx={{ mb: 6 }}>
        <WorkflowDesigner/> {/* Übergeben des geladenen Workflows */}
      </Box>
    </Box>
  );
}

export default WorkflowPage;
