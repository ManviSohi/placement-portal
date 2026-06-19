// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// StrictMode renders components twice in development
// to help detect side effects. Has no impact on production.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);