import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChalkboardTeacher, 
  FaCloudUploadAlt, 
  FaRobot, 
  FaUserPlus, 
  FaBook, 
  FaGraduationCap, 
  FaChartLine, 
  FaUsers,
  FaLightbulb,
  FaCog,
  FaBell,
  FaSearch,
  FaComments,
  FaTimes,
  FaArrowUp,
  FaArrowLeft,
  FaClipboardList,
  FaEye,
  FaBrain,
  FaTools
} from 'react-icons/fa';
import './TeacherHome.css';
import dashImage from '../assets/dash.jpeg';

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

export default function TeacherHome() {
  const navigate = useNavigate();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Animated counters for stats
  const activeStudentsCount = useCountUp(24, 1500);
  const publishedTestsCount = useCountUp(8, 1200);
  const aiGenerationsCount = useCountUp(156, 2000);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <div className="teacher-home-root">
      {/* Hero Section with Background Image */}
      <div className="hero-section">
        {/* Back Button - moved here to top left of banner */}
        <button 
          onClick={() => navigate('/')} 
          className="teacher-back-btn"
          title="Back to Welcome"
        >
          <FaArrowLeft />
          Back to Welcome
        </button>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <FaGraduationCap className="hero-icon" />
              Teacher Dashboard
            </h1>
            <p className="hero-subtitle">
              Empower your teaching with AI-powered tools and create exceptional learning experiences
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">{activeStudentsCount}</span>
                <span className="hero-stat-label">Active Students</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{publishedTestsCount}</span>
                <span className="hero-stat-label">Published Tests</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{aiGenerationsCount}</span>
                <span className="hero-stat-label">AI Generations</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img src={dashImage} alt="Teacher Dashboard" className="dashboard-image" />
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Quick Actions Section */}
        <section className="quick-actions-section">
          <h2 className="section-title">
            <FaLightbulb className="section-icon" />
            Quick Actions
          </h2>
          <div className="actions-grid">
            <button className="action-card primary" onClick={() => navigate('/teacher')}>
              <div className="action-icon">
                <FaChalkboardTeacher />
              </div>
              <div className="action-content">
                <h3>Create Test</h3>
                <p>Build comprehensive assessments for your students</p>
              </div>
              <div className="action-arrow">
                <FaArrowUp />
              </div>
            </button>
            <button className="action-card secondary" onClick={() => navigate('/enroll-student')}>
              <div className="action-icon">
                <FaUserPlus />
              </div>
              <div className="action-content">
                <h3>Enroll Student</h3>
                <p>Add new students to your virtual classroom</p>
              </div>
              <div className="action-arrow">
                <FaArrowUp />
              </div>
            </button>
            <button className="action-card accent" onClick={() => navigate('/learning-content')}>
              <div className="action-icon">
                <FaBrain />
              </div>
              <div className="action-content">
                <h3>Generate Content</h3>
                <p>Create engaging learning materials with AI</p>
              </div>
              <div className="action-arrow">
                <FaArrowUp />
              </div>
            </button>
          </div>
        </section>

        {/* Tools Section */}
        <section className="tools-section">
          <h2 className="section-title">
            <FaTools className="section-icon" />
            All Teaching Tools
          </h2>
          <div className="tools-grid">
            {/* Core Teaching */}
            <div className="tool-category">
              <h3 className="category-title">
                <FaGraduationCap />
                Core Teaching
              </h3>
              <div className="category-tools">
                <button className="tool-card" onClick={() => navigate('/teacher')}>
                  <FaChalkboardTeacher />
                  <span>Test Creation</span>
                </button>
                <button className="tool-card" onClick={() => navigate('/enroll-student')}>
                  <FaUserPlus />
                  <span>Enroll Student</span>
                </button>
                <button className="tool-card" onClick={() => navigate('/published-tests')}>
                  <FaEye />
                  <span>Published Tests</span>
                </button>
              </div>
            </div>

            {/* AI-Powered */}
            <div className="tool-category">
              <h3 className="category-title">
                <FaRobot />
                AI-Powered
              </h3>
              <div className="category-tools">
                <button className="tool-card" onClick={() => navigate('/learning-content')}>
                  <FaBook />
                  <span>Learning Content</span>
                </button>
                <button className="tool-card" onClick={() => navigate('/diagram-generator')}>
                  <FaChartLine />
                  <span>Diagram Generator</span>
                </button>
                <button className="tool-card" onClick={() => navigate('/lesson-planner')}>
                  <FaClipboardList />
                  <span>Lesson Planner</span>
                </button>
                <button className="tool-card" onClick={() => navigate('/reading-eval')}>
                  <FaBook />
                  <span>Reading Evaluation</span>
                </button>
              </div>
            </div>

            {/* Utilities */}
            <div className="tool-category">
              <h3 className="category-title">
                <FaCog />
                Utilities
              </h3>
              <div className="category-tools">
                <button className="tool-card" onClick={() => navigate('/extractor', { state: { from: 'teacher-home' } })}>
                  <FaCloudUploadAlt />
                  <span>Text Extractor</span>
                </button>
                <button className="tool-card" onClick={() => navigate('/assistant', { state: { from: 'teacher-home' } })}>
                  <FaUsers />
                  <span>eduAssistant</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Chatbot */}
      <div className="chatbot-container">
        <button className="chatbot-toggle" onClick={toggleChatbot}>
          {isChatbotOpen ? <FaTimes /> : <FaRobot />}
        </button>
        
        <div className="eduassistant-badge">
          <span className="badge-text">edu</span>
        </div>

        {isChatbotOpen && (
          <div className="chatbot-popup">
            <div className="chatbot-header">
              <div className="chatbot-avatar">
                <FaRobot />
              </div>
              <div className="chatbot-info">
                <h3>eduAssistant</h3>
                <p>AI Teaching Assistant</p>
              </div>
              <button className="chatbot-close" onClick={toggleChatbot}>
                <FaTimes />
              </button>
            </div>
            <div className="chatbot-body">
              <div className="chatbot-message">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <p>Hello! I'm your AI teaching assistant. How can I help you today?</p>
                </div>
              </div>
            </div>
            <div className="chatbot-input">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="chat-input"
              />
              <button className="chat-send">
                <FaArrowUp />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 