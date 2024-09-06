import React from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Paper, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';  // Importiere das remark-gfm Plugin

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
            <Paper sx={{ p: 1, borderRadius: 1, backgroundColor: message.sender === 'user' ? '#f0f0f0' : '#e0f7fa' }}>
            
            <ListItemText
              primary={message.sender === 'user' ? "Prompt" : "Response"}
              secondary={
                <Typography variant="body2" color="textPrimary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>  {/* Render Markdown with GFM support */}
                </Typography>
              }
            />
            </Paper>

          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default MessageList;
