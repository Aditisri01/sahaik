import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './StudentAssistant.css';
import DOMPurify from 'dompurify';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import ttsMap from '../tts.json';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const classes = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const subjects = [
  'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi',
  'Computer', 'General Knowledge', 'Other'
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
];

const langSpeechMap = ttsMap;
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export default function StudentAssistant() {
  // Navigation and state
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = location.state && location.state.from === 'student-home' ? '/student-home' : '/teacher-home';

  // UI state
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: 'Hi! I am your eduAssistant from sahAIk. Ask me any doubt about your topic.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  // Audio state (for mobile/cloud TTS)
  const [cloudAudio, setCloudAudio] = useState(null);
  const [cloudSpeaking, setCloudSpeaking] = useState(false);
  const cloudAudioRef = useRef(null);
  const recognitionRef = useRef(null);

  // Track which message index is currently playing
  const [playingIdx, setPlayingIdx] = useState(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (cloudAudioRef.current) {
        cloudAudioRef.current.pause();
        cloudAudioRef.current = null;
      }
    };
  }, []);

  // Speech-to-text (audio input)
  const handleMicClick = async () => {
    if (isMobile) {
      try {
        const hasPerm = await SpeechRecognition.hasPermission();
        if (!hasPerm.permission) {
          await SpeechRecognition.requestPermission();
        }
        setRecognizing(true);
        const result = await SpeechRecognition.start({
          language: langSpeechMap[selectedLanguage] || 'en-US',
          maxResults: 1,
          prompt: 'Speak your question',
          partialResults: false,
        });
        if (result && result.matches && result.matches[0]) {
          setInput(result.matches[0]);
        }
      } catch (err) {
        alert('Speech recognition failed: ' + (err.message || err));
      } finally {
        setRecognizing(false);
      }
      return;
    }
    // Web fallback
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    let WebSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new WebSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = langSpeechMap[selectedLanguage] || 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setRecognizing(false);
      };
      recognitionRef.current.onerror = () => setRecognizing(false);
      recognitionRef.current.onend = () => setRecognizing(false);
    }
    recognitionRef.current.lang = langSpeechMap[selectedLanguage] || 'en-US';
    setRecognizing(true);
    recognitionRef.current.start();
  };

  // Play or pause cloud TTS audio (mobile)
  const playCloudTTS = async (text, idx, lang) => {
    if (!text) return;
    const ttsLang = langSpeechMap[selectedLanguage] || 'en-US';
    // If audio exists and src matches, always pause if playing
    if (cloudAudioRef.current && cloudAudioRef.current.src && cloudAudioRef.current.textSrc === text) {
      if (!cloudAudioRef.current.paused && !cloudAudioRef.current.ended) {
        cloudAudioRef.current.pause();
        setCloudSpeaking(false);
        setPlayingIdx(null);
        return;
      }
      // If paused or ended, play from start
      cloudAudioRef.current.currentTime = 0;
      cloudAudioRef.current.play();
      setCloudSpeaking(true);
      setPlayingIdx(idx);
      return;
    }
    // Otherwise, stop any previous audio and play new
    if (cloudAudioRef.current) {
      cloudAudioRef.current.pause();
      cloudAudioRef.current = null;
      setCloudSpeaking(false);
      setPlayingIdx(null);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: ttsLang })
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new window.Audio(url);
      audio.textSrc = text; // custom property to track message
      cloudAudioRef.current = audio;
      setCloudAudio(audio);
      setCloudSpeaking(true);
      setPlayingIdx(idx);
      audio.onended = () => {
        setCloudAudio(null);
        setCloudSpeaking(false);
        setPlayingIdx(null);
        cloudAudioRef.current = null;
      };
      audio.play();
    } catch (err) {
      setCloudAudio(null);
      setCloudSpeaking(false);
      setPlayingIdx(null);
      cloudAudioRef.current = null;
      alert('Audio not available for this language. Please use English as a fallback.');
    }
  };

  // Handle TTS button click
  const handleSpeak = (text, idx) => {
    if (!text) return;
    if (
      typeof window === 'undefined' ||
      typeof window.speechSynthesis === 'undefined' ||
      typeof window.SpeechSynthesisUtterance === 'undefined' ||
      isMobile
    ) {
      playCloudTTS(text, idx, langSpeechMap[selectedLanguage] || 'en-US');
      return;
    }
    // Browser TTS
    window.speechSynthesis.cancel();
    setPaused(false);
    setSpeaking(idx);
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = langSpeechMap[selectedLanguage] || 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang === utter.lang && v.localService);
    if (match) utter.voice = match;
    else {
      const fallback = voices.find(v => v.lang === utter.lang);
      if (fallback) utter.voice = fallback;
    }
    utter.rate = 0.92;
    utter.pitch = 0.95;
    utter.volume = 1;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  // Send message to eduAssistant
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const topic = customTopic.trim() ? customTopic : selectedSubject;
    const newMessages = [...messages, { sender: 'student', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL.replace(/\/$/, '')}/eduassistant`, {
        class: selectedClass,
        subject: selectedSubject,
        topic: topic,
        language: selectedLanguage,
        message: input
      });
      setMessages([...newMessages, { sender: 'assistant', text: res.data.reply }]);
    } catch (err) {
      let errorMsg = 'Sorry, I could not process your question.';
      if (err.response && err.response.data && err.response.data.reply) {
        errorMsg = err.response.data.reply;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setMessages([...newMessages, { sender: 'assistant', text: errorMsg }]);
    }
    setLoading(false);
  };

  return (
    <div className="assistant-container">
      <button onClick={() => navigate(backTarget)} style={{ background: 'none', border: 'none', fontSize: 28, position: 'absolute', left: 16, top: isMobile ? 56 : 16, zIndex: 10, color: '#2563eb', cursor: 'pointer' }} title={backTarget === '/teacher-home' ? 'Back to Teacher Home' : 'Back to Student Home'}><FaArrowLeft /></button>
      <h1 className="assistant-title">eduAssistant</h1>
      <div className="assistant-select-row">
        <div className="assistant-select-group">
          <label className="assistant-label" htmlFor="class-select">Class</label>
          <select id="class-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="assistant-select">
            {classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        </div>
        <div className="assistant-select-group">
          <label className="assistant-label" htmlFor="subject-select">Subject</label>
          <select id="subject-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="assistant-select">
            {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </div>
        <div className="assistant-select-group">
          <label className="assistant-label" htmlFor="language-select">Language</label>
          <select id="language-select" value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="assistant-select">
            {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
          </select>
        </div>
      </div>
      <div className="assistant-topic-row">
        <label className="assistant-label" htmlFor="topic-input">Topic</label>
        <input
          id="topic-input"
          type="text"
          value={customTopic}
          onChange={e => setCustomTopic(e.target.value)}
          className="assistant-topic-input"
          placeholder="Enter a specific topic (optional)"
          disabled={loading}
        />
      </div>
      <hr className="divider" />
      <div className="assistant-chatbox">
        {messages.map((msg, idx) => (
          <div key={idx} className={`assistant-msg ${msg.sender} fade-in`}>
            {msg.sender === 'assistant'
              ? <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatAssistantText(msg.text)) }} />
              : msg.text}
            {msg.sender === 'assistant' && (
              <>
                <button
                  className="audio-btn"
                  title={playingIdx === idx && cloudAudioRef.current && !cloudAudioRef.current.paused && !cloudAudioRef.current.ended ? "Pause audio" : "Listen to answer"}
                  onClick={() => handleSpeak(msg.text, idx)}
                  style={{ marginLeft: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                >{isMobile && playingIdx === idx && cloudAudioRef.current && !cloudAudioRef.current.paused && !cloudAudioRef.current.ended ? '⏸️' : '🔊'}</button>
              </>
            )}
          </div>
        ))}
        {loading && (
          <div className="assistant-msg assistant assistant-loading fade-in">AI is thinking...</div>
        )}
      </div>
      <form onSubmit={handleSend} className="assistant-input-row">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="assistant-input"
          placeholder="Type your doubt here..."
          disabled={loading}
        />
        <button
          type="button"
          className="audio-btn"
          title={recognizing ? "Listening..." : "Speak your question"}
          onClick={handleMicClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: recognizing ? '#178aff' : '#888' }}
          disabled={recognizing || loading}
        >🎤</button>
        <button type="submit" className="assistant-send-btn" disabled={loading || !input.trim()}>Send</button>
      </form>
    </div>
  );
}

// Format assistant text with bullet points and numbers
function formatAssistantText(text) {
  const lines = text.split(/\r?\n/);
  let html = '';
  let inUl = false, inOl = false;
  lines.forEach(line => {
    const bulletMatch = /^\*\s+(.+)/.exec(line);
    const numberMatch = /^\d+\.\s+(.+)/.exec(line);
    if (bulletMatch) {
      if (!inUl) { html += '<ul>'; inUl = true; }
      if (inOl) { html += '</ol>'; inOl = false; }
      html += `<li>${bulletMatch[1]}</li>`;
    } else if (numberMatch) {
      if (!inOl) { html += '<ol>'; inOl = true; }
      if (inUl) { html += '</ul>'; inUl = false; }
      html += `<li>${numberMatch[1]}</li>`;
    } else {
      if (inUl) { html += '</ul>'; inUl = false; }
      if (inOl) { html += '</ol>'; inOl = false; }
      if (line.trim() !== '') {
        html += `<div>${line.replace(/\*/g, '').trim()}</div>`;
      } else {
        html += '<br/>';
      }
    }
  });
  if (inUl) html += '</ul>';
  if (inOl) html += '</ol>';
  return html;
} 