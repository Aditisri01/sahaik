# 🧠 sahAIk Mind Map - Interactive 3D Feature Explorer

A futuristic, interactive 3D mind map that serves as a visual index for all features in the sahAIk educational platform.

## ✨ Features

### 🎯 Core Functionality
- **3D Force-Directed Graph**: Interactive 3D visualization using `react-force-graph-3d`
- **Node Types**: Platform (sahAIk), Categories, and Features
- **Interactive Navigation**: Click nodes to explore features and navigate to pages
- **Search & Filter**: Real-time search with highlighting and camera focus
- **Theme Toggle**: Switch between dark and light modes
- **Camera Controls**: Reset view and smooth camera transitions

### 🎨 Visual Design
- **Cyberpunk Aesthetic**: Neon colors, glowing effects, and futuristic UI
- **Particle Background**: Animated floating particles for ambiance
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Responsive Design**: Works on desktop and mobile devices
- **Custom Node Rendering**: Unique visual styles for different node types

### 🔧 Technical Features
- **State Management**: Zustand store for centralized state
- **TypeScript Ready**: Full type safety support
- **Modular Architecture**: Component-based structure
- **Performance Optimized**: Efficient rendering and memory management

## 🚀 Quick Start

### Prerequisites
```bash
npm install react-force-graph-3d three @types/three framer-motion zustand
```

### Basic Usage
```jsx
import { MindMapContainer } from './components/MindMap';

function App() {
  return (
    <div className="app">
      <MindMapContainer />
    </div>
  );
}
```

### Integration with TeacherHome
The mind map is integrated into the TeacherHome page with a toggle button:

```jsx
// In TeacherHome.js
const [showMindMap, setShowMindMap] = useState(false);

if (showMindMap) {
  return <MindMapContainer />;
}
```

## 📁 Project Structure

```
src/components/MindMap/
├── MindMapContainer.js    # Main container component
├── MindMap.js            # 3D graph component
├── NodeModal.js          # Feature details modal
├── SearchBar.js          # Search and filter component
├── ControlPanel.js       # Camera and theme controls
├── MindMap.css           # Comprehensive styling
├── index.js              # Component exports
└── README.md             # This file
```

## 🎮 User Interaction Guide

### Navigation
- **Click Nodes**: Open feature details or navigate to pages
- **Drag**: Rotate and zoom the 3D view
- **Scroll**: Zoom in/out
- **Search**: Type to filter and highlight nodes
- **Reset**: Return to initial camera position

### Node Types
- 🚀 **Platform**: Central sahAIk node
- 📁 **Categories**: Major feature groups
- ⚡ **Features**: Individual tools and pages

### Controls
- **Search Bar**: Filter nodes by name or description
- **Reset View**: Return to center position
- **Theme Toggle**: Switch between dark/light modes
- **Info Panel**: View node type legend and tips

## 🎨 Customization

### Colors and Themes
Modify CSS variables in `MindMap.css`:

```css
:root {
  --primary-glow: #00ff88;      /* Main accent color */
  --secondary-glow: #ff6b35;    /* Platform node color */
  --accent-glow: #4ecdc4;       /* Category node color */
  --text-primary: #ffffff;      /* Primary text */
  --text-secondary: #b0b0b0;    /* Secondary text */
  --bg-primary: #0a0a0a;        /* Background color */
}
```

### Node Data Structure
Update the graph data in `mindMapStore.js`:

```javascript
const graphData = {
  nodes: [
    { 
      id: 'Feature Name',
      group: 2,
      type: 'feature',
      description: 'Feature description',
      route: '/feature-path'
    }
  ],
  links: [
    { source: 'Parent Node', target: 'Child Node' }
  ]
};
```

### Node Types
- `platform`: Central platform node (sahAIk)
- `category`: Feature categories
- `feature`: Individual features with navigation

## 🔧 Advanced Configuration

### Physics Settings
Adjust force simulation parameters in `MindMap.js`:

```javascript
<ForceGraph3D
  d3AlphaDecay={0.02}        // Simulation cooling rate
  d3VelocityDecay={0.1}      // Node velocity decay
  cooldownTicks={100}        // Simulation iterations
  nodeRelSize={6}            // Node size
  linkWidth={2}              // Link thickness
/>
```

### Camera Controls
Customize camera behavior:

```javascript
// Reset camera position
resetCamera: () => set({ cameraPosition: { x: 0, y: 0, z: 100 } })

// Focus on specific node
fgRef.current.cameraPosition(
  node.x - node.x / distRatio,
  node.y - node.y / distRatio,
  node.z - node.z / distRatio,
  3000
);
```

## 🎯 Future Enhancements

### Planned Features
- [ ] **2D/3D Toggle**: Switch between visualization modes
- [ ] **Breadcrumb Trail**: Track navigation history
- [ ] **Sound Effects**: Audio feedback on interactions
- [ ] **Export Options**: Save mind map as image/PDF
- [ ] **Custom Layouts**: Multiple graph layout algorithms
- [ ] **Real-time Updates**: Live data integration
- [ ] **Accessibility**: Screen reader support and keyboard navigation

### API Integration
```javascript
// Future: Load data from API
const loadGraphData = async () => {
  const response = await fetch('/api/mind-map-data');
  const data = await response.json();
  setGraphData(data);
};
```

### CMS Integration
```javascript
// Future: Dynamic content from CMS
const graphData = await fetchFromCMS('mind-map-structure');
```

## 🐛 Troubleshooting

### Common Issues

**Graph not rendering:**
- Check Three.js and react-force-graph-3d installation
- Verify WebGL support in browser
- Check console for errors

**Performance issues:**
- Reduce particle count in `MindMapContainer.js`
- Lower node count or simplify node rendering
- Enable hardware acceleration in browser

**Search not working:**
- Verify Zustand store setup
- Check search query state management
- Ensure node data structure is correct

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 12+)
- **Mobile**: Touch gestures supported

## 📝 License

This component is part of the sahAIk educational platform.

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test on multiple devices and browsers
4. Update documentation for new features

---

**Built with ❤️ for the future of education** 