import axios from 'axios';
// Create a configured Axios instance.
// All API calls use this instance, not the raw axios object.
//to configure baseURL and headers in ONE place.

const api=axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers:{
        'Content-Type':'application/json'
    },
    timeout:10000,
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Runs before EVERY request is sent.
// Automatically attaches the JWT token to every request.
// Without this, you'd have to manually add the header on every API call.
api.interceptors.request.use(
  (config) => {
    // Read the token from localStorage every time (in case it was updated)
    const token = localStorage.getItem('token');

    if (token) {
      // This is the Authorization header the backend's protect middleware reads
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

//RESPONSE INTERCEPTOR
//Runs after Every response is received
api.interceptors.response.use(
  // Success: just return the response as-is
  (response) => response,

  // Error: handle specific error codes globally
  (error) => {
    if (error.response?.status === 401) {
     
      localStorage.removeItem('token');
      localStorage.removeItem('user');
         // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Always reject so individual components can still catch errors
    return Promise.reject(error);
  }
); 

export default api;
