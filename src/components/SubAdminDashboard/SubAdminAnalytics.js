import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../styles/SubAdminDashboard/SubAdminAnalytics.css';
import apiEndpoints from '../../api'; // Import API file

const SubAdminAnalytics = ({
  complaints,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  setComplaints,
  lastChecked,
  lastRefreshed,
}) => {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [showUpdatedNote, setShowUpdatedNote] = useState(true);

  const totalRaised = complaints.length;
  const solved = complaints.filter((c) => c.status === 'Solved').length;
  const notSolved = complaints.filter((c) => c.status !== 'Solved').length;

  const newRaisedCount = complaints.filter(
    (c) => new Date(c.createdAt) > lastChecked && c.status !== 'Solved'
  ).length;
  const newSolvedCount = complaints.filter(
    (c) => new Date(c.updatedAt) > lastChecked && c.status === 'Solved'
  ).length;

  const domains = ['Hardware Failure', 'Software Issue', 'Network Problem'];

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAge = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.put(
        apiEndpoints.complaintById(complaintId),
        { status: newStatus },
        { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } }
      );
      const updatedComplaint = response.data.complaint;
      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? updatedComplaint : c))
      );
    } catch (error) {
      console.error('Mock update error:', error);
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
        )
      );
    }
  };

  const filteredComplaints = complaints
    .filter((c) => {
      if (activeCategory === 'raised') return selectedDomain ? c.issue === selectedDomain : true;
      if (activeCategory === 'solved') return c.status === 'Solved';
      if (activeCategory === 'not-solved') return c.status !== 'Solved';
      return false;
    })
    .filter((c) =>
      searchQuery
        ? c.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.subIssue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sortBy === 'priority') return a.priority === 'High' ? -1 : b.priority === 'High' ? 1 : 0;
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'age' && activeCategory === 'not-solved') return calculateAge(b.createdAt) - calculateAge(a.createdAt);
      return 0;
    });

  const handleQuickAction = (action, complaintId) => {
    if (action === 'close') {
      handleStatusChange(complaintId, 'Solved');
    } else {
      alert(`${action} action not implemented yet.`);
    }
  };

  const handleRaisedClick = () => {
    setActiveCategory(activeCategory === 'raised' ? '' : 'raised');
    setShowUpdatedNote(false); // Hide the "Updated" note when "Raised" is clicked
  };

  return (
    <div className="section-content analytics-section">
      <div className="analytics-header">
        <h3>Complaint Analytics</h3>
        <div className="last-refreshed">
          Last refreshed: {lastRefreshed.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      <div className="analytics-grid">
        <div
          className={`analytics-card ${activeCategory === 'raised' ? 'active' : ''}`}
          onClick={handleRaisedClick}
        >
          <h4>Raised</h4>
          <p>{totalRaised}</p>
          {newRaisedCount > 0 && showUpdatedNote && (
            <div className="updated-note">Updated</div>
          )}
        </div>
        <div
          className={`analytics-card ${activeCategory === 'solved' ? 'active' : ''}`}
          onClick={() => setActiveCategory(activeCategory === 'solved' ? '' : 'solved')}
        >
          <h4>Solved</h4>
          <p>{solved}</p>
        </div>
        <div
          className={`analytics-card ${activeCategory === 'not-solved' ? 'active' : ''}`}
          onClick={() => setActiveCategory(activeCategory === 'not-solved' ? '' : 'not-solved')}
        >
          <h4>Not Solved</h4>
          <p>{notSolved}</p>
        </div>
      </div>

      {activeCategory && (
        <div className="dynamic-section">
          {activeCategory === 'raised' && (
            <>
              {newRaisedCount > 0 && (
                <div className="update-note">
                  {newRaisedCount} new complaint{newRaisedCount > 1 ? 's' : ''} since{' '}
                  {lastChecked.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
              <div className="filter-group">
                <label>Filter by Issue Type:</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                >
                  <option value="">All</option>
                  {domains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {activeCategory === 'solved' && newSolvedCount > 0 && (
            <div className="update-note">
              {newSolvedCount} complaint{newSolvedCount > 1 ? 's' : ''} solved since{' '}
              {lastChecked.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}

          <div className="controls">
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="">Sort By</option>
              <option value="priority">Priority</option>
              <option value="date">Date</option>
              {activeCategory === 'not-solved' && <option value="age">Age</option>}
            </select>
          </div>

          {filteredComplaints.length === 0 ? (
            <p>No complaints found.</p>
          ) : (
            <div className="complaint-grid">
              {filteredComplaints.map((complaint) => (
                <div key={complaint._id} className="complaint-card">
                  <p><strong>Issue:</strong> {complaint.issue}</p>
                  <p><strong>Sub-Issue:</strong> {complaint.subIssue}</p>
                  <p><strong>Question:</strong> {complaint.selectedQuestion}</p>
                  <p><strong>Description:</strong> {complaint.description || 'N/A'}</p>
                  <p><strong>Priority:</strong> {complaint.priority}</p>
                  <p><strong>Created:</strong> {formatDateTime(complaint.createdAt)}</p>
                  {activeCategory === 'not-solved' && (
                    <p><strong>Age:</strong> {calculateAge(complaint.createdAt)} days</p>
                  )}
                  <div className="status-control">
                    <strong>Status:</strong>
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                      className={`status-select status-${complaint.status.toLowerCase().replace(' ', '-')}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Solved">Solved</option>
                    </select>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SubAdminAnalytics.propTypes = {
  complaints: PropTypes.array.isRequired,
  activeCategory: PropTypes.string.isRequired,
  setActiveCategory: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  setComplaints: PropTypes.func.isRequired,
  lastChecked: PropTypes.instanceOf(Date).isRequired,
  lastRefreshed: PropTypes.instanceOf(Date).isRequired,
};

export default SubAdminAnalytics;