import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaUserPlus, FaUpload, FaCheck } from 'react-icons/fa';

const EnrollStudentSection = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const mockupRef = useRef();

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
      mockupRef.current,
      { opacity: 0, x: 100 },
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
    <section ref={sectionRef} className="scrolly-section enroll-student-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        Enroll Students
      </h2>
      <div ref={mockupRef} className="enrollment-mockup">
        <div className="enrollment-form">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Add New Students</h3>
          <div style={{ marginBottom: '1rem' }}>
            <FaUserPlus style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />
            <span>Individual Enrollment</span>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <FaUpload style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />
            <span>Bulk Import (CSV)</span>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <FaCheck style={{ fontSize: '1.2rem', marginRight: '0.5rem' }} />
            <span>Auto-assign Classes</span>
          </div>
        </div>
        <div className="enrollment-image">
          <div style={{ 
            width: '300px', 
            height: '200px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            opacity: 0.7
          }}>
            👥
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnrollStudentSection; 