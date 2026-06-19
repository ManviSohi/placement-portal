// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute     from './components/common/AdminRoute';
import Navbar from "./components/common/Navbar";
// Pages
import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import Profile     from './pages/Profile';
import Jobs        from './pages/Jobs';
import JobDetail   from './pages/JobDetail';
import AppliedJobs from './pages/AppliedJobs';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageJobs  from './pages/admin/ManageJobs';
import NotFound    from './pages/NotFound';

const App = () => {
  return (
    // BrowserRouter provides routing context to all children
    <BrowserRouter>
      {/* AuthProvider wraps everything so all pages can access auth state */}
      <AuthProvider>
        <Navbar/>
        <Routes>
          {/* Public routes — accessible by anyone */}
          <Route path="/"        element={<Landing />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs"    element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Protected routes — must be logged in as a student */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/applied-jobs" element={
            <ProtectedRoute><AppliedJobs /></ProtectedRoute>
          } />

          {/* Admin routes — must be logged in as admin */}
          <Route path="/admin/dashboard" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/jobs" element={
            <AdminRoute><ManageJobs /></AdminRoute>
          } />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;