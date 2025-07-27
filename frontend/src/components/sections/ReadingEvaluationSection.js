import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaBook, FaChartBar } from 'react-icons/fa';

const ReadingEvaluationSection = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const demoRef = useRef();

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
      demoRef.current,
      { opacity: 0, x: -100 },
      {
        opacity: 1,
        x: 0,
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
    <section ref={sectionRef} className="scrolly-section reading-evaluation-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        Reading Evaluation
      </h2>
      <div ref={demoRef} className="evaluation-demo">
        <div className="input-demo">
          <h3 style={{ marginBottom: '1rem' }}>Student Reading Input</h3>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '1rem', 
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{ margin: 0, fontStyle: 'italic' }}>
              "The quick brown fox jumps over the lazy dog..."
            </p>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <FaBook style={{ fontSize: '2rem', opacity: 0.7 }} />
          </div>
        </div>
        <div className="result-demo">
          <h3 style={{ marginBottom: '1rem' }}>Evaluation Results</h3>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '1rem', 
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span>Fluency: </span>
              <span style={{ color: '#4facfe' }}>85%</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span>Comprehension: </span>
              <span style={{ color: '#43e97b' }}>92%</span>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span>Speed: </span>
              <span style={{ color: '#fa709a' }}>78%</span>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <FaChartBar style={{ fontSize: '2rem', opacity: 0.7 }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadingEvaluationSection; 