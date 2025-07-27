import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPencilAlt, 
  FaCloudUploadAlt, 
  FaRobot, 
  FaChartBar, 
  FaGraduationCap, 
  FaArrowLeft, 
  FaArrowUp,
  FaComments,
  FaUserGraduate
} from 'react-icons/fa';
import './StudentHome.css';
import { API_BASE_URL } from '../config';
import studentImage from '../assets/student.png';

// Custom hook for animated number counter
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return count;
}

export default function StudentHome() {
  const navigate = useNavigate();
  const [hasNewTests, setHasNewTests] = useState(false);

  // Animated counters for stats
  const completedTestsCount = useCountUp(12, 1500);
  const averageScoreCount = useCountUp(85, 1200);
  const studyHoursCount = useCountUp(48, 2000);

  useEffect(() => {
    // Check for new tests for the student's class
    const studentClass = localStorage.getItem('student_class') || 'Class 1';
    fetch(`${API_BASE_URL}/list_tests?class=${encodeURIComponent(studentClass)}&subject=Mathematics`)
      .then(res => res.json())
      .then(data => {
        const testCount = (data.tests && data.tests.length) || 0;
        const lastSeen = parseInt(localStorage.getItem('last_seen_test_count') || '0', 10);
        if (testCount > lastSeen) {
          setHasNewTests(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleTakeTestClick = () => {
    // On click, update last seen test count
    const studentClass = localStorage.getItem('student_class') || 'Class 1';
    fetch(`${API_BASE_URL}/list_tests?class=${encodeURIComponent(studentClass)}&subject=Mathematics`)
      .then(res => res.json())
      .then(data => {
        const testCount = (data.tests && data.tests.length) || 0;
        localStorage.setItem('last_seen_test_count', testCount);
        setHasNewTests(false);
        navigate('/student-tests');
      })
      .catch(() => navigate('/student-tests'));
  };

  return (
    <div className="student-home-root">
      {/* Hero Section */}
      <div className="student-hero-section">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="student-back-btn"
          title="Back to Welcome"
        >
          <FaArrowLeft />
          Back to Welcome
        </button>

        <div className="student-hero-content">
          <div className="student-hero-text">
            <h1 className="student-hero-title">
              <FaGraduationCap className="student-hero-icon" />
              Student Dashboard
            </h1>
            <p className="student-hero-subtitle">
              Your personalized learning hub. Access tools, take tests, and track your progress with AI-powered assistance.
            </p>
            <div className="student-hero-stats">
              <div className="student-hero-stat">
                <span className="student-stat-number">{completedTestsCount}</span>
                <span className="student-stat-label">Tests Completed</span>
              </div>
              <div className="student-hero-stat">
                <span className="student-stat-number">{averageScoreCount}%</span>
                <span className="student-stat-label">Average Score</span>
              </div>
              <div className="student-hero-stat">
                <span className="student-stat-number">{studyHoursCount}h</span>
                <span className="student-stat-label">Study Hours</span>
              </div>
            </div>
          </div>
          <div className="student-hero-image">
            <img src={studentImage} alt="Student Dashboard" className="student-dashboard-image" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="student-main-content">
        {/* Quick Actions Section */}
        <div className="student-quick-actions">
          <h2 className="student-section-title">Quick Actions</h2>
          <div className="student-actions-grid">
            <button className="student-action-card primary" onClick={() => navigate('/extractor', { state: { from: 'student-home' } })}>
              <div className="student-action-icon">
                <FaCloudUploadAlt />
              </div>
              <div className="student-action-content">
                <h3 className="student-action-title">Image Text Extractor</h3>
                <p className="student-action-desc">Extract and translate text from images with AI-powered OCR technology</p>
              </div>
              <div className="student-action-arrow">
                <FaArrowUp />
              </div>
            </button>

            <button className="student-action-card secondary" onClick={() => navigate('/assistant', { state: { from: 'student-home' } })}>
              <div className="student-action-icon">
                <FaRobot />
              </div>
              <div className="student-action-content">
                <h3 className="student-action-title">eduAssistant</h3>
                <p className="student-action-desc">Your AI-powered learning companion for instant help with any subject</p>
              </div>
              <div className="student-action-arrow">
                <FaArrowUp />
              </div>
            </button>

            <button className="student-action-card accent" onClick={() => navigate('/counselor-chat')}>
              <div className="student-action-icon">
                <FaComments />
              </div>
              <div className="student-action-content">
                <h3 className="student-action-title">Counselor Chat</h3>
                <p className="student-action-desc">Get guidance and support from AI counselors for academic and personal growth</p>
              </div>
              <div className="student-action-arrow">
                <FaArrowUp />
              </div>
            </button>

            <button className="student-action-card primary" onClick={handleTakeTestClick} style={{ position: 'relative' }}>
              {hasNewTests && (
                <div className="student-new-badge">New</div>
              )}
              <div className="student-action-icon">
                <FaPencilAlt />
              </div>
              <div className="student-action-content">
                <h3 className="student-action-title">Take Test</h3>
                <p className="student-action-desc">Access and complete assessments to track your learning progress</p>
              </div>
              <div className="student-action-arrow">
                <FaArrowUp />
              </div>
            </button>

            <button className="student-action-card secondary" onClick={() => navigate('/student-report')}>
              <div className="student-action-icon">
                <FaChartBar />
              </div>
              <div className="student-action-content">
                <h3 className="student-action-title">My Progress Report</h3>
                <p className="student-action-desc">View detailed analytics and insights about your academic performance</p>
              </div>
              <div className="student-action-arrow">
                <FaArrowUp />
              </div>
            </button>

            <button className="student-action-card accent" onClick={() => navigate('/reading-eval')}>
              <div className="student-action-icon">
                <FaUserGraduate />
              </div>
              <div className="student-action-content">
                <h3 className="student-action-title">Reading Evaluation</h3>
                <p className="student-action-desc">Improve reading skills with AI-powered pronunciation and accuracy feedback</p>
              </div>
              <div className="student-action-arrow">
                <FaArrowUp />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 