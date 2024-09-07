import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, List, ListItem } from '@mui/material';
import axios from 'axios';
import API_BASE_URL from '../../hooks/apiConfig';

function Chat({ threadId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (threadId) {
      axios.get(API_BASE_URL + `/get_messages/${threadId}`)
        .then((response) => setMessages(response.data))
        .catch((error) => console.error('Error fetching messages:', error));
    }
  }, [threadId]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    axios.post(API_BASE_URL + '/send_message', { thread_id: threadId, message: newMessage })
      .then((response) => {
        setMessages([...messages, { sender: 'user', content: newMessage }, { sender: 'assistant', content: response.data.message }]);
        setNewMessage(''); // Clear input field after sending
      })
      .catch((error) => console.error('Error sending message:', error));
  };

  // Handle enter key for sending message or adding new line with shift+enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter behavior
      handleSendMessage(); // Send message
    }
  };

  return (
    <Box>
      <Typography variant="h6">Chat</Typography>
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <strong>{msg.sender === 'user' ? 'You: ' : 'Assistant: '}</strong> {msg.content}
          </ListItem>
        ))}
      </List>
      <TextField
        label="Your message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        onKeyDown={handleKeyDown} // Handle Enter and Shift+Enter
      />
      <Button variant="contained" color="primary" onClick={handleSendMessage} fullWidth>
        Send Message
      </Button>
    </Box>
  );
}

export default Chat;
