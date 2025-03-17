import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/UserDashboard/CoreDashboard.css';
import SubAdminAnalytics from './SubAdminAnalytics';
import ResolveComplaint from './ResolveComplaint';

const SubAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'SubAdmin' };

  useEffect(() => {
    if (!user || user.role !== 'SubAdmin') {
      navigate('/login');
    }
    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async (isManual = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/complaints/subadmin', {
        headers: { 'x-auth-token': token },
      });
      const newComplaints = response.data;
      updateNotifications(newComplaints, isManual);
      setComplaints(newComplaints);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const updateNotifications = (newComplaints, isManual) => {
    const newRaised = newComplaints.filter(
      (c) => new Date(c.createdAt) > lastChecked && c.status !== 'Solved'
    );
    const newSolved = newComplaints.filter(
      (c) => new Date(c.updatedAt) > lastChecked && c.status === 'Solved'
    );

    const newNotifications = [
      ...newRaised.map((c) => ({
        message: `New complaint raised: ${c.issue} - ${c.subIssue}`,
        timestamp: c.createdAt,
      })),
      ...newSolved.map((c) => ({
        message: `Complaint solved: ${c.issue} - ${c.subIssue}`,
        timestamp: c.updatedAt,
      })),
    ];

    if (isManual) {
      setNotifications(newNotifications);
      setLastChecked(new Date());
    } else {
      setNotifications((prev) => [...prev, ...newNotifications]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sections = ['Analytics', 'Resolve Complaint'];
  const [activeSection, setActiveSection] = useState('Analytics');

  return (
    <div className="user-dashboard">
      <header className="dashboard-header">
        <h1 className="welcome-message">Welcome, {user.username}!</h1>
        <div className="header-actions">
          <div className="notification-bell">
            <span role="img" aria-label="Notifications">🔔</span>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
            {notifications.length > 0 && (
              <div className="notification-dropdown">
                {notifications.map((notif, index) => (
                  <div key={index} className="notification-item">
                    {notif.message} - {new Date(notif.timestamp).toLocaleTimeString()}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="refresh-btn" onClick={() => fetchComplaints(true)}>
            Refresh
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <h2>SubAdmin Dashboard</h2>
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
          {activeSection === 'Analytics' && (
            <SubAdminAnalytics
              complaints={complaints}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              setComplaints={setComplaints}
              lastChecked={lastChecked}
              lastRefreshed={lastRefreshed}
            />
          )}
          {activeSection === 'Resolve Complaint' && (
            <ResolveComplaint complaints={complaints} setComplaints={setComplaints} />
          )}
        </main>
      </div>
    </div>
  );
};

export default SubAdminDashboard;
