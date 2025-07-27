import os
import hashlib
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image
import pytesseract
from googletrans import Translator
from wordcloud import WordCloud
import io
import google.generativeai as genai
import uuid
import json as pyjson
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
import re
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from db import db
import time
from flask import send_file
from google.cloud import texttospeech
import tempfile
import traceback
from firestore_service import firestore_service

# Import agentic architecture
try:
    from agents.agent_service import agent_service
    AGENTIC_ARCHITECTURE_ENABLED = True
    print("✅ Agentic architecture enabled")
except ImportError as e:
    AGENTIC_ARCHITECTURE_ENABLED = False
    print(f"⚠️ Agentic architecture not available: {e}")
# --- suvrat_sahAIk feature imports ---
from flask import session, send_from_directory
from flask_cors import CORS as FlaskCORS
# Import helpers if available (user must copy these files):

from profanity_filter import filter_profanity
from gemini_client import get_gemini_response
from learning_curator import LearningCurator, text_to_speech_file, google_text_to_speech_file
from diagram_generator import create_diagram_endpoint
from reading_utils import generate_passage, evaluate_reading

import os
import json

tests_file = 'tests.json'
responses_file = 'responses.json'

tests = {}  # test_id: {class, subject, topic, questions, created_by, ...}
responses = {}  # test_id: {student_id: {answers, score}}

# Translation cache to avoid repeated translations
translation_cache = {}

def load_translation_cache():
    """Load translation cache from file"""
    global translation_cache
    cache_file = 'translation_cache.json'
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                translation_cache = pyjson.load(f)
            print(f"📂 DEBUG: Loaded {len(translation_cache)} cached translations from file")
        except Exception as e:
            print(f"❌ DEBUG: Error loading cache: {e}")
            translation_cache = {}

def save_translation_cache():
    """Save translation cache to file"""
    cache_file = 'translation_cache.json'
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            pyjson.dump(translation_cache, f, ensure_ascii=False, indent=2)
        print(f"💾 DEBUG: Saved {len(translation_cache)} translations to cache file")
    except Exception as e:
        print(f"❌ DEBUG: Error saving cache: {e}")

# Load cache on startup
load_translation_cache()

def save_responses():
    with open(responses_file, 'w') as f:
        pyjson.dump(responses, f)

def load_responses():
    global responses
    if os.path.exists(responses_file):
        with open(responses_file, 'r') as f:
            responses.update(pyjson.load(f))

# Load cache on startup
load_translation_cache()
load_responses()

# Example user store (replace with DB in production)
users = {
    "teacher1": {"password": generate_password_hash("teachpass"), "role": "teacher"},
    "student1": {"password": generate_password_hash("studpass"), "role": "student"},
}

def save_tests():
    with open(tests_file, 'w') as f:
        pyjson.dump(tests, f)

def load_tests():
    global tests
    if os.path.exists(tests_file):
        with open(tests_file, 'r') as f:
            tests.update(pyjson.load(f))

load_tests()

def get_cache_key(text, language):
    """Generate a cache key for translation"""
    cache_key = hashlib.md5(f"{text}:{language}".encode()).hexdigest()
    print(f"🔑 DEBUG: Generated cache key: {cache_key[:8]}... for text: '{text[:30]}...' → {language}")
    return cache_key

def batch_translate(texts, language):
    """Translate multiple texts in batch to reduce API calls"""
    if not texts:
        return []
    
    print(f"🔍 DEBUG: Starting batch translation for {len(texts)} texts to {language}")
    start_time = datetime.now()
    
    # Check cache first
    cached_results = []
    texts_to_translate = []
    indices_to_translate = []
    
    for i, text in enumerate(texts):
        cache_key = get_cache_key(text, language)
        if cache_key in translation_cache:
            print(f"✅ DEBUG: Cache HIT for text {i+1}: '{text[:30]}...'")
            cached_results.append((i, translation_cache[cache_key]))
        else:
            print(f"❌ DEBUG: Cache MISS for text {i+1}: '{text[:30]}...'")
            texts_to_translate.append(text)
            indices_to_translate.append(i)
    
    cache_hits = len(cached_results)
    cache_misses = len(texts_to_translate)
    print(f"📊 DEBUG: Cache stats - Hits: {cache_hits}, Misses: {cache_misses}")
    
    # Translate only uncached texts
    if texts_to_translate:
        print(f"🚀 DEBUG: Translating {len(texts_to_translate)} uncached texts individually (batch approach failed)")
        # Use individual translation for reliability
        for i, text in enumerate(texts_to_translate):
            try:
                individual_start = datetime.now()
                translated = translator.translate(text, dest=language)
                individual_end = datetime.now()
                individual_duration = (individual_end - individual_start).total_seconds()
                print(f"🔄 DEBUG: Individual translation {i+1} took {individual_duration:.2f}s: '{text[:30]}...'")
                
                cache_key = get_cache_key(text, language)
                translation_cache[cache_key] = translated.text
                print(f"💾 DEBUG: Cached translation {i+1}: '{text[:30]}...' → '{translated.text[:30]}...'")
                cached_results.append((indices_to_translate[i], translated.text))
            except Exception as e2:
                print(f"❌ DEBUG: Individual translation error: {e2}")
                cached_results.append((indices_to_translate[i], text))  # Keep original
        
        # Save cache to file after adding new translations
        if texts_to_translate:
            save_translation_cache()
    else:
        print(f"🎉 DEBUG: All texts found in cache! No API calls needed.")
    
    # Sort by original index and return only the translated texts
    cached_results.sort(key=lambda x: x[0])
    end_time = datetime.now()
    total_duration = (end_time - start_time).total_seconds()
    print(f"⏱️ DEBUG: Total batch translation completed in {total_duration:.2f} seconds")
    print(f"📈 DEBUG: Performance: {len(texts)} texts processed, {cache_hits} from cache, {cache_misses} from API")
    
    return [result[1] for result in cached_results]

app = Flask(__name__)
app.secret_key = 'dev_secret_key_1234567890'  # Change to a secure random value in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sahaik.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import models after db and app are set up
from models import User

db.init_app(app)
bcrypt = Bcrypt(app)

CORS(app)
translator = Translator()

# --- Ensure DB and tables are always created on startup ---
import os
with app.app_context():
    db.create_all()

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print('ERROR: GEMINI_API_KEY environment variable not set. Gemini features will not work.')

genai.configure(api_key=GEMINI_API_KEY)

create_diagram_endpoint(app)

@app.route('/')
def root():
    """Root endpoint for health check"""
    return jsonify({
        "status": "ok",
        "message": "SahAIk Backend API is running",
        "version": "1.0.1",
        "firestore": "enabled",
        "agentic_architecture": AGENTIC_ARCHITECTURE_ENABLED
    })

@app.route('/process', methods=['POST'])
def process_image():
    if 'image' not in request.files or 'language' not in request.form:
        return jsonify({'error': 'Image file and language are required.'}), 400
    image_file = request.files['image']
    language = request.form['language']
    
    # Save image temporarily
    img = Image.open(image_file.stream)
    
    # OCR
    extracted_text = pytesseract.image_to_string(img)
    
    # Translation
    translated = translator.translate(extracted_text, dest=language)
    translated_text = translated.text
    
    # Word Cloud
    wc = WordCloud(width=800, height=400, background_color='white').generate(translated_text)
    img_io = io.BytesIO()
    wc.to_image().save(img_io, 'PNG')
    img_io.seek(0)
    
    # Return results
    response = {
        'extracted_text': extracted_text,
        'translated_text': translated_text
    }
    # Save word cloud image to a temp file for download
    wordcloud_path = 'wordcloud.png'
    wc.to_file(wordcloud_path)
    response['wordcloud_url'] = '/wordcloud'
    return jsonify(response)

@app.route('/wordcloud')
def get_wordcloud():
    return send_file('wordcloud.png', mimetype='image/png')

@app.route('/eduassistant', methods=['POST'])
def eduassistant():
    data = request.get_json()
    student_class = data.get('class')
    subject = data.get('subject')
    topic = data.get('topic')
    language = data.get('language', 'en')
    message = data.get('message')
    if not GEMINI_API_KEY:
        return jsonify({'reply': 'Gemini API key not set on server.'}), 500
    genai.configure(api_key=GEMINI_API_KEY)

    # Adjust tone and language based on class
    class_num = int(''.join(filter(str.isdigit, student_class))) if any(char.isdigit() for char in student_class) else 10
    if class_num <= 5:
        tone = "Use very simple words, short sentences, and a friendly, encouraging tone."
    elif class_num <= 8:
        tone = "Use simple language, clear explanations, and a supportive tone."
    elif class_num <= 10:
        tone = "Use clear, concise language and provide practical examples."
    else:
        tone = "Use advanced concepts, detailed explanations, and a respectful, academic tone."

    print(f"Language requested: {language}")
    # Language instruction
    if language == 'en':
        lang_instruction = "You must answer ONLY in English. Do NOT use any Hindi or other language words, even for single words."
    else:
        lang_instruction = f"You must answer ONLY in {language} language. Do NOT use any English or other language words, even for single words."
    structure_instruction = "Make your answer comprehensive, step-by-step, and well-structured. Use bullet points or numbered lists wherever possible, especially for steps, key points, or explanations. Avoid long paragraphs."

    prompt = f"You are an educational assistant for Indian school students. The student is in {student_class} and wants to learn about {subject}. The specific topic is: {topic}. {tone} {lang_instruction} {structure_instruction} Answer their doubt below.\n\nStudent: {message}\n\nAssistant:"
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        reply = response.text.strip()
    except Exception as e:
        reply = f"Sorry, there was an error contacting Gemini AI: {str(e)}"
    return jsonify({'reply': reply})

@app.route('/api/eduassistant', methods=['POST', 'OPTIONS'])
def api_eduassistant():
    if request.method == 'OPTIONS':
        return ('', 204)
    return eduassistant()

@app.route('/create_test', methods=['POST'])
def create_test():
    data = request.get_json()
    test_id = str(uuid.uuid4())
    test = {
        'test_id': test_id,
        'class': data['class'],
        'subject': data['subject'],
        'topic': data['topic'],
        'questions': data['questions'],
        'created_at': datetime.now().isoformat()
    }
    tests[test_id] = test
    save_tests()
    return jsonify({'test_id': test_id})

@app.route('/generate_test_ai', methods=['POST'])
def generate_test_ai():
    data = request.get_json()
    num_questions = data.get('num_questions', 5)
    question_type = data.get('question_type', 'mixed')
    content = data.get('content')
    # Use Gemini to generate questions for the topic/class/subject or content
    if question_type == 'mcq':
        type_instruction = 'All questions must be MCQ.'
    elif question_type == 'short':
        type_instruction = 'All questions must be short answer.'
    else:
        type_instruction = 'Mix of MCQ and short answer.'
    if content and len(content.strip()) > 10:
        prompt = (
            f"You are an expert teacher. Read the following content and generate {num_questions} exam questions for {data['subject']} for {data['class']}. "
            f"{type_instruction} Respond ONLY with a valid JSON array in this format: "
            "[{'q': question, 'type': 'mcq'/'short', 'options': [if mcq], 'answer': correct answer}]. "
            "Do not include any explanation or extra text.\n\nCONTENT:\n" + content.strip()
        )
    else:
        prompt = (
            f"Generate {num_questions} exam questions for {data['subject']} topic '{data['topic']}' for {data['class']}. "
            f"{type_instruction} "
            "Respond ONLY with a valid JSON array in this format: "
            "[{'q': question, 'type': 'mcq'/'short', 'options': [if mcq], 'answer': correct answer}]. "
            "Do not include any explanation or extra text."
        )
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        import json as pyjson
        raw = response.text.strip()
        # Remove Markdown code block markers if present
        if raw.startswith('```'):
            raw = '\n'.join(line for line in raw.splitlines() if not line.strip().startswith('```'))
        try:
            questions = pyjson.loads(raw)
        except Exception as e:
            return jsonify({'error': f'Invalid JSON from AI. Raw response: {raw}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'questions': questions})

@app.route('/list_tests', methods=['GET'])
def list_tests():
    class_name = request.args.get('class')
    subject = request.args.get('subject')
    print('DEBUG: list_tests called with class:', class_name, 'subject:', subject)
    print('DEBUG: All tests:', tests)
    
    # If no filters provided, return all tests
    if not class_name and not subject:
        filtered = list(tests.values())
    else:
        # Apply filters if provided
        filtered = []
        for t in tests.values():
            matches_class = not class_name or t.get('class') == class_name
            matches_subject = not subject or t.get('subject') == subject
            if matches_class and matches_subject:
                filtered.append(t)
    
    print('DEBUG: Filtered tests:', filtered)
    return jsonify({'tests': filtered})

@app.route('/get_tests', methods=['GET'])
def get_tests():
    class_name = request.args.get('class')
    subject = request.args.get('subject')
    print('DEBUG: get_tests called with class:', class_name, 'subject:', subject)
    print('DEBUG: All tests:', tests)
    
    # If no filters provided, return all tests
    if not class_name and not subject:
        filtered = list(tests.values())
    else:
        # Apply filters if provided
        filtered = []
        for t in tests.values():
            matches_class = not class_name or t.get('class') == class_name
            matches_subject = not subject or t.get('subject') == subject
            if matches_class and matches_subject:
                filtered.append(t)
    
    print('DEBUG: Filtered tests:', filtered)
    return jsonify({'tests': filtered})

# Add a new endpoint to get all tests without filtering
@app.route('/api/all_tests', methods=['GET'])
def get_all_tests():
    print('DEBUG: get_all_tests called')
    print('DEBUG: All tests:', tests)
    all_tests = list(tests.values())
    print('DEBUG: Returning all tests:', len(all_tests))
    return jsonify({'tests': all_tests})

# Add endpoint for published tests (same as all_tests but with different name)
@app.route('/api/published_tests', methods=['GET'])
def get_published_tests():
    print('DEBUG: get_published_tests called')
    try:
        # Get all tests from Firestore
        all_tests = firestore_service.get_all_tests()
        tests_list = list(all_tests.values())
        
        # Filter out tests with null values
        filtered_tests = []
        for test in tests_list:
            if test.get('class') and test.get('subject') and test.get('test_id'):
                filtered_tests.append(test)
        
        print('DEBUG: Returning published tests from Firestore:', len(filtered_tests))
        return jsonify({'tests': filtered_tests})
    except Exception as e:
        print(f"Error getting published tests from Firestore: {e}")
        return jsonify({'tests': []})

# Add endpoint for available tests (same as all_tests but with different name)
@app.route('/api/available_tests', methods=['GET'])
def get_available_tests():
    print('DEBUG: get_available_tests called')
    try:
        # Get all tests from Firestore
        all_tests = firestore_service.get_all_tests()
        tests_list = list(all_tests.values())
        
        # Filter out tests with null values
        filtered_tests = []
        for test in tests_list:
            if test.get('class') and test.get('subject') and test.get('test_id'):
                filtered_tests.append(test)
        
        print('DEBUG: Returning available tests from Firestore:', len(filtered_tests))
        return jsonify({'tests': filtered_tests})
    except Exception as e:
        print(f"Error getting available tests from Firestore: {e}")
        return jsonify({'tests': []})

@app.route('/get_test/<test_id>', methods=['GET'])
def get_test(test_id):
    endpoint_start = time.perf_counter()
    test = firestore_service.get_test_by_id(test_id)
    if not test:
        return jsonify({'error': 'Test not found'}), 404
    
    # Get language parameter from query string
    language = request.args.get('language', 'en')
    print(f"DEBUG: get_test called with test_id: {test_id}, language: {language}")
    
    # If language is not English, translate the test content
    if language != 'en':
        try:
            print(f"🌐 DEBUG: ===== TRANSLATION PROCESS START =====")
            print(f"🌐 DEBUG: Translating test '{test_id}' to language: {language}")
            print(f"🌐 DEBUG: Test has {len(test['questions'])} questions")
            
            # Always use the original test data from Firestore, not modified data
            original_test = firestore_service.get_test_by_id(test_id)
            translated_test = original_test.copy()
            translated_test['questions'] = []
            
            # Collect all texts to translate in batch
            all_texts = []
            text_mapping = []  # (question_index, field_type, text_index)
            
            print(f"📋 DEBUG: Collecting all texts for translation...")
            for i, question in enumerate(original_test['questions']):
                print(f"📝 DEBUG: Processing question {i+1}")
                
                if 'q' in question:
                    all_texts.append(question['q'])
                    text_mapping.append((i, 'q', len(all_texts) - 1))
                    print(f"   📄 Question text: '{question['q'][:50]}...'")
                
                if 'answer' in question:
                    all_texts.append(question['answer'])
                    text_mapping.append((i, 'answer', len(all_texts) - 1))
                    print(f"   ✅ Answer text: '{question['answer'][:50]}...'")
                
                if 'options' in question:
                    print(f"   🎯 Options count: {len(question['options'])}")
                    for j, option in enumerate(question['options']):
                        all_texts.append(option)
                        text_mapping.append((i, f'option_{j}', len(all_texts) - 1))
                        print(f"      Option {j+1}: '{option[:30]}...'")
            
            print(f"📊 DEBUG: Total texts collected: {len(all_texts)}")
            print(f"📊 DEBUG: Text mapping entries: {len(text_mapping)}")
            
            # Profile cache lookup and translation
            cache_start = time.perf_counter()
            translation_start = datetime.now()
            translated_texts = batch_translate(all_texts, language)
            translation_end = datetime.now()
            cache_end = time.perf_counter()
            translation_duration = (translation_end - translation_start).total_seconds()
            print(f"✅ DEBUG: Batch translation completed in {translation_duration:.2f} seconds")
            print(f"⏱️ PROFILE: Cache lookup + translation: {(cache_end - cache_start):.4f} seconds")
            
            # Reconstruct the test with translated content
            print(f"🔧 DEBUG: Reconstructing test with translated content...")
            reconstruction_start = time.perf_counter()
            for i, question in enumerate(original_test['questions']):
                print(f"🔧 DEBUG: Reconstructing question {i+1}")
                translated_question = question.copy()
                # Apply translations
                for q_idx, field_type, text_idx in text_mapping:
                    if q_idx == i:
                        if field_type == 'q':
                            translated_question['q'] = translated_texts[text_idx]
                            print(f"   📄 Applied question translation: '{translated_texts[text_idx][:50]}...'")
                        elif field_type == 'answer':
                            translated_question['answer'] = translated_texts[text_idx]
                            print(f"   ✅ Applied answer translation: '{translated_texts[text_idx][:50]}...'")
                        elif field_type.startswith('option_'):
                            option_idx = int(field_type.split('_')[1])
                            if 'options' not in translated_question:
                                translated_question['options'] = question['options'].copy()
                            translated_question['options'][option_idx] = translated_texts[text_idx]
                            print(f"   🎯 Applied option {option_idx+1} translation: '{translated_texts[text_idx][:30]}...'")
                translated_test['questions'].append(translated_question)
            reconstruction_end = time.perf_counter()
            print(f"⏱️ PROFILE: Reconstruction: {(reconstruction_end - reconstruction_start):.4f} seconds")
            total_endpoint_time = time.perf_counter() - endpoint_start
            print(f"⏱️ PROFILE: Total /get_test endpoint time: {total_endpoint_time:.4f} seconds")
            print(f"✅ DEBUG: Test reconstruction completed in {(reconstruction_end - reconstruction_start):.2f} seconds")
            print(f"⏱️ DEBUG: Total translation process: {translation_duration:.2f} seconds")
            print(f"🌐 DEBUG: ===== TRANSLATION PROCESS END =====")
            return jsonify(translated_test)
        except Exception as e:
            print(f"Translation error: {e}")
            # If translation fails, return original test
            return jsonify(test)
    else:
        print(f"DEBUG: No translation needed, returning original test")
    total_endpoint_time = time.perf_counter() - endpoint_start
    print(f"⏱️ PROFILE: Total /get_test endpoint time: {total_endpoint_time:.4f} seconds (no translation)")
    return jsonify(test)

@app.route('/submit_test', methods=['POST'])
def submit_test():
    data = request.get_json()
    test_id = data['test_id']
    student_id = data['student_id']
    answers = data['answers']
    language = data.get('language', 'en')
    
    test = firestore_service.get_test_by_id(test_id)
    if not test:
        return jsonify({'error': 'Test not found'}), 404
    
    # Score all questions
    def normalize_answer(ans):
        if not isinstance(ans, str):
            return ''
        return re.sub(r'\W+', '', ans.strip().lower())

    score = 0
    wrong_answers = []
    
    for i, (q, a) in enumerate(zip(test['questions'], answers)):
        correct = normalize_answer(q.get('answer', ''))
        given = normalize_answer(a)
        
        # If the test was taken in a different language, try to translate the given answer back to English for comparison
        if language != 'en' and given:
            try:
                # Check cache first
                cache_key = get_cache_key(given, 'en')
                if cache_key in translation_cache:
                    translated_given_text = translation_cache[cache_key]
                else:
                    # Translate the given answer back to English for comparison
                    translated_given = translator.translate(given, dest='en')
                    translated_given_text = translated_given.text
                    # Cache the result
                    translation_cache[cache_key] = translated_given_text
                    save_translation_cache()
                
                given = normalize_answer(translated_given_text)
            except Exception as e:
                print(f"Translation error for answer: {e}")
                # If translation fails, use original answer
        
        if correct == given:
            score += 1
        else:
            wrong_answers.append({
                'question_index': i,
                'question': q.get('q', ''),
                'correct_answer': q.get('answer', ''),
                'student_answer': a
            })
    
    # Calculate percentage
    total_questions = len(test['questions'])
    percentage = (score / total_questions) * 100
    
    # Generate encouraging remark based on score
    if percentage >= 90:
        remark = "Excellent work! You've mastered this topic. Keep up the great learning!"
    elif percentage >= 80:
        remark = "Great job! You have a solid understanding of this material. Keep practicing!"
    elif percentage >= 70:
        remark = "Good effort! You're on the right track. Review the concepts and try again!"
    elif percentage >= 60:
        remark = "Not bad! You're making progress. Focus on the areas you found challenging."
    else:
        remark = "Don't worry! Learning takes time. Review the material and try again. You can do it!"
    
    # Generate AI suggestions for wrong answers
    ai_suggestions = []
    if wrong_answers:
        try:
            # Create a prompt for AI suggestions
            suggestions_prompt = f"""
            A student got {score} out of {total_questions} questions correct on a {test.get('subject', 'subject')} test about {test.get('topic', 'topic')}.
            
            Here are the questions they got wrong:
            """
            
            for wrong in wrong_answers:
                suggestions_prompt += f"""
                Question {wrong['question_index'] + 1}: {wrong['question']}
                Correct Answer: {wrong['correct_answer']}
                Student's Answer: {wrong['student_answer']}
                """
            
            suggestions_prompt += """
            For each wrong answer, provide:
            1. A clear explanation of why the student's answer is incorrect
            2. The correct solution with step-by-step reasoning
            3. A helpful tip to remember this concept
            4. An encouraging message to keep learning
            
            Format each suggestion as:
            "❌ Your Answer: [student's answer] is incorrect because [explanation]
            ✅ Correct Answer: [correct answer] 
            💡 Solution: [step-by-step explanation]
            🎯 Tip: [helpful tip to remember]
            💪 Keep going: [encouraging message]"
            
            Make each suggestion educational, clear, and motivating.
            """
            
            # Use Gemini API to generate suggestions
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            model = genai.GenerativeModel('gemini-pro')
            
            response = model.generate_content(suggestions_prompt)
            if response and hasattr(response, 'text'):
                # Parse the response and extract suggestions
                suggestions_text = response.text
                # Split by lines and filter out empty ones
                suggestions = [s.strip() for s in suggestions_text.split('\n') if s.strip() and not s.startswith('Question')]
                ai_suggestions = suggestions[:len(wrong_answers)]  # Limit to number of wrong answers
            else:
                ai_suggestions = ["Keep practicing! Review the material and try again."] * len(wrong_answers)
                
        except Exception as e:
            print(f"Error generating AI suggestions: {e}")
            ai_suggestions = ["Keep practicing! Review the material and try again."] * len(wrong_answers)
    
    # Save response to Firestore
    response_data = {
        'test_id': test_id,
        'student_id': student_id,
        'answers': answers, 
        'score': score,
        'percentage': percentage,
        'timestamp': datetime.now().isoformat()
    }
    firestore_service.submit_response(response_data)
    
    # Translate remark if needed
    translated_remark = remark
    if language != 'en':
        try:
            translated_remark = translator.translate(remark, dest=language).text
        except Exception as e:
            print(f"Error translating remark: {e}")
    
    return jsonify({
        'score': score,
        'total_questions': total_questions,
        'percentage': percentage,
        'remark': remark,
        'translated_remark': translated_remark,
        'ai_suggestions': ai_suggestions
    })

@app.route('/submit_answers/<test_id>', methods=['POST'])
def submit_answers(test_id):
    data = request.get_json()
    student_id = data['student_id']
    answers = data['answers']  # [{q, answer}]
    language = data.get('language', 'en')
    test = tests.get(test_id)
    if not test:
        return jsonify({'error': 'Test not found'}), 404
    
    # Score all questions
    def normalize_answer(ans):
        if not isinstance(ans, str):
            return ''
        return re.sub(r'\W+', '', ans.strip().lower())

    score = 0
    for q, a in zip(test['questions'], answers):
        correct = normalize_answer(q.get('answer', ''))
        given = normalize_answer(a.get('answer', ''))
        
        # If the test was taken in a different language, try to translate the given answer back to English for comparison
        if language != 'en' and given:
            print(f"🔄 DEBUG: Translating answer from {language} to English: '{given}'")
            try:
                # Check cache first
                cache_key = get_cache_key(given, 'en')
                if cache_key in translation_cache:
                    translated_given_text = translation_cache[cache_key]
                    print(f"✅ DEBUG: Answer translation cache HIT: '{given}' → '{translated_given_text}'")
                else:
                    print(f"❌ DEBUG: Answer translation cache MISS: '{given}'")
                    # Translate the given answer back to English for comparison
                    answer_translation_start = datetime.now()
                    translated_given = translator.translate(given, dest='en')
                    answer_translation_end = datetime.now()
                    answer_translation_duration = (answer_translation_end - answer_translation_start).total_seconds()
                    translated_given_text = translated_given.text
                    print(f"⚡ DEBUG: Answer translation took {answer_translation_duration:.2f}s: '{given}' → '{translated_given_text}'")
                    # Cache the result
                    translation_cache[cache_key] = translated_given_text
                    print(f"💾 DEBUG: Cached answer translation")
                    # Save cache to file
                    save_translation_cache()
                
                given = normalize_answer(translated_given_text)
                print(f"🔍 DEBUG: Normalized answer: '{given}'")
            except Exception as e:
                print(f"❌ DEBUG: Translation error for answer: {e}")
                # If translation fails, use original answer
        
        if correct == given:
            score += 1
    
    if test_id not in responses:
        responses[test_id] = {}
    responses[test_id][student_id] = {'answers': answers, 'score': score}
    save_responses()
    return jsonify({'score': score})

@app.route('/get_responses/<test_id>', methods=['GET'])
def get_responses(test_id):
    try:
        # Get responses from Firestore
        responses_data = firestore_service.get_responses_by_test_id(test_id)
        
        # Get test details
        test_data = firestore_service.get_test_by_id(test_id)
        
        # Calculate statistics
        stats = {
            'total_responses': len(responses_data),
            'average_score': 0,
            'highest_score': 0,
            'lowest_score': 0,
            'pass_rate': 0,
            'question_analysis': {},
            'student_performance': []
        }
        
        if responses_data and test_data:
            scores = []
            total_questions = len(test_data.get('questions', []))
            
            for student_id, response in responses_data.items():
                score = 0
                answers = response.get('answers', [])
                
                # Calculate score
                for i, answer in enumerate(answers):
                    if i < total_questions:
                        correct_answer = test_data['questions'][i].get('answer', '')
                        if str(answer).lower().strip() == str(correct_answer).lower().strip():
                            score += 1
                
                percentage = (score / total_questions * 100) if total_questions > 0 else 0
                scores.append(percentage)
                
                stats['student_performance'].append({
                    'student_id': student_id,
                    'score': score,
                    'total_questions': total_questions,
                    'percentage': round(percentage, 2),
                    'timestamp': response.get('timestamp', ''),
                    'passed': percentage >= 60
                })
            
            # Calculate overall statistics
            if scores:
                stats['average_score'] = round(sum(scores) / len(scores), 2)
                stats['highest_score'] = round(max(scores), 2)
                stats['lowest_score'] = round(min(scores), 2)
                stats['pass_rate'] = round((sum(1 for s in scores if s >= 60) / len(scores)) * 100, 2)
            
            # Question-wise analysis
            if test_data.get('questions'):
                for i, question in enumerate(test_data['questions']):
                    correct_count = 0
                    total_attempts = len(responses_data)
                    
                    for response in responses_data.values():
                        answers = response.get('answers', [])
                        if i < len(answers):
                            correct_answer = question.get('answer', '')
                            if str(answers[i]).lower().strip() == str(correct_answer).lower().strip():
                                correct_count += 1
                    
                    stats['question_analysis'][f'question_{i+1}'] = {
                        'correct_count': correct_count,
                        'total_attempts': total_attempts,
                        'success_rate': round((correct_count / total_attempts * 100) if total_attempts > 0 else 0, 2),
                        'question_text': question.get('q', ''),
                        'correct_answer': question.get('answer', '')
                    }
        
        return jsonify({
            'responses': responses_data,
            'test_data': test_data,
            'statistics': stats
        })
        
    except Exception as e:
        print(f"Error getting responses: {e}")
        return jsonify({'responses': {}, 'test_data': {}, 'statistics': {}})

@app.route('/all_test_responses', methods=['GET'])
def all_test_responses():
    # Assuming 'responses' is your in-memory or persistent dict: {test_id: {student_id: {...}}}
    global responses
    return jsonify(responses)

@app.route('/get_students_info', methods=['POST'])
def get_students_info():
    ids = request.json.get('ids', [])
    result = {}
    for student_id in ids:
        user = User.query.filter_by(student_id=student_id).first()
        if user:
            result[student_id] = {
                'name': user.name,
                'student_class': user.student_class
            }
        else:
            result[student_id] = {
                'name': student_id,
                'student_class': ''
            }
    return jsonify(result)

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    user_agent = request.headers.get('User-Agent', '')
    is_android = 'Android' in user_agent
    if data.get('role') == 'student':
        if User.query.filter_by(student_id=data['student_id']).first():
            return jsonify({'error': 'Student ID already registered', 'success': False}), 400
        user = User(
            role='student',
            name=data['name'],
            student_class=data['student_class'],
            student_id=data['student_id']
        )
    else:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered', 'success': False}), 400
        user = User(
            role='teacher',
            name=data['name'],
            email=data['email'] if 'email' in data else None
        )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    if is_android:
        return jsonify({'message': 'User registered successfully', 'success': True}), 200
    else:
        return jsonify({'message': 'User registered successfully'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if data.get('role') == 'student':
        user = User.query.filter_by(student_id=data['student_id']).first()
    else:
        user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        return jsonify({
            'message': 'Login successful',
            'role': user.role,
            'name': user.name,
            'email': getattr(user, 'email', None),
            'student_class': getattr(user, 'student_class', None),
            'student_id': getattr(user, 'student_id', None)
        })
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/register', methods=['POST'])
def api_register():
    return register()

@app.route('/api/login', methods=['POST'])
def api_login():
    return login()

@app.route('/api/generate_test_ai', methods=['POST'])
def api_generate_test_ai():
    return generate_test_ai()

@app.route('/api/list_tests', methods=['GET'])
def api_list_tests():
    return list_tests()

@app.route('/api/create_test', methods=['POST', 'OPTIONS'])
def api_create_test():
    if request.method == 'OPTIONS':
        return '', 204
    return create_test()

@app.route('/api/get_test/<test_id>', methods=['GET'])
def api_get_test(test_id):
    return get_test(test_id)

@app.route('/api/get_responses/<test_id>', methods=['GET'])
def api_get_responses(test_id):
    return get_responses(test_id)

@app.route('/api/process', methods=['POST'])
def api_process():
    return process_image()

@app.route('/api/tts', methods=['POST', 'OPTIONS'])
def api_tts():
    if request.method == 'OPTIONS':
        return '', 204
    return tts()

@app.route('/api/submit_answers/<test_id>', methods=['POST', 'OPTIONS'])
def api_submit_answers(test_id):
    if request.method == 'OPTIONS':
        return ('', 204)
    return submit_answers(test_id)

@app.route('/save_test', methods=['POST', 'OPTIONS'])
def save_test():
    if request.method == 'OPTIONS':
        return ('', 204)
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('class') or not data.get('subject') or not data.get('topic'):
            return jsonify({'success': False, 'error': 'Missing required fields: class, subject, and topic are required'}), 400
        
        test_data = {
            'title': data.get('title'),
            'class': data.get('class'),
            'subject': data.get('subject'),
            'topic': data.get('topic'),
            'questions': data.get('questions', []),
            'created_at': datetime.now().isoformat(),
            'created_by': 'teacher'
        }
        
        # Save to Firestore
        test_id = firestore_service.create_test(test_data)
        
        return jsonify({'success': True, 'message': 'Test saved successfully', 'test_id': test_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/tts', methods=['POST'])
def tts():
    data = request.json
    text = data.get('text')
    language = data.get('language', 'en-US')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    print(f"[TTS] Request: text='{text[:50]}...', language='{language}'")

    # Enhanced language mapping for better support
    language_mapping = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'bn': 'bn-IN',
        'te': 'te-IN',
        'mr': 'mr-IN',
        'ta': 'ta-IN',
        'gu': 'gu-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'or': 'or-IN',
        'pa': 'pa-IN',
        'as': 'as-IN',
        'ur': 'ur-IN',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'zh': 'zh-CN',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ar': 'ar-XA',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'tr': 'tr-TR',
        'ko': 'ko-KR',
        'vi': 'vi-VN',
        'th': 'th-TH',
        'id': 'id-ID',
        'pl': 'pl-PL',
        'nl': 'nl-NL',
        'sv': 'sv-SE',
        'fi': 'fi-FI',
        'no': 'no-NO',
        'da': 'da-DK',
        'cs': 'cs-CZ',
        'el': 'el-GR',
        'he': 'he-IL',
        'uk': 'uk-UA',
        'ro': 'ro-RO',
        'hu': 'hu-HU',
        'sk': 'sk-SK',
        'bg': 'bg-BG',
        'hr': 'hr-HR',
        'lt': 'lt-LT',
        'lv': 'lv-LV',
        'et': 'et-EE',
        'sl': 'sl-SI',
        'sr': 'sr-RS',
        'ms': 'ms-MY',
        'ca': 'ca-ES',
        'eu': 'eu-ES',
        'gl': 'gl-ES',
        'mt': 'mt-MT',
        'ga': 'ga-IE',
        'sq': 'sq-AL',
        'mk': 'mk-MK',
        'is': 'is-IS',
        'af': 'af-ZA',
        'sw': 'sw-KE',
        'zu': 'zu-ZA',
        'xh': 'xh-ZA',
        'st': 'st-ZA',
        'tn': 'tn-BW',
        'ts': 'ts-ZA',
        'ss': 'ss-ZA',
        've': 've-ZA',
        'nr': 'nr-ZA',
        'kg': 'kg-CG',
        'rw': 'rw-RW',
        'so': 'so-SO',
        'yo': 'yo-NG',
        'ig': 'ig-NG',
        'am': 'am-ET',
        'om': 'om-ET',
        'ti': 'ti-ER',
        'ha': 'ha-NE',
        'fa': 'fa-IR',
        'ps': 'ps-AF',
        'ne': 'ne-NP',
        'si': 'si-LK',
        'my': 'my-MM',
        'km': 'km-KH',
        'lo': 'lo-LA',
        'mn': 'mn-MN',
        'ka': 'ka-GE',
        'hy': 'hy-AM',
        'az': 'az-AZ',
        'kk': 'kk-KZ',
        'uz': 'uz-UZ',
        'ky': 'ky-KG',
        'tg': 'tg-TJ',
        'tk': 'tk-TM',
        'be': 'be-BY',
        'mo': 'mo-MD',
        'bs': 'bs-BA',
        'lb': 'lb-LU',
        'fo': 'fo-FO',
        'sm': 'sm-WS',
        'to': 'to-TO',
        'mg': 'mg-MG',
        'ny': 'ny-MW',
        'rn': 'rn-BI',
        'sg': 'sg-CF',
        'sn': 'sn-ZW'
    }

    # Normalize language code
    if language in language_mapping:
        language = language_mapping[language]

    # List of supported language codes for Google Cloud TTS
    supported_languages = {
        'en-US', 'hi-IN', 'bn-IN', 'te-IN', 'mr-IN', 'ta-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'or-IN', 'pa-IN', 'as-IN', 'ur-IN',
        'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ru-RU', 'ja-JP', 'ar-XA', 'it-IT', 'pt-PT', 'tr-TR', 'ko-KR', 'vi-VN', 'th-TH',
        'id-ID', 'pl-PL', 'nl-NL', 'sv-SE', 'fi-FI', 'no-NO', 'da-DK', 'cs-CZ', 'el-GR', 'he-IL', 'uk-UA', 'ro-RO', 'hu-HU',
        'sk-SK', 'bg-BG', 'hr-HR', 'lt-LT', 'lv-LV', 'et-EE', 'sl-SI', 'sr-RS', 'ms-MY', 'ca-ES', 'eu-ES', 'gl-ES', 'mt-MT',
        'ga-IE', 'sq-AL', 'mk-MK', 'is-IS', 'af-ZA', 'sw-KE', 'zu-ZA', 'xh-ZA', 'st-ZA', 'tn-BW', 'ts-ZA', 'ss-ZA', 've-ZA',
        'nr-ZA', 'tn-ZA', 'kg-CG', 'rw-RW', 'so-SO', 'yo-NG', 'ig-NG', 'am-ET', 'om-ET', 'ti-ER', 'ha-NE', 'fa-IR', 'ps-AF',
        'ur-PK', 'ne-NP', 'si-LK', 'my-MM', 'km-KH', 'lo-LA', 'mn-MN', 'ka-GE', 'hy-AM', 'az-AZ', 'kk-KZ', 'uz-UZ', 'ky-KG',
        'tg-TJ', 'tk-TM', 'be-BY', 'mo-MD', 'bs-BA', 'lb-LU', 'fo-FO', 'sm-WS', 'to-TO', 'mg-MG', 'ny-MW', 'rn-BI', 'sg-CF',
        'sn-ZW', 'yo-NG', 'zu-ZA'
    }

    # Enhanced fallback mapping
    fallback_map = {
        'mr-IN': ['hi-IN', 'en-US'],
        'ta-IN': ['hi-IN', 'en-US'],
        'bn-IN': ['hi-IN', 'en-US'],
        'te-IN': ['hi-IN', 'en-US'],
        'gu-IN': ['hi-IN', 'en-US'],
        'kn-IN': ['hi-IN', 'en-US'],
        'ml-IN': ['hi-IN', 'en-US'],
        'or-IN': ['hi-IN', 'en-US'],
        'pa-IN': ['hi-IN', 'en-US'],
        'as-IN': ['hi-IN', 'en-US'],
        'ur-IN': ['hi-IN', 'en-US'],
        'ur-PK': ['hi-IN', 'en-US'],
        'ne-NP': ['hi-IN', 'en-US'],
        'si-LK': ['hi-IN', 'en-US'],
        'my-MM': ['hi-IN', 'en-US'],
        'km-KH': ['hi-IN', 'en-US'],
        'lo-LA': ['hi-IN', 'en-US'],
        'mn-MN': ['hi-IN', 'en-US'],
        'ka-GE': ['hi-IN', 'en-US'],
        'hy-AM': ['hi-IN', 'en-US'],
        'az-AZ': ['hi-IN', 'en-US'],
        'kk-KZ': ['hi-IN', 'en-US'],
        'uz-UZ': ['hi-IN', 'en-US'],
        'ky-KG': ['hi-IN', 'en-US'],
        'tg-TJ': ['hi-IN', 'en-US'],
        'tk-TM': ['hi-IN', 'en-US'],
        'be-BY': ['hi-IN', 'en-US'],
        'mo-MD': ['hi-IN', 'en-US'],
        'bs-BA': ['hi-IN', 'en-US'],
        'lb-LU': ['hi-IN', 'en-US'],
        'fo-FO': ['hi-IN', 'en-US'],
        'sm-WS': ['hi-IN', 'en-US'],
        'to-TO': ['hi-IN', 'en-US'],
        'mg-MG': ['hi-IN', 'en-US'],
        'ny-MW': ['hi-IN', 'en-US'],
        'rn-BI': ['hi-IN', 'en-US'],
        'sg-CF': ['hi-IN', 'en-US'],
        'sn-ZW': ['hi-IN', 'en-US'],
        'kg-CG': ['hi-IN', 'en-US'],
        'rw-RW': ['hi-IN', 'en-US'],
        'so-SO': ['hi-IN', 'en-US'],
        'yo-NG': ['hi-IN', 'en-US'],
        'ig-NG': ['hi-IN', 'en-US'],
        'am-ET': ['hi-IN', 'en-US'],
        'om-ET': ['hi-IN', 'en-US'],
        'ti-ER': ['hi-IN', 'en-US'],
        'ha-NE': ['hi-IN', 'en-US'],
        'fa-IR': ['hi-IN', 'en-US'],
        'ps-AF': ['hi-IN', 'en-US']
    }

    def synthesize_tts(text, lang_code):
        try:
            print(f"[TTS] Attempting synthesis for language: {lang_code}")
            client = texttospeech.TextToSpeechClient()
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Try to get available voices for the language
            try:
                voices = client.list_voices(language_code=lang_code)
                if voices.voices:
                    voice = texttospeech.VoiceSelectionParams(
                        language_code=lang_code,
                        name=voices.voices[0].name,
                        ssml_gender=voices.voices[0].ssml_gender
                    )
                    print(f"[TTS] Using voice: {voices.voices[0].name}")
                else:
                    voice = texttospeech.VoiceSelectionParams(
                        language_code=lang_code,
                        ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
                    )
                    print(f"[TTS] No specific voice found, using default")
            except Exception as e:
                print(f"[TTS] Error getting voices for {lang_code}: {e}")
                voice = texttospeech.VoiceSelectionParams(
                    language_code=lang_code,
                    ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
                )
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=0.9,
                pitch=0.0,
                volume_gain_db=0.0
            )
            
            response = client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            
            if response.audio_content:
                print(f"[TTS] Successfully synthesized audio for {lang_code}")
                return response.audio_content
            else:
                print(f"[TTS] No audio content returned for {lang_code}")
                return None
                
        except Exception as e:
            print(f"[TTS] Error synthesizing for {lang_code}: {e}")
            return None

    def send_audio(audio_content):
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as out:
            out.write(audio_content)
            temp_path = out.name
        return send_file(temp_path, mimetype='audio/mp3')

    tried_langs = [language]
    
    # Try the requested language first
    if language in supported_languages:
        print(f"[TTS] Trying requested language: {language}")
        audio_content = synthesize_tts(text, language)
        if audio_content:
            print(f"[TTS] Success with requested language: {language}")
            return send_audio(audio_content)
        else:
            print(f"[TTS] Failed with requested language: {language}")
    else:
        print(f"[TTS] Requested language not supported: {language}")

    # Try fallbacks if available
    fallbacks = fallback_map.get(language, ['en-US'])
    print(f"[TTS] Trying fallbacks: {fallbacks}")
    
    for fallback in fallbacks:
        if fallback not in tried_langs and fallback in supported_languages:
            print(f"[TTS] Trying fallback: {fallback}")
            audio_content = synthesize_tts(text, fallback)
            if audio_content:
                print(f"[TTS] Fallback success: {fallback}")
                return send_audio(audio_content)
            else:
                print(f"[TTS] Fallback failed: {fallback}")
            tried_langs.append(fallback)

    # Final fallback to English
    if 'en-US' not in tried_langs:
        print(f"[TTS] Final fallback to en-US")
        audio_content = synthesize_tts(text, 'en-US')
        if audio_content:
            print(f"[TTS] Final fallback success: en-US")
            return send_audio(audio_content)

    print(f"[TTS] No audio available for: {language} (tried: {tried_langs})")
    return jsonify({'error': 'Audio not available for this language. Please try again.'}), 400

# --- suvrat_sahAIk endpoints ---
# Only add if not already present
if not hasattr(app, 'suvrat_sahaik_features_added'):
    FlaskCORS(app, supports_credentials=True)
    LANGUAGE_MAP = {
        'en': 'English', 'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu', 'bn': 'Bengali',
        'gu': 'Gujarati', 'ml': 'Malayalam', 'mr': 'Marathi', 'pa': 'Punjabi', 'kn': 'Kannada',
        'or': 'Odia', 'ur': 'Urdu',
    }
    
    @app.route('/chat', methods=['POST'])
    def chat():
        user_input = request.json.get('message', '')
        language_code = request.json.get('language', 'en')
        language = LANGUAGE_MAP.get(language_code, 'English')
        filtered, warning = filter_profanity(user_input) if filter_profanity else (user_input, None)
        if warning:
            return jsonify({'response': warning})
        if 'history' not in session:
            session['history'] = []
        session['history'].append({'user': filtered})
        prompt = (
            f"You are a kind and professional teacher counselor helping teacher manage stress. "
            f"Respond with empathy, practical advice, and emotional support. Avoid generic chatbot responses. "
            f"Never give medical or legal advice. If the user mentions suicidal thoughts or serious mental health issues, "
            f"gently suggest seeing a real counselor.\n"
            f"Always reply in {language}. Format your answer in short, well-structured sentences or bullet points, not long paragraphs.\n"
            f"Conversation so far: {session['history']}\n"
            f"Student: {filtered}\nCounselor:"
        )
        response = get_gemini_response(prompt) if get_gemini_response else "(Gemini not configured)"
        session['history'].append({'counselor': response})
        return jsonify({'response': response})

    @app.route('/reset', methods=['POST'])
    def reset():
        session.pop('history', None)
        return jsonify({'status': 'reset'})

    @app.route('/podcast_audio/<filename>')
    def podcast_audio(filename):
        audio_dir = os.path.join(os.getcwd(), 'podcast_audio')
        filepath = os.path.join(audio_dir, filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'Audio file not found'}), 404
        return send_from_directory(audio_dir, filename)

    @app.route('/generate_learning_content', methods=['POST'])
    def generate_learning_content():
        data = request.json
        topic = data.get('topic', '')
        grade_level = data.get('grade_level', '')
        language = data.get('language', 'English')
        if not topic or not grade_level:
            return jsonify({'error': 'Missing topic or grade_level'}), 400
        curator = LearningCurator() if LearningCurator else None
        try:
            print(curator)
            result = curator.generate_learning_material(topic, grade_level, language) if curator else None
            if result:
                try:
                    json_start = result.index('{')
                    json_end = result.rindex('}') + 1
                    json_str = result[json_start:json_end]
                    structured = json.loads(json_str)
                except Exception as extract_err:
                    print(f"[ERROR] Failed to extract/parse JSON from Gemini result: {extract_err}")
                    print(f"[ERROR] Raw Gemini result: {result}")
                    traceback.print_exc()
                    return jsonify({'error': 'Failed to extract/parse JSON from Gemini result', 'raw': result}), 500
                try:
                    podcast_script = curator.generate_podcast_script(result, topic, grade_level, language) if curator else None
                    podcast_audio_url = None
                    if podcast_script:
                        try:
                            audio_filename = text_to_speech_file(podcast_script)
                            audio_dir = os.path.join(os.getcwd(), 'podcast_audio')
                            filepath = os.path.join(audio_dir, audio_filename)
                            if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                                podcast_audio_url = f"/podcast_audio/{audio_filename}"
                        except Exception as e1:
                            print(f"[ERROR] ElevenLabs TTS failed: {e1}")
                            traceback.print_exc()
                            try:
                                audio_filename = google_text_to_speech_file(podcast_script, language_label=language)
                                audio_dir = os.path.join(os.getcwd(), 'podcast_audio')
                                filepath = os.path.join(audio_dir, audio_filename)
                                if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                                    podcast_audio_url = f"/podcast_audio/{audio_filename}"
                            except Exception as e2:
                                print(f"[ERROR] Google TTS failed: {e2}")
                                traceback.print_exc()
                    return jsonify({
                        'structured_content': structured,
                        'podcast_script': podcast_script,
                        'podcast_audio_url': podcast_audio_url
                    })
                except Exception as e:
                    print(f"[ERROR] Podcast script/audio generation failed: {e}")
                    traceback.print_exc()
                    return jsonify({'error': 'Failed to generate podcast script or audio', 'raw': result}), 500
            else:
                print("[ERROR] LearningCurator.generate_learning_material returned None or empty result.")
                traceback.print_exc()
                return jsonify({'error': 'Failed to generate content'}), 500
        except Exception as endpoint_exc:
            print(f"[ERROR] Exception in /generate_learning_content endpoint: {endpoint_exc}")
            traceback.print_exc()
            return jsonify({'error': 'Internal server error', 'details': str(endpoint_exc)}), 500

    @app.route('/generate_lesson_plan', methods=['POST'])
    def generate_lesson_plan():
        data = request.json
        grade = data.get('grade', '')
        subject = data.get('subject', '')
        chapter = data.get('chapter', '')
        days_per_week = data.get('days_per_week', 5)
        language = data.get('language', 'English')
        objectives = data.get('objectives', '')
        learner_type = data.get('learner_type', 'Mixed')
        curriculum = data.get('curriculum', 'CBSE')
        if not (grade and subject and chapter and days_per_week and language and learner_type and curriculum):
            return jsonify({'error': 'Missing required fields'}), 400
        prompt = f"""
You are an expert lesson planner generator AI.
Your task is to generate a comprehensive, weekly breakdown of a lesson plan for a given chapter name, based on the following inputs:
- Grade/Class level: {grade}
- Subject: {subject}
- Chapter name or topic: {chapter}
- Number of teaching days per week: {days_per_week}
- Language of instruction: {language}
- Learning objectives: {objectives if objectives else 'Not specified'}
- Type of learner: {learner_type}
- Curriculum board: {curriculum}
🎯 OUTPUT FORMAT (JSON):
{{
  "title": "Chapter Title",
  "grade": "Class 7",
  "subject": "Science",
  "language": "English",
  "weekly_plan": [{{"week": 1, "days": [{{"day": "Monday", "topic": "Intro", "activities": ["..."], "assessment": "..."}}]}}],
  "projects_and_assignments": [{{"week": 2, "title": "...", "description": "...", "submission_date": "..."}}],
  "teacher_notes": ["..."],
  "modifications_for_learning_styles": {{"visual": "...", "auditory": "...", "kinesthetic": "..."}}
}}
- The output must be in {language}.
- The plan should be detailed, practical, and tailored to the specified learner type and curriculum board.
- If learning objectives are provided, ensure they are addressed in the plan.
- Use the exact JSON structure above, filling in all fields with relevant, creative, and actionable content.
- Do not include any explanation or text outside the JSON.
"""
        try:
            result = get_gemini_response(prompt) if get_gemini_response else None
            json_start = result.index('{')
            json_end = result.rindex('}') + 1
            json_str = result[json_start:json_end]
            lesson_plan = json.loads(json_str)
            return jsonify({'lesson_plan': lesson_plan})
        except Exception as e:
            return jsonify({'error': f'Failed to generate or parse lesson plan: {e}', 'raw': result if "result" in locals() else ''}), 500

    @app.route('/reading-eval', methods=['POST'])
    def reading_eval():
        grade_level = request.form.get('grade_level')
        language = request.form.get('language')
        transcription = request.form.get('transcription')
        if not grade_level or not language:
            return jsonify({'error': 'Missing grade_level or language'}), 400
        passage = generate_passage(grade_level, language) if generate_passage else None
        if not passage:
            return jsonify({'error': 'Failed to generate passage.'}), 500
        if not transcription:
            return jsonify({'generated_passage': passage})
        result = evaluate_reading(passage, transcription) if evaluate_reading else {}
        return jsonify(result)

    @app.route('/test_gemini', methods=['GET'])
    def test_gemini():
        from learning_curator import LearningCurator
        curator = LearningCurator()
        result = curator.generate_learning_material("Say hello", "Grade 1", "English")
        return jsonify({"result": result})

    # A2A Protocol Endpoints (to prevent 404 errors)
    @app.route('/api/a2a/status', methods=['GET'])
    def a2a_status():
        return jsonify({"status": "active", "protocol": "A2A"})
    
    @app.route('/api/a2a/agents', methods=['GET'])
    def a2a_agents():
        return jsonify({"agents": []})
    
    @app.route('/api/a2a/tasks', methods=['GET'])
    def a2a_tasks():
        return jsonify({"tasks": []})

    # Agentic Architecture Endpoints
    if AGENTIC_ARCHITECTURE_ENABLED:
        @app.route('/agent/educational', methods=['POST'])
        def agent_educational():
            """Enhanced educational assistance using agentic architecture"""
            data = request.get_json()
            result = agent_service.process_educational_request(data)
            return jsonify(result)

        @app.route('/agent/generate_test', methods=['POST'])
        def agent_generate_test():
            """Generate tests using agentic architecture"""
            data = request.get_json()
            result = agent_service.generate_test(data)
            return jsonify(result)

        @app.route('/agent/analyze_performance', methods=['POST'])
        def agent_analyze_performance():
            """Analyze performance using agentic architecture"""
            data = request.get_json()
            result = agent_service.analyze_performance(data)
            return jsonify(result)

        @app.route('/agent/complex_request', methods=['POST'])
        def agent_complex_request():
            """Handle complex requests using multiple agents"""
            data = request.get_json()
            result = agent_service.process_complex_request(data)
            return jsonify(result)

        @app.route('/agent/learning_tip', methods=['POST'])
        def agent_learning_tip():
            """Generate learning tips for wrong answers"""
            data = request.get_json()
            question = data.get('question', '')
            correct_answer = data.get('correct_answer', '')
            student_answer = data.get('student_answer', '')
            context = data.get('context', {})
            
            tip = agent_service.provide_learning_tip(question, correct_answer, student_answer, context)
            return jsonify({
                'success': True,
                'tip': tip,
                'timestamp': datetime.now().isoformat()
            })

        @app.route('/agent/practice_questions', methods=['POST'])
        def agent_practice_questions():
            """Generate practice questions"""
            data = request.get_json()
            topic = data.get('topic', 'General')
            difficulty = data.get('difficulty', 'medium')
            count = data.get('count', 3)
            
            result = agent_service.generate_practice_questions(topic, difficulty, count)
            return jsonify(result)

        @app.route('/agent/validate_questions', methods=['POST'])
        def agent_validate_questions():
            """Validate test questions"""
            data = request.get_json()
            questions = data.get('questions', [])
            
            result = agent_service.validate_test_questions(questions)
            return jsonify(result)

        @app.route('/agent/conversation_summary', methods=['GET'])
        def agent_conversation_summary():
            """Get conversation summary"""
            session_id = request.args.get('session_id')
            result = agent_service.get_conversation_summary(session_id)
            return jsonify(result)

        @app.route('/agent/clear_session', methods=['POST'])
        def agent_clear_session():
            """Clear session data"""
            data = request.get_json()
            session_id = data.get('session_id')
            result = agent_service.clear_session(session_id)
            return jsonify(result)

        @app.route('/agent/status', methods=['GET'])
        def agent_status():
            """Get agent status"""
            result = agent_service.get_agent_status()
            return jsonify(result)


    app.suvrat_sahaik_features_added = True

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port) 