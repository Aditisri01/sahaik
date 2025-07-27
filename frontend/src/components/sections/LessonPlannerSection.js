import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const LessonPlannerSection = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const plannerRef = useRef();

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

    gsap.fromTo(
      plannerRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );

  }, []);

  return (
    <section ref={sectionRef} className="scrolly-section lesson-planner-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        Lesson Planner
      </h2>
      <div ref={plannerRef} className="planner-ui">
        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Weekly Schedule</h3>
        <div className="week-grid">
          <div className="day-cell">
            <strong>Mon</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Math</div>
          </div>
          <div className="day-cell">
            <strong>Tue</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Science</div>
          </div>
          <div className="day-cell">
            <strong>Wed</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>English</div>
          </div>
          <div className="day-cell">
            <strong>Thu</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>History</div>
          </div>
          <div className="day-cell">
            <strong>Fri</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Art</div>
          </div>
          <div className="day-cell">
            <strong>Sat</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.5 }}>Free</div>
          </div>
          <div className="day-cell">
            <strong>Sun</strong>
            <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.5 }}>Free</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LessonPlannerSection; 