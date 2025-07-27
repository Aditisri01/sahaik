import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaRobot, FaBook, FaVideo } from 'react-icons/fa';

const LearningContentSection = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const cardsRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );

    const cards = cardsRef.current.children;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 100, rotationY: 90 },
      {
        opacity: 1,
        y: 0,
        rotationY: 0,
        duration: 1,
        stagger: 0.3,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, []);

  return (
    <section ref={sectionRef} className="scrolly-section learning-content-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        AI-Powered Learning Content
      </h2>
      <div ref={cardsRef} className="content-cards">
        <div className="content-card">
          <FaRobot style={{ fontSize: '3rem', marginBottom: '1rem', color: '#4facfe' }} />
          <h3>AI-Generated Content</h3>
          <p>Automatically create engaging learning materials tailored to your curriculum</p>
        </div>
        <div className="content-card">
          <FaBook style={{ fontSize: '3rem', marginBottom: '1rem', color: '#43e97b' }} />
          <h3>Smart Flashcards</h3>
          <p>Generate interactive flashcards with AI-powered explanations and examples</p>
        </div>
        <div className="content-card">
          <FaVideo style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fa709a' }} />
          <h3>Video Summaries</h3>
          <p>Create concise video summaries of complex topics for better understanding</p>
        </div>
      </div>
    </section>
  );
};

export default LearningContentSection; 