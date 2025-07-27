import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const WelcomeSection = () => {
  const sectionRef = useRef();
  const logoRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();

  useEffect(() => {
    // Animate logo
    gsap.fromTo(
      logoRef.current,
      { 
        opacity: 0, 
        scale: 0.5, 
        rotation: -180 
      },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.5,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animate title
    gsap.fromTo(
      titleRef.current,
      { 
        opacity: 0, 
        y: 50,
        scale: 0.8
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animate subtitle
    gsap.fromTo(
      subtitleRef.current,
      { 
        opacity: 0, 
        y: 30 
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Add floating animation to logo
    gsap.to(logoRef.current, {
      y: -10,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

  }, []);

  return (
    <section ref={sectionRef} className="scrolly-section welcome-section">
      <div ref={logoRef} className="welcome-logo">
        <img 
          src="/logo192.png" 
          alt="SahAIk Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <h1 ref={titleRef} className="welcome-title">
        Welcome, Teacher!
      </h1>
      <p ref={subtitleRef} className="welcome-subtitle">
        Your classroom, reimagined.
      </p>
    </section>
  );
};

export default WelcomeSection; 