import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaChalkboardTeacher, FaImage, FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

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
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
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
      console.log('Saving test with payload:', {
        class: selectedClass,
        subject: selectedSubject,
        topic,
        questions: questions.length
      });
      console.log('API_BASE_URL:', API_BASE_URL);
      
      const response = await axios.post(`${API_BASE_URL}/create_test`, {
        class: selectedClass,
        subject: selectedSubject,
        topic,
        questions
      });
      
      console.log('Save test response:', response.data);
      alert('Test saved successfully!');
      setQuestions([]);
      setTopic('');
      fetchTestList();
    } catch (e) {
      console.error('Save test error:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      
      let errorMessage = 'Failed to save test.';
      if (e.response?.data?.error) {
        errorMessage = `Error: ${e.response.data.error}`;
      } else if (e.message) {
        errorMessage = `Network error: ${e.message}`;
      }
      
      alert(errorMessage);
    }
    setLoading(false);
  };

  const fetchTestList = async () => {
    const res = await axios.get(`${API_BASE_URL}/list_tests`, {
      params: { class: selectedClass, subject: selectedSubject }
    });
    setTestList(res.data.tests);
  };

  const fetchResponses = async (testId) => {
    const res = await axios.get(`${API_BASE_URL}/get_responses/${testId}`);
    setResponses(res.data);
  };

  // When clicking to view responses, fetch the full test object if needed
  const handleViewResponses = async (test) => {
    // Always fetch the full test object to get created_at and all fields
    const res = await axios.get(`${API_BASE_URL}/get_test/${test.test_id}`);
    const testObj = res.data;
    setShowResponses(testObj);
    fetchResponses(test.test_id);
  };

  // Calculate totalQuestions once for the test
  const totalQuestions = showResponses?.questions?.length || 0;
  // Build score distribution
  let scoreDist = {};
  if (totalQuestions > 0) {
    Object.values(responses).forEach(resp => {
      let correct = 0;
      if (resp.answers && showResponses?.questions) {
        showResponses.questions.forEach((q, i) => {
          if (normalizeAnswer(resp.answers[i]?.answer) === normalizeAnswer(q.answer)) correct++;
        });
      }
      const label = `${correct}/${totalQuestions}`;
      scoreDist[label] = (scoreDist[label] || 0) + 1;
    });
  }

  function capitalizeWords(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase());
  }

  function formatDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  // Flexible answer normalization for comparison
  function normalizeAnswer(str) {
    if (!str) return '';
    // Remove punctuation, trim, lowercase, and remove leading articles
    return str
      .replace(/^[\s]*(the|a|an)\s+/i, '') // remove leading articles
      .replace(/[.,!?;:()\[\]{}"'`]/g, '') // remove punctuation
      .trim()
      .toLowerCase();
  }

  // OCR + AI test generation
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
      <div className="teacher-portal-root" style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6f0fa', padding: 32, width: '100vw', boxSizing: 'border-box', position: 'relative' }}>
        <button onClick={() => navigate('/teacher-home')} style={{ background: 'none', border: 'none', fontSize: 28, position: 'absolute', left: 16, top: 16, zIndex: 10, color: '#2563eb', cursor: 'pointer' }} title="Back to Teacher Home"><FaArrowLeft /></button>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button onClick={() => setShowCreatedTests(false)} style={{ float: 'right', marginBottom: 18, marginTop: 8 }}>
            Publish Tests
          </button>
        </div>
        <h2>Published Tests</h2>
        <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap', marginBottom: 18, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label htmlFor="published-class-select" style={{ fontWeight: 600 }}>Class:</label>
            <select
              id="published-class-select"
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                fetchTestList();
              }}
            >
              {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
            <button onClick={fetchTestList} style={{marginLeft:12}}>Refresh List</button>
          </div>
        </div>
        <ul style={{marginTop:18}}>
          {testList.map((test, idx) => (
            <li key={test.test_id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="test-number-circle">{idx+1}.</span>
              <span style={{ fontWeight: 700, fontSize: '1.08em' }}>{capitalizeWords(test.topic)}</span>
              <span style={{ color: '#475569', fontSize: '1em', marginLeft: 6 }}>
                ({capitalizeWords(test.subject)}, {capitalizeWords(test.class)})
              </span>
              <button style={{ marginLeft: 'auto' }}
                onClick={() => {
                  if (showResponses && showResponses.test_id === test.test_id) {
                    setShowResponses(null); setResponses({}); setDetailsStudent(null);
                  } else {
                    handleViewResponses(test);
                  }
                }}
              >
                {showResponses && showResponses.test_id === test.test_id ? 'Close Report' : 'View Responses'}
              </button>
            </li>
          ))}
        </ul>
        {showResponses && (
          <div className="test-report-card">
            {/* Test Info Card */}
            <div className="test-info-card">
              <div className="test-info-header">
                <span className="test-info-title" style={{fontWeight:'bold', display:'block', marginBottom:'18px', fontSize:'2rem', marginTop:'56px'}}>Test Report</span>
              </div>
              <div className="test-info-details">
                <div><b>Topic:</b> {capitalizeWords(showResponses.topic)}</div>
                <div><b>Class:</b> {showResponses.class}</div>
                <div style={{marginBottom:'18px'}}><b>Subject:</b> {capitalizeWords(showResponses.subject)}</div>
                {showResponses.created_at && (
                  <div><b>Created:</b> {formatDateTime(showResponses.created_at)}</div>
                )}
              </div>
            </div>
            {/* Class Performance Summary */}
            {Object.keys(responses).length > 0 && (
              <div className="class-summary-section">
                <div className="section-header" style={{marginTop:40, fontWeight:'bold', marginBottom:'20px'}}>
                  Class Performance Summary
                </div>
                {(() => {
                  const scores = Object.entries(responses).map(([studentId, resp]) => {
                    let correct = 0;
                    if (resp.answers && showResponses?.questions) {
                      showResponses.questions.forEach((q, i) => {
                        if (normalizeAnswer(resp.answers[i]?.answer) === normalizeAnswer(q.answer)) correct++;
                      });
                    }
                    return { studentId, correct };
                  });
                  const avg = scores.length ? (scores.reduce((a, b) => a + b.correct, 0) / scores.length).toFixed(2) : 0;
                  const toppers = scores.length ? scores.filter(s => s.correct === Math.max(...scores.map(s => s.correct))) : [];
                  const lowest = scores.length ? scores.filter(s => s.correct === Math.min(...scores.map(s => s.correct))) : [];
                  return (
                    <div className="class-summary-badges">
                      <div className="summary-badge topper" style={{flex:1}}><span role="img" aria-label="responses">📝</span> <b>Total Responses:</b> {Object.keys(responses).length}</div>
                      <div className="summary-badge avg" style={{flex:1}}><span role="img" aria-label="avg">📈</span> <span className="summary-badge-label"><b>Class Average:</b></span> {avg} / {showResponses.questions.length}</div>
                      <div className="summary-badge topper" style={{flex:1}}><span role="img" aria-label="trophy">🏆</span> <span className="summary-badge-label"><b>Topper{toppers.length > 1 ? 's' : ''}:</b></span> {toppers.map(s => `${s.studentId} (${s.correct})`).join(', ')}</div>
                      <div className="summary-badge lowest" style={{flex:1}}><span role="img" aria-label="low">⚠️</span> <span className="summary-badge-label"><b>Lowest:</b></span> {lowest.map(s => `${s.studentId} (${s.correct})`).join(', ')}</div>
                    </div>
                  );
                })()}
              </div>
            )}
            {/* Collapsible Student Scores Table */}
            {Object.keys(responses).length > 0 && (
              <div style={{marginTop:40}}>
                <div className="section-header collapsible-toggle" onClick={() => setShowStudentScores(v => !v)} style={{fontWeight:'bold', marginBottom:'20px'}}>
                  Student Scores
                </div>
                <div className={`collapsible-section ${showStudentScores ? 'expanded' : 'collapsed'}`}> 
                  <div className="student-summary-table">
                    <table>
                      <thead>
                        <tr>
                          <th style={{width:'80px', textAlign:'center'}}>S.No</th>
                          <th style={{width:'220px', textAlign:'center'}}>Student</th>
                          <th style={{width:'180px', textAlign:'center'}}>Score</th>
                          <th style={{width:'180px', textAlign:'center'}}>Percentage</th>
                          <th style={{width:'180px', textAlign:'center'}}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const scoresArr = Object.entries(responses).map(([studentId, resp]) => {
                            let correct = 0;
                            if (resp.answers && showResponses?.questions) {
                              showResponses.questions.forEach((q, i) => {
                                if (normalizeAnswer(resp.answers[i]?.answer) === normalizeAnswer(q.answer)) correct++;
                              });
                            }
                            return { studentId, correct };
                          });
                          const maxScore = Math.max(...scoresArr.map(s => s.correct));
                          const minScore = Math.min(...scoresArr.map(s => s.correct));
                          return Object.entries(responses).map(([studentId, resp], idx) => {
                            let correct = 0;
                            if (resp.answers && showResponses?.questions) {
                              showResponses.questions.forEach((q, i) => {
                                if (normalizeAnswer(resp.answers[i]?.answer) === normalizeAnswer(q.answer)) correct++;
                              });
                            }
                            const percent = showResponses?.questions?.length ? Math.round((correct / showResponses.questions.length) * 100) : 0;
                            const isTopper = correct === maxScore;
                            const isLowest = correct === minScore;
                            return (
                              <tr key={studentId}
                                className={isTopper ? 'row-topper' : isLowest ? 'row-lowest' : idx % 2 === 0 ? 'row-even' : 'row-odd'}
                                title="Click for detailed answers"
                                style={{cursor:'pointer'}}
                                onClick={() => setDetailsStudent(studentId)}
                              >
                                <td style={{textAlign:'center', verticalAlign:'middle'}}>{idx+1}</td>
                                <td style={{textAlign:'center', verticalAlign:'middle'}}>{studentNames[studentId] || studentId} {isTopper && <span className="topper-badge" title="Topper">🏆 Topper</span>}</td>
                                <td style={{textAlign:'center', verticalAlign:'middle'}}>
                                  <div className="score-bar-outer">
                                    <div className="score-bar-inner" style={{width: `${percent}%`, background: isTopper ? '#22c55e' : isLowest ? '#e11d48' : '#2563eb'}}></div>
                                    <span className="score-bar-label">{correct} / {showResponses.questions.length}</span>
                                  </div>
                                </td>
                                <td style={{textAlign:'center', verticalAlign:'middle'}}>{percent}%</td>
                                <td style={{textAlign:'center', verticalAlign:'middle'}}>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (detailsStudent === studentId) {
                                        setDetailsStudent(null);
                                      } else {
                                        setDetailsStudent(studentId);
                                      }
                                    }}
                                    style={{fontWeight:700}}
                                  >
                                    {detailsStudent === studentId ? 'Close Details' : 'View Details'}
                                  </button>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {/* Per-student, per-question breakdown modal/section */}
            {detailsStudent && responses[detailsStudent] && (
              <div className="student-details-modal">
                <div className="student-details-header" style={{marginTop:'40px', marginBottom:'18px', fontSize:'1.35em'}}>
                  <b>Student:</b> {studentNames[detailsStudent] || detailsStudent}
                </div>
                <div className="student-details-list">
                  {showResponses.questions.map((q, i) => {
                    const ans = responses[detailsStudent].answers[i]?.answer;
                    const correct = normalizeAnswer(ans) === normalizeAnswer(q.answer);
                    return (
                      <div key={i} className="student-details-qblock" style={{marginBottom:'28px', paddingBottom:'10px', borderBottom:'1.5px solid #e5e7eb'}}>
                        <div className="student-details-q" style={{marginBottom:'10px'}}>Q{i+1}. {q.q} <span className="qtype">({q.type})</span></div>
                        <div className={correct ? 'student-details-ans correct' : 'student-details-ans wrong'} style={{marginBottom:'8px'}}>{ans} {correct ? '✔️' : '❌'}</div>
                        {!correct && (
                          <div className="student-details-correct">Correct: {q.answer}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Collapsible Question Analytics Table */}
       <div style={{marginTop:40}}>
              <div className="section-header collapsible-toggle" onClick={() => setShowStudentScores(v => !v)} style={{fontWeight:'bold', marginBottom:'20px'}}>
                Question Analytics
              </div>
              <div style={{marginTop:20}} className={`collapsible-section ${showStudentScores ? 'expanded' : 'collapsed'}`}> 
                {showResponses && Array.isArray(showResponses.questions) && showResponses.questions.length > 0 && (
                  <div className="question-analytics-section">
                    <table className="question-analytics-table">
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
                        {showResponses.questions.map((q, i) => {
                          let correct = 0, wrong = 0;
                          if (Object.values(responses).length > 0) {
                            Object.values(responses).forEach(resp => {
                              const ans = resp.answers && resp.answers[i]?.answer;
                              if (normalizeAnswer(ans) === normalizeAnswer(q.answer)) correct++;
                              else wrong++;
                            });
                          } else {
                            wrong = 0;
                            correct = 0;
                          }
                          const total = correct + wrong;
                          const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
                          return (
                            <tr key={i}>
                              <td>{i+1}</td>
                              <td>{q.q}</td>
                              <td style={{color:'#22c55e'}}>{correct}</td>
                              <td style={{color:'#e11d48'}}>{wrong}</td>
                              <td>{percent}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {/* Guaranteed spacer below Question Analytics section */}
              <div style={{height:'24px'}}></div>
            </div>
          </div>
        )}
      </div>
    );
  }
  // Main test creation view
  return (
    <div className="teacher-portal-root" style={{ background: 'linear-gradient(120deg, #f4f8ff 60%, #e0edff 100%)', minHeight: '100vh', padding: '0 0 60px 0', width: '100vw', boxSizing: 'border-box', position: 'relative' }}>
      <button onClick={() => navigate('/teacher-home')} style={{ background: 'none', border: 'none', fontSize: 28, position: 'absolute', left: 16, top: 16, zIndex: 10, color: '#2563eb', cursor: 'pointer' }} title="Back to Teacher Home"><FaArrowLeft /></button>
      <div className="teacher-portal-main" style={{ maxWidth: 820, margin: '2.5rem auto 0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 6px 32px #e6f0fa', padding: 40, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
          <FaChalkboardTeacher size={38} color="#2563eb" />
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#174ea6', letterSpacing: 0.5, margin: 0 }}>Teacher Portal</h1>
        </div>
        <div style={{ background: 'linear-gradient(90deg, #e0edff 60%, #f4f8ff 100%)', borderRadius: 12, boxShadow: '0 2px 12px #e6f0fa', padding: '28px 24px 18px 24px', marginBottom: 36 }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb', marginBottom: 18, letterSpacing: 0.01 }}>Create a Test</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 0, alignItems: 'center' }}>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1.5px solid #b3c6e0', fontWeight: 600, color: '#174ea6', background: '#fafdff' }}>
              {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1.5px solid #b3c6e0', fontWeight: 600, color: '#174ea6', background: '#fafdff' }}>
              {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter the topic" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1.5px solid #b3c6e0', fontWeight: 500, color: '#174ea6', background: '#fafdff' }} />
          </div>
          <div style={{ marginTop: 32, marginBottom: 32 }}>
            <label style={{ fontWeight: 600, color: '#2563eb', marginRight: 18 }}>
              <input type="radio" checked={mode === 'ai'} onChange={() => setMode('ai')} /> Generate with AI
            </label>
            <label style={{ fontWeight: 600, color: '#2563eb', marginRight: 18 }}>
              <input type="radio" checked={mode === 'manual'} onChange={() => setMode('manual')} /> Enter Manually
            </label>
            <label style={{ fontWeight: 600, color: '#2563eb' }}>
              <input type="radio" checked={mode === 'image'} onChange={() => setMode('image')} /> Generate from Image
            </label>
          </div>
          {mode === 'ai' && (
            <>
              {/* Short legends before each input */}
              <label style={{color:'#222', fontWeight:600, fontSize:'0.89em'}}>Questions:
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  style={{ width: 60, marginLeft: 6, marginRight: 18 }}
                  placeholder="No. of Qs"
                />
              </label>
              <label style={{color:'#222', fontWeight:600, fontSize:'0.89em'}}>Type:
                <select value={questionType} onChange={e => setQuestionType(e.target.value)} style={{marginLeft: 6}}>
                  <option value="mcq">MCQ</option>
                  <option value="short">Short Answer</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>
              <div style={{display:'flex', alignItems:'center', gap:16, marginTop: 16, marginBottom: 16}}>
                <button
                  onClick={handleGenerateAI}
                  disabled={loading || !topic.trim()}
                  style={{padding: '6px 12px', fontSize: '0.93em', fontWeight: 700, borderRadius: 8, boxShadow: '0 2px 8px #b3c6e0', background: 'linear-gradient(90deg, #178aff 60%, #4fc3f7 100%)', color: '#fff', border: 'none', display:'flex', alignItems:'center', gap:8}}>
                  {loading ? <span className="loader"></span> : 'Generate Questions'}
                </button>
              </div>
            </>
          )}
          {mode === 'image' && (
            <div style={{marginTop: 16, marginBottom: 16}}>
              <label style={{color:'#222', fontWeight:600, fontSize:'0.89em'}}>Questions:
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  style={{ width: 60, marginLeft: 6, marginRight: 18 }}
                  placeholder="No. of Qs"
                />
              </label>
              <label style={{color:'#222', fontWeight:600, fontSize:'0.89em'}}>Type:
                <select value={questionType} onChange={e => setQuestionType(e.target.value)} style={{marginLeft: 6}}>
                  <option value="mcq">MCQ</option>
                  <option value="short">Short Answer</option>
                  <option value="mixed">Mixed</option>
                </select>
              </label>
              <div style={{display:'flex', alignItems:'center', gap:16, marginTop: 16}}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageTestGenerate}
                  style={{display:'none'}}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  disabled={ocrLoading}
                  style={{padding: '6px 12px', fontSize: '0.93em', fontWeight: 700, borderRadius: 8, boxShadow: '0 2px 8px #b3c6e0', background: 'linear-gradient(90deg, #178aff 60%, #4fc3f7 100%)', color: '#fff', border: 'none', display:'flex', alignItems:'center', gap:8}}>
                  <FaImage style={{fontSize:18}} />
                  {ocrLoading ? <span className="loader"></span> : 'Upload Image & Generate'}
                </button>
              </div>
            </div>
          )}
          {mode === 'manual' && (
            <div style={{ marginBottom: 16 }}>
              <input value={manualQ} onChange={e => setManualQ(e.target.value)} placeholder="Enter question" style={{ width: '100%', marginBottom: 8 }} />
              <select value={manualType} onChange={e => setManualType(e.target.value)} style={{ marginBottom: 8 }}>
                <option value="mcq">MCQ</option>
                <option value="short">Short Answer</option>
              </select>
              {manualType === 'mcq' && (
                <div style={{ marginBottom: 8 }}>
                  {manualOptions.map((opt, i) => (
                    <input key={i} value={opt} onChange={e => {
                      const opts = [...manualOptions]; opts[i] = e.target.value; setManualOptions(opts);
                    }} placeholder={`Option ${i + 1}`} style={{ marginRight: 8, width: 120 }} />
                  ))}
                  <input value={manualAnswer} onChange={e => setManualAnswer(e.target.value)} placeholder="Correct answer" style={{ width: 140 }} />
                </div>
              )}
              <button onClick={handleAddManual}>Add Question</button>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 16 }}>
          <h4>Questions:</h4>
          {questions.length === 0 && <div style={{ color: '#888' }}>No questions yet.</div>}
          <ol>
            {questions.map((q, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <b>{q.q}</b> ({q.type})
                {q.type === 'mcq' && (
                  <ul>{q.options.map((opt, j) => <li key={j}>{opt}</li>)}</ul>
                )}
                {q.type === 'mcq' && <div style={{ color: '#178aff' }}>Answer: {q.answer}</div>}
              </li>
            ))}
          </ol>
        </div>
        <button onClick={handleSaveTest} disabled={loading || questions.length === 0}>Save Test</button>
        <button style={{marginTop:24}} onClick={() => setShowCreatedTests(true)}>See All Published Tests</button>
      </div>
    </div>
  );
} 