import os
import json
from flask import jsonify, request
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

os.environ['GEMINI_API_KEY'] = 'AIzaSyD23iH-7lxFeE3ZQBirZ8bCC7QJDKPyJ0g'

def generate_gemini_image(prompt, output_file):
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash-preview-image-generation",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=['TEXT', 'IMAGE']
        )
    )
    # Robust error handling for NoneType
    if not response or not getattr(response, 'candidates', None):
        print("[Gemini] No candidates in response.")
        return None
    candidate = response.candidates[0]
    content = getattr(candidate, 'content', None)
    if not content or not getattr(content, 'parts', None):
        print("[Gemini] No content parts in candidate.")
        return None
    for part in content.parts:
        if getattr(part, 'inline_data', None) is not None:
            image = Image.open(BytesIO(part.inline_data.data))
            image.save(output_file)
            return output_file
    print("[Gemini] No inline_data found in content parts.")
    return None

def generate_educational_diagrams(topic, grade_level, language):
    """
    Generate four educational diagrams for a given topic using Gemini API.
    """
    diagram_types = [
        {
            "type": "concept_overview",
            "description": f"A simple chalkboard-style diagram showing the basic concept of {topic}. Clean, minimal sketch with clear labels in {language}.",
            "prompt": f"Educational chalkboard diagram: {topic} - basic concept overview. Simple black and white sketch style, clean lines, minimal design, educational illustration suitable for {grade_level} students. There should ne no text - just the visual diagram"
        },
        {
            "type": "process_flow",
            "description": f"A step-by-step process diagram of {topic} showing the sequence of events or stages.",
            "prompt": f"Educational chalkboard diagram: {topic} - step-by-step process flow. Sequential numbered steps, arrows showing progression, simple black and white sketch style, educational illustration for {grade_level} students. Clean, minimal design. There should ne no text - just the visual diagram"
        },
        {
            "type": "components_parts",
            "description": f"A labeled diagram showing the main components or parts of {topic}.",
            "prompt": f"Educational chalkboard diagram: {topic} - labeled components and parts. Simple black and white sketch with clear labels pointing to different parts, educational illustration for {grade_level} students. Minimal, clean design. There should ne no text - just the visual diagram"
        },
        {
            "type": "comparison_contrast",
            "description": f"A comparison diagram showing different aspects or types related to {topic}.",
            "prompt": f"Educational chalkboard diagram: {topic} - comparison and contrast. Side-by-side or divided sections showing different aspects, simple black and white sketch style, educational illustration for {grade_level} students. Clean, minimal design. There should ne no text - just the visual diagram"
        }
    ]
    diagrams = []
    for i, diagram_type in enumerate(diagram_types):
        prompt = diagram_type['prompt']
        filename = f"diagram_{topic.replace(' ', '_').lower()}_{i+1}_gemini.png"
        filepath = os.path.join("static", "diagrams", filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        result = generate_gemini_image(prompt, filepath)
        if result:
            diagrams.append({
                "image_url": f"/static/diagrams/{filename}",
                "caption": diagram_type["description"],
                "type": diagram_type["type"],
                "topic": topic,
                "grade_level": grade_level,
                "language": language
            })
    return diagrams

def create_diagram_endpoint(app):
    @app.route('/generate_diagrams', methods=['POST'])
    def generate_diagrams():
        try:
            data = request.get_json()
            topic = data.get('topic', '').strip()
            grade_level = data.get('grade_level', 'Grade 6')
            language = data.get('language', 'English')
            if not topic:
                return jsonify({"error": "Topic is required"}), 400
            diagrams = generate_educational_diagrams(topic, grade_level, language)
            return jsonify({
                "success": True,
                "diagrams": diagrams,
                "topic": topic,
                "grade_level": grade_level,
                "language": language
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500 