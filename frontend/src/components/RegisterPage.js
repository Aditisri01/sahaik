import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const navigate = useNavigate();

  const isNameValid = name.trim().length > 0;
  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  const validate = () => {
    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      setError('Please fix the errors above.');
      return false;
    }
    setError('');
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    console.log('API_BASE_URL:', API_BASE_URL, 'Register payload:', { name, email, password });
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { role: 'teacher', name, email, password };
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (res.ok) {
        if (isAndroid) {
          if (data.success) {
            setSuccess('Registration successful! You can now log in.');
            setName(''); setEmail(''); setPassword('');
            setTouched({ name: false, email: false, password: false });
          } else {
            setError(data.error || 'Registration failed.');
          }
        } else {
          setSuccess('Registration successful! You can now log in.');
          setName(''); setEmail(''); setPassword('');
          setTouched({ name: false, email: false, password: false });
        }
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Registration failed.');
    }
    setLoading(false);
  };

  const getInputClass = (field, valid) => {
    if (!touched[field]) return 'login-input';
    return 'login-input ' + (valid ? 'input-valid' : 'input-invalid');
  };

  return (
    <div className="login-root">
      <div className="login-card" role="main" aria-labelledby="register-title">
        <div className="login-logo">sahAIk</div>
        <h2 className="login-title" id="register-title">New Teacher Registration</h2>
        <form onSubmit={handleRegister} className="login-form" autoComplete="on">
          <label className="login-label">Full Name</label>
          <div className="input-row">
            <input
              className={getInputClass('name', isNameValid)}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              autoFocus
            />
            {touched.name && (isNameValid
              ? <FaCheckCircle className="input-icon valid" />
              : <FaExclamationCircle className="input-icon invalid" />)}
          </div>
          {touched.name && !isNameValid && <div className="input-error">Full Name is required.</div>}

          <label className="login-label">Email</label>
          <div className="input-row">
            <input
              className={getInputClass('email', isEmailValid)}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
            />
            {touched.email && (isEmailValid
              ? <FaCheckCircle className="input-icon valid" />
              : <FaExclamationCircle className="input-icon invalid" />)}
          </div>
          {touched.email && !isEmailValid && <div className="input-error">Enter a valid email address.</div>}

          <label className="login-label">Password</label>
          <div className="input-row">
            <input
              className={getInputClass('password', isPasswordValid)}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
            />
            {touched.password && (isPasswordValid
              ? <FaCheckCircle className="input-icon valid" />
              : <FaExclamationCircle className="input-icon invalid" />)}
          </div>
          {touched.password && !isPasswordValid && <div className="input-error">Password must be at least 6 characters.</div>}

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          <button className="login-btn" type="submit" style={{ marginTop: 12 }} disabled={loading} aria-busy={loading}>
            {loading ? <span className="login-spinner"></span> : 'Register'}
          </button>
        </form>
        <button className="login-back-btn" type="button" onClick={() => navigate('/teacher-login')} style={{ marginTop: 18 }}>
          Back to Login
        </button>
      </div>
    </div>
  );
} 