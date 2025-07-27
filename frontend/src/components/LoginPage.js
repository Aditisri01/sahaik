import React, { useState, useRef } from 'react';
import './LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function LoginPage({ userType = 'teacher', onLoginSuccess }) {
  console.log('NODE_ENV:', process.env.NODE_ENV, 'UserAgent:', navigator.userAgent, 'API_BASE_URL:', API_BASE_URL);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();
  // REMOVE: const [showRegister, setShowRegister] = useState(false);
  // Only show teacher registration fields
  const [regName, setRegName] = useState('');
  const [regTeacherEmail, setRegTeacherEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  React.useEffect(() => {
    // This effect is no longer needed as regRole, regClass, regStudentId are removed
    // Keeping it for now in case it's used elsewhere or if the user wants to re-add it.
    // For now, it will always be empty.
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('API_BASE_URL:', API_BASE_URL, 'Email:', username, 'Password:', password);
    let payload = { password };
    if (userType === 'teacher') {
      if (!username.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }
      payload = { role: 'teacher', email: username, password };
    } else {
      if (!username.trim() || !password.trim()) {
        setError('Please enter both student ID and password.');
        setLoading(false);
        return;
      }
      payload = { role: 'student', student_id: username, password };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          // Store student_class and student_id if present
          if (data.role === 'student') {
            localStorage.setItem('student_class', data.student_class);
            localStorage.setItem('student_id', data.student_id);
          }
          onLoginSuccess(data);
        }, 900);
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('Login failed.');
    }
    setLoading(false);
  };

  return (
    <div className="login-root">
      <div className="login-container">
        {/* Left Column - Image */}
        <div className="login-image-column">
          <div className="login-image-container">
            <img 
              src={require('../assets/teacher-101.gif')} 
              alt="Teacher Login" 
              className="login-image"
            />
          </div>
        </div>
        
        {/* Right Column - Login Form */}
        <div className="login-form-column">
          <div className="login-card" role="main" aria-labelledby="login-title">
            <div className="login-logo">sahAIk</div>
            <h2 className="login-title" id="login-title">{userType === 'teacher' ? 'Teacher Login' : 'Student Login'}</h2>
            <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
              <label className="login-label" htmlFor="login-username">{userType === 'teacher' ? 'Email' : 'Student ID'}</label>
              <input
                className="login-input"
                id="login-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                aria-label={userType === 'teacher' ? 'Full Name' : 'Student ID'}
                autoComplete="username"
              />
              <label className="login-label" htmlFor="login-password">Password</label>
              <div className="login-password-row">
                <input
                  className="login-input"
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  ref={passwordInputRef}
                  aria-label="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={0}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="login-row login-remember-row">
                <label className="login-remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    aria-label="Remember me"
                  />
                  Remember me
                </label>
                <button type="button" className="login-forgot-btn" tabIndex={0} onClick={() => alert('Forgot password? (Demo only)')}>Forgot password?</button>
              </div>
              {error && <div className="login-error" role="alert">{error}</div>}
              <button className="login-btn" type="submit" disabled={loading} aria-busy={loading}>
                {loading ? <span className="login-spinner"></span> : 'Login'}
              </button>
            </form>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button type="button" className="login-link-btn" onClick={() => navigate('/register')}>
                Register New Account
              </button>
            </div>
            <button className="login-back-btn" type="button" onClick={() => navigate('/')}>Back to Welcome</button>
            {success && <div className="login-success">Login successful!</div>}
          </div>

        </div>
      </div>
    </div>
  );
} 