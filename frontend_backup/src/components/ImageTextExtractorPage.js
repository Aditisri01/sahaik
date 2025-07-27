import React, { useState } from 'react';
import UploadForm from './UploadForm';
import ResultDisplay from './ResultDisplay';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ImageTextExtractorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const isMobile = window.innerWidth <= 600;
  // Determine back target
  const backTarget = location.state && location.state.from === 'student-home' ? '/student-home' : '/teacher-home';
  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#e6e6e6', padding: '0', margin: '0' }}>
      <button onClick={() => navigate(backTarget)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 28,
          position: 'absolute',
          left: 16,
          top: isMobile ? 48 : 16,
          zIndex: 10,
          color: '#2563eb',
          cursor: 'pointer'
        }}
        title={backTarget === '/teacher-home' ? 'Back to Teacher Home' : 'Back to Student Home'}
      >
        <FaArrowLeft />
      </button>
      <UploadForm setResult={setResult} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
      <ResultDisplay result={result} selectedLanguage={selectedLanguage} />
      {/* TODO: Investigate mobile audio button issues in ResultDisplay */}
    </div>
  );
} 