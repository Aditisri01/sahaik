import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindMapStore } from '../../store/mindMapStore';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';

const SearchBar = () => {
  const { searchQuery, setSearchQuery, getFilteredNodes } = useMindMapStore();
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showResults, setShowResults] = useState(false);

  const filteredNodes = getFilteredNodes();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    setShowResults(false);
  };

  const handleNodeSelect = (node) => {
    setLocalQuery(node.id);
    setSearchQuery(node.id);
    setShowResults(false);
  };

  return (
    <div className="search-container">
      <motion.div
        className="search-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search features and tools..."
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              setShowResults(e.target.value.length > 0);
            }}
            onFocus={() => {
              setIsFocused(true);
              setShowResults(localQuery.length > 0);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowResults(false), 200);
            }}
            className="search-input"
          />
          {localQuery && (
            <motion.button
              className="clear-btn"
              onClick={handleClear}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showResults && filteredNodes.length > 0 && (
            <motion.div
              className="search-results"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="results-header">
                <FaFilter />
                <span>{filteredNodes.length} result{filteredNodes.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="results-list">
                {filteredNodes.slice(0, 5).map((node, index) => (
                  <motion.div
                    key={node.id}
                    className="result-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNodeSelect(node)}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="result-icon">
                      {node.type === 'platform' && '🚀'}
                      {node.type === 'category' && '📁'}
                      {node.type === 'feature' && '⚡'}
                    </div>
                    <div className="result-content">
                      <div className="result-title">{node.id}</div>
                      <div className="result-type">{node.type}</div>
                    </div>
                    <div className="result-arrow">→</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SearchBar; 