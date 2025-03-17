import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/UserDashboard/AnalysisComplaints.css';
import apiEndpoints from '../../api';  // Import API file

const AnalysisComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState({
    total: 0,
    solved: 0,
    pending: 0,
    inProgress: 0,
    solvedByAI: 0,
    notSolvedByAI: 0,
    avgTimeToSolve: 0,
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(apiEndpoints.complaints, {
          headers: {
            'x-auth-token': token,
          },
        });
        const complaintsData = response.data;
        setComplaints(complaintsData);
        calculateAnalysis(complaintsData);
        setLoading(false);
      } catch (error) {
        console.error(error.response?.data);
        alert(error.response?.data?.message || 'Failed to fetch complaints');
        navigate('/user');
      }
    };

    fetchComplaints();
  }, [navigate]);

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
        const timeDiff = (updatedAt - createdAt) / (1000 * 60 * 60); // Convert to hours
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="analysis-container">
      <h2>Analysis of Complaints</h2>
      <div className="analysis-grid">
        <div className="analysis-card">
          <h3>Total Complaints</h3>
          <p>{analysis.total}</p>
        </div>
        <div className="analysis-card">
          <h3>Solved</h3>
          <p>{analysis.solved}</p>
        </div>
        <div className="analysis-card">
          <h3>Pending</h3>
          <p>{analysis.pending}</p>
        </div>
        <div className="analysis-card">
          <h3>In Progress</h3>
          <p>{analysis.inProgress}</p>
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
          <p>{analysis.avgTimeToSolve} hours</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisComplaints;