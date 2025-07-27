import React from 'react';
import { FaLanguage, FaUniversalAccess, FaChalkboardTeacher, FaArrowRight, FaRegSmile } from 'react-icons/fa';
import './WelcomePage.css';
import { useTranslation } from 'react-i18next';
import pieBg from '../assets/pie-bg.png';

export default function WelcomePage({ onTeacherLogin, onStudentLogin }) {
  const { t } = useTranslation();
  return (
    <div className="welcome-root">
      {/* Decorative pie chart image background */}
      <img src={pieBg} alt="" className="welcome-bg-pie" aria-hidden="true" />
      {/* Faint bar/area chart in bottom left */}
      <svg className="welcome-bg-bars" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="0,60 0,40 20,30 40,50 60,20 80,40 100,10 120,30 140,15 160,35 180,25 180,60" fill="#e0e0e0" opacity="0.13" />
        <rect x="10" y="35" width="8" height="25" fill="#e0f4ff" opacity="0.18" />
        <rect x="30" y="45" width="8" height="15" fill="#ffe4e1" opacity="0.18" />
        <rect x="50" y="25" width="8" height="35" fill="#fff7d6" opacity="0.18" />
      </svg>
      {/* Faint zigzag line chart in top left */}
      <svg className="welcome-bg-zigzag" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="0,35 20,20 40,30 60,10 80,25 100,5 120,15" fill="none" stroke="#e0f4ff" strokeWidth="3" opacity="0.18" />
      </svg>
      {/* More scattered circles */}
      <svg className="welcome-bg-svg-circ" style={{left: 120, top: 80}} width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#ffe4e1" opacity="0.13" /></svg>
      <svg className="welcome-bg-svg-circ" style={{right: 60, bottom: 120}} width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#fff7d6" opacity="0.13" /></svg>
      {/* Existing SVG and content remain unchanged */}
      <svg className="welcome-bg-svg" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="170" cy="110" rx="160" ry="90" fill="#e0f4ff" />
        <ellipse cx="250" cy="60" rx="60" ry="30" fill="#fff7d6" />
        <ellipse cx="80" cy="170" rx="50" ry="20" fill="#ffe4e1" />
      </svg>
      <svg className="welcome-bg-svg-bl" viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,100 Q80,60 160,100 T320,100 V120 H0 Z" fill="#e0f4ff" opacity="0.18" />
        <circle cx="40" cy="40" r="28" fill="#ffe4e1" opacity="0.18" />
      </svg>
      <svg className="welcome-bg-svg-circ" style={{left: 60, top: 320}} width="60" height="60" viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="30" fill="#fff7d6" opacity="0.13" /></svg>
      <svg className="welcome-bg-svg-circ" style={{right: 120, top: 180}} width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#e0f4ff" opacity="0.13" /></svg>
      <header className="welcome-header">
        <span className="welcome-logo">sahAIk <span className="welcome-tagline">Empowering Classrooms</span></span>
        <div className="welcome-login-btns">
          <button className="welcome-login-btn" onClick={onTeacherLogin}>{t('Teacher Login')} <FaArrowRight /></button>
          <button className="welcome-login-btn alt" onClick={onStudentLogin}>{t('Student Login')} <FaArrowRight /></button>
        </div>
      </header>
      <main className="welcome-main">
        <h1 className="welcome-title">{t('Welcome to sahAIk')}</h1>
        <p className="welcome-desc">
          {t('sahAIkDesc1')}<br/>
          {t('sahAIkDesc2')}
        </p>
        <div className="welcome-features">
          <div className="welcome-feature-card">
            <span className="welcome-feature-icon"><FaLanguage /></span>
            <h3>{t('Multilingual Content')}</h3>
            <p>{t('Multilingual Content Desc')}</p>
          </div>
          <div className="welcome-feature-card">
            <span className="welcome-feature-icon"><FaUniversalAccess /></span>
            <h3>{t('Inclusive by Design')}</h3>
            <p>{t('Inclusive by Design Desc')}</p>
          </div>
          <div className="welcome-feature-card">
            <span className="welcome-feature-icon"><FaChalkboardTeacher /></span>
            <h3>{t('Teacher-first, Tech-smart')}</h3>
            <p>{t('Teacher-first, Tech-smart Desc')}</p>
          </div>
        </div>
      </main>
      <footer className="welcome-footer">
        <span className="footer-logo"><FaRegSmile /></span>
        © 2025 sahAIk – An AI Co-Teacher for Every Classroom
      </footer>
    </div>
  );
} 