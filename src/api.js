const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiEndpoints = {
  login: `${BASE_URL}/users/login`,
  register: `${BASE_URL}/users/register`,
  complaints: `${BASE_URL}/complaints`,
  userComplaints: `${BASE_URL}/complaints/user`,
  subAdminComplaints: `${BASE_URL}/complaints/subadmin`,
  complaintById: (id) => `${BASE_URL}/complaints/${id}`,
  resolveComplaint: (id) => `${BASE_URL}/complaints/${id}/resolve`,
  analytics: `${BASE_URL}/analytics`,
};

export default apiEndpoints;
