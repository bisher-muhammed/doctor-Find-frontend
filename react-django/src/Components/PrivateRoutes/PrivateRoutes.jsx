import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoutes = ({ children, role }) => {
  const { isAuthenticated, isAdmin, isDoctor, isUser } = useSelector(
    (state) => state.authUser
  );

  // ✅ Handle not authenticated (with role-specific redirection)
  if (!isAuthenticated) {
    if (role === 'admin') return <Navigate to="/admin/login" />;
    if (role === 'doctor') return <Navigate to="/doctor/login" />;
    return <Navigate to="/login" />;
  }

  // ✅ Authenticated but wrong role
  if (role === 'admin' && !isAdmin) return <Navigate to="/admin/login" />;
  if (role === 'doctor' && !isDoctor) return <Navigate to="/doctor/login" />;
  if (role === 'user' && !isUser) return <Navigate to="/login" />;

  return children;
};

export default PrivateRoutes;
