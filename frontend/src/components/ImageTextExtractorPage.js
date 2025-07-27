import React, { useState } from 'react';
import UploadForm from './UploadForm';
import ResultDisplay from './ResultDisplay';
import { FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './TextExtractor.css';
import textImage from '../assets/text.jpeg';

export default function ImageTextExtractorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  
  // Determine back target
  const backTarget = location.state && location.state.from === 'student-home' ? '/student-home' : '/teacher-home';
  
  return (
    <div className="text-extractor-root">
      <div className="text-extractor-container">
        {/* Back Button */}
        <button 
          onClick={() => navigate(backTarget)} 
          className="text-back-btn"
          title={backTarget === '/teacher-home' ? 'Back to Teacher Home' : 'Back to Student Home'}
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Header Section */}
        <div className="text-header">
          <div className="text-header-content">
            <div className="text-header-text">
              <h1 className="text-title">
                <FaFileAlt className="text-title-icon" />
                Image Text Extractor
              </h1>
              <p className="text-subtitle">
                Extract and translate text from images with AI-powered OCR technology. Upload any image containing text and get instant, accurate text extraction with translation support for multiple languages.
              </p>
            </div>
            <div className="text-header-image">
              <img src={textImage} alt="Text Extractor" className="text-illustration" />
            </div>
          </div>
        </div>

        {/* Upload Form Section */}
        <div className="text-upload-section">
          <UploadForm 
            setResult={setResult} 
            selectedLanguage={selectedLanguage} 
            setSelectedLanguage={setSelectedLanguage}
            setLoading={setLoading}
          />
        </div>

        {/* Results Section */}
        {result && (
          <div className="text-results-section">
            <ResultDisplay result={result} selectedLanguage={selectedLanguage} />
          </div>
        )}

        {/* Loading Section */}
        {loading && (
          <div className="text-loading-section">
            <div className="text-loading-spinner"></div>
            <p className="text-loading-text">Extracting text from image...</p>
          </div>
        )}
      </div>
    </div>
  );
} 