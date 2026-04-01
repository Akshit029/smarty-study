import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token); 
      navigate('/dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Registration error');
    }
  };

  return (
    <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
      {error && <p style={{color: 'var(--danger)', marginBottom: '1rem'}}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" className="input" required
          onChange={e => setFormData({...formData, name: e.target.value})} />
        <input type="email" placeholder="Email Address" className="input" required
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" className="input" required
          onChange={e => setFormData({...formData, password: e.target.value})} />
        
        <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
           Register
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Login</Link>
      </p>
    </div>
  );
};

export default Signup;
