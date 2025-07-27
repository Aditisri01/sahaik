import React, { useState } from 'react';
import { FaPencilAlt, FaDownload, FaImage, FaGraduationCap, FaLanguage, FaBook } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

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
    <div className="diagram-generator" style={{maxWidth: 1200, margin: '40px auto'}}>
      <div className="card beige" style={{marginBottom: 32}}>
        <h2 style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <FaPencilAlt style={{color: '#007bff'}} /> Educational Diagram Generator
        </h2>
        <p style={{color: '#666', marginBottom: 24}}>
          Generate four simple, sketch-style educational diagrams for any topic using AI
        </p>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'row', gap: 16, maxWidth: 900, margin: '0 auto', alignItems: 'center', flexWrap: 'wrap', background: 'transparent', borderRadius: 12, padding: 0, boxShadow: 'none'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <FaBook style={{color: '#007bff'}} />
            <input 
              type="text" 
              value={topic} 
              onChange={e => setTopic(e.target.value)} 
              required 
              placeholder="Educational topic (e.g., Photosynthesis)" 
              style={{minWidth: 200}}
            />
          </span>
          <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <FaGraduationCap style={{color: '#007bff'}} />
            <select value={grade} onChange={e => setGrade(e.target.value)} style={{minWidth: 120}}>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </span>
          <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
            <FaLanguage style={{color: '#007bff'}} />
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{minWidth: 120}}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </span>
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Diagrams'}
          </button>
        </form>
        
        {error && <div style={{color: '#dc3545', marginTop: 16, padding: 12, background: '#f8d7da', borderRadius: 8, border: '1px solid #f5c6cb'}}>{error}</div>}
      </div>

      {diagrams.length > 0 && (
        <div className="card blue" style={{marginBottom: 32}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24}}>
            <FaImage style={{color: '#007bff'}} /> Generated Diagrams for "{topic}"
          </h3>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24}}>
            {diagrams.map((diagram, index) => (
              <div key={index} className="card" style={{margin: 0, padding: 20, background: '#fff', border: '1px solid #e9ecef'}}>
                <div style={{marginBottom: 16}}>
                  <img 
                    src={BACKEND_URL + diagram.image_url} 
                    alt={diagram.caption}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #e9ecef'
                    }}
                  />
                </div>
                
                <h4 style={{marginBottom: 8, fontSize: '1.1rem', color: '#333'}}>
                  Diagram {index + 1}
                </h4>
                
                <p style={{color: '#666', marginBottom: 16, lineHeight: 1.5}}>
                  {diagram.caption}
                </p>
                
                <div style={{display: 'flex', gap: 8}}>
                  <button 
                    onClick={() => downloadImage(diagram.image_url, `diagram-${index + 1}-${topic}.png`)}
                    style={{fontSize: '0.9rem', padding: '8px 12px'}}
                  >
                    <FaDownload style={{marginRight: 4}} /> PNG
                  </button>
                  <button 
                    onClick={() => downloadImage(diagram.image_url, `diagram-${index + 1}-${topic}.svg`)}
                    style={{fontSize: '0.9rem', padding: '8px 12px'}}
                  >
                    <FaDownload style={{marginRight: 4}} /> SVG
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{textAlign: 'center', padding: 40}}>
          <div className="loading-spinner" style={{margin: '0 auto 16px auto'}}></div>
          <p style={{color: '#666'}}>Generating educational diagrams...</p>
        </div>
      )}
    </div>
  );
}

export default DiagramGenerator; 