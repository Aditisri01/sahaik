import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaUpload, FaFileAlt, FaVolumeUp } from 'react-icons/fa';

const TextExtractorSection = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const flowRef = useRef();

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

    const steps = flowRef.current.children;
    gsap.fromTo(
      steps,
      { opacity: 0, y: 100, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
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
    <section ref={sectionRef} className="scrolly-section text-extractor-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center' }}>
        Text Extractor
      </h2>
      <div ref={flowRef} className="extractor-flow">
        <div className="flow-step">
          <FaUpload style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fcb69f' }} />
          <h3>Upload Image</h3>
          <p>Upload any image containing text</p>
        </div>
        <div className="flow-step">
          <FaFileAlt style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fcb69f' }} />
          <h3>Extract Text</h3>
          <p>AI-powered OCR technology</p>
        </div>
        <div className="flow-step">
          <FaVolumeUp style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fcb69f' }} />
          <h3>Audio Output</h3>
          <p>Convert to speech instantly</p>
        </div>
      </div>
    </section>
  );
};

export default TextExtractorSection; 