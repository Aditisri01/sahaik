"""
Test Generator Agent
Specialized agent for creating educational tests and assessments
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent
from langchain_core.messages import HumanMessage, SystemMessage
import json


class TestGeneratorAgent(BaseAgent):
    """Agent specialized in generating educational tests and assessments"""
    
    def get_system_prompt(self) -> str:
        return """You are an expert test generator for SahAIk, an AI-powered teaching companion for India's grassroots education system.

Your role is to:
1. Create age-appropriate, engaging test questions
2. Generate questions that test understanding, not just memorization
3. Provide clear, unambiguous questions and answers
4. Match question difficulty to the specified grade level
5. Create culturally relevant and inclusive content
6. Ensure questions align with educational standards

Key principles:
- Questions should be clear and unambiguous
- Multiple choice options should be plausible but distinct
- Correct answers should be definitively correct
- Questions should test understanding, not just facts
- Use culturally relevant examples and contexts
- Ensure age-appropriate language and complexity
- Include a mix of difficulty levels within the specified range

Question types to generate:
- Multiple choice questions
- True/False questions
- Fill-in-the-blank questions
- Short answer questions (for higher grades)
- Problem-solving questions (for math/science)

Always provide:
- Clear question text
- Multiple choice options (A, B, C, D)
- Correct answer
- Brief explanation of the correct answer
- Difficulty level indication"""

    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process test generation request"""
        
        # Extract input parameters
        subject = input_data.get('subject', 'General')
        topic = input_data.get('topic', 'General')
        grade_level = input_data.get('grade_level', 'Class 1')
        difficulty = input_data.get('difficulty', 'medium')
        question_count = input_data.get('question_count', 5)
        language = input_data.get('language', 'en')
        
        # Set context for this interaction
        self.set_context({
            'subject': subject,
            'topic': topic,
            'grade_level': grade_level,
            'difficulty': difficulty,
            'language': language
        })
        
        # Generate test questions
        questions = self._generate_test_questions(subject, topic, grade_level, difficulty, question_count, language)
        
        # Create test structure
        test_data = {
            'title': f"{subject} Test - {topic}",
            'subject': subject,
            'topic': topic,
            'grade_level': grade_level,
            'difficulty': difficulty,
            'language': language,
            'questions': questions,
            'total_questions': len(questions),
            'estimated_time': len(questions) * 2  # 2 minutes per question
        }
        
        # Log interaction
        output_data = {
            'test': test_data,
            'metadata': {
                'subject': subject,
                'topic': topic,
                'grade_level': grade_level,
                'difficulty': difficulty,
                'language': language
            }
        }
        self.log_interaction(input_data, output_data)
        
        return output_data
    
    def _generate_test_questions(self, subject: str, topic: str, grade_level: str, difficulty: str, count: int, language: str) -> List[Dict[str, Any]]:
        """Generate test questions based on parameters"""
        
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
        
        prompt = f"""Generate {count} test questions for {subject} on the topic: {topic}

Grade Level: {grade_level}
Difficulty: {difficulty}
Language: {target_language}

Requirements:
1. Questions should be age-appropriate for {grade_level}
2. Difficulty level: {difficulty}
3. Questions should test understanding, not just memorization
4. Use culturally relevant examples where appropriate
5. Make questions clear and unambiguous
6. Provide 4 multiple choice options (A, B, C, D)
7. Ensure correct answer is definitively correct
8. Include brief explanations for correct answers

Format as JSON:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": [
        "A. Option A",
        "B. Option B", 
        "C. Option C",
        "D. Option D"
      ],
      "correct_answer": "A",
      "explanation": "Brief explanation of why this is correct",
      "difficulty": "{difficulty}",
      "topic": "{topic}"
    }}
  ]
}}

Make sure the questions are engaging, educational, and appropriate for {grade_level} students."""
        
        messages = self._create_messages(prompt, include_memory=False)
        response = self._call_llm(messages)
        
        try:
            # Try to parse JSON response
            parsed_response = json.loads(response)
            return parsed_response.get('questions', [])
        except json.JSONDecodeError:
            # Fallback to generating individual questions
            return self._generate_fallback_questions(subject, topic, grade_level, difficulty, count)
    
    def _generate_fallback_questions(self, subject: str, topic: str, grade_level: str, difficulty: str, count: int) -> List[Dict[str, Any]]:
        """Generate fallback questions if JSON parsing fails"""
        
        questions = []
        for i in range(count):
            question_data = {
                "question": f"Sample question {i+1} about {topic}",
                "options": [
                    "A. First option",
                    "B. Second option", 
                    "C. Third option",
                    "D. Fourth option"
                ],
                "correct_answer": "A",
                "explanation": f"This is a sample explanation for question {i+1}",
                "difficulty": difficulty,
                "topic": topic
            }
            questions.append(question_data)
        
        return questions
    
    def generate_adaptive_test(self, student_performance: Dict[str, Any], topic: str, subject: str) -> Dict[str, Any]:
        """Generate an adaptive test based on student performance"""
        
        # Analyze student performance to determine difficulty
        avg_score = student_performance.get('average_score', 70)
        recent_performance = student_performance.get('recent_scores', [])
        
        if avg_score >= 80:
            difficulty = 'hard'
        elif avg_score >= 60:
            difficulty = 'medium'
        else:
            difficulty = 'easy'
        
        # Generate questions with appropriate difficulty
        questions = self._generate_test_questions(subject, topic, 'adaptive', difficulty, 5, 'en')
        
        return {
            'test_type': 'adaptive',
            'difficulty': difficulty,
            'questions': questions,
            'estimated_time': len(questions) * 2,
            'adaptation_reason': f"Based on average score of {avg_score}%"
        }
    
    def validate_test_questions(self, questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate test questions for quality and appropriateness"""
        
        validation_results = {
            'total_questions': len(questions),
            'valid_questions': 0,
            'issues': [],
            'suggestions': []
        }
        
        for i, question in enumerate(questions):
            issues = []
            
            # Check for required fields
            if not question.get('question'):
                issues.append("Missing question text")
            if not question.get('options') or len(question['options']) != 4:
                issues.append("Must have exactly 4 options")
            if not question.get('correct_answer'):
                issues.append("Missing correct answer")
            
            # Check answer validity
            correct_answer = question.get('correct_answer', '')
            if correct_answer not in ['A', 'B', 'C', 'D']:
                issues.append("Correct answer must be A, B, C, or D")
            
            if issues:
                validation_results['issues'].append({
                    'question_index': i,
                    'issues': issues
                })
            else:
                validation_results['valid_questions'] += 1
        
        # Add suggestions for improvement
        if validation_results['valid_questions'] < len(questions):
            validation_results['suggestions'].append("Review questions with issues before using")
        
        return validation_results 