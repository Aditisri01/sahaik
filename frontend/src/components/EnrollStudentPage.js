import React, { useState } from 'react';
import './EnrollStudentPage.css';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaCopy, FaArrowLeft } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

const classOptions = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

function generateStudentID(name, studentClass) {
  if (!name || !studentClass) return '';
  const classLabel = studentClass.replace(/^Class\s*/i, '');
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${classLabel}-${initials}-${rand}`;
}

export default function EnrollStudentPage() {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [password, setPassword] = useState('');
  const [studentID, setStudentID] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, studentClass: false, password: false });
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const isNameValid = name.trim().length > 0;
  const isClassValid = !!studentClass;
  const isPasswordValid = password.length >= 6;

  const validate = () => {
    if (!isNameValid || !isClassValid || !isPasswordValid) {
      setError('Please fix the errors above.');
      return false;
    }
    setError('');
    return true;
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    const generatedID = generateStudentID(name, studentClass);
    setStudentID(generatedID);
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          name,
          student_class: studentClass,
          student_id: generatedID,
          password
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Student enrolled successfully! Student ID: ${data.student_id || generatedID}`);
        setName(''); setStudentClass(''); setPassword('');
        setCopied(false);
        setTouched({ name: false, studentClass: false, password: false });
      } else {
        setError(data.error || 'Enrollment failed.');
      }
    } catch (err) {
      setError('Enrollment failed.');
    }
    setLoading(false);
  };

  const getInputClass = (field, valid) => {
    if (!touched[field]) return 'enroll-input';
    return 'enroll-input ' + (valid ? 'input-valid' : 'input-invalid');
  };

  return (
    <div className="enroll-root">
      <button onClick={() => navigate('/teacher-home')} className="enroll-back-btn" title="Back to Teacher Home">
        <FaArrowLeft />
        Back to Teacher Home
      </button>
      <div className="enroll-container">
        {/* Left Column: Form */}
        <div className="enroll-form-column">
          <div className="enroll-card" role="main" aria-labelledby="enroll-title">
            <div className="enroll-logo">sahAIk</div>
            <h2 className="enroll-title" id="enroll-title">Enroll New Student</h2>
            <form onSubmit={handleEnroll} className="enroll-form" autoComplete="on">
              <label className="enroll-label">Full Name</label>
              <div className="input-row">
                <input
                  className={getInputClass('name', isNameValid)}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  autoFocus
                  placeholder="Enter full name"
                />
                {touched.name && (isNameValid
                  ? <FaCheckCircle className="input-icon valid" />
                  : <FaExclamationCircle className="input-icon invalid" />)}
              </div>
              {touched.name && !isNameValid && <div className="input-error">Full Name is required.</div>}

              <label className="enroll-label">Class</label>
              <div className="input-row">
                <select
                  className={getInputClass('studentClass', isClassValid)}
                  value={studentClass}
                  onChange={e => setStudentClass(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, studentClass: true }))}
                >
                  <option value="">Select Class</option>
                  {classOptions.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                {touched.studentClass && (isClassValid
                  ? <FaCheckCircle className="input-icon valid" />
                  : <FaExclamationCircle className="input-icon invalid" />)}
              </div>
              {touched.studentClass && !isClassValid && <div className="input-error">Class is required.</div>}

              <label className="enroll-label">Password</label>
              <div className="input-row">
                <input
                  className={getInputClass('password', isPasswordValid)}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  placeholder="Set password"
                />
                {touched.password && (isPasswordValid
                  ? <FaCheckCircle className="input-icon valid" />
                  : <FaExclamationCircle className="input-icon invalid" />)}
              </div>
              {touched.password && !isPasswordValid && <div className="input-error">Password must be at least 6 characters.</div>}

              {error && <div className="enroll-error">{error}</div>}
              {success && (
                <div className="enroll-success" style={{ marginTop: 8 }}>
                  {success}
                  {success.includes('Student ID:') && studentID && (
                    <button
                      type="button"
                      className="enroll-btn"
                      style={{ marginLeft: 8, padding: '2px 8px', fontSize: 14, height: 32 }}
                      onClick={() => {
                        const id = (success.match(/Student ID: ([^\s]+)/) || [])[1] || studentID;
                        if (id) {
                          const isAndroid = /Android/i.test(navigator.userAgent);
                          if (isAndroid) {
                            // Mobile fallback: use textarea and execCommand
                            try {
                              const textarea = document.createElement('textarea');
                              textarea.value = id;
                              document.body.appendChild(textarea);
                              textarea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textarea);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1200);
                            } catch (err) {
                              alert('Copy not supported on this device.');
                            }
                          } else if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(id);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1200);
                          }
                        }
                      }}
                    >
                      <FaCopy style={{ marginRight: 4 }} />
                      {copied ? 'Copied!' : 'Copy ID'}
                    </button>
                  )}
                </div>
              )}
              <button className="enroll-btn" type="submit" style={{ marginTop: 12 }} disabled={loading} aria-busy={loading}>
                {loading ? <span className="enroll-spinner"></span> : 'Enroll Student'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="enroll-image-column">
          <div className="enroll-image-container">
                          <img
                src={require('../assets/enroll-2.gif')}
                alt="Student Enrollment"
                className="enroll-page-image"
              />
          </div>
        </div>
      </div>
    </div>
  );
} 