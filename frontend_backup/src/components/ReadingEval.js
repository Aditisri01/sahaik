import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop, FaCheck, FaRedo, FaBookOpen, FaLanguage, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

const GRADE_LEVELS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];
const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Malayalam', 'Marathi', 'Punjabi', 'Kannada', 'Odia', 'Urdu'
];
const LANG_CODES = {
  English: 'en-US', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN', Bengali: 'bn-IN', Gujarati: 'gu-IN', Malayalam: 'ml-IN', Marathi: 'mr-IN', Punjabi: 'pa-IN', Kannada: 'kn-IN', Odia: 'or-IN', Urdu: 'ur-IN'
};

export default function ReadingEval() {
  const [grade, setGrade] = useState('3');
  const [language, setLanguage] = useState('English');
  const [passage, setPassage] = useState('');
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: select, 2: passage, 3: record, 4: result
  const [transcription, setTranscription] = useState('');
  const recognitionRef = useRef(null);

  // Generate passage from backend
  const handleGeneratePassage = async () => {
    setError(null);
    setProgress(true);
    setPassage('');
    setResult(null);
    setTranscription('');
    setStep(2);
    try {
      const formData = new FormData();
      formData.append('grade_level', grade);
      formData.append('language', language);
      const res = await fetch(`${API_BASE_URL}/reading-eval`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setProgress(false);
      if (res.ok && data.generated_passage) {
        setPassage(data.generated_passage);
        setStep(3);
      } else {
        setError(data.error || 'Failed to generate passage.');
      }
    } catch (err) {
      setProgress(false);
      setError('Network or server error.');
    }
  };

  // Start browser speech recognition
  const startRecording = () => {
    setError(null);
    setResult(null);
    setTranscription('');
    setProgress(false);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CODES[language] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscription(transcript);
      setRecording(false);
    };
    recognition.onerror = (event) => {
      setError('Speech recognition error: ' + event.error);
      setRecording(false);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setRecording(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  // Stop browser speech recognition
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setRecording(false);
    }
  };

  // Submit passage and transcription for evaluation
  const handleSubmit = async () => {
    if (!transcription) {
      setError('No transcription available.');
      return;
    }
    setProgress(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('grade_level', grade);
      formData.append('language', language);
      formData.append('transcription', transcription);
      const res = await fetch(`${API_BASE_URL}/reading-eval`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setProgress(false);
      if (res.ok) {
        setResult(data);
        setStep(4);
      } else {
        setError(data.error || 'Evaluation failed.');
      }
    } catch (err) {
      setProgress(false);
      setError('Network or server error.');
    }
  };

  // Highlight mismatches
  function highlightDiff(orig, trans) {
    if (!orig || !trans) return '';
    const o = orig.split(/\s+/);
    const t = trans.split(/\s+/);
    let html = '';
    let i = 0, j = 0;
    while (i < o.length || j < t.length) {
      if (o[i] === t[j]) {
        html += `<span>${o[i] || ''} </span>`;
        i++; j++;
      } else if (t[j] && !o.includes(t[j])) {
        html += `<span style="background:#ffe0e0;">${t[j]} </span>`;
        j++;
      } else if (o[i] && !t.includes(o[i])) {
        html += `<span style="background:#e0e0ff;">${o[i]} </span>`;
        i++;
      } else {
        html += `<span style="background:#ffe0e0;">${t[j] || ''} </span>`;
        i++; j++;
      }
    }
    return html;
  }

  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001' }}>
      <h2 style={{display:'flex',alignItems:'center',gap:8}}><FaBookOpen style={{color:'#3498db'}}/> Reading Evaluation</h2>
      {/* Step 1: Selectors */}
      {step === 1 && (
        <div style={{ marginBottom: 24, display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <FaGraduationCap style={{color:'#222'}}/>
            <label>Grade Level:</label>
            <select value={grade} onChange={e => setGrade(e.target.value)} style={{ marginRight: 8, minWidth:60 }}>
              {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <FaLanguage style={{color:'#222'}}/>
            <label>Language:</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={handleGeneratePassage} style={{ marginLeft: 16, background: '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 16, cursor: 'pointer', display:'flex',alignItems:'center',gap:8 }}>
              <FaArrowRight/> Generate Passage
            </button>
          </div>
        </div>
      )}
      {/* Progress Bar */}
      {progress && (
        <div style={{ margin: '16px 0' }}>
          <div style={{ width: '100%', height: 8, background: '#eee', borderRadius: 4 }}>
            <div style={{ width: '100%', height: 8, background: '#3498db', borderRadius: 4, animation: 'progressBar 1s linear infinite' }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>Processing...</div>
        </div>
      )}
      {/* Error */}
      {error && <div style={{ color: '#e74c3c', margin: '12px 0', fontWeight:600 }}>{error}</div>}
      {/* Step 2/3: Passage and Recording */}
      {step === 3 && passage && (
        <div style={{ marginBottom: 24 }}>
          <b style={{display:'flex',alignItems:'center',gap:6}}><FaBookOpen/> Generated Passage:</b>
          <div style={{ background: '#f8f8f8', padding: 12, borderRadius: 6, marginTop: 4, fontSize:17 }}>{passage}</div>
          <div style={{ marginTop: 20, display:'flex',alignItems:'center',gap:12 }}>
            <button
              onClick={recording ? stopRecording : startRecording}
              style={{ background: recording ? '#e74c3c' : '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 18, cursor: 'pointer', display:'flex',alignItems:'center',gap:8 }}
            >
              {recording ? <FaStop/> : <FaMicrophone/>}
              {recording ? 'Stop' : 'Record'}
            </button>
            {transcription && !recording && (
              <button onClick={handleSubmit} style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 18, cursor: 'pointer', display:'flex',alignItems:'center',gap:8 }}>
                <FaCheck/> Evaluate
              </button>
            )}
            <button onClick={() => { setStep(1); setResult(null); setPassage(''); setTranscription(''); setError(null); }} style={{ background: '#f39c12', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 18, cursor: 'pointer', display:'flex',alignItems:'center',gap:8 }}>
              <FaRedo/> Start Over
            </button>
          </div>
          {transcription && (
            <div style={{ marginTop: 18 }}>
              <b style={{display:'flex',alignItems:'center',gap:6}}><FaMicrophone/> Transcription:</b>
              <div style={{ background: '#f8f8f8', padding: 10, borderRadius: 6, marginTop: 2, fontSize:16 }}>{transcription}</div>
            </div>
          )}
        </div>
      )}
      {/* Step 4: Results */}
      {step === 4 && result && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 10 }}>
            <b style={{display:'flex',alignItems:'center',gap:6}}><FaBookOpen/> Passage:</b>
            <div style={{ background: '#f8f8f8', padding: 10, borderRadius: 6, marginTop: 2, fontSize:16 }}>{result.generated_passage || passage}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <b style={{display:'flex',alignItems:'center',gap:6}}><FaMicrophone/> Transcribed:</b>
            <div style={{ background: '#f8f8f8', padding: 10, borderRadius: 6, marginTop: 2, fontSize:16 }} dangerouslySetInnerHTML={{ __html: highlightDiff(result.generated_passage || passage, result.transcription) }} />
          </div>
          <div style={{ marginBottom: 10, display:'flex',alignItems:'center',gap:8 }}>
            <b>Score:</b> <span style={{ color: '#27ae60', fontWeight: 700, fontSize:18 }}>{result.score}</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Feedback:</b>
            <div style={{ background: '#f8f8f8', padding: 10, borderRadius: 6, marginTop: 2, fontSize:16 }}>{result.feedback}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Missing Words:</b> {Array.isArray(result.missing_words) ? result.missing_words.join(', ') : ''}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Extra Words:</b> {Array.isArray(result.extra_words) ? result.extra_words.join(', ') : ''}
          </div>
          <button onClick={() => { setStep(1); setResult(null); setPassage(''); setTranscription(''); setError(null); }} style={{ background: '#f39c12', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 18, cursor: 'pointer', display:'flex',alignItems:'center',gap:8, marginTop: 12 }}>
            <FaRedo/> Start Over
          </button>
        </div>
      )}
      <style>{`
        @keyframes progressBar {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        @media (max-width: 600px) {
          div[style*='max-width: 520px'] { max-width: 98vw !important; padding: 4vw !important; }
          textarea { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
} 