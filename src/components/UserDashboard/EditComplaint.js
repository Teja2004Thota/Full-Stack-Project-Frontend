import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/UserDashboard/CreateComplaint.css'; // Reusing CreateComplaint.css

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    issue: '',
    subIssue: '',
    selectedQuestion: '',
    description: '',
    priority: '',
  });

  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  const issues = {
    'Hardware Failure': ['Server Crash', 'Component Malfunction', 'Power Supply Issue'],
    'Software Issue': ['Application Crash', 'Bug', 'Performance Lag'],
    'Network Problem': ['Connectivity Loss', 'Slow Speed', 'Firewall Issue'],
  };

  const questions = {
    'Server Crash': [
      { q: 'Why does the server keep crashing?', a: 'This could be due to overheating. Check the cooling fans and ensure proper ventilation.' },
      { q: 'What if there’s an error code?', a: 'Note the error code and restart the server in safe mode to diagnose the issue.' },
      { q: 'How to prevent future crashes?', a: 'Update the firmware and ensure regular maintenance checks.' },
    ],
    'Component Malfunction': [
      { q: 'What if the component is overheating?', a: 'Apply thermal paste and ensure the heat sink is properly attached.' },
      { q: 'How to check for damage?', a: 'Inspect for burn marks or bulging capacitors and replace if damaged.' },
      { q: 'What if it’s making noise?', a: 'Lubricate moving parts or replace the faulty component.' },
    ],
    'Power Supply Issue': [
      { q: 'Why isn’t the power indicator on?', a: 'Check the power cable connection and test with another outlet.' },
      { q: 'What if it’s not working elsewhere?', a: 'The power supply unit may be faulty; replace it with a compatible one.' },
      { q: 'How to avoid power issues?', a: 'Use a surge protector to prevent voltage spikes.' },
    ],
    'Application Crash': [
      { q: 'Why does it crash on launch?', a: 'Reinstall the application or update to the latest version.' },
      { q: 'What if there’s an error message?', a: 'Search the error online or clear the app cache.' },
      { q: 'How to stabilize it?', a: 'Ensure your system meets the minimum requirements.' },
    ],
    'Bug': [
      { q: 'How to fix a reproducible bug?', a: 'Document the steps and apply the latest patch from the vendor.' },
      { q: 'What if it affects all users?', a: 'Roll back recent updates or contact support.' },
      { q: 'How to prevent bugs?', a: 'Test updates in a sandbox before deployment.' },
    ],
    'Performance Lag': [
      { q: 'Why is it lagging?', a: 'Close unnecessary background apps to free up memory.' },
      { q: 'What if restarting doesn’t help?', a: 'Check for resource-heavy processes in Task Manager.' },
      { q: 'How to optimize performance?', a: 'Update drivers and increase RAM if possible.' },
    ],
    'Connectivity Loss': [
      { q: 'Why is the connection dropping?', a: 'Reset the router and ensure cables are secure.' },
      { q: 'What if another network works?', a: 'Contact your ISP to check for outages.' },
      { q: 'How to maintain connection?', a: 'Place the router centrally and avoid interference.' },
    ],
    'Slow Speed': [
      { q: 'Why is the speed slow?', a: 'Limit connected devices or upgrade your bandwidth.' },
      { q: 'What if it’s time-specific?', a: 'Peak usage times may slow it; test off-peak.' },
      { q: 'How to boost speed?', a: 'Use a wired connection instead of Wi-Fi.' },
    ],
    'Firewall Issue': [
      { q: 'Why are ports blocked?', a: 'Check firewall rules and unblock required ports.' },
      { q: 'What if disabling helps?', a: 'Add an exception for your application.' },
      { q: 'How to secure it?', a: 'Update firewall settings and monitor logs.' },
    ],
  };

  useEffect(() => {
    const fetchComplaint = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to edit a complaint.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/complaints/${id}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        setFormData({
          issue: response.data.issue,
          subIssue: response.data.subIssue,
          selectedQuestion: response.data.selectedQuestion,
          description: response.data.description || '',
          priority: response.data.priority,
        });
        setExpandedQuestion(response.data.selectedQuestion);
        setLoading(false);
      } catch (error) {
        console.error(error.response?.data);
        alert(error.response?.data?.message || 'Failed to fetch complaint');
        navigate('/user');
      }
    };

    fetchComplaint();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'issue' && { subIssue: '', selectedQuestion: '', description: '' }),
      ...(name === 'subIssue' && { selectedQuestion: '', description: '' }),
    }));
  };

  const handleQuestionClick = (question) => {
    setExpandedQuestion(expandedQuestion === question ? null : question);
    setFormData((prev) => ({
      ...prev,
      selectedQuestion: question,
      description: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to update a complaint.');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/complaints/${id}`, formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });
      alert(response.data.message);
      navigate('/user');
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Failed to update complaint');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="section-content">
      <h3>Edit Complaint</h3>
      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-group">
          <label>Select Issue</label>
          <select name="issue" value={formData.issue} onChange={handleChange} required>
            <option value="">-- Select an Issue --</option>
            {Object.keys(issues).map((issue) => (
              <option key={issue} value={issue}>{issue}</option>
            ))}
          </select>
        </div>

        {formData.issue && (
          <div className="form-group">
            <label>Related Issue</label>
            <select name="subIssue" value={formData.subIssue} onChange={handleChange} required>
              <option value="">-- Select a Related Issue --</option>
              {issues[formData.issue].map((subIssue) => (
                <option key={subIssue} value={subIssue}>{subIssue}</option>
              ))}
            </select>
          </div>
        )}

        {formData.subIssue && (
          <div className="form-group questions-group">
            <label>Common Questions & Solutions</label>
            {questions[formData.subIssue].map((item, idx) => (
              <div key={idx} className="question-item">
                <p
                  className={`question ${expandedQuestion === item.q ? 'expanded' : ''}`}
                  onClick={() => handleQuestionClick(item.q)}
                >
                  {item.q}
                </p>
                {expandedQuestion === item.q && (
                  <p className="answer">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {formData.selectedQuestion && (
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue..."
              rows="4"
              required
            />
          </div>
        )}

        {formData.description && (
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} required>
              <option value="">-- Select Priority --</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        )}

        {formData.priority && (
          <button type="submit" className="submit-btn">Update Complaint</button>
        )}
      </form>
    </div>
  );
};

export default EditComplaint;