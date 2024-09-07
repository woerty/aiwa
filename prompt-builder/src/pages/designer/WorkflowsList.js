import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, Button } from '@mui/material';
import axios from 'axios';

function WorkflowsList({ onLoadWorkflow, onDeleteWorkflow }) {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    axios.get('http://wodv.de:5000/get_workflows')
      .then((response) => setWorkflows(response.data))
      .catch((error) => console.error('Error fetching workflows:', error));
  }, []);

  const handleDelete = (workflowId) => {
    axios.delete(`http://wodv.de:5000/delete_workflow/${workflowId}`)
      .then(() => {
        setWorkflows(workflows.filter((workflow) => workflow.id !== workflowId));
        if (onDeleteWorkflow) {
          onDeleteWorkflow(workflowId);
        }
      })
      .catch((error) => console.error('Error deleting workflow:', error));
  };

  return (
    <Box>
      <Typography variant="h5">Saved Workflows</Typography>
      <List>
        {workflows.map((workflow) => (
          <ListItem key={workflow.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{workflow.name}</Typography>
              <Typography variant="body2">{workflow.description}</Typography>
            </Box>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => onLoadWorkflow(workflow)}
              >
                Load
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDelete(workflow.id)}
              >
                Delete
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default WorkflowsList;
