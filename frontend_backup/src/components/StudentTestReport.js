import React, { useEffect, useState } from 'react';
import { FaChartBar, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function StudentTestReport() {
  const [history, setHistory] = useState([]);
  const [subjectFilter, setSubjectFilter] = React.useState('');
  const [topicFilter, setTopicFilter] = React.useState('');
  const [viewingPerformance, setViewingPerformance] = React.useState(null); // index of attempt
  const navigate = useNavigate();
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  // Get unique subjects and topics from history
  const subjects = Array.from(new Set(history.map(h => h.subject)));
  const topics = Array.from(new Set(history.map(h => h.topic)));
  // Filtered history
  const filteredHistory = history.filter(h => (!subjectFilter || h.subject === subjectFilter) && (!topicFilter || h.topic === topicFilter));
  // Get student name from localStorage
  const studentName = localStorage.getItem('student_name') || '';

  // Helper to determine pass/fail (assume out of 10 by default)
  const isPass = (score) => {
    const num = parseInt(score);
    return !isNaN(num) && num >= 4; // 4/10 = 40%
  };

  useEffect(() => {
    // Retrieve test history from localStorage
    const data = localStorage.getItem('student_test_history');
    const studentId = localStorage.getItem('student_id');
    if (data && studentId) {
      const allHistory = JSON.parse(data);
      // Show all attempts, sorted by date (most recent first)
      const studentAttempts = allHistory.filter(h => h.student_id === studentId);
      studentAttempts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(studentAttempts);
    } else if (data) {
      setHistory(JSON.parse(data));
    }
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #e6f0fa', padding: 40 }}>
      <button onClick={() => navigate('/student-home')} style={{ background: 'none', border: 'none', fontSize: 28, position: 'absolute', left: 16, top: isMobile ? 56 : 16, zIndex: 10, color: '#2563eb', cursor: 'pointer' }} title="Back to Student Home"><FaArrowLeft /></button>
      <h2 style={{ marginBottom: 24, color: '#2563eb', fontWeight: 900, fontSize: '2.1rem', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 12 }}>
        <FaChartBar style={{ color: '#19e6b3', fontSize: 32 }} /> My Test Progress
      </h2>
      {/* Summary Section */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ background: '#e0f4ff', borderRadius: 12, padding: '18px 32px', minWidth: 180, textAlign: 'center', boxShadow: '0 2px 8px #e6f0fa' }}>
          <div style={{ fontSize: 18, color: '#2563eb', fontWeight: 700 }}>Total Tests</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#178aff' }}>{history.length}</div>
        </div>
      </div>
      {/* Filter Section */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 18, alignItems: 'center', justifyContent: 'center' }}>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16 }}>
          <option value=''>All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #bbb', fontSize: 16 }}>
          <option value=''>All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        {(subjectFilter || topicFilter) && <button onClick={() => { setSubjectFilter(''); setTopicFilter(''); }} style={{ marginLeft: 8, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#e0e0e0', color: '#2563eb', fontWeight: 600 }}>Reset</button>}
      </div>
      {/* Table/Card Section */}
      {filteredHistory.length === 0 ? (
        <div style={{ color: '#888', fontStyle: 'italic', fontSize: 18 }}>No tests taken yet.</div>
      ) : (
        <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <table style={{ width: 700, minWidth: 700, borderCollapse: 'collapse', background: '#fafdff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px #e6f0fa', fontSize: 17, margin: '0 auto' }}>
            <thead>
              <tr style={{ background: '#e0edff', color: '#174ea6', fontWeight: 700 }}>
                <th style={{ padding: 14, borderBottom: '2px solid #b3c6e0', textAlign: 'left' }}>Date</th>
                <th style={{ padding: 14, borderBottom: '2px solid #b3c6e0', textAlign: 'left' }}>Subject</th>
                <th style={{ padding: 14, borderBottom: '2px solid #b3c6e0', textAlign: 'left' }}>Topic</th>
                <th style={{ padding: 14, borderBottom: '2px solid #b3c6e0', textAlign: 'left' }}>Name</th>
                <th style={{ padding: 14, borderBottom: '2px solid #b3c6e0', textAlign: 'right' }}>Score</th>
                <th style={{ padding: 14, borderBottom: '2px solid #b3c6e0', textAlign: 'center' }}>Result</th>
                <th style={{ padding: 14, borderBottom: '2px solid #b3c6e0', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((h, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f6f4ef', transition: 'background 0.2s', verticalAlign: 'middle' }}>
                  <td style={{ padding: 13, color: '#2563eb', fontWeight: 600, verticalAlign: 'middle', textAlign: 'left', fontFamily: 'monospace' }}>{h.date}</td>
                  <td style={{ padding: 13, color: '#e11d48', fontWeight: 600, textAlign: 'left', verticalAlign: 'middle' }}>{h.subject}</td>
                  <td style={{ padding: '14px 12px', borderBottom: '1px solid #e0e0e0', textAlign: 'left' }}>
                    {h.topic && h.topic.charAt(0).toUpperCase() + h.topic.slice(1)}
                  </td>
                  <td style={{ padding: 13, color: '#2563eb', fontWeight: 600, textAlign: 'left', verticalAlign: 'middle' }}>{studentName}</td>
                  <td style={{ padding: 13, textAlign: 'right', verticalAlign: 'middle' }}>
                    <span style={{ background: parseInt(h.score) >= 8 ? '#eafbe7' : parseInt(h.score) >= 5 ? '#fff7d6' : '#ffe4e1', color: parseInt(h.score) >= 8 ? '#22c55e' : parseInt(h.score) >= 5 ? '#b68900' : '#e11d48', fontWeight: 800, borderRadius: 8, padding: '6px 18px', fontSize: 18, boxShadow: '0 1px 4px #e6f0fa', display: 'inline-block', minWidth: 60, textAlign: 'center' }}>{h.score}</span>
                  </td>
                  <td style={{ padding: 13, textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{ fontWeight: 700, color: isPass(h.score) ? '#22c55e' : '#e11d48', background: isPass(h.score) ? '#eafbe7' : '#ffe4e1', borderRadius: 6, padding: '2px 16px', fontSize: 16, verticalAlign: 'middle', display: 'inline-block', minWidth: 60 }}>{isPass(h.score) ? 'Pass' : 'Fail'}</span>
                  </td>
                  <td style={{ padding: 13, textAlign: 'center', verticalAlign: 'middle' }}>
                    <button onClick={() => setViewingPerformance(i)} style={{ background: '#e0f4ff', color: '#2563eb', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>View Performance</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Inline Performance View */}
      {viewingPerformance !== null && filteredHistory[viewingPerformance] && (
        <div style={{ marginTop: 32 }}>
          <PerformanceViewReport attempt={filteredHistory[viewingPerformance]} onClose={() => setViewingPerformance(null)} />
        </div>
      )}
    </div>
  );
}

// PerformanceViewReport: shows answers and correct answers for a given attempt
function PerformanceViewReport({ attempt, onClose }) {
  const [test, setTest] = React.useState(null);
  React.useEffect(() => {
    fetch(`${API_BASE_URL}/get_test/${attempt.test_id}?language=${localStorage.getItem('selectedLanguage') || 'en'}`)
      .then(res => res.json())
      .then(data => setTest(data))
      .catch(error => {
        console.error('Error fetching test data:', error);
        setTest(null);
      });
  }, [attempt.test_id]);
  if (!test) return <div style={{ color: '#888', fontStyle: 'italic', marginTop: 16 }}>Loading test details...</div>;
  const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
  return (
    <div style={{ background: '#fafdff', borderRadius: 12, boxShadow: '0 1px 4px #e6f0fa', padding: 32, position: 'relative', maxWidth: 700, margin: '0 auto' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#e11d48', cursor: 'pointer' }}>&times;</button>
      <h3 style={{ color: '#2563eb', fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Performance Details</h3>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 15 }}>
        <b>Name:</b> {localStorage.getItem('student_name') || 'N/A'} &nbsp; <b>Date:</b> {attempt.date} &nbsp; <b>Score:</b> {attempt.score}
      </div>
      <ol style={{ paddingLeft: 20 }}>
        {test.questions.map((q, i) => (
          <li key={i} style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, color: '#222', marginBottom: 4 }}>{q.q}</div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: '#888' }}>Your answer: </span>
              <span style={{ color: answers[i] === q.answer ? '#19e6b3' : '#e11d48', fontWeight: 600 }}>{(answers[i] !== undefined && answers[i] !== null) ? answers[i] : <i>Not answered</i>}</span>
            </div>
            <div style={{ color: '#2563eb', marginTop: 2, fontSize: 15 }}><b>Correct answer:</b> {q.answer}</div>
          </li>
        ))}
      </ol>
    </div>
  );
} 