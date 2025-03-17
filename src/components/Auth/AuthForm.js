import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth/AuthForm.css';
import apiEndpoints from '../../api';  // Import API file

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'User',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? apiEndpoints.login
      : apiEndpoints.register;
    try {
      const res = await axios.post(url, isLogin ? { email: formData.email, password: formData.password } : formData);
      
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        const role = res.data.user.role.toLowerCase();
        navigate(`/${role}`);
      } else {
        alert('Registration successful! Please log in.');
        setIsLogin(true); // Switch to login form
        setFormData({ username: '', email: '', password: '', role: 'User' });
      }
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '', role: 'User' });
  };

  return (
    <div style={{ background: 'linear-gradient(to bottom right, #667eea, #764ba2)', minHeight: '100vh' }}>
      <div className="form-container">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="User">User</option>
                <option value="SubAdmin">SubAdmin</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <span className="toggle-link" onClick={toggleForm}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </span>
      </div>
    </div>
  );
};

export default AuthForm;