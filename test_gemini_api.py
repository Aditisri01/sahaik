import google.generativeai as genai

genai.configure(api_key="AIzaSyD23iH-7lxFeE3ZQBirZ8bCC7QJDKPyJ0g")
model = genai.GenerativeModel('gemini-1.5-flash-latest')
print('Testing Gemini API...')
try:
    response = model.generate_content('Say hello')
    print('Gemini API response:', response.text)
except Exception as e:
    print('Gemini API error:', e) 