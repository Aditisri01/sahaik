import React from 'react';
import { motion } from 'framer-motion';
import { useMindMapStore } from '../../store/mindMapStore';
import { FaHome, FaMoon, FaSun, FaExpand, FaCompress, FaInfo } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';

const ControlPanel = () => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    resetCamera,
    selectedNode 
  } = useMindMapStore();

  const controls = [
    {
      id: 'reset',
      icon: FaHome,
      label: 'Reset View',
      action: resetCamera,
      color: '#4ecdc4'
    },
    {
      id: 'theme',
      icon: isDarkMode ? FaSun : FaMoon,
      label: isDarkMode ? 'Light Mode' : 'Dark Mode',
      action: toggleDarkMode,
      color: isDarkMode ? '#ffd93d' : '#6c5ce7'
    }
  ];

  return (
    <motion.div
      className="control-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="controls-container">
        {controls.map((control, index) => (
          <motion.button
            key={control.id}
            className="control-btn"
            onClick={control.action}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ 
              scale: 1.1,
              backgroundColor: control.color + '20',
              borderColor: control.color
            }}
            whileTap={{ scale: 0.95 }}
            style={{ borderColor: control.color }}
          >
            <control.icon style={{ color: control.color }} />
            <span className="control-label">{control.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Info Panel */}
      <motion.div
        className="info-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="info-header">
          <FaInfo />
          <span>Mind Map Guide</span>
        </div>
        <div className="info-content">
          <div className="info-item">
            <span className="info-dot platform"></span>
            <span>Platform (sahAIk)</span>
          </div>
          <div className="info-item">
            <span className="info-dot category"></span>
            <span>Categories</span>
          </div>
          <div className="info-item">
            <span className="info-dot feature"></span>
            <span>Features</span>
          </div>
        </div>
        <div className="info-tips">
          <p>💡 Click nodes to explore features</p>
          <p>🔍 Use search to find specific tools</p>
          <p>🎯 Drag to navigate the 3D space</p>
        </div>
      </motion.div>

      {/* Selected Node Info */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="selected-node-info"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="selected-node-header">
              <span className="selected-node-icon">
                {selectedNode.type === 'platform' && '🚀'}
                {selectedNode.type === 'category' && '📁'}
                {selectedNode.type === 'feature' && '⚡'}
              </span>
              <span className="selected-node-title">{selectedNode.id}</span>
            </div>
            <div className="selected-node-type">{selectedNode.type}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ControlPanel; 