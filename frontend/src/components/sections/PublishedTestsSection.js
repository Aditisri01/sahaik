import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaFileAlt, FaClock, FaUsers } from 'react-icons/fa';

const PublishedTestsSection = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const gridRef = useRef();

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

    const cards = gridRef.current.children;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 100, scale: 0.8 },
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

  }, []);

  return (
    <section ref={sectionRef} className="scrolly-section published-tests-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        Published Tests
      </h2>
      <div ref={gridRef} className="tests-grid">
        <div className="test-card">
          <FaFileAlt style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <h3>Math Quiz - Chapter 5</h3>
          <p>Algebra fundamentals</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <span><FaClock /> 30 min</span>
            <span><FaUsers /> 24 students</span>
          </div>
        </div>
        <div className="test-card">
          <FaFileAlt style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <h3>Science Test - Biology</h3>
          <p>Cell structure & function</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <span><FaClock /> 45 min</span>
            <span><FaUsers /> 18 students</span>
          </div>
        </div>
        <div className="test-card">
          <FaFileAlt style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <h3>English Literature</h3>
          <p>Shakespeare analysis</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <span><FaClock /> 60 min</span>
            <span><FaUsers /> 22 students</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublishedTestsSection; 