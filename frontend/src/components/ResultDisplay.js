import React, { useState, useRef } from 'react';
import { FaRegCopy, FaCheck, FaVolumeUp, FaStop } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import ttsMap from '../tts.json';

export default function ResultDisplay({ result, selectedLanguage }) {
  const [copied, setCopied] = useState({extracted: false, translated: false});
  const [speaking, setSpeaking] = useState({extracted: false, translated: false});
  const utterRef = useRef({extracted: null, translated: null});
  const [cloudAudio, setCloudAudio] = useState(null);
  const [cloudSpeaking, setCloudSpeaking] = useState(false);
  if (!result) return null;

  // Map i18n language codes to speechSynthesis codes
  const langSpeechMap = ttsMap;

  // Only show supported languages for TTS
  const supportedLangs = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (hi-IN)' },
    { code: 'bn', name: 'Bengali (bn-IN)' },
    { code: 'te', name: 'Telugu (te-IN)' },
    { code: 'mr', name: 'Marathi (mr-IN)' },
    { code: 'ta', name: 'Tamil (ta-IN)' },
    { code: 'gu', name: 'Gujarati (gu-IN)' },
    { code: 'kn', name: 'Kannada (kn-IN)' },
    { code: 'ml', name: 'Malayalam (ml-IN)' },
    { code: 'or', name: 'Odia (or-IN)' },
    { code: 'pa', name: 'Punjabi (pa-IN)' },
    { code: 'as', name: 'Assamese (as-IN)' },
    { code: 'ur', name: 'Urdu (ur-IN)' },
    { code: 'es', name: 'Spanish (es-ES)' },
    { code: 'fr', name: 'French (fr-FR)' },
    { code: 'de', name: 'German (de-DE)' },
    { code: 'zh-cn', name: 'Chinese (zh-CN)' },
    { code: 'ru', name: 'Russian (ru-RU)' },
    { code: 'ja', name: 'Japanese (ja-JP)' },
    { code: 'ar', name: 'Arabic (ar-XA)' },
    { code: 'it', name: 'Italian (it-IT)' },
    { code: 'pt', name: 'Portuguese (pt-PT)' },
    { code: 'tr', name: 'Turkish (tr-TR)' },
    { code: 'ko', name: 'Korean (ko-KR)' },
    { code: 'vi', name: 'Vietnamese (vi-VN)' },
    { code: 'th', name: 'Thai (th-TH)' },
    { code: 'id', name: 'Indonesian (id-ID)' },
    // Add more as confirmed working
  ];

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({...prev, [type]: true}));
    setTimeout(() => setCopied(prev => ({...prev, [type]: false})), 1200);
  };

  const getBestVoice = (lang) => {
    const voices = window.speechSynthesis.getVoices();
    // Prefer voices with 'female', 'natural', or 'soft' in their name, and matching lang
    const preferred = voices.filter(v => v.lang === lang && /female|natural|soft/i.test(v.name));
    if (preferred.length > 0) return preferred[0];
    // Otherwise, pick any matching lang
    const fallback = voices.find(v => v.lang === lang);
    if (fallback) return fallback;
    // Try to match by language prefix (e.g., 'ta' for Tamil)
    const langPrefix = lang.split('-')[0];
    const prefixMatch = voices.find(v => v.lang && v.lang.startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;
    // Otherwise, return default
    return voices[0];
  };

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const handleSpeak = (text, type, lang) => {
    if (!text) return;
    if (
      typeof window === 'undefined' ||
      typeof window.speechSynthesis === 'undefined' ||
      typeof window.SpeechSynthesisUtterance === 'undefined' ||
      isMobile
    ) {
      // On mobile or unsupported, use Cloud TTS instead
      playCloudTTS(text, langSpeechMap[selectedLanguage] || 'en-US');
      return;
    }
    // If already speaking, stop
    if (speaking[type]) {
      window.speechSynthesis.cancel();
      setSpeaking(prev => ({...prev, [type]: false}));
      return;
    }
    // Otherwise, start speaking
    const utter = new window.SpeechSynthesisUtterance(text);
    if (lang) utter.lang = lang;
    // Set softer, more human-like voice if available
    const bestVoice = getBestVoice(lang);
    if (bestVoice) utter.voice = bestVoice;
    utter.rate = 0.92; // slower for clarity
    utter.pitch = 0.95; // slightly lower for softness
    utter.volume = 1.0;
    utterRef.current[type] = utter;
    setSpeaking(prev => ({...prev, [type]: true}));
    utter.onend = () => setSpeaking(prev => ({...prev, [type]: false}));
    window.speechSynthesis.speak(utter);
  };

  // Play/stop audio using Google Cloud TTS for translated text
  const playCloudTTS = async (text, lang) => {
    if (!text) return;
    const ttsLang = langSpeechMap[selectedLanguage] || 'en-US';
    if (!ttsLang) {
      alert('Audio not available for this language. Please use English as a fallback.');
      return;
    }
    // If already playing, stop
    if (cloudAudio) {
      cloudAudio.pause();
      cloudAudio.currentTime = 0;
      setCloudAudio(null);
      setCloudSpeaking(false);
      return;
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
      setCloudAudio(audio);
      setCloudSpeaking(true);
      audio.onended = () => {
        setCloudAudio(null);
        setCloudSpeaking(false);
      };
      audio.play();
    } catch (err) {
      setCloudAudio(null);
      setCloudSpeaking(false);
      alert('Audio not available for this language. Please use English as a fallback.');
    }
  };

  return (
    <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
      {/* Extracted Text Card */}
      <div style={{ background: 'linear-gradient(135deg, #fff7d6 0%, #e0f4ff 100%)', boxShadow: '0 4px 24px #b3c6e0', borderRadius: 18, padding: '2.2rem 2.2rem 1.5rem 2.2rem', maxWidth: 700, width: '100%', border: '2.5px solid #2563eb', position: 'relative' }}>
        <h3 style={{ color: '#2563eb', fontSize: '1.35rem', fontWeight: 800, marginBottom: 12, letterSpacing: 0.5 }}>Extracted Text</h3>
        <pre style={{ background: '#fff', color: '#1a1a1a', fontSize: '1.18rem', padding: '1.2rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%', overflowX: 'auto', borderRadius: 10, minHeight: 80, fontFamily: 'IBM Plex Mono, Fira Mono, monospace', boxShadow: '0 1.5px 8px #e6f0fa', border: '1.5px solid #b3c6e0', marginBottom: 0 }}>
          {result.extracted_text || <span style={{color:'#888'}}>No text found in image.</span>}
        </pre>
        <div style={{ position: 'absolute', top: 18, right: 18, display: 'flex', gap: 12 }}>
          <button onClick={() => handleCopy(result.extracted_text, 'extracted')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 22 }} title="Copy extracted text">
            {copied.extracted ? <FaCheck color="#2ecc40" /> : <FaRegCopy />}
          </button>
          <button onClick={() => handleSpeak(result.extracted_text, 'extracted', 'en-US')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: speaking.extracted ? '#d32f2f' : '#2563eb', fontSize: 22 }} title={speaking.extracted ? "Stop audio" : "Play extracted text as audio"} aria-label="Play extracted text">
            {speaking.extracted ? <FaStop /> : <FaVolumeUp />}
          </button>
        </div>
      </div>
      {/* Translated Text Card */}
      <div style={{ background: 'linear-gradient(135deg, #e0f4ff 0%, #fff7d6 100%)', boxShadow: '0 4px 24px #b3c6e0', borderRadius: 18, padding: '2.2rem 2.2rem 1.5rem 2.2rem', maxWidth: 700, width: '100%', border: '2.5px solid #2563eb', position: 'relative' }}>
        <h3 style={{ color: '#2563eb', fontSize: '1.35rem', fontWeight: 800, marginBottom: 12, letterSpacing: 0.5 }}>Translated Text</h3>
        <pre style={{ background: '#fff', color: '#1a1a1a', fontSize: '1.18rem', padding: '1.2rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%', overflowX: 'auto', borderRadius: 10, minHeight: 80, fontFamily: 'IBM Plex Mono, Fira Mono, monospace', boxShadow: '0 1.5px 8px #e6f0fa', border: '1.5px solid #b3c6e0', marginBottom: 0 }}>
          {result.translated_text || <span style={{color:'#888'}}>No translation available.</span>}
        </pre>
        <div style={{ position: 'absolute', top: 18, right: 18, display: 'flex', gap: 12 }}>
          <button onClick={() => handleCopy(result.translated_text, 'translated')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 22 }} title="Copy translated text">
            {copied.translated ? <FaCheck color="#2ecc40" /> : <FaRegCopy />}
          </button>
          <button onClick={() => playCloudTTS(result.translated_text, langSpeechMap[selectedLanguage] || 'en-US')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cloudSpeaking ? '#d32f2f' : '#2563eb', fontSize: 22 }} title={cloudSpeaking ? "Stop audio" : "Play translated text as audio"} aria-label="Play translated text">
            {cloudSpeaking ? <FaStop /> : <FaVolumeUp />}
          </button>
        </div>
      </div>
    </div>
  );
} 