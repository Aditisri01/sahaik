import google.generativeai as genai
import os

API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyD23iH-7lxFeE3ZQBirZ8bCC7QJDKPyJ0g"
MODEL_NAME = "models/gemini-2.0-flash"

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel(MODEL_NAME)

def get_gemini_response(prompt):
    try:
        response = model.generate_content(prompt)
        if response and response.text:
            return response.text.strip()
        else:
            return f"Sorry, the model could not generate a valid response for that prompt. Feedback: {getattr(response, 'prompt_feedback', None)}"
    except Exception as e:
        return f"[Gemini API Error]: {e}" 