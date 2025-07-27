import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaFileAlt, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';

const TestCreationSection = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const uiRef = useRef();
  const stepsRef = useRef();

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

    // Animate UI container
    gsap.fromTo(
      uiRef.current,
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

    // Animate steps sequentially
    const steps = stepsRef.current.children;
    gsap.fromTo(
      steps,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.4,
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
    <section ref={sectionRef} className="scrolly-section test-creation-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        Test Creation
      </h2>
      <div ref={uiRef} className="test-creation-ui">
        <div ref={stepsRef}>
          <div className="step-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FaFileAlt style={{ fontSize: '1.5rem' }} />
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Step 1: Enter Test Details</h3>
                <p style={{ margin: 0, opacity: 0.8 }}>Create a new test with title, description, and settings</p>
              </div>
            </div>
          </div>
          <div className="step-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FaQuestionCircle style={{ fontSize: '1.5rem' }} />
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Step 2: Add Questions</h3>
                <p style={{ margin: 0, opacity: 0.8 }}>Choose question types and add your content</p>
              </div>
            </div>
          </div>
          <div className="step-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FaCheckCircle style={{ fontSize: '1.5rem' }} />
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Step 3: Publish & Share</h3>
                <p style={{ margin: 0, opacity: 0.8 }}>Publish your test and share with students</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestCreationSection; 