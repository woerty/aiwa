import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Dashboard from './Dashboard';
import WorkflowPage from './WorkflowPage';  // Importiere die neue Workflow-Seite

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
