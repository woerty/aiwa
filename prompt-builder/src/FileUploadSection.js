import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function FileUploadSection({
  serverFiles,
  uploadedFiles,
  handleFileChange,
  handleFileUpload,
  handleDeleteFile,
  handleRemoveFileFromList,
  selectedFile,
  setUploadedFiles,
}) {
  return (
    <Box>
      <Typography variant="h6">Upload a File</Typography>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="fileInput"
      />
      <label htmlFor="fileInput">
        <Button variant="contained" component="span">
          Select File
        </Button>
      </label>
      <Button
        variant="contained"
        onClick={handleFileUpload}
        sx={{ ml: 2 }}
        disabled={!selectedFile}
      >
        Upload File
      </Button>

      {/* Display list of files on server */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Files on Server:</Typography>
        <List>
          {serverFiles.map((file, index) => (
            <ListItem key={index}>
              <ListItemText primary={file} />
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file)}>
                <DeleteIcon />
              </IconButton>
              <Button variant="contained" onClick={() => setUploadedFiles([...uploadedFiles, { name: file, path: `uploads/${file}` }])} sx={{ ml: 2 }}>
                Add to Workflow
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Display list of uploaded files */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Uploaded Files:</Typography>
        <List>
          {uploadedFiles.map((file, index) => (
            <ListItem key={index}>
              <ListItemText primary={file.name} />
              <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFileFromList(file.name)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default FileUploadSection;
