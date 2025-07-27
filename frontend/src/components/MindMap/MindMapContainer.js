import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import MindMap from './MindMap';
import NodeModal from './NodeModal';
import SearchBar from './SearchBar';
import ControlPanel from './ControlPanel';
import { useMindMapStore } from '../../store/mindMapStore';
import './MindMap.css';

const MindMapContainer = () => {
  const { isDarkMode } = useMindMapStore();

  useEffect(() => {
    // Add body class for dark mode
    document.body.classList.toggle('mind-map-dark', isDarkMode);
    
    return () => {
      document.body.classList.remove('mind-map-dark');
    };
  }, [isDarkMode]);

  return (
    <div className={`mind-map-page ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Background Particles */}
      <div className="particles-container">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{
              y: [null, -100],
              opacity: [null, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        className="mind-map-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="header-content">
          <div className="header-title">
            <h1>sahAIk Mind Map</h1>
            <p>Explore the interconnected world of educational AI tools</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">13</span>
              <span className="stat-label">Features</span>
            </div>
            <div className="stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat">
              <span className="stat-number">1</span>
              <span className="stat-label">Platform</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="mind-map-main">
        {/* Search Bar */}
        <div className="search-section">
          <SearchBar />
        </div>

        {/* Mind Map */}
        <div className="mind-map-section">
          <MindMap />
        </div>

        {/* Control Panel */}
        <div className="control-section">
          <ControlPanel />
        </div>
      </div>

      {/* Modal */}
      <NodeModal />

      {/* Loading Overlay */}
      <motion.div
        className="loading-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{ pointerEvents: 'none' }}
      >
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Initializing Mind Map...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default MindMapContainer; 