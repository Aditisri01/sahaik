"""
Educational Assistant Agent
Specialized agent for providing educational help, explanations, and learning guidance
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent
from langchain_core.messages import HumanMessage, SystemMessage
import json


class EducationalAssistantAgent(BaseAgent):
    """Agent specialized in educational assistance and learning support"""
    
    def get_system_prompt(self) -> str:
        return """You are an expert educational assistant for SahAIk, an AI-powered teaching companion for India's grassroots education system.

Your role is to:
1. Provide clear, age-appropriate explanations for educational concepts
2. Help students understand their mistakes and learn from them
3. Offer step-by-step guidance for problem-solving
4. Adapt your teaching style to the student's grade level and language
5. Be encouraging and supportive while maintaining educational rigor
6. Use examples and analogies that are culturally relevant to Indian students

Key principles:
- Always respond in the specified language (default: English)
- Match complexity to the student's grade level
- Use concrete examples and visual analogies
- Encourage critical thinking and problem-solving
- Be patient and supportive
- Avoid giving direct answers, guide students to discover them
- Use culturally relevant examples when possible

Format your responses in a clear, structured manner with:
- Brief explanations
- Step-by-step guidance
- Encouraging feedback
- Practice suggestions"""

    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process educational assistance request"""
        
        # Extract input parameters
        student_class = input_data.get('class', 'Class 1')
        subject = input_data.get('subject', 'General')
        topic = input_data.get('topic', 'General')
        language = input_data.get('language', 'en')
        message = input_data.get('message', '')
        student_level = input_data.get('student_level', 'beginner')
        
        # Set context for this interaction
        self.set_context({
            'student_class': student_class,
            'subject': subject,
            'topic': topic,
            'language': language,
            'student_level': student_level
        })
        
        # Create the prompt with context
        prompt = self._create_educational_prompt(message, student_class, subject, topic, language, student_level)
        
        # Get response from LLM
        messages = self._create_messages(prompt)
        response = self._call_llm(messages)
        
        # Add to memory
        self.add_to_memory(message, response, {
            'class': student_class,
            'subject': subject,
            'topic': topic,
            'language': language
        })
        
        # Log interaction
        output_data = {
            'reply': response,
            'context': {
                'class': student_class,
                'subject': subject,
                'topic': topic,
                'language': language
            }
        }
        self.log_interaction(input_data, output_data)
        
        return output_data
    
    def _create_educational_prompt(self, message: str, student_class: str, subject: str, topic: str, language: str, student_level: str) -> str:
        """Create a context-aware educational prompt"""
        
        language_map = {
            'en': 'English',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu',
            'bn': 'Bengali',
            'gu': 'Gujarati',
            'ml': 'Malayalam',
            'mr': 'Marathi',
            'pa': 'Punjabi',
            'kn': 'Kannada',
            'or': 'Odia',
            'ur': 'Urdu'
        }
        
        target_language = language_map.get(language, 'English')
        
        prompt = f"""You are helping a {student_class} student with {subject} (topic: {topic}).

Student level: {student_level}
Target language: {target_language}

Student's question/message: {message}

Please provide a helpful, educational response that:
1. Addresses the student's specific question or concern
2. Uses age-appropriate language and complexity
3. Provides clear explanations with examples
4. Encourages learning and understanding
5. Responds in {target_language}

Make your response engaging, supportive, and educational."""
        
        return prompt
    
    def provide_learning_tip(self, question: str, correct_answer: str, student_answer: str, context: Dict[str, Any]) -> str:
        """Provide a specific learning tip for a wrong answer"""
        
        prompt = f"""A student got this question wrong and needs help learning from their mistake.

Question: {question}
Correct Answer: {correct_answer}
Student's Answer: {student_answer}
Context: {context}

Please provide a helpful learning tip that:
1. Explains why their answer was incorrect
2. Shows the correct approach
3. Provides a simple explanation they can understand
4. Encourages them to keep learning
5. Suggests a way to practice this concept

Keep it brief, encouraging, and educational."""
        
        messages = self._create_messages(prompt, include_memory=False)
        response = self._call_llm(messages)
        
        return response
    
    def generate_practice_questions(self, topic: str, difficulty: str, count: int = 3) -> List[Dict[str, Any]]:
        """Generate practice questions for a topic"""
        
        prompt = f"""Generate {count} practice questions for the topic: {topic}
Difficulty level: {difficulty}

For each question, provide:
1. A clear, age-appropriate question
2. Multiple choice options (A, B, C, D)
3. The correct answer
4. A brief explanation of why it's correct

Format as JSON:
{{
  "questions": [
    {{
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "A",
      "explanation": "..."
    }}
  ]
}}"""
        
        messages = self._create_messages(prompt, include_memory=False)
        response = self._call_llm(messages)
        
        try:
            # Try to parse JSON response
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback to structured text
            return {
                "questions": [
                    {
                        "question": f"Practice question about {topic}",
                        "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
                        "correct_answer": "A",
                        "explanation": "This is a practice question to help you learn."
                    }
                ]
            } 