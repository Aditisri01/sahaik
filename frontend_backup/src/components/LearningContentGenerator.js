import React, { useState } from 'react';
import { FaBook, FaPodcast, FaMicrophone, FaLanguage, FaGraduationCap, FaListOl } from 'react-icons/fa';
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

function LearningContentGenerator() {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState(GRADES[0]);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [podcastScript, setPodcastScript] = useState(null);
  const [podcastAudioUrl, setPodcastAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const BACKEND_URL = API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setPodcastScript(null);
    setPodcastAudioUrl(null);
    try {
      const res = await fetch(`${BACKEND_URL}/generate_learning_content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          grade_level: grade,
          language: LANGUAGES.find(l => l.code === language)?.label || 'English',
        })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setResult(data.structured_content);
        setPodcastScript(data.podcast_script);
        setPodcastAudioUrl(data.podcast_audio_url);
      }
    } catch (e) {
      setError('Failed to fetch content.');
    }
    setLoading(false);
  };

  return (
    <div className="learning-content-generator" style={{maxWidth: 1100, margin: '40px auto'}}>
      <div className="card beige" style={{marginBottom: 32}}>
        <h2 style={{display: 'flex', alignItems: 'center', gap: 12}}><FaBook style={{color: '#b85c00'}} /> Learning Content Generator</h2>
        <div className="decorative-line"></div>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'row', gap: 16, maxWidth: 900, margin: '0 auto 0 auto', alignItems: 'center', flexWrap: 'wrap', background: 'transparent', borderRadius: 12, padding: 0, boxShadow: 'none'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 6}}><FaBook style={{color: '#2a4d7a'}} /><input type="text" value={topic} onChange={e => setTopic(e.target.value)} required placeholder="Topic" style={{padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', minWidth: 120, fontFamily: 'Space Mono'}} /></span>
          <span style={{display: 'flex', alignItems: 'center', gap: 6}}><FaGraduationCap style={{color: '#2a4d7a'}} /><select value={grade} onChange={e => setGrade(e.target.value)} style={{padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', minWidth: 110, fontFamily: 'Space Mono'}}>{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select></span>
          <span style={{display: 'flex', alignItems: 'center', gap: 6}}><FaLanguage style={{color: '#2a4d7a'}} /><select value={language} onChange={e => setLanguage(e.target.value)} style={{padding: 8, borderRadius: 8, border: '1.5px solid #bdbdbd', minWidth: 110, fontFamily: 'Space Mono'}}>{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}</select></span>
          <button type="submit" disabled={loading} style={{padding: 10, borderRadius: 8, background: '#222', color: '#fff', border: 'none', fontWeight: 600, minWidth: 120, fontFamily: 'Space Mono'}}>{loading ? 'Generating...' : 'Generate Content'}</button>
        </form>
        {error && <div style={{color: 'red', marginTop: 16}}>{error}</div>}
      </div>
      {(result || podcastAudioUrl || podcastScript) && (
        <div style={{display: 'flex', gap: 32, marginTop: 0, flexWrap: 'wrap'}}>
          {/* Column 1: Educational Content */}
          <div className="card blue" style={{flex: 1, minWidth: 320, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 18}}>
            <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: 8}}><FaBook style={{color: '#b85c00'}} /> Generated Content</h3>
            {result && result.sections && result.sections.map((section, idx) => (
              <div key={idx} className="card beige" style={{marginBottom: 18, background: '#fdfbf7', borderRadius: 12, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'}}>
                <h4 style={{display: 'flex', alignItems: 'center', gap: 6}}><FaListOl style={{color: '#2a4d7a'}} /> {section.title}</h4>
                <div style={{marginBottom: 8}}>{section.content}</div>
                {section.diagram_prompt && <div style={{fontStyle: 'italic', color: '#2a4d7a', marginTop: 8}}><FaMicrophone style={{marginRight: 4}} />Diagram prompt: {section.diagram_prompt}</div>}
              </div>
            ))}
            {result && result.key_concepts && (
              <div className="card yellow" style={{marginTop: 8, padding: 10}}><strong>Key Concepts:</strong> {result.key_concepts.join(', ')}</div>
            )}
            {result && result.resources && (
              <div className="card yellow" style={{marginTop: 8, padding: 10}}><strong>Resources:</strong> {result.resources.join(', ')}</div>
            )}
            {result && result.quiz && result.quiz.length > 0 && (
              <div className="card pink" style={{marginTop: 16, padding: 14}}>
                <strong style={{display: 'flex', alignItems: 'center', gap: 6}}><FaListOl style={{color: '#b85c00'}} /> Quiz:</strong>
                <ul style={{paddingLeft: 20, marginTop: 10}}>
                  {result.quiz.map((q, i) => (
                    <li key={i} style={{marginBottom: 14}}>
                      <div style={{fontWeight: 500, marginBottom: 4}}>{i + 1}. {q.question}</div>
                      <ol style={{margin: 0, paddingLeft: 20}}>
                        {q.options.map((opt, j) => (
                          <li key={j} style={{marginBottom: 2}}>{opt}</li>
                        ))}
                      </ol>
                      <div style={{marginTop: 4, color: '#2a4d7a'}}><strong>Answer:</strong> {q.answer}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Column 2: Podcast Audio and Script */}
          <div className="card peach" style={{flex: 1, minWidth: 320, maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 18}}>
            <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: 8}}><FaPodcast style={{color: '#b85c00'}} /> Podcast</h3>
            {podcastAudioUrl && (
              <div style={{marginBottom: 24}}>
                <audio
                  key={podcastAudioUrl}
                  controls
                  src={BACKEND_URL + podcastAudioUrl}
                  style={{width: '100%'}}
                />
              </div>
            )}
            {podcastScript && (
              <div className="card blue" style={{marginTop: 0, padding: 14, fontSize: '1em', color: '#2a4d7a', whiteSpace: 'pre-wrap', background: '#f8fbff'}}>
                <h4 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: 6}}><FaMicrophone style={{color: '#b85c00'}} /> Podcast Script</h4>
                {podcastScript}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningContentGenerator; 