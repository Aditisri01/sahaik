import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaLanguage, FaArrowLeft, FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import './StudentTestPortal.css';

const subjects = [
  'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi',
  'Computer', 'General Knowledge', 'Other'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'ur', name: 'اردو (Urdu)' }
];

export default function StudentTestPortal({ language }) {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'en');
  const [studentClass, setStudentClass] = useState(localStorage.getItem('student_class') || 'Class 1');
  const [studentId] = useState(localStorage.getItem('student_id') || '');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [testList, setTestList] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(30 * 60); // 30 minutes in seconds
  const [timeUp, setTimeUp] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [translatedRemark, setTranslatedRemark] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [expandedTips, setExpandedTips] = useState([]);
  const timerRef = useRef(null);
  const [viewingPerformance, setViewingPerformance] = useState(null); // test_id or null
  
  useEffect(() => { 
    if(language) i18n.changeLanguage(language); 
  }, [language, i18n]);
  
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('selectedLanguage', selectedLanguage);
  }, [selectedLanguage, i18n]);

  // Separate useEffect to handle test refresh when language changes
  useEffect(() => {
    if (currentTest && selectedLanguage && currentTest.test_id) {
      console.log('DEBUG: Language changed, refreshing test with new language:', selectedLanguage);
      setIsTranslating(true);
      const refreshTest = async () => {
        try {
          const url = `${API_BASE_URL}/get_test/${currentTest.test_id}?language=${selectedLanguage}`;
          console.log('DEBUG: Refreshing test with URL:', url);
          const res = await axios.get(url);
          console.log('DEBUG: Refreshed test data:', res.data);
          setCurrentTest(res.data);
          // Reset answers when language changes
          setAnswers(res.data.questions.map(() => ''));
        } catch (error) {
          console.error('Error refreshing test:', error);
        } finally {
          setIsTranslating(false);
        }
      };
      refreshTest();
    }
    // eslint-disable-next-line
  }, [selectedLanguage, currentTest ? currentTest.test_id : null]);

  // When tips are loaded, initialize expandedTips to all false
  useEffect(() => {
    setExpandedTips(Array(aiSuggestions.length).fill(false));
  }, [aiSuggestions.length]);

  // Fetch test list when component loads or when class/subject changes
  useEffect(() => {
    fetchTestList();
  }, [studentClass, selectedSubject]);

  // Demo: username to class mapping
  const navigate = useNavigate();
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const fetchTestList = async () => {
    console.log('Fetching tests for class:', studentClass, 'subject:', selectedSubject);
    try {
      // Use the new endpoint that handles filtering better
      const res = await axios.get(`${API_BASE_URL}/api/available_tests`);
      let allTests = res.data.tests || [];
      
      console.log('All tests before filtering:', allTests);
      console.log('Tests with test_id:', allTests.map(t => ({ test_id: t.test_id, topic: t.topic, class: t.class, subject: t.subject })));
      
      // Filter by class and subject, handling "All" selection and null values
      allTests = allTests.filter(test => {
        // Skip tests with null class or subject
        if (!test.class || !test.subject) {
          console.log('Skipping test with null class/subject:', test);
          return false;
        }
        return test.class === studentClass && (selectedSubject === 'All' || test.subject === selectedSubject);
      });
      
      console.log('Test list response:', res.data);
      console.log('Filtered tests for class:', studentClass, 'subject:', selectedSubject, 'count:', allTests.length);
      console.log('Final test list:', allTests);
      setTestList(allTests);
    } catch (error) {
      console.error('Error fetching test list:', error);
      setTestList([]);
    }
  };

  const handleStartTest = async (testId) => {
    console.log('handleStartTest called with testId:', testId);
    if (!testId || testId === 'undefined' || testId === 'null') {
      console.error('Invalid testId:', testId);
      alert('Invalid test ID. Please try again.');
      return;
    }
    
    try {
      const res = await axios.get(`${API_BASE_URL}/get_test/${testId}?language=${selectedLanguage}`);
      console.log('Test data received:', res.data);
      setCurrentTest(res.data);
      setAnswers(res.data.questions.map(() => ''));
      setScore(null);
      setSubmitted(false);
      setTimeUp(false);
      setTimer(30 * 60);
      setRemarks('');
      setTranslatedRemark('');
      setAiSuggestions([]);
      setExpandedTips([]);
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Error loading test. Please try again.');
    }
  };

  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitted) return;
    
    setSubmitted(true);
    clearInterval(timerRef.current);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/submit_test`, {
        test_id: currentTest.test_id,
        student_id: studentId,
        answers: answers,
        class: studentClass,
        subject: selectedSubject,
        topic: currentTest.topic,
        language: selectedLanguage
      });
      
      setScore(res.data.score);
      setRemarks(res.data.remark);
      setTranslatedRemark(res.data.translated_remark);
      setAiSuggestions(res.data.ai_suggestions || []);
      
      // Save to local history
      const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
      const historyEntry = {
        test_id: currentTest.test_id,
        student_id: studentId,
        class: studentClass,
        subject: selectedSubject,
        topic: currentTest.topic,
        answers: answers,
        score: res.data.score,
        timestamp: new Date().toISOString(),
        aiSuggestions: res.data.ai_suggestions || []
      };
      console.log('Saving test history entry:', historyEntry);
      history.push(historyEntry);
      localStorage.setItem('student_test_history', JSON.stringify(history));
      console.log('Updated localStorage history:', JSON.parse(localStorage.getItem('student_test_history') || '[]'));
      
    } catch (error) {
      console.error('Error submitting test:', error);
      setScore(0);
      setRemarks('Error submitting test');
      setTranslatedRemark('Error submitting test');
    }
  };

  // Timer effect
  useEffect(() => {
    if (currentTest && !submitted && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setTimeUp(true);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentTest, submitted, timer]);

  const getConciseTip = (tip) => {
    return tip.length > 80 ? tip.substring(0, 80) + '...' : tip;
  };

  const hasTakenTest = (testId) => {
    const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
    return history.some(h => h.test_id === testId && h.student_id === studentId);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (timer <= 60) return 'danger';
    if (timer <= 300) return 'warning';
    return '';
  };

  return (
    <div className="test-portal-root">
      <div className="test-portal-container">
        {/* Back Button */}
        <button className="test-portal-back-btn" onClick={() => navigate('/student-home')}>
          <FaArrowLeft />
          Back
        </button>

        {/* Header Section */}
        <div className="test-portal-header">
          <div className="test-portal-header-content">
            <div className="test-portal-controls">
              <div className="test-portal-language-group">
                <FaLanguage className="test-portal-language-icon" />
                <select
                  className="test-portal-language-select"
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
                {isTranslating && (
                  <span className="test-portal-translating">
                    Translating...
                  </span>
                )}
              </div>
              <button 
                className="test-portal-progress-btn" 
                onClick={() => navigate('/student-report')}
              >
                {t('My Progress Report')}
              </button>
            </div>
          </div>
          
          <h1 className="test-portal-title">{t('Welcome, Student!')}</h1>
          
          <div className="test-portal-student-info">
            {studentId && (
              <div className="test-portal-student-id">
                Student ID: <span>{studentId.replace(/^Class \d+-/, '')}</span>
              </div>
            )}
            {studentClass && (
              <div className="test-portal-class">
                Class: <span>{studentClass.replace(/^Class\s*/, '')}</span>
              </div>
            )}
          </div>

          {/* Subject Selection */}
          <div className="test-portal-subject-section">
            <select 
              className="test-portal-subject-select"
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="All">All Subjects</option>
              {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
            <button className="test-portal-show-btn" onClick={fetchTestList}>
              {t('Show Available Tests')}
            </button>
            <button className="test-portal-refresh-btn" onClick={fetchTestList}>
              <FaClipboardList />
              {t('Refresh')}
            </button>
          </div>
        </div>

        {!currentTest ? (
          <>
            {testList.length === 0 ? (
              <div className="test-portal-no-tests">{t('No test available')}</div>
            ) : (
              <ul className="test-portal-test-list">
                {testList.map(test => (
                  <li key={test.test_id} className="test-portal-test-item">
                    <div className="test-portal-test-info">
                      <div className="test-portal-test-details">
                        <div className="test-portal-test-topic">{test.topic}</div>
                        <div className="test-portal-test-meta">{test.subject}, {test.class}</div>
                      </div>
                      {!hasTakenTest(test.test_id) ? (
                        <button 
                          className="test-portal-test-btn"
                          onClick={() => handleStartTest(test.test_id)}
                        >
                          {t('Take Test')}
                        </button>
                      ) : (
                        <button 
                          className="test-portal-view-btn"
                          onClick={() => {
                            console.log('View Performance clicked for test:', test.test_id);
                            console.log('Current localStorage history:', JSON.parse(localStorage.getItem('student_test_history') || '[]'));
                            setViewingPerformance(test.test_id);
                          }}
                        >
                          {t('View Performance')}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Performance Section - Inline */}
            {viewingPerformance && (
              <div style={{ marginTop: '2rem' }}>
                <PerformanceView testId={viewingPerformance} onClose={() => setViewingPerformance(null)} inline />
              </div>
            )}
          </>
        ) : (
          <div>
            {/* Test Header */}
            <div className="test-portal-test-header">
              <h3 className="test-portal-test-title">
                <FaClipboardList style={{ marginRight: '0.5rem', color: '#7C91E7' }} />
                {t('Test')}: {currentTest.topic}
              </h3>
              <div className={`test-portal-timer ${getTimerClass()}`}>
                <FaClock style={{ marginRight: '0.5rem' }} />
                {t('Time Left')}: {formatTime(timer)}
              </div>
            </div>

            {timeUp && (
              <div className="test-portal-time-up">
                {t('Time is up! Your test has been submitted automatically.')}
              </div>
            )}

            {/* Questions */}
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              <div className="test-portal-questions">
                {currentTest.questions.map((q, i) => (
                  <div key={i} className="test-portal-question">
                    <div className="test-portal-question-text">
                      <strong>{i + 1}.</strong> {q.q}
                    </div>
                    <div className="test-portal-question-type">
                      Type: {q.type.toUpperCase()}
                    </div>
                    {q.type === 'mcq' ? (
                      <div className="test-portal-options">
                        {q.options.map((opt, j) => (
                          <label key={j} className="test-portal-option">
                            <input
                              type="radio"
                              name={`q${i}`}
                              value={opt}
                              checked={answers[i] === opt}
                              onChange={() => handleAnswerChange(i, opt)}
                              disabled={submitted}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="test-portal-text-input"
                        value={answers[i]}
                        onChange={e => handleAnswerChange(i, e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={submitted}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {!submitted && (
                <button type="submit" className="test-portal-submit-btn">
                  {t('Submit Answers')}
                </button>
              )}
            </form>

            {/* Results */}
            {submitted && (
              <>
                <div className="test-portal-score">
                  <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                  {t('Your score')}: {score} / {currentTest.questions.length}
                </div>
                
                <div className="test-portal-remark">{translatedRemark}</div>
                
                {aiSuggestions.length > 0 && (
                  <div className="test-portal-tips">
                    <div className="test-portal-tips-title">
                      {t('Tips for your incorrect answers')}:
                    </div>
                    <ol className="test-portal-tips-list">
                      {aiSuggestions.map((tip, i) => (
                        <li key={i} className="test-portal-tip-item">
                          {expandedTips[i] ? tip : getConciseTip(tip)}
                          {tip.length > 80 && (
                            <button
                              className="test-portal-tip-toggle"
                              onClick={() => setExpandedTips(tips => tips.map((v, idx) => idx === i ? !v : v))}
                            >
                              {expandedTips[i] ? t('Show less') : t('Show more')}
                            </button>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                <button 
                  className="test-portal-back-list-btn"
                  onClick={() => setCurrentTest(null)}
                >
                  {t('Back to Test List')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PerformanceView({ testId, onClose, inline }) {
  const studentId = localStorage.getItem('student_id') || '';
  const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
  const perf = history.find(h => h.test_id === testId && h.student_id === studentId);
  const [test, setTest] = React.useState(null);
  
  // Debug logging
  console.log('PerformanceView Debug:', {
    testId,
    studentId,
    historyLength: history.length,
    perf,
    foundPerf: !!perf
  });
  
  React.useEffect(() => {
    console.log('PerformanceView useEffect - testId:', testId, 'perf:', perf);
    
    if (!testId) {
      console.error('No testId provided to PerformanceView');
      return;
    }
    
    axios.get(`${API_BASE_URL}/get_test/${testId}?language=${localStorage.getItem('selectedLanguage') || 'en'}`)
      .then(res => {
        console.log('Test data loaded:', res.data);
        setTest(res.data);
      })
      .catch(err => {
        console.error('Error loading test:', err);
      });
  }, [testId, perf]);
  
  if (!perf) {
    console.log('No performance data found for testId:', testId, 'studentId:', studentId);
    return <div style={{ marginTop: 24, color: '#e11d48' }}>
      Could not load performance data. 
      <br />
      <small>Test ID: {testId}, Student ID: {studentId}</small>
      <br />
      <small>History entries: {history.length}</small>
    </div>;
  }
  
  if (!test) {
    return <div style={{ marginTop: 24, color: '#e11d48' }}>Loading test data...</div>;
  }
  
  const answers = Array.isArray(perf.answers) ? perf.answers : [];
  const totalQuestions = test.questions.length;
  const correctAnswers = test.questions.filter((q, i) => {
    const normalize = s => (typeof s === 'string' ? s.trim().toLowerCase().replace(/\W+/g, '') : '');
    return normalize(q.answer) === normalize(answers[i] || '');
  }).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  const getPerformanceColor = () => {
    if (percentage >= 90) return '#10b981'; // green
    if (percentage >= 80) return '#3b82f6'; // blue
    if (percentage >= 70) return '#f59e0b'; // yellow
    if (percentage >= 60) return '#f97316'; // orange
    return '#ef4444'; // red
  };
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Excellent! You've mastered this topic! 🎉";
    if (percentage >= 80) return "Great job! You have a solid understanding! 👍";
    if (percentage >= 70) return "Good effort! You're on the right track! 💪";
    if (percentage >= 60) return "Not bad! Keep practicing to improve! 📚";
    return "Don't worry! Learning takes time. Keep going! 🌟";
  };
  
  return (
    <div className="test-portal-performance-inline">
      <div className="performance-header">
        <h2 className="test-portal-performance-title">Test Performance Report</h2>
        <button onClick={onClose} className="test-portal-performance-close">
          <FaTimesCircle />
        </button>
      </div>
      
      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="performance-stats">
          <div className="performance-stat">
            <div className="stat-number" style={{ color: getPerformanceColor() }}>{percentage}%</div>
            <div className="stat-label">Score</div>
          </div>
          <div className="performance-stat">
            <div className="stat-number">{correctAnswers}/{totalQuestions}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="performance-stat">
            <div className="stat-number">{totalQuestions - correctAnswers}</div>
            <div className="stat-label">Incorrect</div>
          </div>
        </div>
        <div className="performance-message" style={{ color: getPerformanceColor() }}>
          {getPerformanceMessage()}
        </div>
      </div>
      
      {/* Detailed Question Analysis */}
      <div className="question-analysis">
        <h3>Question Analysis</h3>
        <ol className="test-portal-performance-answers">
          {test.questions.map((q, i) => {
            const isCorrect = (() => {
              const normalize = s => (typeof s === 'string' ? s.trim().toLowerCase().replace(/\W+/g, '') : '');
              return normalize(q.answer) === normalize(answers[i] || '');
            })();
            
            return (
              <li key={i} className={`test-portal-performance-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-header">
                  <span className="question-number">Question {i + 1}</span>
                  <span className={`question-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                </div>
                
                <div className="test-portal-performance-question">{q.q}</div>
                
                <div className="answer-comparison">
                  <div className="test-portal-performance-user-answer">
                    <span className="answer-label">Your answer:</span>
                    <span className={`answer-text ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {(answers[i] !== undefined && answers[i] !== null && answers[i] !== '') ? answers[i] : <i>Not answered</i>}
                    </span>
                  </div>
                  
                  <div className="test-portal-performance-correct-answer">
                    <span className="answer-label">Correct answer:</span>
                    <span className="answer-text correct">{q.answer}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
} 