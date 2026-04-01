import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, Calendar, LogIn } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="nav">
          <Link to="/" className="nav-brand">Smart Study</Link>
          <div className="nav-links">
            <Link to="/dashboard" className="btn btn-secondary">
              <Calendar size={18} /> <span>Dashboard</span>
            </Link>
            {localStorage.getItem('token') ? (
              <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
            ) : (
               <Link to="/login" className="btn btn-primary">
                 <LogIn size={18} /> <span>Login</span>
               </Link>
            )}
          </div>
        </nav>
        <main className="page-container animate-fade-in">
          <Routes>
            <Route path="/" element={
              <div className="card" style={{ textAlign: 'center', padding: 'clamp(2rem, 8vw, 4rem) var(--card-padding)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BookOpen size={48} color="var(--accent-color)" style={{ marginBottom: '1.5rem' }} />
                <h1 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>Welcome to Smart Study Planner</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
                  Analyze your productivity patterns using powerful machine learning. Optimize your daily task list against personalized peak focus windows.
                </p>
                <Link to="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 2.5rem', borderRadius: '0.75rem' }}>Get Started</Link>
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
