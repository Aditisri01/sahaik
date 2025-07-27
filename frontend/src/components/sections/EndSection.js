import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const EndSection = ({ navigate }) => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const ctaRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );
    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: 0.5,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );
    // Parallax background effect
    gsap.to(sectionRef.current, {
      backgroundPosition: '0% 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }, []);

  return (
    <section ref={sectionRef} className="scrolly-section end-section">
      <h2 ref={titleRef} style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem' }}>
        "The best teachers are those who show you where to look, but don’t tell you what to see."
      </h2>
      <div ref={ctaRef} className="cta-buttons">
        <button className="cta-button" onClick={() => navigate('/teacher-home')}>Start Teaching Now</button>
        <a className="cta-button" href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Explore More Tools</a>
      </div>
    </section>
  );
};

export default EndSection; 