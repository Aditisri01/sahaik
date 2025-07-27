import React, { useState } from 'react';
import { FaPencilAlt, FaDownload, FaImage, FaGraduationCap, FaLanguage, FaBook, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './DiagramGenerator.css';
import diagramImage from '../assets/diagram.jpeg';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'or', label: 'Odia' },
  { code: 'ur', label: 'Urdu' },
];

const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
];

function DiagramGenerator() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState(GRADES[0]);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [diagrams, setDiagrams] = useState([]);
  const [error, setError] = useState(null);

  const BACKEND_URL = API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDiagrams([]);
    
    try {
      const res = await fetch(`${BACKEND_URL}/generate_diagrams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          grade_level: grade,
          language: LANGUAGES.find(l => l.code === language)?.label || 'English',
        })
      });
      
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDiagrams(data.diagrams || []);
      }
    } catch (e) {
      setError('Failed to generate diagrams. Please try again.');
    }
    setLoading(false);
  };

  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="diagram-generator-root">
      <div className="diagram-generator-container">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/teacher-home')} 
          className="diagram-back-btn"
          title="Back to Teacher Home"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Header Section */}
        <div className="diagram-header">
          <div className="diagram-header-content">
            <div className="diagram-header-text">
              <h1 className="diagram-title">
                <FaPencilAlt className="diagram-title-icon" />
                Educational Diagram Generator
              </h1>
              <p className="diagram-subtitle">
                Generate four simple, sketch-style educational diagrams for any topic using AI. Create visual learning materials that make complex concepts easy to understand.
              </p>
            </div>
            <div className="diagram-header-image">
              <img src={diagramImage} alt="Diagram Generator" className="diagram-illustration" />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="diagram-form-section">
          <form onSubmit={handleSubmit} className="diagram-form">
            <div className="diagram-form-group">
              <FaBook className="group-icon" />
              <input 
                type="text" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                required 
                placeholder="Educational topic (e.g., Photosynthesis)" 
                className="diagram-input"
              />
            </div>
            <div className="diagram-form-group">
              <FaGraduationCap className="group-icon" />
              <select value={grade} onChange={e => setGrade(e.target.value)} className="diagram-select">
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="diagram-form-group">
              <FaLanguage className="group-icon" />
              <select value={language} onChange={e => setLanguage(e.target.value)} className="diagram-select">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="diagram-generate-btn">
              <FaPencilAlt className="btn-icon" />
              {loading ? 'Generating...' : 'Generate Diagrams'}
            </button>
          </form>
          
          {error && <div className="diagram-error">{error}</div>}
        </div>

        {/* Results Section */}
        {diagrams.length > 0 && (
          <div className="diagram-results-section">
            <h3 className="diagram-results-title">
              <FaImage className="title-icon" /> Generated Diagrams for "{topic}"
            </h3>
            
            <div className="diagram-grid">
              {diagrams.map((diagram, index) => (
                <div key={index} className="diagram-card">
                  <div className="diagram-image-container">
                    <img 
                      src={BACKEND_URL + diagram.image_url} 
                      alt={diagram.caption}
                      className="diagram-image"
                    />
                  </div>
                  
                  <h4 className="diagram-card-title">
                    Diagram {index + 1}
                  </h4>
                  
                  <p className="diagram-caption">
                    {diagram.caption}
                  </p>
                  
                  <div className="diagram-download-buttons">
                    <button 
                      onClick={() => downloadImage(diagram.image_url, `diagram-${index + 1}-${topic}.png`)}
                      className="diagram-download-btn"
                    >
                      <FaDownload /> PNG
                    </button>
                    <button 
                      onClick={() => downloadImage(diagram.image_url, `diagram-${index + 1}-${topic}.svg`)}
                      className="diagram-download-btn"
                    >
                      <FaDownload /> SVG
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Section */}
        {loading && (
          <div className="diagram-loading-section">
            <div className="diagram-loading-spinner"></div>
            <p className="diagram-loading-text">Generating educational diagrams...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DiagramGenerator; 