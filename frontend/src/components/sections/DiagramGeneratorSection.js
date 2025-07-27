import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaPencilAlt, FaImage } from 'react-icons/fa';

const DiagramGeneratorSection = () => {
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
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: 0.3,
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
    <section ref={sectionRef} className="scrolly-section diagram-generator-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        Diagram Generator
      </h2>
      <div ref={demoRef} className="diagram-demo">
        <div className="input-area">
          <h3 style={{ marginBottom: '1rem' }}>Input Description</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '10px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#6c757d' }}>
              "Create a diagram showing the water cycle with evaporation, condensation, and precipitation"
            </p>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <FaPencilAlt style={{ fontSize: '2rem', color: '#fcb69f' }} />
          </div>
        </div>
        <div className="output-area">
          <h3 style={{ marginBottom: '1rem' }}>Generated Diagram</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '2rem', 
            borderRadius: '10px',
            border: '2px solid #dee2e6',
            textAlign: 'center'
          }}>
            <FaImage style={{ fontSize: '4rem', color: '#fcb69f', marginBottom: '1rem' }} />
            <p style={{ margin: 0, color: '#6c757d' }}>Water Cycle Diagram</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiagramGeneratorSection; 