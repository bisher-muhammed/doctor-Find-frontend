import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const PrivateRoutes = ({children,role}) => {
  const { isAuthenticated, isAdmin, isDoctor, isUser } = useSelector(state => state.authUser);

  if (!isAuthenticated && isUser) {
    return <Navigate to="/login" />;
  }

  if (!isAuthenticated && isAdmin){
    return <Navigate to = "/admin/login"/>

  }

  if(!isAuthenticated && isDoctor) {
    return <Navigate to ="/doctor/login"/>
  }

  if (role === 'admin' && !isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  if (role === 'doctor' && !isDoctor) {
    return <Navigate to="/doctor/login" />;
  }

  if (role === 'user' && !isUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoutes
