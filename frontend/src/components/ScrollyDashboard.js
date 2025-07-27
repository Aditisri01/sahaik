import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WelcomeSection from './sections/WelcomeSection';
import StudentOverviewSection from './sections/StudentOverviewSection';
import TestCreationSection from './sections/TestCreationSection';
import EnrollStudentSection from './sections/EnrollStudentSection';
import PublishedTestsSection from './sections/PublishedTestsSection';
import LearningContentSection from './sections/LearningContentSection';
import DiagramGeneratorSection from './sections/DiagramGeneratorSection';
import LessonPlannerSection from './sections/LessonPlannerSection';
import ReadingEvaluationSection from './sections/ReadingEvaluationSection';
import TextExtractorSection from './sections/TextExtractorSection';
import EduAssistantSection from './sections/EduAssistantSection';
import EndSection from './sections/EndSection';


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ScrollyDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize GSAP ScrollTrigger
    ScrollTrigger.refresh();
    
    // Cleanup on unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="scrolly-dashboard">
      <WelcomeSection />
      <StudentOverviewSection />
      <TestCreationSection />
      <EnrollStudentSection />
      <PublishedTestsSection />
      <LearningContentSection />
      <DiagramGeneratorSection />
      <LessonPlannerSection />
      <ReadingEvaluationSection />
      <TextExtractorSection />
      <EduAssistantSection />
      <EndSection navigate={navigate} />
    </div>
  );
};

export default ScrollyDashboard; 