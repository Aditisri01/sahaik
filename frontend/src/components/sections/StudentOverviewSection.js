import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaUsers, FaGraduationCap, FaChartLine, FaLightbulb } from 'react-icons/fa';

const StudentOverviewSection = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const statsRef = useRef();

  useEffect(() => {
    // Animate title
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

    // Animate stats cards
    const statCards = statsRef.current.children;
    gsap.fromTo(
      statCards,
      { 
        opacity: 0, 
        y: 100,
        scale: 0.8
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Add hover animations
    Array.from(statCards).forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

  }, []);

  return (
    <section ref={sectionRef} className="scrolly-section student-overview-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        Student Overview
      </h2>
      <div ref={statsRef} className="stats-grid">
        <div className="stat-card">
          <FaUsers style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.8 }} />
          <div className="stat-number">24</div>
          <div className="stat-label">Active Students</div>
        </div>
        <div className="stat-card">
          <FaGraduationCap style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.8 }} />
          <div className="stat-number">85%</div>
          <div className="stat-label">Average Performance</div>
        </div>
        <div className="stat-card">
          <FaChartLine style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.8 }} />
          <div className="stat-number">12</div>
          <div className="stat-label">Published Tests</div>
        </div>
        <div className="stat-card">
          <FaLightbulb style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.8 }} />
          <div className="stat-number">156</div>
          <div className="stat-label">Learning Hours</div>
        </div>
      </div>
    </section>
  );
};

export default StudentOverviewSection; 