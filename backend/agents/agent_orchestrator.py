"""
Agent Orchestrator
Coordinates and manages interactions between different specialized agents
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent
from .educational_assistant_agent import EducationalAssistantAgent
from .test_generator_agent import TestGeneratorAgent
from .learning_analytics_agent import LearningAnalyticsAgent
from langchain_core.messages import HumanMessage, SystemMessage
import json
from datetime import datetime


class AgentOrchestrator(BaseAgent):
    """Orchestrates interactions between different specialized agents"""
    
    def __init__(self):
        super().__init__()
        self.agents = {
            'educational_assistant': EducationalAssistantAgent(),
            'test_generator': TestGeneratorAgent(),
            'learning_analytics': LearningAnalyticsAgent()
        }
        self.conversation_history = []
        self.current_context = {}
    
    def get_system_prompt(self) -> str:
        return """You are the SahAIk Agent Orchestrator, coordinating between specialized educational agents.

Your role is to:
1. Understand user requests and route them to appropriate specialized agents
2. Coordinate multi-agent workflows when needed
3. Maintain conversation context and history
4. Provide seamless user experience across different agent capabilities
5. Handle complex requests that require multiple agents

Available agents:
- Educational Assistant: Provides learning help, explanations, and guidance
- Test Generator: Creates educational tests and assessments
- Learning Analytics: Analyzes performance and provides insights

Key principles:
- Route requests to the most appropriate agent(s)
- Maintain context across agent interactions
- Provide clear, unified responses
- Handle errors gracefully
- Support both simple and complex workflows"""

    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process user request and route to appropriate agent(s)"""
        
        # Extract request details
        request_type = input_data.get('request_type', 'general')
        user_message = input_data.get('message', '')
        user_context = input_data.get('context', {})
        
        # Update conversation history
        self.conversation_history.append({
            'timestamp': datetime.now().isoformat(),
            'user_message': user_message,
            'request_type': request_type,
            'context': user_context
        })
        
        # Route to appropriate agent(s)
        if request_type == 'educational_help':
            return self._handle_educational_request(input_data)
        elif request_type == 'test_generation':
            return self._handle_test_generation_request(input_data)
        elif request_type == 'performance_analysis':
            return self._handle_analytics_request(input_data)
        elif request_type == 'complex_request':
            return self._handle_complex_request(input_data)
        else:
            return self._route_by_intent(input_data)
    
    def _handle_educational_request(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle educational assistance requests"""
        
        agent = self.agents['educational_assistant']
        
        # Set context from conversation history
        if self.conversation_history:
            recent_context = self.conversation_history[-1].get('context', {})
            agent.set_context(recent_context)
        
        # Process with educational assistant
        result = agent.process(input_data)
        
        # Add to orchestrator memory
        self.add_to_memory(
            input_data.get('message', ''),
            result.get('reply', ''),
            {'agent': 'educational_assistant', 'request_type': 'educational_help'}
        )
        
        return {
            'response': result.get('reply', ''),
            'agent_used': 'educational_assistant',
            'confidence': 'high',
            'suggestions': self._generate_follow_up_suggestions('educational_help')
        }
    
    def _handle_test_generation_request(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle test generation requests"""
        
        agent = self.agents['test_generator']
        
        # Process with test generator
        result = agent.process(input_data)
        
        # Add to orchestrator memory
        self.add_to_memory(
            f"Generate test for {input_data.get('subject', '')} - {input_data.get('topic', '')}",
            f"Generated {result.get('test', {}).get('total_questions', 0)} questions",
            {'agent': 'test_generator', 'request_type': 'test_generation'}
        )
        
        return {
            'test': result.get('test', {}),
            'agent_used': 'test_generator',
            'confidence': 'high',
            'suggestions': self._generate_follow_up_suggestions('test_generation')
        }
    
    def _handle_analytics_request(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle learning analytics requests"""
        
        agent = self.agents['learning_analytics']
        
        # Process with learning analytics agent
        result = agent.process(input_data)
        
        # Add to orchestrator memory
        self.add_to_memory(
            f"Analyze performance for {input_data.get('student_id', '')}",
            f"Generated analytics report with {len(result.get('report', {}).get('insights', []))} insights",
            {'agent': 'learning_analytics', 'request_type': 'performance_analysis'}
        )
        
        return {
            'report': result.get('report', {}),
            'agent_used': 'learning_analytics',
            'confidence': 'high',
            'suggestions': self._generate_follow_up_suggestions('performance_analysis')
        }
    
    def _handle_complex_request(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle complex requests that require multiple agents"""
        
        user_message = input_data.get('message', '')
        
        # Analyze the request to determine required agents
        required_agents = self._analyze_complex_request(user_message)
        
        results = {}
        
        # Execute each required agent
        for agent_name in required_agents:
            if agent_name in self.agents:
                agent = self.agents[agent_name]
                
                # Prepare agent-specific input
                agent_input = self._prepare_agent_input(agent_name, input_data)
                
                # Process with agent
                agent_result = agent.process(agent_input)
                results[agent_name] = agent_result
        
        # Synthesize results
        synthesized_response = self._synthesize_multi_agent_results(results, user_message)
        
        return {
            'response': synthesized_response,
            'agents_used': required_agents,
            'confidence': 'medium',
            'detailed_results': results,
            'suggestions': self._generate_follow_up_suggestions('complex_request')
        }
    
    def _route_by_intent(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Route request based on intent analysis"""
        
        user_message = input_data.get('message', '').lower()
        
        # Simple intent detection
        if any(word in user_message for word in ['help', 'explain', 'understand', 'learn', 'teach']):
            return self._handle_educational_request(input_data)
        elif any(word in user_message for word in ['test', 'quiz', 'question', 'assessment']):
            return self._handle_test_generation_request(input_data)
        elif any(word in user_message for word in ['performance', 'progress', 'analysis', 'report', 'score']):
            return self._handle_analytics_request(input_data)
        else:
            # Default to educational assistant
            return self._handle_educational_request(input_data)
    
    def _analyze_complex_request(self, user_message: str) -> List[str]:
        """Analyze complex request to determine required agents"""
        
        message_lower = user_message.lower()
        required_agents = []
        
        # Check for educational help needs
        if any(word in message_lower for word in ['help', 'explain', 'understand']):
            required_agents.append('educational_assistant')
        
        # Check for test generation needs
        if any(word in message_lower for word in ['test', 'quiz', 'practice']):
            required_agents.append('test_generator')
        
        # Check for analytics needs
        if any(word in message_lower for word in ['performance', 'progress', 'analysis']):
            required_agents.append('learning_analytics')
        
        # If no specific needs detected, default to educational assistant
        if not required_agents:
            required_agents.append('educational_assistant')
        
        return required_agents
    
    def _prepare_agent_input(self, agent_name: str, original_input: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare agent-specific input from original request"""
        
        base_input = original_input.copy()
        
        if agent_name == 'educational_assistant':
            # Extract educational context
            base_input['request_type'] = 'educational_help'
        
        elif agent_name == 'test_generator':
            # Extract test generation parameters
            base_input['request_type'] = 'test_generation'
            if 'subject' not in base_input:
                base_input['subject'] = 'General'
            if 'topic' not in base_input:
                base_input['topic'] = 'General'
        
        elif agent_name == 'learning_analytics':
            # Extract analytics parameters
            base_input['request_type'] = 'performance_analysis'
        
        return base_input
    
    def _synthesize_multi_agent_results(self, results: Dict[str, Any], original_message: str) -> str:
        """Synthesize results from multiple agents into a coherent response"""
        
        synthesis_prompt = f"""Synthesize the following multi-agent results into a coherent response for the user.

Original user message: {original_message}

Agent results:
{json.dumps(results, indent=2)}

Please provide a unified response that:
1. Addresses the user's original request
2. Integrates insights from all relevant agents
3. Provides clear, actionable information
4. Maintains a conversational tone
5. Suggests next steps if appropriate

Keep the response concise but comprehensive."""
        
        messages = self._create_messages(synthesis_prompt, include_memory=False)
        response = self._call_llm(messages)
        
        return response
    
    def _generate_follow_up_suggestions(self, request_type: str) -> List[str]:
        """Generate follow-up suggestions based on request type"""
        
        suggestions = {
            'educational_help': [
                "Would you like me to generate practice questions on this topic?",
                "Should I analyze your performance in this subject?",
                "Would you like to take a test to assess your understanding?"
            ],
            'test_generation': [
                "Would you like me to explain any of these concepts?",
                "Should I analyze your performance on similar tests?",
                "Would you like more practice questions?"
            ],
            'performance_analysis': [
                "Would you like me to explain concepts in your weak areas?",
                "Should I generate practice questions for improvement?",
                "Would you like to take a diagnostic test?"
            ],
            'complex_request': [
                "Is there anything specific you'd like me to explain further?",
                "Would you like me to generate additional practice materials?",
                "Should I provide more detailed analysis?"
            ]
        }
        
        return suggestions.get(request_type, ["How else can I help you?"])
    
    def get_conversation_summary(self) -> Dict[str, Any]:
        """Get a summary of the current conversation"""
        
        if not self.conversation_history:
            return {"summary": "No conversation history available."}
        
        # Analyze conversation patterns
        request_types = [entry.get('request_type', 'unknown') for entry in self.conversation_history]
        agent_usage = {}
        
        for entry in self.conversation_history:
            agent = entry.get('context', {}).get('agent', 'unknown')
            agent_usage[agent] = agent_usage.get(agent, 0) + 1
        
        return {
            "total_interactions": len(self.conversation_history),
            "request_types": request_types,
            "agent_usage": agent_usage,
            "recent_topics": [entry.get('context', {}).get('topic', 'general') for entry in self.conversation_history[-5:]],
            "conversation_duration": self._calculate_conversation_duration()
        }
    
    def _calculate_conversation_duration(self) -> str:
        """Calculate the duration of the current conversation"""
        
        if len(self.conversation_history) < 2:
            return "Single interaction"
        
        first_time = datetime.fromisoformat(self.conversation_history[0]['timestamp'])
        last_time = datetime.fromisoformat(self.conversation_history[-1]['timestamp'])
        duration = last_time - first_time
        
        if duration.total_seconds() < 60:
            return f"{int(duration.total_seconds())} seconds"
        elif duration.total_seconds() < 3600:
            return f"{int(duration.total_seconds() // 60)} minutes"
        else:
            return f"{int(duration.total_seconds() // 3600)} hours"
    
    def clear_conversation_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        self.current_context = {}
        
        # Clear memory for all agents
        for agent in self.agents.values():
            agent.clear_context()
            agent.memory = [] 