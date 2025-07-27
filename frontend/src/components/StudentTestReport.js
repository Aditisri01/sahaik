import React, { useEffect, useState } from 'react';
import { 
  FaChartBar, 
  FaArrowLeft, 
  FaFilter, 
  FaTimes, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaCalendarAlt, 
  FaBook, 
  FaUser, 
  FaTrophy, 
  FaChartLine,
  FaRegSmile,
  FaGraduationCap
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './StudentTestReport.css';

export default function StudentTestReport() {
  const [history, setHistory] = useState([]);
  const [subjectFilter, setSubjectFilter] = React.useState('');
  const [viewingPerformance, setViewingPerformance] = React.useState(null);
  const [allSubjects, setAllSubjects] = React.useState([]);
  const navigate = useNavigate();
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  
  // Get unique subjects from history
  const subjects = Array.from(new Set(history.map(h => h.subject).filter(Boolean)));
  
  // Filtered history
  const filteredHistory = history.filter(h => 
    (!subjectFilter || h.subject === subjectFilter)
  );
  
  // Get student name from localStorage
  const studentName = localStorage.getItem('student_name') || '';

  // Helper to determine pass/fail (assume 60% passing grade)
  const isPass = (score, totalQuestions) => {
    const num = parseInt(score);
    const total = parseInt(totalQuestions) || 10;
    const percentage = (num / total) * 100;
    return !isNaN(percentage) && percentage >= 60;
  };

  // Calculate real statistics
  const totalTests = history.length;
  const passedTests = history.filter(h => {
    // Try to get total questions from the test data or assume 10
    const totalQuestions = h.totalQuestions || 10;
    return isPass(h.score, totalQuestions);
  }).length;
  
  const averageScore = history.length > 0 
    ? Math.round(history.reduce((sum, h) => {
        const score = parseInt(h.score || 0);
        const total = parseInt(h.totalQuestions || 10);
        return sum + (score / total * 100);
      }, 0) / history.length)
    : 0;
    
  const bestScore = history.length > 0 
    ? Math.max(...history.map(h => {
        const score = parseInt(h.score || 0);
        const total = parseInt(h.totalQuestions || 10);
        return Math.round((score / total) * 100);
      }))
    : 0;

  useEffect(() => {
    // Retrieve test history from localStorage
    const data = localStorage.getItem('student_test_history');
    const studentId = localStorage.getItem('student_id');
    if (data && studentId) {
      const allHistory = JSON.parse(data);
      // Show all attempts, sorted by date (most recent first)
      const studentAttempts = allHistory.filter(h => h.student_id === studentId);
      studentAttempts.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
      setHistory(studentAttempts);
    } else if (data) {
      setHistory(JSON.parse(data));
    }
    
    // Fetch all available subjects from backend
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sahaik-backend-1073580335924.us-central1.run.app';
    fetch(`${API_BASE_URL}/api/available_tests`)
      .then(res => res.json())
      .then(data => {
        if (data.tests && Array.isArray(data.tests)) {
          const subjects = Array.from(new Set(data.tests.map(test => test.subject).filter(Boolean)));
          setAllSubjects(subjects);
        }
      })
      .catch(error => {
        console.error('Error fetching subjects:', error);
      });
  }, []);

  return (
    <div className="progress-root">
      {/* Header */}
      <header className="progress-header">
        <button 
          onClick={() => navigate('/student-home')} 
          className="progress-back-btn"
          title="Back to Student Home"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <div className="progress-header-content">
          <h1 className="progress-title">
            <FaChartBar className="progress-title-icon" />
            My Learning Progress
          </h1>
          <p className="progress-subtitle">
            Track your academic journey and performance across all subjects
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="progress-main">
        {/* Statistics Cards */}
        <div className="progress-stats">
          <div className="progress-stat-card">
            <div className="progress-stat-icon">
              <FaGraduationCap />
            </div>
            <div className="progress-stat-content">
              <div className="progress-stat-number">{totalTests}</div>
              <div className="progress-stat-label">Total Tests</div>
            </div>
          </div>
          
          <div className="progress-stat-card">
            <div className="progress-stat-icon passed">
              <FaCheckCircle />
            </div>
            <div className="progress-stat-content">
              <div className="progress-stat-number">{passedTests}</div>
              <div className="progress-stat-label">Tests Passed</div>
            </div>
          </div>
          
          <div className="progress-stat-card">
            <div className="progress-stat-icon average">
              <FaChartLine />
            </div>
            <div className="progress-stat-content">
              <div className="progress-stat-number">{averageScore}%</div>
              <div className="progress-stat-label">Average Score</div>
            </div>
          </div>
          
          <div className="progress-stat-card">
            <div className="progress-stat-icon best">
              <FaTrophy />
            </div>
            <div className="progress-stat-content">
              <div className="progress-stat-number">{bestScore}%</div>
              <div className="progress-stat-label">Best Score</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="progress-filters">
          <div className="progress-filter-group">
            <label className="progress-filter-label">
              <FaFilter />
              Filter by Subject
            </label>
            <select 
              value={subjectFilter} 
              onChange={e => setSubjectFilter(e.target.value)}
              className="progress-filter-select"
            >
              <option value=''>All Subjects</option>
              {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          {subjectFilter && (
            <button 
              onClick={() => setSubjectFilter('')}
              className="progress-reset-btn"
            >
              <FaTimes />
              Reset Filters
            </button>
          )}
        </div>

        {/* Results Section */}
        <div className="progress-results">
          {filteredHistory.length === 0 ? (
            <div className="progress-empty">
              <FaRegSmile className="progress-empty-icon" />
              <h3>No tests taken yet</h3>
              <p>Start your learning journey by taking your first test!</p>
              <button 
                onClick={() => navigate('/take-test')}
                className="progress-empty-btn"
              >
                Take Your First Test
              </button>
            </div>
          ) : (
            <div className="progress-table-container">
              <table className="progress-table">
                <thead>
                  <tr>
                    <th><FaCalendarAlt /> Date</th>
                    <th><FaBook /> Subject</th>
                    <th><FaUser /> Student</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h, i) => {
                    const score = parseInt(h.score || 0);
                    const totalQuestions = parseInt(h.totalQuestions || 10);
                    const percentage = Math.round((score / totalQuestions) * 100);
                    const passed = isPass(score, totalQuestions);
                    
                    return (
                      <tr key={i} className="progress-table-row">
                        <td className="progress-date">
                          {new Date(h.timestamp || h.date).toLocaleDateString()}
                        </td>
                        <td className="progress-subject">{h.subject}</td>
                        <td className="progress-student">{studentName}</td>
                        <td className="progress-score">
                          <span className={`score-badge score-${percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : 'needs-improvement'}`}>
                            {score}/{totalQuestions} ({percentage}%)
                          </span>
                        </td>
                        <td className="progress-result">
                          <span className={`result-badge ${passed ? 'passed' : 'failed'}`}>
                            {passed ? <FaCheckCircle /> : <FaTimesCircle />}
                            {passed ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                        <td className="progress-action">
                          <button 
                            onClick={() => setViewingPerformance(i)}
                            className="progress-view-btn"
                          >
                            <FaEye />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Detail View */}
        {viewingPerformance !== null && filteredHistory[viewingPerformance] && (
          <div className="progress-detail-overlay">
            <PerformanceViewReport 
              attempt={filteredHistory[viewingPerformance]} 
              onClose={() => setViewingPerformance(null)} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

// PerformanceViewReport: shows answers and correct answers for a given attempt
function PerformanceViewReport({ attempt, onClose }) {
  const [test, setTest] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    setLoading(true);
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sahaik-backend-1073580335924.us-central1.run.app';
    fetch(`${API_BASE_URL}/get_test/${attempt.test_id}?language=${localStorage.getItem('selectedLanguage') || 'en'}`)
      .then(res => res.json())
      .then(data => {
        setTest(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading test:', error);
        setLoading(false);
      });
  }, [attempt.test_id]);
  
  if (loading) {
    return (
      <div className="progress-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading test details...</p>
      </div>
    );
  }
  
  if (!test) {
    return (
      <div className="progress-detail-error">
        <p>Unable to load test details. Please try again.</p>
        <button onClick={onClose} className="progress-close-btn">Close</button>
      </div>
    );
  }
  
  const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
  
  return (
    <div className="progress-detail">
      <button onClick={onClose} className="progress-detail-close">
        <FaTimes />
      </button>
      
      <div className="progress-detail-header">
        <h2>Performance Details</h2>
        <div className="progress-detail-meta">
          <span><strong>Student:</strong> {localStorage.getItem('student_name') || 'N/A'}</span>
          <span><strong>Date:</strong> {new Date(attempt.timestamp || attempt.date).toLocaleDateString()}</span>
          <span><strong>Score:</strong> {attempt.score}</span>
        </div>
      </div>
      
      <div className="progress-detail-questions">
        <ol>
          {test.questions.map((q, i) => (
            <li key={i} className="progress-question">
              <div className="question-text">{q.q}</div>
              <div className="question-answers">
                <div className="answer-row">
                  <span className="answer-label">Your answer:</span>
                  <span className={`answer-value ${answers[i] === q.answer ? 'correct' : 'incorrect'}`}>
                    {(answers[i] !== undefined && answers[i] !== null) ? answers[i] : <em>Not answered</em>}
                  </span>
                </div>
                <div className="answer-row">
                  <span className="answer-label">Correct answer:</span>
                  <span className="answer-value correct">{q.answer}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
} 