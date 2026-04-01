import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token); 
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication error');
    }
  };

  return (
    <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>
      {error && <p style={{color: 'var(--danger)', marginBottom: '1rem'}}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email Address" className="input" required
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" className="input" required
          onChange={e => setFormData({...formData, password: e.target.value})} />
        
        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
           Login
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Register</Link>
      </p>
    </div>
  );
};

export default Login;
