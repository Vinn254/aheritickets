// src/utils/api.js
export const API_BASE = import.meta.env.VITE_API_URL || "https://aheritickets.onrender.com"; // backend server

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
    let errorMessage = "Request failed";
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || "Request failed";
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
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
  // for file uploads
  upload: (endpoint, formData) => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    });
  },
};


export default API;
