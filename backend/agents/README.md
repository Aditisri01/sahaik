# SahAIk Agentic Architecture

## 🎯 Overview

The SahAIk Agentic Architecture is a sophisticated multi-agent system built with LangChain that provides intelligent, context-aware educational assistance. It consists of specialized agents that work together to deliver personalized learning experiences.

## 🏗️ Architecture Components

### 1. Base Agent (`base_agent.py`)
- **Purpose**: Abstract base class for all agents
- **Features**:
  - LLM integration with Gemini API
  - Memory management and context tracking
  - Error handling and logging
  - Common utility functions

### 2. Educational Assistant Agent (`educational_assistant_agent.py`)
- **Purpose**: Provides educational help and explanations
- **Capabilities**:
  - Age-appropriate explanations
  - Multi-language support (12+ Indian languages)
  - Step-by-step problem solving
  - Learning tips for wrong answers
  - Practice question generation

### 3. Test Generator Agent (`test_generator_agent.py`)
- **Purpose**: Creates educational assessments and tests
- **Capabilities**:
  - Grade-appropriate test generation
  - Multiple question types (MCQ, True/False, etc.)
  - Difficulty level adaptation
  - Question validation and quality checks
  - Adaptive test generation based on performance

### 4. Learning Analytics Agent (`learning_analytics_agent.py`)
- **Purpose**: Analyzes student performance and provides insights
- **Capabilities**:
  - Performance trend analysis
  - Strength and weakness identification
  - Personalized recommendations
  - Progress tracking
  - Learning gap analysis

### 5. Agent Orchestrator (`agent_orchestrator.py`)
- **Purpose**: Coordinates between different agents
- **Capabilities**:
  - Intelligent request routing
  - Multi-agent workflow management
  - Conversation history tracking
  - Context preservation across interactions
  - Complex request handling

### 6. Agent Service (`agent_service.py`)
- **Purpose**: Service layer for Flask integration
- **Capabilities**:
  - RESTful API endpoints
  - Session management
  - Error handling and logging
  - Status monitoring

## 🚀 Getting Started

### Prerequisites
```bash
pip install langchain langchain-google-genai langchain-community langchain-core
```

### Environment Variables
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

### Basic Usage

#### 1. Educational Assistance
```python
from agents.agent_service import agent_service

result = agent_service.process_educational_request({
    'message': 'What is photosynthesis?',
    'class': 'Class 7',
    'subject': 'Science',
    'topic': 'biology',
    'language': 'en'
})

print(result['reply'])
```

#### 2. Test Generation
```python
result = agent_service.generate_test({
    'subject': 'Mathematics',
    'topic': 'addition',
    'grade_level': 'Class 3',
    'difficulty': 'medium',
    'question_count': 5,
    'language': 'en'
})

print(f"Generated {result['test']['total_questions']} questions")
```

#### 3. Performance Analysis
```python
result = agent_service.analyze_performance({
    'student_id': 'student_001',
    'test_results': [...],  # Test result data
    'performance_history': [...],  # Historical data
    'subject': 'Mathematics',
    'time_period': '30d'
})

print(f"Found {len(result['report']['insights'])} insights")
```

## 🔧 API Endpoints

### Educational Assistance
- `POST /agent/educational` - Get educational help
- `POST /agent/learning_tip` - Generate learning tips for wrong answers
- `POST /agent/practice_questions` - Generate practice questions

### Test Generation
- `POST /agent/generate_test` - Generate educational tests
- `POST /agent/validate_questions` - Validate test questions

### Analytics
- `POST /agent/analyze_performance` - Analyze student performance
- `GET /agent/conversation_summary` - Get conversation summary

### Complex Workflows
- `POST /agent/complex_request` - Handle complex multi-agent requests

### Management
- `GET /agent/status` - Get agent status
- `POST /agent/clear_session` - Clear session data

## 🧪 Testing

Run the comprehensive test suite:
```bash
python test_agentic_architecture.py
```

This will test:
- Agent imports and initialization
- Individual agent functionality
- Orchestrator coordination
- Service layer integration
- Complex multi-agent workflows

## 🎨 Key Features

### 1. Multi-Language Support
- English, Hindi, Tamil, Telugu, Bengali, Gujarati, Malayalam, Marathi, Punjabi, Kannada, Odia, Urdu
- Culturally relevant examples and explanations

### 2. Adaptive Learning
- Performance-based difficulty adjustment
- Personalized recommendations
- Progress tracking and analytics

### 3. Context Awareness
- Conversation history tracking
- Cross-agent context sharing
- Session management

### 4. Error Handling
- Graceful degradation
- Comprehensive logging
- Fallback mechanisms

### 5. Scalability
- Modular agent design
- Easy to add new agents
- Configurable parameters

## 🔄 Agent Workflows

### Simple Request Flow
```
User Request → Agent Orchestrator → Specific Agent → Response
```

### Complex Request Flow
```
User Request → Agent Orchestrator → Multiple Agents → Result Synthesis → Unified Response
```

### Learning Tip Flow
```
Wrong Answer → Educational Assistant → Context Analysis → Personalized Tip
```

## 📊 Monitoring and Analytics

### Agent Status
```python
status = agent_service.get_agent_status()
print(f"Active agents: {status['status']['orchestrator']['active_agents']}")
```

### Conversation Analytics
```python
summary = agent_service.get_conversation_summary()
print(f"Total interactions: {summary['summary']['total_interactions']}")
```

## 🛠️ Customization

### Adding New Agents
1. Create a new agent class inheriting from `BaseAgent`
2. Implement required methods (`get_system_prompt`, `process`)
3. Add to the orchestrator's agent registry
4. Create corresponding service methods

### Custom Prompts
Each agent has customizable system prompts that can be modified for specific use cases.

### Language Models
The architecture supports different LLM providers by modifying the `_initialize_llm` method in `BaseAgent`.

## 🔒 Security and Privacy

- No sensitive data stored in agent memory
- Session-based context management
- Configurable memory limits
- Secure API key handling

## 🚀 Deployment

### Local Development
```bash
cd backend
python app.py
```

### Production Deployment
The agentic architecture is automatically integrated with the Flask app and will be available when deployed to Cloud Run.

## 📈 Performance Optimization

### Memory Management
- Automatic memory cleanup (last 50 interactions)
- Configurable memory limits
- Context summarization for long conversations

### Caching
- Translation cache for repeated requests
- Response caching for common queries
- Session data optimization

## 🤝 Contributing

1. Follow the existing agent patterns
2. Add comprehensive tests for new features
3. Update documentation for new endpoints
4. Ensure multi-language support for new features

## 📚 Examples

### Example 1: Student Asking for Help
```python
# Student asks for help with math
result = agent_service.process_educational_request({
    'message': 'I don\'t understand fractions',
    'class': 'Class 5',
    'subject': 'Mathematics',
    'topic': 'fractions',
    'language': 'en'
})
```

### Example 2: Teacher Generating Test
```python
# Teacher generates a test
result = agent_service.generate_test({
    'subject': 'Science',
    'topic': 'photosynthesis',
    'grade_level': 'Class 6',
    'difficulty': 'medium',
    'question_count': 10,
    'language': 'hi'  # Hindi
})
```

### Example 3: Performance Analysis
```python
# Analyze student performance
result = agent_service.analyze_performance({
    'student_id': 'student_123',
    'test_results': [
        {'score': 85, 'questions': [...]},
        {'score': 92, 'questions': [...]}
    ],
    'subject': 'Mathematics',
    'time_period': '30d'
})
```

## 🎯 Future Enhancements

1. **Vector Database Integration** - For semantic search and content recommendations
2. **Real-time Collaboration** - Multi-user agent interactions
3. **Advanced Analytics** - Predictive learning analytics
4. **Voice Integration** - Speech-to-text and text-to-speech
5. **Offline Capabilities** - Local agent processing for rural areas

---

**Built with ❤️ for India's grassroots education system** 