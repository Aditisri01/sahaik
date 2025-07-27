import React, { useState, createContext } from 'react';
import WelcomePage from './components/WelcomePage';
import StudentAssistant from './components/StudentAssistant';
import TeacherPortal from './components/TeacherPortal';
import StudentTestPortal from './components/StudentTestPortal';
import TeacherHome from './components/TeacherHome';
import ImageTextExtractorPage from './components/ImageTextExtractorPage';
import StudentHome from './components/StudentHome';
import LoginPage from './components/LoginPage';
import StudentTestReport from './components/StudentTestReport';
import RegisterPage from './components/RegisterPage';
import EnrollStudentPage from './components/EnrollStudentPage';
import StudentReportAdmin from './components/StudentReportAdmin';
import Chat from './components/Chat';
import LearningContentGenerator from './components/LearningContentGenerator';
import DiagramGenerator from './components/DiagramGenerator';
import LessonPlanner from './components/LessonPlanner';
import ReadingEval from './components/ReadingEval';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

export const LanguageContext = createContext();

function AppRoutes({ language, setLanguage }) {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={
        <WelcomePage
          onTeacherLogin={() => navigate('/teacher-login')}
          onStudentLogin={() => navigate('/student-login')}
          language={language}
          setLanguage={setLanguage}
        />
      } />
      <Route path="/teacher-login" element={<LoginPage userType="teacher" onLoginSuccess={() => navigate('/teacher-home')} language={language} />} />
      <Route path="/student-login" element={<LoginPage userType="student" onLoginSuccess={() => navigate('/student-home')} language={language} />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/student-home" element={<StudentHome language={language} />} />
      <Route path="/teacher-home" element={<TeacherHome language={language} />} />
      <Route path="/extractor" element={<ImageTextExtractorPage language={language} />} />
      <Route path="/assistant" element={<StudentAssistant language={language} />} />
      <Route path="/teacher" element={<TeacherPortal language={language} />} />
      <Route path="/published-tests" element={<TeacherPortal language={language} />} />
      <Route path="/student-tests" element={<StudentTestPortal language={language} />} />
      <Route path="/student-report" element={<StudentTestReport language={language} />} />
      <Route path="/enroll-student" element={<EnrollStudentPage />} />
      <Route path="/student-report-admin" element={<StudentReportAdmin />} />
      <Route path="/counselor-chat" element={<Chat />} />
      <Route path="/learning-content" element={<LearningContentGenerator />} />
      <Route path="/diagram-generator" element={<DiagramGenerator />} />
      <Route path="/lesson-planner" element={<LessonPlanner />} />
      <Route path="/reading-eval" element={<ReadingEval />} />
    </Routes>
  );
}

export default function App() {
  const [language, setLanguage] = useState('en');
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <Router>
        <AppRoutes language={language} setLanguage={setLanguage} />
      </Router>
    </LanguageContext.Provider>
  );
}
