// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import endpoints from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const navigate = useNavigate();

 useEffect(() => {
   checkAuth();
 }, []);

 const checkAuth = async () => {
   try {
     const result = await endpoints.auth.checkAuth();
     if (result.success) {
       setUser(result.user);
     }
   } catch (error) {
     setError(error.message);
   } finally {
     setLoading(false);
   }
 };

 const login = async (credentials) => {
   try {
     setError(null);
     const result = await endpoints.auth.login(credentials);
     if (result.success) {
       setUser(result.user);
       navigate('/');
       return { success: true };
     } else {
       setError(result.error);
       return { success: false, error: result.error };
     }
   } catch (error) {
     const errorMessage = 'Login failed. Please try again.';
     setError(errorMessage);
     return { success: false, error: errorMessage };
   }
 };

 const logout = async () => {
   try {
     const result = await endpoints.auth.logout();
     if (result.success) {
       setUser(null);
       navigate('/login');
       return { success: true };
     } else {
       setError(result.error);
       return { success: false, error: result.error };
     }
   } catch (error) {
     const errorMessage = 'Logout failed. Please try again.';
     setError(errorMessage);
     return { success: false, error: errorMessage };
   }
 };

 const value = {
   user,
   loading,
   error,
   login,
   logout,
   isAuthenticated: !!user,
   setError
 };

 return (
   <AuthContext.Provider value={value}>
     {!loading && children}
   </AuthContext.Provider>
 );
};

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
   throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};

export default AuthContext;