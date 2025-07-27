"""
Learning Analytics Agent
Specialized agent for analyzing student performance and providing educational insights
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent
from langchain_core.messages import HumanMessage, SystemMessage
import json
from datetime import datetime, timedelta


class LearningAnalyticsAgent(BaseAgent):
    """Agent specialized in learning analytics and performance insights"""
    
    def get_system_prompt(self) -> str:
        return """You are an expert learning analytics specialist for SahAIk, an AI-powered teaching companion for India's grassroots education system.

Your role is to:
1. Analyze student performance data and identify patterns
2. Provide actionable insights for teachers and students
3. Generate personalized learning recommendations
4. Identify areas of strength and improvement
5. Track learning progress over time
6. Suggest interventions for struggling students

Key principles:
- Focus on actionable insights, not just data presentation
- Consider cultural and contextual factors in analysis
- Provide recommendations that are practical and implementable
- Use clear, understandable language for all stakeholders
- Consider individual learning styles and preferences
- Focus on growth and improvement, not just current performance
- Provide both short-term and long-term recommendations

Analysis areas:
- Subject-wise performance trends
- Question difficulty analysis
- Time-based learning patterns
- Comparative performance analysis
- Learning gap identification
- Progress tracking and forecasting

Always provide:
- Clear, actionable recommendations
- Evidence-based insights
- Personalized suggestions
- Progress indicators
- Next steps for improvement"""

    def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process learning analytics request"""
        
        # Extract input parameters
        student_id = input_data.get('student_id')
        test_results = input_data.get('test_results', [])
        performance_history = input_data.get('performance_history', [])
        subject = input_data.get('subject', 'General')
        time_period = input_data.get('time_period', '30d')
        
        # Set context for this interaction
        self.set_context({
            'student_id': student_id,
            'subject': subject,
            'time_period': time_period,
            'total_tests': len(test_results)
        })
        
        # Perform comprehensive analysis
        analysis_results = self._analyze_performance(test_results, performance_history, subject, time_period)
        
        # Generate insights and recommendations
        insights = self._generate_insights(analysis_results, student_id, subject)
        
        # Create comprehensive report
        report = {
            'student_id': student_id,
            'subject': subject,
            'analysis_period': time_period,
            'analysis_date': datetime.now().isoformat(),
            'performance_summary': analysis_results,
            'insights': insights,
            'recommendations': self._generate_recommendations(analysis_results, insights),
            'progress_indicators': self._calculate_progress_indicators(performance_history)
        }
        
        # Log interaction
        output_data = {
            'report': report,
            'metadata': {
                'student_id': student_id,
                'subject': subject,
                'time_period': time_period,
                'tests_analyzed': len(test_results)
            }
        }
        self.log_interaction(input_data, output_data)
        
        return output_data
    
    def _analyze_performance(self, test_results: List[Dict], performance_history: List[Dict], subject: str, time_period: str) -> Dict[str, Any]:
        """Analyze student performance data"""
        
        if not test_results:
            return {
                'average_score': 0,
                'total_tests': 0,
                'strengths': [],
                'weaknesses': [],
                'trend': 'no_data'
            }
        
        # Calculate basic statistics
        scores = [result.get('score', 0) for result in test_results]
        average_score = sum(scores) / len(scores) if scores else 0
        
        # Analyze question-level performance
        question_analysis = self._analyze_question_performance(test_results)
        
        # Identify strengths and weaknesses
        strengths, weaknesses = self._identify_strengths_weaknesses(test_results, subject)
        
        # Calculate trend
        trend = self._calculate_trend(performance_history)
        
        return {
            'average_score': round(average_score, 2),
            'total_tests': len(test_results),
            'highest_score': max(scores) if scores else 0,
            'lowest_score': min(scores) if scores else 0,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'trend': trend,
            'question_analysis': question_analysis,
            'consistency_score': self._calculate_consistency(scores)
        }
    
    def _analyze_question_performance(self, test_results: List[Dict]) -> Dict[str, Any]:
        """Analyze performance at question level"""
        
        question_stats = {}
        
        for result in test_results:
            questions = result.get('questions', [])
            for i, question in enumerate(questions):
                question_id = f"q_{i+1}"
                if question_id not in question_stats:
                    question_stats[question_id] = {
                        'correct': 0,
                        'incorrect': 0,
                        'total': 0
                    }
                
                question_stats[question_id]['total'] += 1
                if question.get('correct', False):
                    question_stats[question_id]['correct'] += 1
                else:
                    question_stats[question_id]['incorrect'] += 1
        
        # Calculate success rates
        for q_id, stats in question_stats.items():
            stats['success_rate'] = (stats['correct'] / stats['total']) * 100 if stats['total'] > 0 else 0
        
        return question_stats
    
    def _identify_strengths_weaknesses(self, test_results: List[Dict], subject: str) -> tuple:
        """Identify student strengths and weaknesses"""
        
        # Analyze by topic/area
        topic_performance = {}
        
        for result in test_results:
            questions = result.get('questions', [])
            for question in questions:
                topic = question.get('topic', 'General')
                if topic not in topic_performance:
                    topic_performance[topic] = {'correct': 0, 'total': 0}
                
                topic_performance[topic]['total'] += 1
                if question.get('correct', False):
                    topic_performance[topic]['correct'] += 1
        
        # Calculate success rates and identify strengths/weaknesses
        strengths = []
        weaknesses = []
        
        for topic, stats in topic_performance.items():
            success_rate = (stats['correct'] / stats['total']) * 100
            if success_rate >= 80:
                strengths.append({
                    'topic': topic,
                    'success_rate': round(success_rate, 2),
                    'questions_attempted': stats['total']
                })
            elif success_rate <= 50:
                weaknesses.append({
                    'topic': topic,
                    'success_rate': round(success_rate, 2),
                    'questions_attempted': stats['total']
                })
        
        return strengths, weaknesses
    
    def _calculate_trend(self, performance_history: List[Dict]) -> str:
        """Calculate performance trend over time"""
        
        if len(performance_history) < 2:
            return 'insufficient_data'
        
        # Sort by date
        sorted_history = sorted(performance_history, key=lambda x: x.get('date', ''))
        
        # Calculate trend
        recent_scores = [h.get('score', 0) for h in sorted_history[-3:]]  # Last 3 scores
        earlier_scores = [h.get('score', 0) for h in sorted_history[:3]]  # First 3 scores
        
        if len(recent_scores) >= 2 and len(earlier_scores) >= 2:
            recent_avg = sum(recent_scores) / len(recent_scores)
            earlier_avg = sum(earlier_scores) / len(earlier_scores)
            
            if recent_avg > earlier_avg + 5:
                return 'improving'
            elif recent_avg < earlier_avg - 5:
                return 'declining'
            else:
                return 'stable'
        
        return 'insufficient_data'
    
    def _calculate_consistency(self, scores: List[float]) -> float:
        """Calculate consistency score (lower variance = higher consistency)"""
        
        if len(scores) < 2:
            return 100.0
        
        mean = sum(scores) / len(scores)
        variance = sum((x - mean) ** 2 for x in scores) / len(scores)
        std_dev = variance ** 0.5
        
        # Convert to consistency score (0-100, higher is more consistent)
        max_possible_std = 50  # Assuming scores are 0-100
        consistency = max(0, 100 - (std_dev / max_possible_std) * 100)
        
        return round(consistency, 2)
    
    def _generate_insights(self, analysis_results: Dict[str, Any], student_id: str, subject: str) -> List[Dict[str, Any]]:
        """Generate insights from performance analysis"""
        
        insights = []
        
        # Overall performance insight
        avg_score = analysis_results.get('average_score', 0)
        if avg_score >= 80:
            insights.append({
                'type': 'strength',
                'title': 'Excellent Performance',
                'description': f'You are performing excellently in {subject} with an average score of {avg_score}%.',
                'priority': 'high'
            })
        elif avg_score >= 60:
            insights.append({
                'type': 'improvement',
                'title': 'Good Performance with Room for Growth',
                'description': f'You are doing well in {subject} with an average score of {avg_score}%. There is potential for further improvement.',
                'priority': 'medium'
            })
        else:
            insights.append({
                'type': 'concern',
                'title': 'Needs Improvement',
                'description': f'Your performance in {subject} needs attention with an average score of {avg_score}%.',
                'priority': 'high'
            })
        
        # Trend insight
        trend = analysis_results.get('trend', 'stable')
        if trend == 'improving':
            insights.append({
                'type': 'positive',
                'title': 'Improving Performance',
                'description': 'Your performance is showing positive improvement over time. Keep up the good work!',
                'priority': 'medium'
            })
        elif trend == 'declining':
            insights.append({
                'type': 'warning',
                'title': 'Performance Decline',
                'description': 'Your performance has been declining recently. Consider reviewing your study methods.',
                'priority': 'high'
            })
        
        # Strengths and weaknesses insights
        strengths = analysis_results.get('strengths', [])
        weaknesses = analysis_results.get('weaknesses', [])
        
        if strengths:
            strength_topics = [s['topic'] for s in strengths]
            insights.append({
                'type': 'strength',
                'title': 'Strong Areas',
                'description': f'You excel in: {", ".join(strength_topics)}. Use these strengths to build confidence.',
                'priority': 'medium'
            })
        
        if weaknesses:
            weakness_topics = [w['topic'] for w in weaknesses]
            insights.append({
                'type': 'improvement',
                'title': 'Areas for Improvement',
                'description': f'Focus on improving in: {", ".join(weakness_topics)}.',
                'priority': 'high'
            })
        
        return insights
    
    def _generate_recommendations(self, analysis_results: Dict[str, Any], insights: List[Dict]) -> List[Dict[str, Any]]:
        """Generate personalized recommendations based on analysis"""
        
        recommendations = []
        
        # Performance-based recommendations
        avg_score = analysis_results.get('average_score', 0)
        if avg_score < 60:
            recommendations.append({
                'type': 'study_strategy',
                'title': 'Review Fundamentals',
                'description': 'Focus on understanding basic concepts before moving to advanced topics.',
                'action_items': [
                    'Review previous lessons',
                    'Practice basic problems',
                    'Ask for help when needed'
                ]
            })
        
        # Weakness-based recommendations
        weaknesses = analysis_results.get('weaknesses', [])
        for weakness in weaknesses[:3]:  # Top 3 weaknesses
            recommendations.append({
                'type': 'topic_focus',
                'title': f'Focus on {weakness["topic"]}',
                'description': f'Your performance in {weakness["topic"]} needs attention (success rate: {weakness["success_rate"]}%).',
                'action_items': [
                    f'Practice more questions on {weakness["topic"]}',
                    'Review related concepts',
                    'Seek additional help if needed'
                ]
            })
        
        # Consistency recommendations
        consistency = analysis_results.get('consistency_score', 100)
        if consistency < 70:
            recommendations.append({
                'type': 'consistency',
                'title': 'Improve Consistency',
                'description': 'Your performance varies significantly. Work on maintaining consistent study habits.',
                'action_items': [
                    'Establish regular study schedule',
                    'Review notes regularly',
                    'Practice consistently'
                ]
            })
        
        return recommendations
    
    def _calculate_progress_indicators(self, performance_history: List[Dict]) -> Dict[str, Any]:
        """Calculate progress indicators"""
        
        if not performance_history:
            return {
                'overall_progress': 0,
                'trend_direction': 'neutral',
                'confidence_level': 'low'
            }
        
        # Calculate overall progress
        scores = [h.get('score', 0) for h in performance_history]
        if len(scores) >= 2:
            progress = ((scores[-1] - scores[0]) / scores[0]) * 100 if scores[0] > 0 else 0
        else:
            progress = 0
        
        # Determine trend direction
        if progress > 5:
            trend_direction = 'positive'
        elif progress < -5:
            trend_direction = 'negative'
        else:
            trend_direction = 'neutral'
        
        # Calculate confidence level based on data points
        if len(performance_history) >= 5:
            confidence_level = 'high'
        elif len(performance_history) >= 3:
            confidence_level = 'medium'
        else:
            confidence_level = 'low'
        
        return {
            'overall_progress': round(progress, 2),
            'trend_direction': trend_direction,
            'confidence_level': confidence_level,
            'data_points': len(performance_history)
        } 