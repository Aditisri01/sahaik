import React, { useRef, useCallback, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useMindMapStore } from '../../store/mindMapStore';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const MindMap = () => {
  const fgRef = useRef();
  const {
    graphData,
    selectedNode,
    setSelectedNode,
    searchQuery,
    isDarkMode,
    setHighlightedNodes,
    getNodeColor,
    getFilteredNodes,
    resetCamera
  } = useMindMapStore();

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  // Handle node hover
  const handleNodeHover = useCallback((node) => {
    if (node) {
      setHighlightedNodes([node.id]);
    } else {
      setHighlightedNodes([]);
    }
  }, [setHighlightedNodes]);

  // Handle search filtering
  useEffect(() => {
    if (searchQuery) {
      const filteredNodes = getFilteredNodes();
      setHighlightedNodes(filteredNodes.map(n => n.id));
      
      // Focus camera on first matched node
      if (filteredNodes.length > 0 && fgRef.current) {
        const node = filteredNodes[0];
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        
        fgRef.current.cameraPosition(
          node.x - node.x / distRatio,
          node.y - node.y / distRatio,
          node.z - node.z / distRatio,
          3000
        );
      }
    } else {
      setHighlightedNodes([]);
    }
  }, [searchQuery, getFilteredNodes, setHighlightedNodes]);

  // Custom node component
  const nodeThreeObject = useCallback((node) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(generateNodeTexture(node)),
        transparent: true,
        sizeAttenuation: false
      })
    );
    sprite.scale.set(20, 20, 1);
    return sprite;
  }, []);

  // Generate node texture
  const generateNodeTexture = (node) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;

    const color = getNodeColor(node);
    const isHighlighted = node.id === selectedNode?.id;

    // Background glow
    if (isHighlighted) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.7, color + '40');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(32, 32, 16, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Border
    ctx.strokeStyle = isHighlighted ? '#ffffff' : color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pulse animation for platform node
    if (node.type === 'platform') {
      ctx.beginPath();
      ctx.arc(32, 32, 20, 0, 2 * Math.PI);
      ctx.strokeStyle = color + '60';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    return canvas;
  };

  // Custom link component
  const linkThreeObject = useCallback((link) => {
    const material = new THREE.LineBasicMaterial({
      color: isDarkMode ? '#4a4a4a' : '#e0e0e0',
      transparent: true,
      opacity: 0.6
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(link.source.x, link.source.y, link.source.z),
      new THREE.Vector3(link.target.x, link.target.y, link.target.z)
    ]);
    
    return new THREE.Line(geometry, material);
  }, [isDarkMode]);

  return (
    <motion.div
      className="mind-map-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        nodeThreeObject={nodeThreeObject}
        linkThreeObject={linkThreeObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        backgroundColor={isDarkMode ? '#0a0a0a' : '#f8f9fa'}
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={false}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.1}
        cooldownTicks={100}
        nodeRelSize={6}
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => isDarkMode ? '#00ff88' : '#4ecdc4'}
        onEngineStop={() => fgRef.current.zoomToFit(400)}
      />
    </motion.div>
  );
};

export default MindMap; 