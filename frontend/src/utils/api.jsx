// src/utils/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"; // backend server

const apiRequest = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
};


const API = {
  get: (endpoint) => apiRequest(endpoint, "GET", null, localStorage.getItem("token")),
  post: (endpoint, body) => apiRequest(endpoint, "POST", body, localStorage.getItem("token")),
  put: (endpoint, body) => apiRequest(endpoint, "PUT", body, localStorage.getItem("token")),
  patch: (endpoint, body) => apiRequest(endpoint, "PATCH", body, localStorage.getItem("token")),
  delete: (endpoint) => apiRequest(endpoint, "DELETE", null, localStorage.getItem("token")),
  // new helper for auth
  authPost: (endpoint, body) => apiRequest(endpoint, "POST", body, null),
};


export default API;
