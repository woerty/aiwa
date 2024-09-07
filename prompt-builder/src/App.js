import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './pages/login/LoginForm';
import RegisterForm from './pages/register/RegisterForm';
import Dashboard from './pages/chat/Dashboard';
import WorkflowPage from './pages/designer/WorkflowPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workflows" element={<WorkflowPage />} />  {/* Neue Route */}
        <Route path="/" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
