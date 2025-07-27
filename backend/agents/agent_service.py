"""
Agent Service Layer
Integrates the agentic architecture with the existing Flask application
"""

from typing import Dict, Any, Optional
from .agent_orchestrator import AgentOrchestrator
from .educational_assistant_agent import EducationalAssistantAgent
from .test_generator_agent import TestGeneratorAgent
from .learning_analytics_agent import LearningAnalyticsAgent
import json
from datetime import datetime


class AgentService:
    """Service layer for managing agent interactions"""
    
    def __init__(self):
        self.orchestrator = AgentOrchestrator()
        self.individual_agents = {
            'educational_assistant': EducationalAssistantAgent(),
            'test_generator': TestGeneratorAgent(),
            'learning_analytics': LearningAnalyticsAgent()
        }
        self.session_data = {}  # Store session-specific data
    
    def process_educational_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process educational assistance requests"""
        
        try:
            # Use the orchestrator for intelligent routing
            result = self.orchestrator.process({
                'request_type': 'educational_help',
                'message': request_data.get('message', ''),
                'class': request_data.get('class', 'Class 1'),
                'subject': request_data.get('subject', 'General'),
                'topic': request_data.get('topic', 'General'),
                'language': request_data.get('language', 'en'),
                'student_level': request_data.get('student_level', 'beginner'),
                'context': request_data.get('context', {})
            })
            
            return {
                'success': True,
                'reply': result.get('response', ''),
                'agent_used': result.get('agent_used', 'educational_assistant'),
                'suggestions': result.get('suggestions', []),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'reply': 'Sorry, I encountered an error while processing your request.',
                'timestamp': datetime.now().isoformat()
            }
    
    def generate_test(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate educational tests"""
        
        try:
            result = self.orchestrator.process({
                'request_type': 'test_generation',
                'subject': request_data.get('subject', 'General'),
                'topic': request_data.get('topic', 'General'),
                'grade_level': request_data.get('grade_level', 'Class 1'),
                'difficulty': request_data.get('difficulty', 'medium'),
                'question_count': request_data.get('question_count', 5),
                'language': request_data.get('language', 'en'),
                'context': request_data.get('context', {})
            })
            
            return {
                'success': True,
                'test': result.get('test', {}),
                'agent_used': result.get('agent_used', 'test_generator'),
                'suggestions': result.get('suggestions', []),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'test': {},
                'timestamp': datetime.now().isoformat()
            }
    
    def analyze_performance(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze student performance"""
        
        try:
            result = self.orchestrator.process({
                'request_type': 'performance_analysis',
                'student_id': request_data.get('student_id'),
                'test_results': request_data.get('test_results', []),
                'performance_history': request_data.get('performance_history', []),
                'subject': request_data.get('subject', 'General'),
                'time_period': request_data.get('time_period', '30d'),
                'context': request_data.get('context', {})
            })
            
            return {
                'success': True,
                'report': result.get('report', {}),
                'agent_used': result.get('agent_used', 'learning_analytics'),
                'suggestions': result.get('suggestions', []),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'report': {},
                'timestamp': datetime.now().isoformat()
            }
    
    def process_complex_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process complex requests that may require multiple agents"""
        
        try:
            result = self.orchestrator.process({
                'request_type': 'complex_request',
                'message': request_data.get('message', ''),
                'context': request_data.get('context', {}),
                **request_data  # Include all other parameters
            })
            
            return {
                'success': True,
                'response': result.get('response', ''),
                'agents_used': result.get('agents_used', []),
                'detailed_results': result.get('detailed_results', {}),
                'suggestions': result.get('suggestions', []),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': 'Sorry, I encountered an error while processing your complex request.',
                'timestamp': datetime.now().isoformat()
            }
    
    def provide_learning_tip(self, question: str, correct_answer: str, student_answer: str, context: Dict[str, Any]) -> str:
        """Provide specific learning tips for wrong answers"""
        
        try:
            agent = self.individual_agents['educational_assistant']
            return agent.provide_learning_tip(question, correct_answer, student_answer, context)
        except Exception as e:
            return f"Sorry, I couldn't generate a learning tip. Error: {str(e)}"
    
    def generate_practice_questions(self, topic: str, difficulty: str, count: int = 3) -> Dict[str, Any]:
        """Generate practice questions for a topic"""
        
        try:
            agent = self.individual_agents['educational_assistant']
            questions = agent.generate_practice_questions(topic, difficulty, count)
            
            return {
                'success': True,
                'questions': questions,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'questions': [],
                'timestamp': datetime.now().isoformat()
            }
    
    def validate_test_questions(self, questions: list) -> Dict[str, Any]:
        """Validate test questions for quality"""
        
        try:
            agent = self.individual_agents['test_generator']
            validation_results = agent.validate_test_questions(questions)
            
            return {
                'success': True,
                'validation': validation_results,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'validation': {},
                'timestamp': datetime.now().isoformat()
            }
    
    def get_conversation_summary(self, session_id: str = None) -> Dict[str, Any]:
        """Get conversation summary for analytics"""
        
        try:
            summary = self.orchestrator.get_conversation_summary()
            
            return {
                'success': True,
                'summary': summary,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'summary': {},
                'timestamp': datetime.now().isoformat()
            }
    
    def clear_session(self, session_id: str = None):
        """Clear session data and conversation history"""
        
        try:
            self.orchestrator.clear_conversation_history()
            
            # Clear session data if provided
            if session_id and session_id in self.session_data:
                del self.session_data[session_id]
            
            return {
                'success': True,
                'message': 'Session cleared successfully',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all agents"""
        
        try:
            status = {}
            
            for agent_name, agent in self.individual_agents.items():
                status[agent_name] = {
                    'available': True,
                    'memory_count': len(agent.memory),
                    'context_keys': list(agent.context.keys()) if agent.context else []
                }
            
            # Add orchestrator status
            status['orchestrator'] = {
                'available': True,
                'conversation_count': len(self.orchestrator.conversation_history),
                'active_agents': list(self.orchestrator.agents.keys())
            }
            
            return {
                'success': True,
                'status': status,
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'status': {},
                'timestamp': datetime.now().isoformat()
            }


# Global instance for use in Flask app
agent_service = AgentService() 