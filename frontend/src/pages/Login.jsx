// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/forms/FormInput';

function Login() {
    const { login, error } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      email: '',
      password: ''
    });

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const result = await login(formData);
    //     if (result.success) {
    //         navigate('/');
    //     }
    // };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const result = await login(formData);
          console.log('Login response:', result); // Add this for debugging
          if (result.success) {
              navigate('/');
          }
      } catch (err) {
          console.error('Login error:', err); // Add this for debugging
      }
  };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                    <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;