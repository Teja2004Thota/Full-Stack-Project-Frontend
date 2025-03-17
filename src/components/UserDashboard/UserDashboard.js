import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/UserDashboard/CoreDashboard.css';
import '../../styles/UserDashboard/AnalysisComplaints.css';
import '../../styles/UserDashboard/EditDeleteComplaints.css';
import '../../styles/UserDashboard/TrackComplaints.css';
import CreateComplaint from './CreateComplaint';
import TrackComplaints from './TrackComplaints';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [analysis, setAnalysis] = useState({
    total: 0,
    solved: 0,
    pending: 0,
    inProgress: 0,
    solvedByAI: 0,
    notSolvedByAI: 0,
    avgTimeToSolve: 0,
  });

  const user = JSON.parse(localStorage.getItem('user')) || { username: 'User' };

  useEffect(() => {
    if (!user || user.role !== 'User') {
      navigate('/login');
    }
    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/complaints', {
        headers: {
          'x-auth-token': token,
        },
      });
      const complaintsData = response.data;
      setComplaints(complaintsData);
      calculateAnalysis(complaintsData);
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Failed to fetch complaints');
    }
  };

  const calculateAnalysis = (complaints) => {
    const total = complaints.length;
    const solved = complaints.filter((c) => c.status === 'Solved').length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const solvedByAI = complaints.filter((c) => c.aiResolved).length;
    const notSolvedByAI = complaints.filter((c) => c.needsAI && !c.aiResolved).length;

    const solvedComplaints = complaints.filter((c) => c.status === 'Solved');
    let avgTimeToSolve = 0;
    if (solvedComplaints.length > 0) {
      const totalTime = solvedComplaints.reduce((acc, complaint) => {
        const createdAt = new Date(complaint.createdAt);
        const updatedAt = new Date(complaint.updatedAt);
        const timeDiff = (updatedAt - createdAt) / (1000 * 60 * 60);
        return acc + timeDiff;
      }, 0);
      avgTimeToSolve = (totalTime / solvedComplaints.length).toFixed(2);
    }

    setAnalysis({
      total,
      solved,
      pending,
      inProgress,
      solvedByAI,
      notSolvedByAI,
      avgTimeToSolve,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDelete = async (complaintId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to delete a complaint.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/complaints/${complaintId}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      setComplaints(complaints.filter((complaint) => complaint._id !== complaintId));
      alert('Complaint deleted successfully');
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Failed to delete complaint');
    }
  };

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

  const statusChartData = {
    labels: ['Solved', 'Pending', 'In Progress'],
    datasets: [
      {
        label: 'Complaint Status',
        data: [analysis.solved, analysis.pending, analysis.inProgress],
        backgroundColor: ['#28a745', '#ffc107', '#007bff'],
        borderColor: ['#218838', '#e0a800', '#0056b3'],
        borderWidth: 1,
      },
    ],
  };

  const aiChartData = {
    labels: ['Solved by AI', 'Not Solved by AI'],
    datasets: [
      {
        label: 'AI Resolution',
        data: [analysis.solvedByAI, analysis.notSolvedByAI],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#218838', '#c82333'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
  };

  const sections = [
    'Create Complaint',
    'Edit or Delete',
    'Track the Complaint',
    'Analysis of Complaints',
  ];

  const renderSectionContent = () => {
    if (!activeSection) {
      return <p className="default-message">Select a section to view content</p>;
    }
    switch (activeSection) {
      case 'Create Complaint':
        return <CreateComplaint />;
      case 'Edit or Delete':
        return (
          <div className="section-content edit-section">
            <h3>Edit or Delete</h3>
            {complaints.length === 0 ? (
              <p>No complaints found.</p>
            ) : (
              <div className="complaint-grid">
                {complaints.map((complaint) => (
                  <div key={complaint._id} className="complaint-card">
                    <p><strong>Issue:</strong> {complaint.issue}</p>
                    <p><strong>Sub-Issue:</strong> {complaint.subIssue}</p>
                    <p><strong>Question:</strong> {complaint.selectedQuestion}</p>
                    <p><strong>Created:</strong> {formatDateTime(complaint.createdAt)}</p>
                    <p><strong>Updated:</strong> {formatDateTime(complaint.updatedAt)}</p>
                    <div className="complaint-actions">
                      <button
                        onClick={() => navigate(`/edit-complaint/${complaint._id}`)}
                        className="edit-complaint-btn"
                      >
                        Edit Complaint
                      </button>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="delete-complaint-btn"
                      >
                        Delete Complaint
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'Track the Complaint':
        return <TrackComplaints complaints={complaints} formatDateTime={formatDateTime} />;
      case 'Analysis of Complaints':
        return (
          <div className="section-content analysis-section">
            <h3>Analysis of Complaints</h3>
            {complaints.length === 0 ? (
              <p>No complaints found.</p>
            ) : (
              <div className="analysis-content">
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <h3>Total Complaints</h3>
                    <p>{analysis.total}</p>
                  </div>
                  <div className="analysis-card">
                    <h3>Solved by AI</h3>
                    <p>{analysis.solvedByAI}</p>
                  </div>
                  <div className="analysis-card">
                    <h3>Not Solved by AI</h3>
                    <p>{analysis.notSolvedByAI}</p>
                  </div>
                  <div className="analysis-card">
                    <h3>Average Time to Solve</h3>
                    <p className="time-to-solve">
                      {analysis.avgTimeToSolve} <span>hours</span>
                    </p>
                  </div>
                </div>
                <div className="chart-container">
                  <h4>Complaint Status Distribution</h4>
                  <div className="chart-wrapper">
                    <Pie data={statusChartData} options={chartOptions} />
                  </div>
                </div>
                <div className="chart-container">
                  <h4>AI Resolution</h4>
                  <div className="chart-wrapper">
                    <Bar data={aiChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-dashboard">
      <header className="dashboard-header">
        <h1 className="welcome-message">Welcome, {user.username}!</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <h2>Dashboard Content</h2>
          <ul className="dashboard-sections">
            {sections.map((section) => (
              <li
                key={section}
                className={activeSection === section ? 'active' : ''}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </li>
            ))}
          </ul>
        </aside>
        <main className="dashboard-main">
          {renderSectionContent()}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;