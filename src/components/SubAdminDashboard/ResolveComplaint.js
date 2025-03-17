import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/SubAdminDashboard/ResolveComplaint.css'; // Ensure correct path
import apiEndpoints from '../../api'; // Import API file

const ResolveComplaint = ({ complaints, setComplaints }) => {
  const [selectedComplaint, setSelectedComplaint] = useState('');
  const [status, setStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !selectedComplaint) return;

    try {
      const response = await axios.put(
        apiEndpoints.resolveComplaint(selectedComplaint),
        { status, resolutionNotes },
        { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } }
      );
      setComplaints((prev) => prev.map((c) => (c._id === selectedComplaint ? response.data.complaint : c)));
      alert('Complaint updated successfully');
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Failed to update complaint');
    }
  };

  return (
    <div className="resolve-section">  {/* ✅ Add CSS class */}
      <h3>Resolve Complaint</h3>
      <form className="resolve-form" onSubmit={handleSubmit}>  {/* ✅ Add CSS class */}
        
        <div className="form-group">
          <label>Select a Complaint:</label>
          <select value={selectedComplaint} onChange={(e) => setSelectedComplaint(e.target.value)} required>
            <option value="">Select a Complaint</option>
            {complaints.map((c) => (
              <option key={c._id} value={c._id}>
                {c.issue} - {c.subIssue}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Solved">Solved</option>
          </select>
        </div>

        <div className="form-group">
          <label>Resolution Notes:</label>
          <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Resolution Notes" />
        </div>

        <button type="submit" className="submit-btn">Update Complaint</button> {/* ✅ Add CSS class */}
      </form>
    </div>
  );
};

export default ResolveComplaint;
