import { create } from 'zustand';

export const useMindMapStore = create((set, get) => ({
  // Graph data
  graphData: {
    nodes: [
      { id: 'sahAIk', group: 0, type: 'platform', description: 'AI-powered educational platform' },
      { id: 'Learning Tools', group: 1, type: 'category', description: 'Core teaching and learning tools' },
      { id: 'Test Creator', group: 2, type: 'feature', description: 'Create and manage assessments', route: '/teacher' },
      { id: 'Image Text Extractor', group: 2, type: 'feature', description: 'Extract text from images', route: '/extractor' },
      { id: 'Learning Content Generator', group: 2, type: 'feature', description: 'Generate educational content', route: '/learning-content' },
      { id: 'Diagram Generator', group: 2, type: 'feature', description: 'Create educational diagrams', route: '/diagram-generator' },
      { id: 'Lesson Planner', group: 2, type: 'feature', description: 'Plan lessons with AI assistance', route: '/lesson-planner' },
      { id: 'Assistive Tech', group: 1, type: 'category', description: 'AI-powered assistance tools' },
      { id: 'eduAssistant', group: 2, type: 'feature', description: 'AI teaching assistant chatbot', route: '/assistant' },
      { id: 'Reading Evaluation', group: 2, type: 'feature', description: 'Evaluate reading comprehension', route: '/reading-eval' },
      { id: 'Admin Tools', group: 1, type: 'category', description: 'Administrative and management tools' },
      { id: 'Student Enrollment', group: 2, type: 'feature', description: 'Enroll and manage students', route: '/enroll-student' },
      { id: 'Published Tests', group: 2, type: 'feature', description: 'View and manage published tests', route: '/published-tests' },
    ],
    links: [
      { source: 'sahAIk', target: 'Learning Tools' },
      { source: 'Learning Tools', target: 'Test Creator' },
      { source: 'Learning Tools', target: 'Image Text Extractor' },
      { source: 'Learning Tools', target: 'Learning Content Generator' },
      { source: 'Learning Tools', target: 'Diagram Generator' },
      { source: 'Learning Tools', target: 'Lesson Planner' },
      { source: 'sahAIk', target: 'Assistive Tech' },
      { source: 'Assistive Tech', target: 'eduAssistant' },
      { source: 'Assistive Tech', target: 'Reading Evaluation' },
      { source: 'sahAIk', target: 'Admin Tools' },
      { source: 'Admin Tools', target: 'Student Enrollment' },
      { source: 'Admin Tools', target: 'Published Tests' },
    ]
  },

  // UI State
  selectedNode: null,
  searchQuery: '',
  isDarkMode: true,
  isModalOpen: false,
  cameraPosition: { x: 0, y: 0, z: 100 },
  highlightedNodes: [],

  // Actions
  setSelectedNode: (node) => set({ selectedNode: node, isModalOpen: !!node }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  closeModal: () => set({ selectedNode: null, isModalOpen: false }),
  setCameraPosition: (position) => set({ cameraPosition: position }),
  setHighlightedNodes: (nodes) => set({ highlightedNodes: nodes }),
  resetCamera: () => set({ cameraPosition: { x: 0, y: 0, z: 100 } }),

  // Computed values
  getFilteredNodes: () => {
    const { graphData, searchQuery } = get();
    if (!searchQuery) return graphData.nodes;
    
    return graphData.nodes.filter(node => 
      node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  },

  getNodeColor: (node) => {
    const { isDarkMode, highlightedNodes } = get();
    const isHighlighted = highlightedNodes.includes(node.id);
    
    if (isHighlighted) return '#00ff88';
    
    const colors = {
      platform: isDarkMode ? '#ff6b35' : '#ff6b35',
      category: isDarkMode ? '#4ecdc4' : '#4ecdc4',
      feature: isDarkMode ? '#45b7d1' : '#45b7d1'
    };
    
    return colors[node.type] || '#666';
  }
})); 