import React, { useState } from 'react';
import { FaArrowLeft, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './LessonPlanner.css';
import lessonImage from '../assets/lesson.jpeg';

const CURRICULUM_BOARDS = [
  'CBSE', 'ICSE', 'IGCSE', 'IB', 'Custom'
];
const LEARNER_TYPES = [
  'Visual', 'Auditory', 'Kinesthetic', 'Mixed'
];
const LANGUAGES = [
  'English', 'Hindi', 'Other'
];

export default function LessonPlanner() {
  const navigate = useNavigate();
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [language, setLanguage] = useState('English');
  const [objectives, setObjectives] = useState('');
  const [learnerType, setLearnerType] = useState('Mixed');
  const [curriculum, setCurriculum] = useState('CBSE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/generate_lesson_plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade, subject, chapter, days_per_week: daysPerWeek, language, objectives, learner_type: learnerType, curriculum
        })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data.lesson_plan);
    } catch (e) {
      setError('Failed to generate lesson plan. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="lesson-planner-root">
      <div className="lesson-planner-container">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/teacher-home')} 
          className="lesson-back-btn"
          title="Back to Teacher Home"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Header Section */}
        <div className="lesson-header">
          <div className="lesson-header-content">
            <div className="lesson-header-text">
              <h1 className="lesson-title">
                <FaChalkboardTeacher className="lesson-title-icon" />
                Expert Lesson Planner
              </h1>
              <p className="lesson-subtitle">
                Generate comprehensive lesson plans with AI assistance. Create structured weekly plans, activities, assessments, and teacher notes tailored to your curriculum and learning objectives.
              </p>
            </div>
            <div className="lesson-header-image">
              <img src={lessonImage} alt="Lesson Planner" className="lesson-illustration" />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="lesson-form-section">
          <form onSubmit={handleSubmit} className="lesson-form">
            <div className="lesson-form-group">
              <label className="lesson-label">Grade/Class Level:</label>
              <input 
                className="lesson-input"
                value={grade} 
                onChange={e => setGrade(e.target.value)} 
                required 
                placeholder="e.g. Class 7" 
              />
            </div>
            <div className="lesson-form-group">
              <label className="lesson-label">Subject:</label>
              <input 
                className="lesson-input"
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                required 
                placeholder="e.g. Science" 
              />
            </div>
            <div className="lesson-form-group">
              <label className="lesson-label">Chapter Name/Topic:</label>
              <input 
                className="lesson-input"
                value={chapter} 
                onChange={e => setChapter(e.target.value)} 
                required 
                placeholder="e.g. Solar System" 
              />
            </div>
            <div className="lesson-form-group">
              <label className="lesson-label">Number of Teaching Days per Week:</label>
              <input 
                className="lesson-input"
                type="number" 
                min={1} 
                max={7} 
                value={daysPerWeek} 
                onChange={e => setDaysPerWeek(e.target.value)} 
                required 
              />
            </div>
            <div className="lesson-form-group">
              <label className="lesson-label">Language of Instruction:</label>
              <select 
                className="lesson-select"
                value={language} 
                onChange={e => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="lesson-form-group">
              <label className="lesson-label">Learning Objectives (optional):</label>
              <input 
                className="lesson-input"
                value={objectives} 
                onChange={e => setObjectives(e.target.value)} 
                placeholder="e.g. Understand phases of the moon" 
              />
            </div>
            <div className="lesson-form-group">
              <label className="lesson-label">Type of Learner:</label>
              <select 
                className="lesson-select"
                value={learnerType} 
                onChange={e => setLearnerType(e.target.value)}
              >
                {LEARNER_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="lesson-form-group">
              <label className="lesson-label">Curriculum Board:</label>
              <select 
                className="lesson-select"
                value={curriculum} 
                onChange={e => setCurriculum(e.target.value)}
              >
                {CURRICULUM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="lesson-generate-btn">
              <FaCalendarAlt className="btn-icon" />
              {loading ? 'Generating...' : 'Generate Lesson Plan'}
            </button>
          </form>
          
          {error && <div className="lesson-error">{error}</div>}
        </div>

        {/* Results Section */}
        {result && (
          <div className="lesson-results-section">
            <h3 className="lesson-results-title">
              <FaChalkboardTeacher className="title-icon" /> Generated Lesson Plan
            </h3>
            <div className="lesson-plan-card">
              <div className="lesson-plan-header">
                <strong>Title:</strong> <span>{result.title}</span><br />
                <strong>Grade:</strong> <span>{result.grade}</span><br />
                <strong>Subject:</strong> <span>{result.subject}</span><br />
                <strong>Language:</strong> <span>{result.language}</span>
              </div>
              
              <details open className="lesson-details">
                <summary>Weekly Plan</summary>
                <div className="lesson-weekly-plan">
                  {result.weekly_plan && result.weekly_plan.map((week, wIdx) => (
                    <div key={wIdx} className="lesson-week-card">
                      <div className="lesson-week-title">Week {week.week}</div>
                      <div>
                        {week.days && week.days.map((day, dIdx) => (
                          <div key={dIdx} className="lesson-day-card">
                            <div className="lesson-day-title">{day.day}:</div>
                            <div className="lesson-day-topic">{day.topic}</div>
                            <div className="lesson-day-activities">
                              <strong>Activities:</strong> {day.activities && day.activities.join(', ')}
                            </div>
                            <div className="lesson-day-assessment">
                              <strong>Assessment:</strong> {day.assessment}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
              
              {result.projects_and_assignments && result.projects_and_assignments.length > 0 && (
                <details className="lesson-details">
                  <summary>Projects & Assignments</summary>
                  <div className="lesson-projects-section">
                    {result.projects_and_assignments.map((proj, pIdx) => (
                      <div key={pIdx} className="lesson-project-card">
                        <div className="lesson-project-title">Week {proj.week}: {proj.title}</div>
                        <div className="lesson-project-description">{proj.description}</div>
                        <div className="lesson-project-submission">
                          <strong>Submission:</strong> {proj.submission_date}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              
              {result.teacher_notes && result.teacher_notes.length > 0 && (
                <details className="lesson-details">
                  <summary>Teacher Notes</summary>
                  <div className="lesson-teacher-notes">
                    <ul>
                      {result.teacher_notes.map((note, nIdx) => (
                        <li key={nIdx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}
              
              {result.modifications_for_learning_styles && (
                <details className="lesson-details">
                  <summary>Modifications for Learning Styles</summary>
                  <div className="lesson-learning-styles">
                    <ul>
                      {Object.entries(result.modifications_for_learning_styles).map(([style, desc], sIdx) => (
                        <li key={sIdx}><strong>{style}:</strong> {desc}</li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Loading Section */}
        {loading && (
          <div className="lesson-loading-section">
            <div className="lesson-loading-spinner"></div>
            <p className="lesson-loading-text">Generating comprehensive lesson plan...</p>
          </div>
        )}
      </div>
    </div>
  );
} 