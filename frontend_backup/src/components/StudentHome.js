import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPencilAlt, FaCloudUploadAlt, FaRobot, FaChartBar } from 'react-icons/fa';
import './StudentHome.css';
import { API_BASE_URL } from '../config';

export default function StudentHome() {
  const navigate = useNavigate();
  const [hasNewTests, setHasNewTests] = useState(false);

  useEffect(() => {
    // Check for new tests for the student's class
    const studentClass = localStorage.getItem('student_class') || 'Class 1';
    fetch(`${API_BASE_URL}/list_tests?class=${encodeURIComponent(studentClass)}&subject=Mathematics`)
      .then(res => res.json())
      .then(data => {
        const testCount = (data.tests && data.tests.length) || 0;
        const lastSeen = parseInt(localStorage.getItem('last_seen_test_count') || '0', 10);
        if (testCount > lastSeen) {
          setHasNewTests(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleTakeTestClick = () => {
    // On click, update last seen test count
    const studentClass = localStorage.getItem('student_class') || 'Class 1';
    fetch(`${API_BASE_URL}/list_tests?class=${encodeURIComponent(studentClass)}&subject=Mathematics`)
      .then(res => res.json())
      .then(data => {
        const testCount = (data.tests && data.tests.length) || 0;
        localStorage.setItem('last_seen_test_count', testCount);
        setHasNewTests(false);
        navigate('/student-tests');
      })
      .catch(() => navigate('/student-tests'));
  };

  return (
    <div className="student-home-root">
      <h1 className="student-home-title">Welcome, Student</h1>
      <p className="student-home-desc">Choose what you want to do:</p>
      <div className="student-home-btn-row">
        <button className="student-home-btn" onClick={() => navigate('/extractor', { state: { from: 'student-home' } })}>
          <FaCloudUploadAlt className="student-home-icon" />
          Image Text Extractor
        </button>
        <button className="student-home-btn" onClick={() => navigate('/assistant', { state: { from: 'student-home' } })}>
          <FaRobot className="student-home-icon" />
          eduAssistant
        </button>
        <button className="student-home-btn" onClick={() => navigate('/counselor-chat')}>
          <span role="img" aria-label="Counselor" style={{ fontSize: 32 }}>🧑‍🎓</span>
          Counselor Chat
        </button>
        <button className="student-home-btn" onClick={handleTakeTestClick} style={{ position: 'relative' }}>
          <FaPencilAlt className="student-home-icon" />
          Take Test
          {hasNewTests && (
            <span style={{ position: 'absolute', top: 18, right: 24, background: '#e11d48', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, boxShadow: '0 1px 4px #e11d4888' }}>New</span>
          )}
        </button>
        <button className="student-home-btn" onClick={() => navigate('/student-report')}>
          <FaChartBar className="student-home-icon" />
          My Progress Report
        </button>
      </div>
    </div>
  );
} 