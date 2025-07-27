import React, { useState } from 'react';
import { FaBook, FaPodcast, FaMicrophone, FaLanguage, FaGraduationCap, FaListOl, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './LearningContentGenerator.css';

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
  const navigate = useNavigate();
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
    <div className="learning-content-root">
      <div className="learning-content-container">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/teacher-home')} 
          className="learning-content-back-btn"
          title="Back to Teacher Home"
        >
          <FaArrowLeft />
          Back to Teacher Home
        </button>

        {/* Header Section */}
        <div className="learning-content-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="learning-content-title">
                <FaBook className="title-icon" />
                Learning Content Generator
              </h1>
              <div className="learning-content-description">
                <p>
                  Create rich, multilingual learning materials and inclusive audio podcasts with AI
                </p>
                <p>
                  Empower every student with AI-generated content that adapts to diverse classroom needs. This tool helps educators design comprehensive lessons, summaries, and exercises in multiple languages — instantly. It also generates podcast-style audio versions of the content, making learning accessible to visually impaired students and auditory learners alike. Whether you're teaching in English, Hindi, or any regional language, this inclusive platform ensures that no student is left behind.
                </p>
              </div>
            </div>
            <div className="header-image">
              <img 
                src={require('../assets/content.jpeg')} 
                alt="Learning Content Creation" 
                className="content-illustration"
              />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="learning-content-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <FaBook className="group-icon" />
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  required
                  placeholder="Enter topic (e.g., Photosynthesis, Fractions, Ancient Civilizations)"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <FaGraduationCap className="group-icon" />
                <select 
                  value={grade} 
                  onChange={e => setGrade(e.target.value)} 
                  className="form-select"
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <FaLanguage className="group-icon" />
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)} 
                  className="form-select"
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="generate-btn"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <FaBook className="btn-icon" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Results Section */}
        {(result || podcastAudioUrl || podcastScript) && (
          <div className="learning-content-results">
            {/* Column 1: Educational Content */}
            <div className="content-column">
              <h2 className="column-title">
                <FaBook className="title-icon" />
                Generated Content
              </h2>
              {result && result.sections && result.sections.map((section, idx) => (
                <div key={idx} className="content-section">
                  <h3 className="section-title">
                    <FaListOl className="section-icon" />
                    {section.title}
                  </h3>
                  <div className="section-content">{section.content}</div>
                  {section.diagram_prompt && (
                    <div className="diagram-prompt">
                      <FaMicrophone className="prompt-icon" />
                      Diagram prompt: {section.diagram_prompt}
                    </div>
                  )}
                </div>
              ))}
              {result && result.key_concepts && (
                <div className="concepts-box">
                  <strong>Key Concepts:</strong> {result.key_concepts.join(', ')}
                </div>
              )}
              {result && result.resources && (
                <div className="resources-box">
                  <strong>Resources:</strong> {result.resources.join(', ')}
                </div>
              )}
              {result && result.quiz && result.quiz.length > 0 && (
                <div className="quiz-section">
                  <h3 className="section-title">
                    <FaListOl className="section-icon" />
                    Quiz
                  </h3>
                  <ul className="quiz-list">
                    {result.quiz.map((q, i) => (
                      <li key={i} className="quiz-item">
                        <div className="quiz-question">{i + 1}. {q.question}</div>
                        <ol className="quiz-options">
                          {q.options.map((opt, j) => (
                            <li key={j} className="quiz-option">{opt}</li>
                          ))}
                        </ol>
                        <div className="quiz-answer">
                          <strong>Answer:</strong> {q.answer}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Column 2: Podcast Audio and Script */}
            <div className="podcast-column">
              <h2 className="column-title">
                <FaPodcast className="title-icon" />
                Podcast Content
              </h2>
              {podcastAudioUrl && (
                <div className="podcast-audio">
                  <audio
                    key={podcastAudioUrl}
                    controls
                    src={BACKEND_URL + podcastAudioUrl}
                  />
                </div>
              )}
              {podcastScript && (
                <div className="podcast-script">
                  <h3 className="section-title">
                    <FaMicrophone className="section-icon" />
                    Podcast Script
                  </h3>
                  {podcastScript}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningContentGenerator; 