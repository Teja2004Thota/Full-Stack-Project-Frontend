import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/UserDashboard/TrackComplaints.css';

const TrackComplaints = ({ complaints, formatDateTime }) => {
  return (
    <div className="section-content track-section">
      <h3>Track the Complaint</h3>
      {complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <div className="complaint-grid">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="complaint-card">
              <p><strong>Issue:</strong> {complaint.issue}</p>
              <p><strong>Sub-Issue:</strong> {complaint.subIssue}</p>
              <p><strong>Question:</strong> {complaint.selectedQuestion}</p>
              <p><strong>Description:</strong> {complaint.description || 'N/A'}</p>
              <p><strong>Priority:</strong> {complaint.priority}</p>
              <p><strong>Updated:</strong> {formatDateTime(complaint.updatedAt)}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                  {complaint.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

TrackComplaints.propTypes = {
  complaints: PropTypes.array.isRequired,
  formatDateTime: PropTypes.func.isRequired,
};

export default TrackComplaints;