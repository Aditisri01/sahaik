import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaChalkboardTeacher, FaImage, FaArrowLeft, FaPlus, FaEye, FaSave, FaList, FaChartBar, FaRobot, FaEdit } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './TeacherPortal.css';

const classes = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];
const subjects = [
  'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi',
  'Computer', 'General Knowledge', 'Other'
];

export default function TeacherPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('mcq');
  const [mode, setMode] = useState('ai');
  const [questions, setQuestions] = useState([]);
  const [manualQ, setManualQ] = useState('');
  const [manualType, setManualType] = useState('mcq');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualAnswer, setManualAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [testList, setTestList] = useState([]);
  const [showResponses, setShowResponses] = useState(null);
  const [responses, setResponses] = useState({});
  const [detailsStudent, setDetailsStudent] = useState(null);
  const [showCreatedTests, setShowCreatedTests] = useState(location.pathname === '/published-tests');
  const [showStudentScores, setShowStudentScores] = useState(true);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef();

  // Helper to fetch student names by ID (cache in state)
  const [studentNames, setStudentNames] = useState({});
  const fetchStudentName = async (studentId) => {
    if (!studentId || studentNames[studentId]) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/get_student_name/` + studentId);
      setStudentNames(prev => ({ ...prev, [studentId]: res.data.name || studentId }));
    } catch {
      setStudentNames(prev => ({ ...prev, [studentId]: studentId }));
    }
  };
  // Fetch names for all students in responses
  useEffect(() => {
    if (responses && Object.keys(responses).length > 0) {
      Object.keys(responses).forEach(studentId => fetchStudentName(studentId));
    }
  }, [responses]);

  useEffect(() => {
    fetchTestList();
    // eslint-disable-next-line
  }, [selectedClass, selectedSubject]);

  const handleGenerateAI = async () => {
    setLoading(true);
    setQuestions([]);
    try {
      const res = await axios.post(`${API_BASE_URL}/generate_test_ai`, {
        class: selectedClass,
        subject: selectedSubject,
        topic,
        num_questions: numQuestions,
        question_type: questionType
      });
      setQuestions(res.data.questions);
    } catch (e) {
      alert('AI generation failed: ' + (e.response?.data?.error || e.message));
    }
    setLoading(false);
  };

  const handleAddManual = () => {
    if (!manualQ.trim()) return;
    let q = { q: manualQ, type: manualType };
    if (manualType === 'mcq') {
      q.options = manualOptions;
      q.answer = manualAnswer;
    }
    setQuestions([...questions, q]);
    setManualQ('');
    setManualOptions(['', '', '', '']);
    setManualAnswer('');
  };

  const handleSaveTest = async () => {
    if (!topic.trim() || questions.length === 0) {
      alert('Please enter a topic and at least one question.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/save_test`, {
        class: selectedClass,
        subject: selectedSubject,
        topic,
        questions
      });
      alert('Test saved successfully!');
      setQuestions([]);
      setTopic('');
      fetchTestList();
    } catch (e) {
      alert('Failed to save test: ' + (e.response?.data?.error || e.message));
    }
    setLoading(false);
  };

  const fetchTestList = async () => {
    try {
      // Use the new endpoint that handles filtering better
      const res = await axios.get(`${API_BASE_URL}/api/published_tests`);
      let allTests = res.data.tests || [];
      
      // Filter by class and subject, handling "All" selections and null values
      if (selectedClass !== 'All' && selectedSubject !== 'All') {
        allTests = allTests.filter(test => 
          test.class && test.subject && test.class === selectedClass && test.subject === selectedSubject
        );
      } else if (selectedClass !== 'All') {
        allTests = allTests.filter(test => test.class && test.class === selectedClass);
      } else if (selectedSubject !== 'All') {
        allTests = allTests.filter(test => test.subject && test.subject === selectedSubject);
      }
      // If both are "All", show all tests except those with null values
      else {
        allTests = allTests.filter(test => test.class && test.subject);
      }
      
      setTestList(allTests);
    } catch (e) {
      console.error('Failed to fetch tests:', e);
      setTestList([]);
    }
  };

  const [testStatistics, setTestStatistics] = useState({});
  const [testData, setTestData] = useState(null);

  const fetchResponses = async (testId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_responses/${testId}`);
      setResponses(res.data.responses || {});
      setTestStatistics(res.data.statistics || {});
      setTestData(res.data.test_data || null);
    } catch (e) {
      console.error('Failed to fetch responses:', e);
      setResponses({});
      setTestStatistics({});
      setTestData(null);
    }
  };

  const handleViewResponses = async (test) => {
    if (showResponses && showResponses.test_id === test.test_id) {
      setShowResponses(null);
      setResponses({});
      setDetailsStudent(null);
    } else {
      setShowResponses(test);
      await fetchResponses(test.test_id);
    }
  };

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  function formatDateTime(iso) {
    return new Date(iso).toLocaleString();
  }

  function normalizeAnswer(str) {
    if (!str) return '';
    return str.toString().toLowerCase().trim();
  }

  const handleImageTestGenerate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true);
    setQuestions([]);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('language', 'en'); // OCR in English for now
      const ocrRes = await axios.post('http://localhost:5001/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const extractedText = ocrRes.data.extracted_text;
      if (!extractedText || extractedText.trim().length < 10) {
        alert('Could not extract enough text from the image.');
        setOcrLoading(false);
        return;
      }
      // Now call AI test generation with extracted text as topic/content
      const aiRes = await axios.post(`${API_BASE_URL}/generate_test_ai`, {
        class: selectedClass,
        subject: selectedSubject,
        topic: topic || 'Image Content',
        num_questions: numQuestions,
        question_type: questionType,
        content: extractedText
      });
      setQuestions(aiRes.data.questions);
    } catch (e) {
      alert('Image test generation failed: ' + (e.response?.data?.error || e.message));
    }
    setOcrLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (showCreatedTests) {
    return (
      <div className="teacher-portal-root">
        {/* Navigation Header */}
        <nav className="portal-nav">
          <button onClick={() => navigate('/teacher-home')} className="back-btn">
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          <div className="portal-nav-right">
            <button onClick={() => setShowCreatedTests(false)} className="nav-action-btn">
              <FaPlus />
              <span>Create New Test</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="portal-container">
          <div className="portal-header">
            <div className="portal-header-content">
              <h1 className="portal-title">Published Tests</h1>
              <p className="portal-subtitle">View and analyze your published assessments</p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="filter-controls">
              <div className="filter-group">
                <label>Class:</label>
                <select
                  value={selectedClass}
                  onChange={e => {
                    setSelectedClass(e.target.value);
                    fetchTestList();
                  }}
                  className="filter-select"
                >
                  <option value="All">All Classes</option>
                  {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Subject:</label>
                <select
                  value={selectedSubject}
                  onChange={e => {
                    setSelectedSubject(e.target.value);
                    fetchTestList();
                  }}
                  className="filter-select"
                >
                  <option value="All">All Subjects</option>
                  {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              </div>
              <button onClick={fetchTestList} className="refresh-btn">
                <FaList />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tests List */}
          <div className="tests-list">
            {testList.map((test, idx) => (
              <div key={test.test_id} className="test-card">
                <div className="test-card-header">
                  <div className="test-number">{idx + 1}</div>
                  <div className="test-info">
                    <h3 className="test-title">{capitalizeWords(test.topic)}</h3>
                    <p className="test-meta">{capitalizeWords(test.subject)} • {capitalizeWords(test.class)}</p>
                  </div>
                  <button 
                    className="view-responses-btn"
                    onClick={() => handleViewResponses(test)}
                  >
                    {showResponses && showResponses.test_id === test.test_id ? (
                      <>
                        <FaEye />
                        <span>Close Report</span>
                      </>
                    ) : (
                      <>
                        <FaChartBar />
                        <span>View Responses</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Test Report */}
          {showResponses && (
            <div className="test-report-section">
              <div className="report-header">
                <h2 className="report-title">Test Report</h2>
                <div className="report-meta">
                  <span><strong>Topic:</strong> {capitalizeWords(showResponses.topic)}</span>
                  <span><strong>Class:</strong> {showResponses.class}</span>
                  <span><strong>Subject:</strong> {capitalizeWords(showResponses.subject)}</span>
                  {showResponses.created_at && (
                    <span><strong>Created:</strong> {formatDateTime(showResponses.created_at)}</span>
                  )}
                </div>
              </div>

              {/* Enhanced Class Performance Summary */}
              {Object.keys(responses).length > 0 && testStatistics && (
                <div className="performance-summary">
                  <h3 className="section-title">Class Performance Summary</h3>
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="summary-icon">📝</div>
                      <div className="summary-content">
                        <h4>Total Responses</h4>
                        <p>{testStatistics.total_responses || 0}</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon">📈</div>
                      <div className="summary-content">
                        <h4>Class Average</h4>
                        <p>{testStatistics.average_score || 0}%</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon">🏆</div>
                      <div className="summary-content">
                        <h4>Highest Score</h4>
                        <p>{testStatistics.highest_score || 0}%</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon">📉</div>
                      <div className="summary-content">
                        <h4>Lowest Score</h4>
                        <p>{testStatistics.lowest_score || 0}%</p>
                      </div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-icon">✅</div>
                      <div className="summary-content">
                        <h4>Pass Rate</h4>
                        <p>{testStatistics.pass_rate || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Question Analysis */}
              {testStatistics.question_analysis && Object.keys(testStatistics.question_analysis).length > 0 && (
                <div className="question-analysis-section">
                  <h3 className="section-title">Question-wise Analysis</h3>
                  <div className="question-analysis-grid">
                    {Object.entries(testStatistics.question_analysis).map(([questionKey, analysis]) => (
                      <div key={questionKey} className="question-analysis-card">
                        <div className="question-header">
                          <h4>{questionKey.replace('question_', 'Question ')}</h4>
                          <span className={`success-rate ${analysis.success_rate >= 80 ? 'excellent' : analysis.success_rate >= 60 ? 'good' : 'needs-improvement'}`}>
                            {analysis.success_rate}%
                          </span>
                        </div>
                        <div className="question-stats">
                          <p><strong>Correct:</strong> {analysis.correct_count}/{analysis.total_attempts}</p>
                          <p><strong>Success Rate:</strong> {analysis.success_rate}%</p>
                        </div>
                        <div className="question-details">
                          <p><strong>Question:</strong> {analysis.question_text}</p>
                          <p><strong>Correct Answer:</strong> {analysis.correct_answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Student Scores Table */}
              {testStatistics.student_performance && testStatistics.student_performance.length > 0 && (
                <div className="student-scores-section">
                  <h3 className="section-title">Student Performance Details</h3>
                  <div className="scores-table">
                    <table>
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Student</th>
                          <th>Score</th>
                          <th>Percentage</th>
                          <th>Status</th>
                          <th>Action</th>
                          <th>Percentage</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testStatistics.student_performance.map((student, idx) => {
                          const isTopper = student.percentage === testStatistics.highest_score;
                          const isLowest = student.percentage === testStatistics.lowest_score;
                          return (
                            <tr key={student.student_id} className={isTopper ? 'row-topper' : isLowest ? 'row-lowest' : idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                              <td>{idx + 1}</td>
                              <td>
                                {studentNames[student.student_id] || student.student_id}
                                {isTopper && <span className="topper-badge">🏆 Topper</span>}
                              </td>
                              <td>
                                <div className="score-bar">
                                  <div className="score-bar-fill" style={{width: `${student.percentage}%`, background: isTopper ? '#22c55e' : isLowest ? '#e11d48' : '#2563eb'}}></div>
                                  <span className="score-text">{student.score} / {student.total_questions}</span>
                                </div>
                              </td>
                              <td>{student.percentage}%</td>
                              <td>
                                <span className={`status-badge ${student.passed ? 'passed' : 'failed'}`}>
                                  {student.passed ? '✅ Pass' : '❌ Fail'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="details-btn"
                                  onClick={() => setDetailsStudent(detailsStudent === student.student_id ? null : student.student_id)}
                                >
                                  {detailsStudent === student.student_id ? 'Close Details' : 'View Details'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Student Details */}
              {detailsStudent && responses[detailsStudent] && (
                <div className="student-details-section">
                  <h3 className="section-title">Student Details: {studentNames[detailsStudent] || detailsStudent}</h3>
                  <div className="student-answers">
                    {showResponses.questions.map((q, i) => {
                      const ans = responses[detailsStudent].answers[i]?.answer;
                      const correct = normalizeAnswer(ans) === normalizeAnswer(q.answer);
                      return (
                        <div key={i} className="answer-card">
                          <div className="question-text">Q{i + 1}. {q.q} <span className="question-type">({q.type})</span></div>
                          <div className={`student-answer ${correct ? 'correct' : 'incorrect'}`}>
                            {ans} {correct ? '✔️' : '❌'}
                          </div>
                          {!correct && (
                            <div className="correct-answer">Correct: {q.answer}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Question Analytics */}
              <div className="question-analytics-section">
                <h3 className="section-title">Question Analytics</h3>
                <div className="analytics-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Q.No</th>
                        <th>Question</th>
                        <th>Correct</th>
                        <th>Wrong</th>
                        <th>Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showResponses && Array.isArray(showResponses.questions) && showResponses.questions.length > 0 && 
                        showResponses.questions.map((q, i) => {
                          let correct = 0, wrong = 0;
                          if (Object.values(responses).length > 0) {
                            Object.values(responses).forEach(resp => {
                              const ans = resp.answers && resp.answers[i]?.answer;
                              if (normalizeAnswer(ans) === normalizeAnswer(q.answer)) correct++;
                              else wrong++;
                            });
                          }
                          const total = correct + wrong;
                          const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
                          return (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{q.q}</td>
                              <td className="correct-count">{correct}</td>
                              <td className="wrong-count">{wrong}</td>
                              <td>{percent}%</td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main test creation view
  return (
    <div className="teacher-portal-root">
      {/* Navigation Header */}
      <nav className="portal-nav">
        <button onClick={() => navigate('/teacher-home')} className="back-btn">
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>
        <div className="portal-nav-right">
          <button onClick={() => setShowCreatedTests(true)} className="nav-action-btn">
            <FaList />
            <span>View Published Tests</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="portal-container">
        <div className="portal-header">
          <div className="portal-header-content">
            <div className="portal-icon">
              <FaChalkboardTeacher />
            </div>
            <div className="portal-title-section">
              <h1 className="portal-title">Create Test</h1>
              <p className="portal-subtitle">Generate and manage assessments for your students</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="two-column-layout">
          {/* Column 1: Test Generation */}
          <div className="column test-generation-column">
            <div className="column-header">
              <h2>Test Generation</h2>
            </div>
            <div className="form-card">
              {/* Basic Settings */}
              <div className="form-group">
                <div className="input-group">
                  <label>Class</label>
                  <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)}
                    className="form-select"
                  >
                    {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Subject</label>
                  <select 
                    value={selectedSubject} 
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="form-select"
                  >
                    {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Topic</label>
                  <input 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)} 
                    placeholder="Enter the topic"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Generation Mode */}
              <div className="form-group">
                <label className="form-label">Generation Mode</label>
                <div className="mode-selector">
                  <button 
                    className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
                    onClick={() => setMode('ai')}
                  >
                    <FaRobot />
                    <span>AI Generation</span>
                  </button>
                  <button 
                    className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
                    onClick={() => setMode('manual')}
                  >
                    <FaEdit />
                    <span>Manual Entry</span>
                  </button>
                  <button 
                    className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
                    onClick={() => setMode('image')}
                  >
                    <FaImage />
                    <span>Image Upload</span>
                  </button>
                </div>
              </div>

              {/* Mode-specific Settings */}
              {mode === 'ai' && (
                <div className="form-group">
                  <div className="input-row">
                    <div className="input-group">
                      <label>Number of Questions</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={numQuestions}
                        onChange={e => setNumQuestions(Number(e.target.value))}
                        className="form-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>Question Type</label>
                      <select 
                        value={questionType} 
                        onChange={e => setQuestionType(e.target.value)}
                        className="form-select"
                      >
                        <option value="mcq">MCQ</option>
                        <option value="short">Short Answer</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={loading || !topic.trim()}
                    className="generate-btn"
                  >
                    {loading ? <span className="loader"></span> : (
                      <>
                        <FaRobot />
                        <span>Generate Questions</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {mode === 'image' && (
                <div className="form-group">
                  <div className="input-row">
                    <div className="input-group">
                      <label>Number of Questions</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={numQuestions}
                        onChange={e => setNumQuestions(Number(e.target.value))}
                        className="form-input"
                      />
                    </div>
                    <div className="input-group">
                      <label>Question Type</label>
                      <select 
                        value={questionType} 
                        onChange={e => setQuestionType(e.target.value)}
                        className="form-select"
                      >
                        <option value="mcq">MCQ</option>
                        <option value="short">Short Answer</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageTestGenerate}
                    style={{display: 'none'}}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={ocrLoading}
                    className="upload-btn"
                  >
                    <FaImage />
                    <span>{ocrLoading ? 'Processing...' : 'Upload Image & Generate'}</span>
                  </button>
                </div>
              )}

              {mode === 'manual' && (
                <div className="form-group">
                  <div className="manual-question-form">
                    <input 
                      value={manualQ} 
                      onChange={e => setManualQ(e.target.value)} 
                      placeholder="Enter question"
                      className="form-input"
                    />
                    <select 
                      value={manualType} 
                      onChange={e => setManualType(e.target.value)}
                      className="form-select"
                    >
                      <option value="mcq">MCQ</option>
                      <option value="short">Short Answer</option>
                    </select>
                    {manualType === 'mcq' && (
                      <div className="mcq-options">
                        {manualOptions.map((opt, i) => (
                          <input 
                            key={i} 
                            value={opt} 
                            onChange={e => {
                              const opts = [...manualOptions]; 
                              opts[i] = e.target.value; 
                              setManualOptions(opts);
                            }} 
                            placeholder={`Option ${i + 1}`}
                            className="form-input"
                          />
                        ))}
                        <input 
                          value={manualAnswer} 
                          onChange={e => setManualAnswer(e.target.value)} 
                          placeholder="Correct answer"
                          className="form-input"
                        />
                      </div>
                    )}
                    <button onClick={handleAddManual} className="add-question-btn">
                      <FaPlus />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Generated Test */}
          <div className="column generated-test-column">
            <div className="column-header">
              <h2>Generated Test</h2>
            </div>
            <div className="questions-preview">
              {questions.length === 0 ? (
                <div className="empty-state">
                  <p>No questions generated yet. Configure your test and generate questions to see them here.</p>
                </div>
              ) : (
                <div className="questions-list">
                  {questions.map((q, i) => (
                    <div key={i} className="question-card">
                      <div className="question-header">
                        <span className="question-number">Q{i + 1}</span>
                        <span className="question-type-badge">{q.type.toUpperCase()}</span>
                      </div>
                      <div className="question-text">{q.q}</div>
                      {q.type === 'mcq' && (
                        <div className="question-options">
                          {q.options.map((opt, j) => (
                            <div key={j} className="option">
                              <span className="option-letter">{String.fromCharCode(65 + j)}.</span>
                              <span className="option-text">{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'mcq' && (
                        <div className="correct-answer">
                          <strong>Answer:</strong> {q.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Save Button */}
              <div className="action-buttons">
                <button 
                  onClick={handleSaveTest} 
                  disabled={loading || questions.length === 0}
                  className="save-btn"
                >
                  <FaSave />
                  <span>Save Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 