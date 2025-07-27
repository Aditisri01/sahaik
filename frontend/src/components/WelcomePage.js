import React from 'react';
import { FaLanguage, FaUniversalAccess, FaChalkboardTeacher, FaArrowRight, FaRegSmile } from 'react-icons/fa';
import './WelcomePage.css';
import { useTranslation } from 'react-i18next';
import teamIllustration from '../assets/team-illustration.png';
import backdrop from '../assets/backdrop.jpeg';

export default function WelcomePage({ onTeacherLogin, onStudentLogin }) {
  const { t } = useTranslation();
  return (
    <div className="welcome-root welcome-backdrop">
      <header className="welcome-header">
        <div className="welcome-logo">
          <span className="welcome-brand">sahAIk</span>
          <span className="welcome-tagline">Empowering Classrooms</span>
        </div>
        <div className="welcome-login-btns">
          <button className="welcome-login-btn" onClick={onTeacherLogin}>{t('Teacher Login')} <FaArrowRight /></button>
          <button className="welcome-login-btn alt" onClick={onStudentLogin}>{t('Student Login')} <FaArrowRight /></button>
        </div>
      </header>
      <main className="welcome-main">
        <img src={teamIllustration} alt="Teachers and students collaborating, inclusive education" className="welcome-illustration" />
        <h1 className="welcome-title">{t('Welcome to sahAIk')}</h1>
        <p className="welcome-desc">
          sahAIk is your AI-powered teaching companion for India's grassroots education system - empowering teachers and students through inclusive, multilingual, and accessible tools.
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