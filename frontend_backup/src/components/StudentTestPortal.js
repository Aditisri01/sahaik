import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaLanguage, FaArrowLeft } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

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
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
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

  // Demo: username to class mapping
  const navigate = useNavigate();
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const fetchTestList = async () => {
    console.log('Fetching tests for class:', studentClass, 'subject:', selectedSubject);
    try {
      const res = await axios.get(`${API_BASE_URL}/list_tests`, {
        params: { class: studentClass, subject: selectedSubject }
      });
      console.log('Test list response:', res.data);
      setTestList(res.data.tests);
      // Remove the alert for no tests
      // if (!res.data.tests || res.data.tests.length === 0) {
      //   window.alert(t('No tests available for the selected class and subject.'));
      // }
    } catch (err) {
      window.alert(t('Could not connect to the server. Please make sure the backend is running.'));
    }
  };

  const handleStartTest = async (testId) => {
    console.log('DEBUG: Starting test with language:', selectedLanguage);
    const url = `${API_BASE_URL}/get_test/${testId}?language=${selectedLanguage}`;
    console.log('DEBUG: Requesting URL:', url);
    const res = await axios.get(url);
    console.log('DEBUG: Test data received:', res.data);
    setCurrentTest(res.data);
    setAnswers(res.data.questions.map(() => ''));
    setScore(null);
    setSubmitted(false);
  };

  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const res = await axios.post(`${API_BASE_URL}/submit_answers/${currentTest.test_id}`, {
      student_id: studentId,
      language: selectedLanguage,
      answers: currentTest.questions.map((q, i) => ({ q: q.q, answer: answers[i] }))
    });
    setScore(res.data.score);
    setSubmitted(true);
    // Save to localStorage for report
    if (currentTest) {
      const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
      history.push({
        test_id: currentTest.test_id,
        student_id: studentId,
        date: new Date().toLocaleString(),
        topic: currentTest.topic,
        class: currentTest.class,
        subject: currentTest.subject,
        score: `${res.data.score} / ${currentTest.questions.length}`,
        answers: answers, // Store the student's answers
        aiSuggestions: aiSuggestions // Store AI suggestions
      });
      localStorage.setItem('student_test_history', JSON.stringify(history));
    }
    // Encouraging remark
    const percent = (res.data.score / currentTest.questions.length) * 100;
    let remark = '';
    if (percent === 100) remark = '🌟 Incredible work! You aced every question—your hard work is really paying off. Celebrate your success!';
    else if (percent >= 80) remark = '👏 Great job! You only missed a couple—review those and you\'ll be unstoppable. Keep up the awesome effort!';
    else if (percent >= 60) remark = '👍 Good effort! You got most of them right. Take a look at the ones you missed and try again—you\'re on the right track.';
    else if (percent >= 40) remark = '💡 Don\'t worry! Every mistake is a chance to learn. Review your answers and give it another shot—you\'re making progress.';
    else remark = '🌱 Remember, learning is a journey. Don\'t be discouraged—every step forward counts. Keep practicing and you\'ll get there!';
    setRemarks(remark);
    // AI suggestions for wrong answers
    const wrongs = currentTest.questions.map((q, i) => ({
      q, given: answers[i], idx: i
    })).filter((item, i) => {
      // Use the same normalization as backend
      const normalize = s => (typeof s === 'string' ? s.trim().toLowerCase().replace(/\W+/g, '') : '');
      return normalize(item.q.answer) !== normalize(item.given);
    });
    if (wrongs.length > 0) {
      setAiSuggestions(Array(wrongs.length).fill(t('Loading suggestion...')));
      Promise.all(wrongs.map(async (item, idx) => {
        try {
          const aiRes = await axios.post(`${API_BASE_URL}/eduassistant`, {
            class: currentTest.class,
            subject: currentTest.subject,
            topic: currentTest.topic,
            language: selectedLanguage,
            message: `I got this question wrong: ${item.q.q}. The correct answer is: ${item.q.answer}. My answer was: ${item.given}. Please give me a short tip or explanation to help me learn this better.`
          });
          return aiRes.data.reply;
        } catch {
          return t('Could not fetch suggestion.');
        }
      })).then(suggestions => {
        setAiSuggestions(suggestions);
        // Save suggestions in history
        if (currentTest) {
          const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
          const idx = history.findIndex(h => h.test_id === currentTest.test_id && h.student_id === studentId);
          if (idx !== -1) {
            history[idx].aiSuggestions = suggestions;
            localStorage.setItem('student_test_history', JSON.stringify(history));
          }
        }
      });
    } else {
      setAiSuggestions([]);
    }
  };

  // Start/reset timer when a test is started
  useEffect(() => {
    if (currentTest) {
      setTimer(30 * 60); // 30 minutes
      setTimeUp(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setTimeUp(true);
            if (!submitted) handleSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line
  }, [currentTest, submitted]);

  useEffect(() => {
    if (remarks && selectedLanguage && selectedLanguage !== 'en') {
      axios.post('http://localhost:5001/translate', {
        text: remarks,
        target: selectedLanguage
      }).then(res => setTranslatedRemark(res.data.translated)).catch(() => setTranslatedRemark(remarks));
    } else {
      setTranslatedRemark(remarks);
    }
  }, [remarks, selectedLanguage]);

  // On mount, if a test is already taken, show result instead of allowing retake
  useEffect(() => {
    if (currentTest && hasTakenTest(currentTest.test_id)) {
      setSubmitted(true);
      // Optionally, load previous score/remark from history
      const studentId = localStorage.getItem('student_id') || '';
      const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
      const prev = history.find(h => h.test_id === currentTest.test_id && h.student_id === studentId);
      if (prev && prev.score) setScore(parseInt(prev.score));
      if (prev && prev.aiSuggestions) setAiSuggestions(prev.aiSuggestions); // Load AI suggestions from history
    }
  }, [currentTest]);

  // Helper to get concise tip (first sentence or 80 chars)
  const getConciseTip = (tip) => {
    const firstSentence = tip.split(/[.!?]/)[0];
    if (firstSentence.length < 80) return firstSentence + (firstSentence.length < tip.length ? '...' : '');
    return tip.slice(0, 80) + (tip.length > 80 ? '...' : '');
  };

  // Helper to check if a test is already taken
  const hasTakenTest = (testId) => {
    const studentId = localStorage.getItem('student_id') || '';
    const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
    return history.some(h => h.test_id === testId && h.student_id === studentId);
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #e6f0fa', padding: 32 }}>
      <button onClick={() => navigate('/student-home')} style={{ background: 'none', border: 'none', fontSize: 28, position: 'absolute', left: 16, top: isMobile ? 56 : 16, zIndex: 10, color: '#2563eb', cursor: 'pointer' }} title="Back to Student Home"><FaArrowLeft /></button>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaLanguage style={{ fontSize: 18, color: '#19e6b3' }} />
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1.5px solid #19e6b3', fontSize: 14, background: '#fff' }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            {isTranslating && (
              <span style={{ color: '#19e6b3', fontSize: 12, marginLeft: 8 }}>
                Translating...
              </span>
            )}
          </div>
          <button onClick={() => navigate('/student-report')} style={{ background: '#19e6b3', color: '#111', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{t('My Progress Report')}</button>
        </div>
        <h2>{t('Welcome, Student!')}</h2>
        {studentId && (
          <div style={{ marginBottom: 4, fontWeight: 600, color: '#2563eb', fontSize: 16 }}>
            Student ID: <span style={{ fontFamily: 'monospace', color: '#174ea6' }}>{studentId.replace(/^Class \d+-/, '')}</span>
          </div>
        )}
        {studentClass && (
          <div style={{ marginBottom: 8, fontWeight: 500, color: '#174ea6', fontSize: 15 }}>
            Class: <span style={{ fontFamily: 'monospace' }}>{studentClass.replace(/^Class\s*/, '')}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {/* Removed class dropdown */}
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #19e6b3', fontSize: 16 }}>
            {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
          <button onClick={fetchTestList}>{t('Show Available Tests')}</button>
        </div>
      </div>
      {!currentTest ? (
        <>
          {/* Class and subject selects are now above, side by side */}
          {testList.length === 0 ? (
            <div style={{ color: '#888', fontStyle: 'italic', fontSize: 18, marginTop: 24 }}>{t('No test available')}</div>
          ) : (
            <ul>
              {testList.map(test => (
                <li key={test.test_id} style={{ marginBottom: 8 }}>
                  <b>{test.topic}</b> ({test.subject}, {test.class})
                  {!hasTakenTest(test.test_id) ? (
                    <button style={{ marginLeft: 12 }} onClick={() => handleStartTest(test.test_id)}>{t('Take Test')}</button>
                  ) : (
                    <button style={{ marginLeft: 12, background: '#e0e0e0', color: '#2563eb', borderRadius: 6, border: 'none', padding: '4px 12px', fontWeight: 600 }} onClick={() => setViewingPerformance(test.test_id)}>{t('View Performance')}</button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {/* Performance Modal/Section */}
          {viewingPerformance && (
            <div style={{ marginTop: 32 }}>
              <PerformanceView testId={viewingPerformance} onClose={() => setViewingPerformance(null)} inline />
            </div>
          )}
        </>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>{t('Test')}: {currentTest.topic}</h3>
            <span style={{ color: timer <= 60 ? '#e11d48' : '#19e6b3', fontWeight: 700, fontSize: 18, minWidth: 120, textAlign: 'right' }}>
              {t('Time Left')}: {String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}
            </span>
          </div>
          {timeUp && (
            <div style={{ color: '#e11d48', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
              {t('Time is up! Your test has been submitted automatically.')}
            </div>
          )}
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            <ol>
              {currentTest.questions.map((q, i) => (
                <li key={i} style={{ marginBottom: 16 }}>
                  <b>{q.q}</b> ({q.type})<br />
                  {q.type === 'mcq' ? (
                    <div>
                      {q.options.map((opt, j) => (
                        <label key={j} style={{ display: 'block', marginBottom: 4 }}>
                          <input
                            type="radio"
                            name={`q${i}`}
                            value={opt}
                            checked={answers[i] === opt}
                            onChange={() => handleAnswerChange(i, opt)}
                            disabled={submitted}
                          /> {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answers[i]}
                      onChange={e => handleAnswerChange(i, e.target.value)}
                      style={{ width: '100%', marginTop: 6 }}
                      disabled={submitted}
                    />
                  )}
                </li>
              ))}
            </ol>
            {!submitted && <button type="submit">{t('Submit Answers')}</button>}
          </form>
          {submitted && (
            <>
              <div style={{ marginTop: 24, color: '#178aff', fontWeight: 700, fontSize: 18 }}>
                {t('Your score')}: {score} / {currentTest.questions.length}
              </div>
              <div style={{ marginTop: 12, color: '#19e6b3', fontWeight: 600, fontSize: 17 }}>{translatedRemark}</div>
              {aiSuggestions.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>{t('Tips for your incorrect answers')}:</div>
                  <ol>
                    {aiSuggestions.map((tip, i) => (
                      <li key={i} style={{ marginBottom: 10, color: '#475569', fontSize: 16 }}>
                        {expandedTips[i] ? tip : getConciseTip(tip)}
                        {tip.length > 80 && (
                          <button
                            style={{ marginLeft: 8, fontSize: 13, color: '#178aff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setExpandedTips(tips => tips.map((v, idx) => idx === i ? !v : v))}
                          >{expandedTips[i] ? t('Show less') : t('Show more')}</button>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
          <button style={{ marginTop: 24 }} onClick={() => setCurrentTest(null)}>{t('Back to Test List')}</button>
        </div>
      )}
    </div>
  );
} 

function PerformanceView({ testId, onClose, inline }) {
  const studentId = localStorage.getItem('student_id') || '';
  const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
  const perf = history.find(h => h.test_id === testId && h.student_id === studentId);
  const [test, setTest] = React.useState(null);
  const [aiSuggestions, setAiSuggestions] = React.useState(perf && perf.aiSuggestions ? perf.aiSuggestions : []);
  React.useEffect(() => {
    axios.get(`${API_BASE_URL}/get_test/${testId}?language=${localStorage.getItem('selectedLanguage') || 'en'}`)
      .then(res => {
        const data = res.data;
        setTest(data);
        // If no suggestions stored, fetch them
        if (perf && (!perf.aiSuggestions || perf.aiSuggestions.length === 0)) {
          // Find wrong answers
          if (perf.answers && perf.answers.length && data && data.questions) {
            const wrongs = data.questions.map((q, i) => ({
              q, given: perf.answers[i], idx: i
            })).filter((item, i) => {
              const normalize = s => (typeof s === 'string' ? s.trim().toLowerCase().replace(/\W+/g, '') : '');
              return normalize(item.q.answer) !== normalize(item.given);
            });
            if (wrongs.length > 0) {
              setAiSuggestions(Array(wrongs.length).fill('Loading suggestion...'));
              Promise.all(wrongs.map(async (item, idx) => {
                try {
                  const aiRes = await axios.post(`${API_BASE_URL}/eduassistant`, {
                    class: perf.class,
                    subject: perf.subject,
                    topic: perf.topic,
                    language: localStorage.getItem('selectedLanguage') || 'en',
                    message: `I got this question wrong: ${item.q.q}. The correct answer is: ${item.q.answer}. My answer was: ${item.given}. Please give me a short tip or explanation to help me learn this better.`
                  });
                  return aiRes.data.reply;
                } catch {
                  return 'Could not fetch suggestion.';
                }
              })).then(suggestions => {
                setAiSuggestions(suggestions);
                // Save suggestions in history
                const history = JSON.parse(localStorage.getItem('student_test_history') || '[]');
                const idx = history.findIndex(h => h.test_id === testId && h.student_id === studentId);
                if (idx !== -1) {
                  history[idx].aiSuggestions = suggestions;
                  localStorage.setItem('student_test_history', JSON.stringify(history));
                }
              });
            }
          }
        }
      })
      .catch(error => {
        console.error('Error fetching test data:', error);
        setTest(null);
      });
  }, [testId, perf]);
  if (!perf || !test) return <div style={{ marginTop: 24, color: '#e11d48' }}>Could not load performance data.</div>;
  const answers = Array.isArray(perf.answers) ? perf.answers : [];
  const containerStyle = inline
    ? { background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, maxWidth: 600, boxShadow: '0 2px 24px #2563eb22', position: 'relative', margin: '0 auto' }
    : { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <div style={containerStyle}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#e11d48', cursor: 'pointer' }}>&times;</button>
      <h2 style={{ color: '#2563eb', marginBottom: 12 }}>Your Performance</h2>
      <div style={{ marginBottom: 16, fontWeight: 600, color: '#19e6b3' }}>Score: {perf.score}</div>
      <ol>
        {test.questions.map((q, i) => (
          <li key={i} style={{ marginBottom: 14 }}>
            <div><b>{q.q}</b></div>
            <div style={{ marginTop: 4 }}>
              <span style={{ color: '#888' }}>Your answer: </span>
              <span style={{ color: answers[i] === q.answer ? '#19e6b3' : '#e11d48', fontWeight: 600 }}>{(answers[i] !== undefined && answers[i] !== null && answers[i] !== '') ? answers[i] : <i>Not answered</i>}</span>
            </div>
            <div>
              <span style={{ color: '#888' }}>Correct answer: </span>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>{q.answer}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
} 