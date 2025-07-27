import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMapStore } from '../../store/mindMapStore';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaArrowRight, FaRocket } from 'react-icons/fa';

const NodeModal = () => {
  const { selectedNode, isModalOpen, closeModal } = useMindMapStore();
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (selectedNode?.route) {
      navigate(selectedNode.route);
      closeModal();
    }
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'platform':
        return '🚀';
      case 'category':
        return '📁';
      case 'feature':
        return '⚡';
      default:
        return '🔗';
    }
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'platform':
        return '#ff6b35';
      case 'category':
        return '#4ecdc4';
      case 'feature':
        return '#45b7d1';
      default:
        return '#666';
    }
  };

  if (!selectedNode) return null;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              borderLeft: `4px solid ${getNodeColor(selectedNode.type)}`
            }}
          >
            {/* Header */}
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{getNodeIcon(selectedNode.type)}</span>
                <h2>{selectedNode.id}</h2>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="modal-body">
              <p className="modal-description">{selectedNode.description}</p>
              
              {selectedNode.type === 'feature' && (
                <div className="modal-actions">
                  <motion.button
                    className="navigate-btn"
                    onClick={handleNavigate}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                  >
                    <FaRocket />
                    <span>Launch Feature</span>
                    <FaArrowRight />
                  </motion.button>
                </div>
              )}

              {selectedNode.type === 'category' && (
                <div className="category-info">
                  <div className="info-item">
                    <span className="info-label">Type:</span>
                    <span className="info-value">Category</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Contains:</span>
                    <span className="info-value">Multiple Features</span>
                  </div>
                </div>
              )}

              {selectedNode.type === 'platform' && (
                <div className="platform-info">
                  <div className="info-item">
                    <span className="info-label">Platform:</span>
                    <span className="info-value">sahAIk</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Version:</span>
                    <span className="info-value">2.0</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value status-active">Active</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <div className="modal-meta">
                <span className="node-type">{selectedNode.type}</span>
                <span className="node-id">#{selectedNode.id.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodeModal; 