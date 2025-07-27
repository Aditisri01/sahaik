import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

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
    <div className="card blue" style={{ maxWidth: 700, margin: '32px auto', padding: 32 }}>
      <h2>Expert Lesson Planner Generator (AI)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label>Grade/Class Level:</label>
          <input value={grade} onChange={e => setGrade(e.target.value)} required placeholder="e.g. Class 7" />
        </div>
        <div>
          <label>Subject:</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g. Science" />
        </div>
        <div>
          <label>Chapter Name/Topic:</label>
          <input value={chapter} onChange={e => setChapter(e.target.value)} required placeholder="e.g. Solar System" />
        </div>
        <div>
          <label>Number of Teaching Days per Week:</label>
          <input type="number" min={1} max={7} value={daysPerWeek} onChange={e => setDaysPerWeek(e.target.value)} required />
        </div>
        <div>
          <label>Language of Instruction:</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label>Learning Objectives (optional):</label>
          <input value={objectives} onChange={e => setObjectives(e.target.value)} placeholder="e.g. Understand phases of the moon" />
        </div>
        <div>
          <label>Type of Learner:</label>
          <select value={learnerType} onChange={e => setLearnerType(e.target.value)}>
            {LEARNER_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label>Curriculum Board:</label>
          <select value={curriculum} onChange={e => setCurriculum(e.target.value)}>
            {CURRICULUM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Lesson Plan'}</button>
      </form>
      {error && <div style={{ color: '#dc3545', marginTop: 16 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 32 }}>
          <h3>Generated Lesson Plan</h3>
          <div className="card blue" style={{ padding: 24, background: '#f8fbff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: 15 }}>
            <div style={{ marginBottom: 16 }}>
              <strong>Title:</strong> {result.title}<br />
              <strong>Grade:</strong> {result.grade} <br />
              <strong>Subject:</strong> {result.subject} <br />
              <strong>Language:</strong> {result.language}
            </div>
            <details open style={{ marginBottom: 18 }}>
              <summary style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Weekly Plan</summary>
              {result.weekly_plan && result.weekly_plan.map((week, wIdx) => (
                <div key={wIdx} className="card beige" style={{ margin: '16px 0', padding: 16, background: '#fdfbf7', borderRadius: 10 }}>
                  <strong>Week {week.week}</strong>
                  <div style={{ marginLeft: 16 }}>
                    {week.days && week.days.map((day, dIdx) => (
                      <div key={dIdx} style={{ margin: '10px 0', padding: 10, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                        <strong>{day.day}:</strong> <span style={{ color: '#007bff' }}>{day.topic}</span><br />
                        <span style={{ color: '#555' }}><strong>Activities:</strong> {day.activities && day.activities.join(', ')}</span><br />
                        <span style={{ color: '#5f27cd' }}><strong>Assessment:</strong> {day.assessment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </details>
            {result.projects_and_assignments && result.projects_and_assignments.length > 0 && (
              <details style={{ marginBottom: 18 }}>
                <summary style={{ fontWeight: 600, fontSize: 16 }}>Projects & Assignments</summary>
                {result.projects_and_assignments.map((proj, pIdx) => (
                  <div key={pIdx} className="card yellow" style={{ margin: '12px 0', padding: 12, background: '#fffbe7', borderRadius: 10 }}>
                    <strong>Week {proj.week}:</strong> {proj.title}<br />
                    <span style={{ color: '#333' }}>{proj.description}</span><br />
                    <span style={{ color: '#888' }}><strong>Submission:</strong> {proj.submission_date}</span>
                  </div>
                ))}
              </details>
            )}
            {result.teacher_notes && result.teacher_notes.length > 0 && (
              <details style={{ marginBottom: 18 }}>
                <summary style={{ fontWeight: 600, fontSize: 16 }}>Teacher Notes</summary>
                <ul style={{ margin: '10px 0 0 18px', color: '#2a4d7a' }}>
                  {result.teacher_notes.map((note, nIdx) => (
                    <li key={nIdx}>{note}</li>
                  ))}
                </ul>
              </details>
            )}
            {result.modifications_for_learning_styles && (
              <details>
                <summary style={{ fontWeight: 600, fontSize: 16 }}>Modifications for Learning Styles</summary>
                <ul style={{ margin: '10px 0 0 18px', color: '#007bff' }}>
                  {Object.entries(result.modifications_for_learning_styles).map(([style, desc], sIdx) => (
                    <li key={sIdx}><strong style={{ textTransform: 'capitalize' }}>{style}:</strong> {desc}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 