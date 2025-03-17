import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthForm from './components/Auth/AuthForm';
import UserDashboard from './components/UserDashboard/UserDashboard';
import EditComplaint from './components/UserDashboard/EditComplaint';
import SubAdminDashboard from './components/SubAdminDashboard/SubAdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthForm />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/subadmin" element={<SubAdminDashboard />} />
        <Route path="/edit-complaint/:id" element={<EditComplaint />} />
        <Route path="/" element={<AuthForm />} />
      </Routes>
    </Router>
  );
}

export default App;