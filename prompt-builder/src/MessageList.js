import React from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Paper } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';

function MessageList({ messages }) {
  return (
    <Paper sx={{ padding: 2, maxHeight: '400px', overflowY: 'auto' }}>
      <List>
        {messages.map((message, index) => (
          <ListItem key={index} alignItems="flex-start" sx={{ mb: 2 }}>
            <ListItemAvatar>
              <Avatar>
                {message.sender === 'user' ? <AccountCircleIcon /> : <SmartToyIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={message.sender === 'user' ? "Prompt" : "Response"}
              secondary={
                <Typography variant="body2" color="textPrimary">
                  {message.text}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default MessageList;
