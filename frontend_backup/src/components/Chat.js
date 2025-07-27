import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../config';

const PRESETS_MAP = {
  en: [
    "I’m overwhelmed with exams",
    "I don’t feel motivated to study",
    "How can I manage my time better?",
    "I’m afraid of failing"
  ],
  hi: [
    "मैं परीक्षाओं से बहुत परेशान हूँ",
    "मुझे पढ़ाई करने की प्रेरणा नहीं मिल रही है",
    "मैं अपना समय कैसे बेहतर तरीके से प्रबंधित कर सकता/सकती हूँ?",
    "मुझे असफल होने का डर है"
  ],
  ta: [
    "தேர்வுகள் காரணமாக நான் மிகுந்த மன அழுத்தத்தில் உள்ளேன்",
    "படிப்பதற்கு எனக்கு ஊக்கம் இல்லை",
    "நான் என் நேரத்தை எப்படிச் சிறப்பாக நிர்வகிப்பது?",
    "தோல்வியடைவேன் என்று பயமாக உள்ளது"
  ],
  te: [
    "పరీక్షల వల్ల నేను చాలా ఒత్తిడిగా ఉన్నాను",
    "చదవడానికి నాకు ప్రేరణ లేదు",
    "నేను నా సమయాన్ని ఎలా మెరుగ్గా నిర్వహించగలను?",
    "పోరుతుంటానేమో అని భయంగా ఉంది"
  ],
  bn: [
    "পরীক্ষার চাপে আমি খুবই বিপর্যস্ত",
    "পড়াশোনার প্রতি আমার কোনো উৎসাহ নেই",
    "আমি কীভাবে আমার সময় আরও ভালোভাবে পরিচালনা করতে পারি?",
    "আমি ব্যর্থ হওয়ার ভয়ে আছি"
  ],
  gu: [
    "હું પરીક્ષાના તણાવથી ખૂબ જ પરેશાન છું",
    "મને અભ્યાસ કરવાની પ્રેરણા નથી મળી રહી",
    "હું મારું સમય કેવી રીતે વધુ સારી રીતે મેનેજ કરી શકું?",
    "મને નિષ્ફળ થવાનો ડર છે"
  ],
  ml: [
    "പരീക്ഷകളുടെ സമ്മർദ്ദം കാരണം ഞാൻ അതിയായി വിഷമിക്കുന്നു",
    "എനിക്ക് പഠിക്കാൻ പ്രേരണയില്ല",
    "ഞാൻ എങ്ങനെ എന്റെ സമയം മെച്ചപ്പെടുത്താം?",
    "പരാജയപ്പെടുമോ എന്ന ഭയം ഉണ്ട്"
  ],
  mr: [
    "मी परीक्षेच्या तणावामुळे खूपच त्रस्त आहे",
    "मला अभ्यासाची प्रेरणा मिळत नाही",
    "मी माझा वेळ कसा चांगला व्यवस्थापित करू शकतो/शकते?",
    "मला अपयशी होण्याची भीती वाटते"
  ],
  pa: [
    "ਮੈਂ ਇਮਤਿਹਾਨਾਂ ਦੇ ਦਬਾਅ ਕਾਰਨ ਬਹੁਤ ਪਰੇਸ਼ਾਨ ਹਾਂ",
    "ਮੈਨੂੰ ਪੜ੍ਹਾਈ ਕਰਨ ਦੀ ਪ੍ਰੇਰਣਾ ਨਹੀਂ ਮਿਲ ਰਹੀ",
    "ਮੈਂ ਆਪਣਾ ਸਮਾਂ ਕਿਵੇਂ ਚੰਗੀ ਤਰ੍ਹਾਂ ਪ੍ਰਬੰਧਿਤ ਕਰ ਸਕਦਾ/ਸਕਦੀ ਹਾਂ?",
    "ਮੈਨੂੰ ਨਾਕਾਮ ਹੋਣ ਦਾ ਡਰ ਹੈ"
  ],
  kn: [
    "ಪರೀಕ್ಷೆಗಳ ಒತ್ತಡದಿಂದ ನಾನು ತುಂಬಾ ಒತ್ತಡದಲ್ಲಿದ್ದೇನೆ",
    "ನನಗೆ ಓದಲು ಪ್ರೇರಣೆ ಇಲ್ಲ",
    "ನಾನು ನನ್ನ ಸಮಯವನ್ನು ಹೇಗೆ ಉತ್ತಮವಾಗಿ ನಿರ್ವಹಿಸಬಹುದು?",
    "ನಾನು ವಿಫಲವಾಗುವೆನೆಂದು ಭಯವಾಗಿದೆ"
  ],
  or: [
    "ପରୀକ୍ଷା ଚାପରେ ମୁଁ ବହୁତ ଅସ୍ୱସ୍ଥ ଅଛି",
    "ମୋତେ ପଢ଼ିବାକୁ ଆଗ୍ରହ ନାହିଁ",
    "ମୁଁ ମୋର ସମୟ କିପରି ଭଲ ଭାବେ ପରିଚାଳନା କରିପାରିବି?",
    "ମୁଁ ବିଫଳ ହେବି ବୋଲି ଭୟ ଲାଗୁଛି"
  ],
  ur: [
    "امتحانات کے دباؤ سے میں بہت پریشان ہوں",
    "مجھے پڑھائی کی کوئی تحریک نہیں مل رہی",
    "میں اپنا وقت بہتر طریقے سے کیسے منظم کر سکتا/سکتی ہوں؟",
    "مجھے ناکام ہونے کا ڈر ہے"
  ]
};

const SEND_LABELS = {
  en: "Send",
  hi: "भेजें",
  ta: "அனுப்பு",
  te: "పంపు",
  bn: "পাঠান",
  gu: "મોકલો",
  ml: "അയയ്ക്കുക",
  mr: "पाठवा",
  pa: "ਭੇਜੋ",
  kn: "ಕಳುಹಿಸಿ",
  or: "ପଠାନ୍ତୁ",
  ur: "بھیجیں"
};

const LANGUAGES = [
  { code: 'en', label: 'English', tts: 'en-IN', stt: 'en-IN' },
  { code: 'hi', label: 'Hindi', tts: 'hi-IN', stt: 'hi-IN' },
  { code: 'ta', label: 'Tamil', tts: 'ta-IN', stt: 'ta-IN' },
  { code: 'te', label: 'Telugu', tts: 'te-IN', stt: 'te-IN' },
  { code: 'bn', label: 'Bengali', tts: 'bn-IN', stt: 'bn-IN' },
  { code: 'gu', label: 'Gujarati', tts: 'gu-IN', stt: 'gu-IN' },
  { code: 'ml', label: 'Malayalam', tts: 'ml-IN', stt: 'ml-IN' },
  { code: 'mr', label: 'Marathi', tts: 'mr-IN', stt: 'mr-IN' },
  { code: 'pa', label: 'Punjabi', tts: 'pa-IN', stt: 'pa-IN' },
  { code: 'kn', label: 'Kannada', tts: 'kn-IN', stt: 'kn-IN' },
  { code: 'or', label: 'Odia', tts: 'or-IN', stt: 'or-IN' },
  { code: 'ur', label: 'Urdu', tts: 'ur-IN', stt: 'ur-IN' }
];

function getLangObj(code) {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
}

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const recognitionRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    setMessages([...messages, { sender: 'user', text: msg }]);
    setLoading(true);
    setInput("");
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: msg, language })
      });
      const data = await res.json();
      setMessages(m => [...m, { sender: 'bot', text: data.response }]);
    } catch (e) {
      setMessages(m => [...m, { sender: 'bot', text: 'Sorry, there was a problem.' }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePreset = (preset) => {
    sendMessage(preset);
  };

  // Speech-to-Text
  const handleMic = () => {
    const langObj = getLangObj(language);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = langObj.stt;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (event) => {
      alert('Speech recognition error: ' + event.error);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // Text-to-Speech
  const handleSpeak = (text) => {
    const langObj = getLangObj(language);
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = langObj.tts;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utter);
  };

  const handleStopSpeak = () => {
    if (window.speechSynthesis && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const presets = PRESETS_MAP[language] || PRESETS_MAP['en'];
  const sendLabel = SEND_LABELS[language] || SEND_LABELS['en'];

  // Helper to render pretty bot text
  const renderBotText = (text) => {
    // Remove unnecessary asterisks and handle markdown-like formatting
    if (!text) return null;
    // Remove leading/trailing asterisks and extra spaces
    let cleaned = text.replace(/\*\*+/g, '').replace(/\* /g, '').trim();
    // Split into lines
    const lines = cleaned.split(/\n|\r/).filter(line => line.trim() !== '');
    return lines.map((line, idx) => {
      // Bullet or numbered list
      if (/^(\d+\.|•|-|\u2022)/.test(line.trim())) {
        return <div key={idx} className="bot-bullet">{line.replace(/^(\d+\.|•|-|\u2022)\s*/, '• ')}</div>;
      }
      // Bold (markdown style)
      if (/^__.*__$/.test(line.trim())) {
        return <div key={idx} style={{fontWeight: 'bold'}}>{line.replace(/__/g, '')}</div>;
      }
      // Regular line
      return <div key={idx} style={{marginBottom: 2}}>{line}</div>;
    });
  };

  return (
    <div className="chat-outer">
      <div className="card beige" style={{width: '100%', maxWidth: 600}}>
        <div className="header" style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div className="icon-container">
            <span className="header-icon" aria-label="Counselor" style={{fontSize: 20}}>🧑‍🎓</span>
          </div>
          <h2 style={{margin: 0}}>Student Counselor Chatbot</h2>
        </div>
        <div className="language-select" style={{marginTop: 16}}>
          <label htmlFor="lang">Choose language: </label>
          <select id="lang" value={language} onChange={e => setLanguage(e.target.value)} aria-label="Select language">
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        <div className="preset-buttons" style={{marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8}}>
          {presets.map((preset, i) => (
            <button key={i} onClick={() => handlePreset(preset)} aria-label={preset}>{preset}</button>
          ))}
        </div>
      </div>
      <div className="card blue" style={{width: '100%', maxWidth: 600, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        <div className="chat-history" aria-live="polite" style={{marginBottom: 16, minHeight: 180}}>
          {messages.map((msg, i) => (
            <div key={i} className={msg.sender === 'user' ? 'user-msg' : 'bot-msg'}>
              {msg.sender === 'bot' ? (
                <span>{renderBotText(msg.text)}
                  <button className="speak-btn" onClick={() => handleSpeak(msg.text)} title="Listen" aria-label="Listen to response">🔊</button>
                  {isSpeaking && <button className="speak-btn" onClick={handleStopSpeak} title="Stop audio" aria-label="Stop audio">⏹️</button>}
                </span>
              ) : (
                <span>{msg.text}</span>
              )}
            </div>
          ))}
          {loading && <div className="bot-msg"><span><span className="loading-spinner" aria-label="Loading"></span></span></div>}
        </div>
        <form className="chat-input" onSubmit={handleSubmit} aria-label="Chat input" style={{display: 'flex', gap: 8}}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            aria-label="Type your message"
            style={{flex: 1}}
          />
          <button type="button" className="mic-btn" onClick={handleMic} title="Speak" aria-label="Speak" disabled={loading}>
            🎤
          </button>
          <button type="submit" disabled={loading || !input.trim()}>{sendLabel}</button>
        </form>
      </div>
      <div className="card yellow" style={{width: '100%', maxWidth: 600, textAlign: 'center', fontSize: 14, color: '#666'}}>
        <span>Made with ❤️ for students | AI counseling is not a substitute for professional help.</span>
      </div>
    </div>
  );
}

export default Chat;