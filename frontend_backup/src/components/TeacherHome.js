import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaCloudUploadAlt, FaRobot, FaUserPlus, FaBook } from 'react-icons/fa';
import './TeacherHome.css';
import { API_BASE_URL } from '../config';

function generateStudentID(name, studentClass) {
  if (!name || !studentClass) return '';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${studentClass}-${initials}-${rand}`;
}

export default function TeacherHome() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [password, setPassword] = useState('');
  const [studentID, setStudentID] = useState('');

  React.useEffect(() => {
    if (name && studentClass) {
      setStudentID(generateStudentID(name, studentClass));
    } else {
      setStudentID('');
    }
  }, [name, studentClass]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!name.trim() || !studentClass.trim() || !password.trim() || !studentID.trim()) {
      alert('Please fill all fields.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          name,
          student_class: studentClass,
          student_id: studentID,
          password
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Student enrolled successfully! Student ID: ${data.student_id || studentID}`);
        setName(''); setStudentClass(''); setPassword(''); setStudentID('');
      } else {
        alert(data.error || 'Enrollment failed.');
      }
    } catch (err) {
      alert('Enrollment failed.');
    }
  };

  return (
    <div className="teacher-home-root">
      <h1 className="teacher-home-title">Welcome, Teacher</h1>
      <p className="teacher-home-desc">Choose what you want to do:</p>
      <div className="teacher-home-btn-row">
        <button className="teacher-home-btn" onClick={() => navigate('/teacher')}>
          <FaChalkboardTeacher className="teacher-home-icon" />
          Test Creation
        </button>
        <button className="teacher-home-btn" onClick={() => navigate('/extractor', { state: { from: 'teacher-home' } })}>
          <FaCloudUploadAlt className="teacher-home-icon" />
          Image Text Extractor
        </button>
        <button className="teacher-home-btn" onClick={() => navigate('/assistant', { state: { from: 'teacher-home' } })}>
          <FaRobot className="teacher-home-icon" />
          eduAssistant
        </button>
        <button className="teacher-home-btn" onClick={() => navigate('/enroll-student')}>
          <FaUserPlus className="teacher-home-icon" />
          Enroll Student
        </button>
        <button className="teacher-home-btn" onClick={() => navigate('/published-tests')}>
          <FaBook className="teacher-home-icon" />
          View Published Tests
        </button>
      </div>
      {/* New Features from suvrat_sahAIk */}
      <div className="teacher-home-btn-row" style={{ marginTop: 32 }}>
        <button className="teacher-home-btn" onClick={() => navigate('/learning-content')}>
          <span role="img" aria-label="Book" style={{ fontSize: 32 }}>📚</span>
          Learning Content Generator
        </button>
        <button className="teacher-home-btn" onClick={() => navigate('/diagram-generator')}>
          <span role="img" aria-label="Diagram" style={{ fontSize: 32 }}>🖼️</span>
          Diagram Generator
        </button>
        <button className="teacher-home-btn" onClick={() => navigate('/lesson-planner')}>
          <span role="img" aria-label="Lesson" style={{ fontSize: 32 }}>📝</span>
          Lesson Planner
        </button>
        <button className="teacher-home-btn" onClick={() => navigate('/reading-eval')}>
          <span role="img" aria-label="Reading" style={{ fontSize: 32 }}>📖</span>
          Reading Evaluation
        </button>
      </div>
    </div>
  );
} 