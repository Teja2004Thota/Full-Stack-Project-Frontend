import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/UserDashboard/CreateComplaint.css';
import apiEndpoints from '../../api';  // Import API file

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    issue: '',
    subIssue: '',
    selectedQuestion: '',
    description: '',
    priority: '',
    needsAI: false,
    aiResolved: false,
  });

  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [aiFlowCompleted, setAiFlowCompleted] = useState(false);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'issue' && { subIssue: '', selectedQuestion: '', description: '', needsAI: false, aiResolved: false }),
      ...(name === 'subIssue' && { selectedQuestion: '', description: '', needsAI: false, aiResolved: false }),
      ...(name === 'needsAI' && checked && { description: '', aiResolved: false }),
      ...(name === 'needsAI' && !checked && { description: '', aiResolved: false }),
    }));

    if (name === 'issue' || name === 'subIssue') {
      setAiFlowCompleted(false);
    }
  };

  const handleQuestionClick = (question) => {
    setExpandedQuestion(expandedQuestion === question ? null : question);
    setFormData((prev) => ({
      ...prev,
      selectedQuestion: question,
      description: '',
      needsAI: false,
      aiResolved: false,
    }));
  };

  const resetForm = () => {
    setFormData({
      issue: '',
      subIssue: '',
      selectedQuestion: '',
      description: '',
      priority: 'Medium',
      needsAI: false,
      aiResolved: false,
    });
    setExpandedQuestion(null);
    setAiFlowCompleted(false);
  };

  const handleAIResolved = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to submit a complaint.');
      return;
    }

    try {
      const updatedFormData = { 
        ...formData, 
        aiResolved: true,
        priority: formData.priority || "Medium"
      };

      console.log('Submitting with AI Resolved:', updatedFormData);

      const response = await axios.post(apiEndpoints.create, updatedFormData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      alert(`${response.data.message} Create another complaint?`);
      resetForm();
    } catch (error) {
      console.error(error.response?.data || 'Server error');
      alert(error.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const handleAINotResolved = () => {
    setFormData((prev) => ({
      ...prev,
      aiResolved: false,
      needsAI: true,
      description: prev.description || "",
    }));
    setAiFlowCompleted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to submit a complaint.');
      return;
    }

    try {
      console.log('Submitting Complaint:', formData);
      const response = await axios.post('http://localhost:5000/api/complaints/create', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });
      alert(`${response.data.message} Create another complaint?`);
      resetForm();
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="section-content">
      <h3>Create Complaint</h3>
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

        {formData.selectedQuestion && !formData.aiResolved && !aiFlowCompleted && (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="needsAI"
                checked={formData.needsAI}
                onChange={handleChange}
              />
              Need AI Assistance?
            </label>
          </div>
        )}

        {formData.needsAI && !formData.aiResolved && !aiFlowCompleted && (
          <div className="form-group ai-buttons">
            <div className="ai-chatbot">
              <p>AI Chatbot: "Can you describe the '{formData.selectedQuestion}' issue in more detail? I’m here to help!"</p>
            </div>
            <div className="ai-resolution-buttons">
              <button
                type="button"
                className="ai-resolved-btn"
                onClick={handleAIResolved}
              >
                AI Resolved My Issue
              </button>
              <button
                type="button"
                className="ai-not-resolved-btn"
                onClick={handleAINotResolved}
              >
                AI Did Not Resolve My Issue
              </button>
            </div>
          </div>
        )}

        {(aiFlowCompleted || (formData.selectedQuestion && !formData.needsAI && !formData.aiResolved)) && (
          <div className="form-group">
            <label>Description (if unresolved)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue if the above solutions and AI didn’t help..."
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
          <button type="submit" className="submit-btn">Submit Complaint</button>
        )}
      </form>
    </div>
  );
};

export default CreateComplaint;