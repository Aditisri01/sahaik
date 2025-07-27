import os
import google.generativeai as genai
import json
import uuid
from dotenv import load_dotenv
from gtts import gTTS
import traceback
load_dotenv()

# Use environment variable for API key

LANG_CODE_MAP = {
    'English': 'en',
    'Hindi': 'hi',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Bengali': 'bn',
    'Gujarati': 'gu',
    'Malayalam': 'ml',
    'Marathi': 'mr',
    'Punjabi': 'pa',
    'Kannada': 'kn',
    'Odia': 'or',
    'Urdu': 'ur',
}

def text_to_speech_file(text: str, language_label: str = "English") -> str:
    """
    Converts the given text to speech using gTTS and saves it as an MP3 file in the podcast_audio directory.
    Returns the file name of the generated audio.
    """
    audio_dir = os.path.join(os.getcwd(), "podcast_audio")
    os.makedirs(audio_dir, exist_ok=True)
    filename = f"podcast_{uuid.uuid4().hex}_gtts.mp3"
    filepath = os.path.join(audio_dir, filename)
    lang_code = LANG_CODE_MAP.get(language_label, 'en')
    tts = gTTS(text=text, lang=lang_code)
    tts.save(filepath)
    return filename

def google_text_to_speech_file(text: str, language_label: str = "English") -> str:
    """
    Converts the given text to speech using Google TTS and saves it as an MP3 file in the podcast_audio directory.
    Returns the file name of the generated audio.
    """
    audio_dir = os.path.join(os.getcwd(), "podcast_audio")
    os.makedirs(audio_dir, exist_ok=True)
    filename = f"podcast_{uuid.uuid4().hex}_gtts.mp3"
    filepath = os.path.join(audio_dir, filename)
    lang_code = LANG_CODE_MAP.get(language_label, 'en')
    tts = gTTS(text=text, lang=lang_code)
    tts.save(filepath)
    return filename

class LearningCurator:
    def __init__(self, api_key=None):
        if api_key:
            genai.configure(api_key=api_key)
        else:
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def generate_learning_material(self, topic: str, grade_level: str, language: str = "English") -> dict:
        prompt = f"""
        You are a seasoned educator and textbook author. Write a comprehensive, multi-section learning module on \"{topic}\" for \"{grade_level}\" students. 

        The output should be in **{language}** and structured as JSON with:
        {{
          "sections": [
            {{
              "title": "...",
              "content": "...",
              
            }}
          ],
          "key_concepts": ["..."],
          "quiz": [
            {{
              "question": "...",
              "options": ["..."],
              "answer": "..."
            }}
          ]
        }}

        - Minimum 500 words per section
        - Match tone and complexity to the specified grade
        - Translate the final output entirely to **{language}**
        """

        print("[Gemini] Prompt sent to Gemini API:")
        print(prompt)
        
        # Retry logic for network issues
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"[Gemini] Attempt {attempt + 1}/{max_retries}")
                response = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                print("[Gemini] Raw response object:")
                print(response)
                if hasattr(response, 'text'):
                    print("[Gemini] Response text:")
                    print(response.text)
                    return response.text
                else:
                    print("[Gemini] No 'text' attribute in response.")
                    return None
            except Exception as e:
                print(f"[Gemini] Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    print(f"[Gemini] Retrying in 2 seconds...")
                    import time
                    time.sleep(2)
                else:
                    print(f"[Gemini] All attempts failed. Final error: {e}")
                    traceback.print_exc()
                    return None 

    def generate_podcast_script(self, learning_content_json: str, topic: str, grade_level: str, language: str = "English") -> str:
        """
        Generate a spoken-word podcast script for visually challenged students based on the structured learning content.
        """
        prompt = f'''
        You are an expert educational podcaster and accessibility advocate. Using the following structured learning content (in JSON), write an engaging, accessible, and descriptive audio script for a podcast episode.

        Requirements:
        - This should be a single voice podcast - write just the verbatim and nothing else [no pauses,  sound cues, etc].
        - Clearly introduce the topic ("{topic}") and grade level ("{grade_level}").
        - Explain each section's content in natural, spoken language (do NOT read the JSON verbatim).
        - Verbally describe diagrams, using vivid and accessible language.
        - End with a question for them to think about
        - The tone should be conversational yet educational, suitable for visually challenged students.
        - The script should be in **{language}**.

        Here is the structured content:
        {learning_content_json}
        '''
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "text/plain"}
            )
            return response.text if response and response.text else None
        except Exception as e:
            print(f"Error generating podcast script: {e}")
            return None