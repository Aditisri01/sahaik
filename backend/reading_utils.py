import json
from gemini_client import get_gemini_response

def generate_passage(grade_level: str, language: str) -> str:
    prompt = f"""
You are an expert educator. Write a short reading passage (40-60 words) suitable for grade {grade_level} students in {language}. The passage should be age-appropriate, clear, and engaging. Only return the passage text, nothing else.
"""
    passage = get_gemini_response(prompt)
    return passage.strip()

def evaluate_reading(passage: str, transcription: str) -> dict:
    prompt = f"""
You are a reading evaluator. Compare the student’s transcribed speech to the original passage.

Original passage:
{passage}

Transcribed speech:
{transcription}

The evaluation should NOT be case sensitive. Convert both the passage and the transcription to lowercase before comparing. Remove all punctuation from the passage and the transcription. Be lenient in the scoring.`

Return your answer as a JSON object with the following keys:
- score: a percentage score of similarity (e.g., "92%")
- missing_words: a list of words that were skipped
- extra_words: a list of words that were added
- feedback: a short paragraph of qualitative feedback, always be optimistic and encouraging

Example output:
{{
  "score": "92%",
  "missing_words": ["quick", "fox"],
  "extra_words": ["really"],
  "feedback": "Good clarity and pace. You skipped a couple of words in the middle. Try to maintain consistency. Good Going!"
}}

Return ONLY the JSON object, nothing else.
"""
    gemini_response = get_gemini_response(prompt)
    try:
        json_start = gemini_response.index('{')
        json_end = gemini_response.rindex('}') + 1
        result_json = gemini_response[json_start:json_end]
        result = json.loads(result_json)
    except Exception as e:
        result = {
            'score': '',
            'missing_words': [],
            'extra_words': [],
            'feedback': '',
            'error': 'Failed to parse Gemini response',
            'raw': gemini_response
        }
    result['transcription'] = transcription
    result['original_passage'] = passage
    for key, default in [
        ('score', ''),
        ('missing_words', []),
        ('extra_words', []),
        ('feedback', '')
    ]:
        if key not in result:
            result[key] = default
    return result 