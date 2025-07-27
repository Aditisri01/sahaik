"""
Base Agent Class for SahAIk Educational System
Provides common functionality for all specialized agents
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from langchain_core.language_models import BaseLLM
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
import os
import json
from datetime import datetime


class BaseAgent(ABC):
    """Base class for all SahAIk agents"""
    
    def __init__(self, model_name: str = "gemini-1.5-flash-latest"):
        self.model_name = model_name
        self.llm = self._initialize_llm()
        self.context = {}
        self.memory = []
        
    def _initialize_llm(self) -> BaseLLM:
        """Initialize the language model"""
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        return ChatGoogleGenerativeAI(
            model=self.model_name,
            google_api_key=api_key,
            temperature=0.7,
            max_output_tokens=2048
        )
    
    def add_to_memory(self, message: str, response: str, metadata: Dict[str, Any] = None):
        """Add interaction to agent memory"""
        memory_entry = {
            'timestamp': datetime.now().isoformat(),
            'message': message,
            'response': response,
            'metadata': metadata or {}
        }
        self.memory.append(memory_entry)
        
        # Keep only last 50 interactions to prevent memory bloat
        if len(self.memory) > 50:
            self.memory = self.memory[-50:]
    
    def get_memory_summary(self) -> str:
        """Get a summary of recent interactions"""
        if not self.memory:
            return "No previous interactions."
        
        recent = self.memory[-5:]  # Last 5 interactions
        summary = "Recent interactions:\n"
        for entry in recent:
            summary += f"- {entry['message'][:100]}... -> {entry['response'][:100]}...\n"
        return summary
    
    def set_context(self, context: Dict[str, Any]):
        """Set context for the agent"""
        self.context.update(context)
    
    def clear_context(self):
        """Clear agent context"""
        self.context = {}
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Return the system prompt for this agent"""
        pass
    
    @abstractmethod
    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input and return response"""
        pass
    
    def _call_llm(self, messages: List, **kwargs) -> str:
        """Make a call to the language model"""
        try:
            response = self.llm.invoke(messages, **kwargs)
            return response.content
        except Exception as e:
            print(f"Error calling LLM: {e}")
            return f"Sorry, I encountered an error: {str(e)}"
    
    def _create_messages(self, user_input: str, include_memory: bool = True) -> List:
        """Create messages for LLM call"""
        messages = [SystemMessage(content=self.get_system_prompt())]
        
        if include_memory and self.memory:
            memory_summary = self.get_memory_summary()
            messages.append(SystemMessage(content=f"Context from previous interactions:\n{memory_summary}"))
        
        if self.context:
            context_str = json.dumps(self.context, indent=2)
            messages.append(SystemMessage(content=f"Current context:\n{context_str}"))
        
        messages.append(HumanMessage(content=user_input))
        return messages
    
    def log_interaction(self, input_data: Dict[str, Any], output_data: Dict[str, Any]):
        """Log agent interaction for debugging and analytics"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'agent_type': self.__class__.__name__,
            'input': input_data,
            'output': output_data,
            'context': self.context.copy()
        }
        
        # In a production system, you'd save this to a database
        print(f"Agent Log: {json.dumps(log_entry, indent=2)}") 