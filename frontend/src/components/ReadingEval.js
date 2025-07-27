import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop, FaCheck, FaRedo, FaBookOpen, FaLanguage, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import './ReadingEval.css';

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
        html += `<span class="highlight-extra">${t[j]} </span>`;
        j++;
      } else if (o[i] && !t.includes(o[i])) {
        html += `<span class="highlight-missing">${o[i]} </span>`;
        i++;
      } else {
        html += `<span class="highlight-extra">${t[j] || ''} </span>`;
        i++; j++;
      }
    }
    return html;
  }

  const handleStartOver = () => {
    setStep(1);
    setResult(null);
    setPassage('');
    setTranscription('');
    setError(null);
  };

  return (
    <div className="reading-eval-root">
      <div className="reading-eval-container">
        {/* Header Section */}
        <div className="reading-eval-header">
          <h1 className="reading-eval-title">
            <FaBookOpen className="reading-eval-title-icon" />
            Reading Evaluation
          </h1>
          <p className="reading-eval-subtitle">
            Improve reading skills with AI-powered evaluation. Generate passages and get instant feedback on pronunciation and accuracy.
          </p>
        </div>

        {/* Step 1: Selectors */}
        {step === 1 && (
          <div className="reading-eval-step">
            <div className="reading-eval-selectors">
              <div className="selector-group">
                <FaGraduationCap className="selector-icon" />
                <label>Grade Level:</label>
                <select value={grade} onChange={e => setGrade(e.target.value)}>
                  {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="selector-group">
                <FaLanguage className="selector-icon" />
                <label>Language:</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="reading-eval-btn-row">
              <button 
                onClick={handleGeneratePassage}
                className="reading-eval-btn primary"
                disabled={progress}
              >
                <FaArrowRight />
                Generate Passage
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="reading-eval-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-text">Processing...</div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="reading-eval-error">
            {error}
          </div>
        )}

        {/* Step 3: Passage and Recording */}
        {step === 3 && passage && (
          <div className="reading-eval-step">
            <div className="reading-eval-content">
              <div className="content-header">
                <FaBookOpen className="content-header-icon" />
                Generated Passage:
              </div>
              <div className="content-text">{passage}</div>
            </div>

            <div className="reading-eval-btn-row">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`reading-eval-btn ${recording ? 'danger' : 'primary'}`}
                disabled={progress}
              >
                {recording ? <FaStop /> : <FaMicrophone />}
                {recording ? 'Stop' : 'Record'}
              </button>
              
              {transcription && !recording && (
                <button 
                  onClick={handleSubmit}
                  className="reading-eval-btn success"
                  disabled={progress}
                >
                  <FaCheck />
                  Evaluate
                </button>
              )}
              
              <button 
                onClick={handleStartOver}
                className="reading-eval-btn warning"
              >
                <FaRedo />
                Start Over
              </button>
            </div>

            {transcription && (
              <div className="reading-eval-content">
                <div className="content-header">
                  <FaMicrophone className="content-header-icon" />
                  Transcription:
                </div>
                <div className="content-text">{transcription}</div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <div className="reading-eval-step">
            <div className="reading-eval-results">
              <div className="results-score">
                <span>Score:</span>
                <span className="score-value">{result.score}</span>
              </div>

              <div className="results-section">
                <div className="results-section-title">Passage:</div>
                <div className="results-section-content">
                  {result.generated_passage || passage}
                </div>
              </div>

              <div className="results-section">
                <div className="results-section-title">Transcribed:</div>
                <div 
                  className="results-section-content"
                  dangerouslySetInnerHTML={{ __html: highlightDiff(result.generated_passage || passage, result.transcription) }}
                />
              </div>

              <div className="results-section">
                <div className="results-section-title">Feedback:</div>
                <div className="results-section-content">
                  {result.feedback}
                </div>
              </div>

              {Array.isArray(result.missing_words) && result.missing_words.length > 0 && (
                <div className="results-section">
                  <div className="results-section-title">Missing Words:</div>
                  <div className="results-section-content">
                    {result.missing_words.join(', ')}
                  </div>
                </div>
              )}

              {Array.isArray(result.extra_words) && result.extra_words.length > 0 && (
                <div className="results-section">
                  <div className="results-section-title">Extra Words:</div>
                  <div className="results-section-content">
                    {result.extra_words.join(', ')}
                  </div>
                </div>
              )}
            </div>

            <div className="reading-eval-btn-row">
              <button 
                onClick={handleStartOver}
                className="reading-eval-btn warning"
              >
                <FaRedo />
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 