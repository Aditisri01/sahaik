import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaRobot } from 'react-icons/fa';

const EduAssistantSection = () => {
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
    <section ref={sectionRef} className="scrolly-section edu-assistant-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        eduAssistant
      </h2>
      <div ref={demoRef} className="chatbot-demo">
        <div className="chat-messages">
          <div className="message bot">
            <FaRobot style={{ marginRight: '0.5rem' }} />
            Hi! How can I help you today?
          </div>
          <div className="message user">
            Can you help me create a quiz for Chapter 5?
          </div>
          <div className="message bot">
            <FaRobot style={{ marginRight: '0.5rem' }} />
            Absolutely! What type of questions would you like?
          </div>
        </div>
        <div style={{ marginTop: 'auto', textAlign: 'center', opacity: 0.7 }}>
          <span style={{ fontStyle: 'italic' }}>Typing...</span>
        </div>
      </div>
    </section>
  );
};

export default EduAssistantSection; 