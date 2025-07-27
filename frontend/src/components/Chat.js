import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMicrophone, FaVolumeUp, FaPause, FaComments } from 'react-icons/fa';
import { API_BASE_URL } from '../config';
import './CounselorChat.css';
import counselorImage from '../assets/bot.jpeg';

const PRESETS_MAP = {
  en: [
    "I'm overwhelmed with exams",
    "I don't feel motivated to study",
    "How can I manage my time better?",
    "I'm afraid of failing"
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
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = location.state && location.state.from === 'student-home' ? '/student-home' : '/teacher-home';

  const [messages, setMessages] = useState([
    { sender: 'counselor', text: 'Hello! I\'m your AI counselor from sahAIk. I\'m here to support you with academic challenges, stress management, and personal growth. How can I help you today?' }
  ]);
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
      setMessages(m => [...m, { sender: 'counselor', text: data.response }]);
    } catch (e) {
      setMessages(m => [...m, { sender: 'counselor', text: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.' }]);
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
    
    // If already recording, stop it
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        return;
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }
    
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langObj.stt;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      
      recognition.onresult = (event) => {
        try {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        } catch (error) {
          console.log('Error processing speech result:', error);
        }
      };
      
      recognition.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition error: ';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage += 'Audio capture failed. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage += 'Network error. Please check your internet connection.';
            break;
          case 'aborted':
            errorMessage += 'Speech recognition was aborted.';
            break;
          default:
            errorMessage += event.error;
        }
        
        // Don't show alert for aborted errors (user clicked stop)
        if (event.error !== 'aborted') {
          alert(errorMessage);
        }
        recognitionRef.current = null;
      };
      
      recognition.onend = () => {
        recognitionRef.current = null;
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.log('Error starting speech recognition:', error);
      alert('Failed to start speech recognition. Please try again.');
    }
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
    
    // Wait for voices to load if they haven't already
    const loadVoices = () => {
      return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices());
          };
        }
      });
    };
    
    loadVoices().then(voices => {
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Try to find a voice for the requested language
      let selectedVoice = voices.find(voice => 
        voice.lang.startsWith(langObj.tts.split('-')[0]) || 
        voice.lang === langObj.tts
      );
      
      // Fallback to English if no voice found for the language
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') || 
          voice.lang === 'en-US' || 
          voice.lang === 'en-GB'
        );
      }
      
      // Fallback to any available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }
      
      const utter = new window.SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utter.voice = selectedVoice;
        utter.lang = selectedVoice.lang;
        console.log('Using voice:', selectedVoice.name, 'for language:', selectedVoice.lang);
      } else {
        utter.lang = langObj.tts;
        console.log('No voice found, using default for language:', langObj.tts);
      }
      
      // Set speech parameters for better quality
      utter.rate = 0.9; // Slightly slower for better clarity
      utter.pitch = 1.0;
      utter.volume = 1.0;
      
      utter.onstart = () => {
        setIsSpeaking(true);
        console.log('TTS started with voice:', selectedVoice ? selectedVoice.name : 'default');
      };
      
      utter.onend = () => {
        setIsSpeaking(false);
        console.log('TTS ended');
      };
      
      utter.onerror = (event) => {
        console.log('TTS error:', event.error);
        setIsSpeaking(false);
        
        // Try fallback to English if there was an error
        if (langObj.tts !== 'en-IN' && langObj.tts !== 'en-US') {
          console.log('Trying English fallback...');
          const fallbackUtter = new window.SpeechSynthesisUtterance(text);
          fallbackUtter.lang = 'en-US';
          fallbackUtter.rate = 0.9;
          fallbackUtter.pitch = 1.0;
          fallbackUtter.volume = 1.0;
          fallbackUtter.onstart = () => setIsSpeaking(true);
          fallbackUtter.onend = () => setIsSpeaking(false);
          fallbackUtter.onerror = () => setIsSpeaking(false);
          synthRef.current.speak(fallbackUtter);
        } else {
          alert('Text-to-speech failed. Please try again.');
        }
      };
      
      try {
        synthRef.current.speak(utter);
      } catch (error) {
        console.log('Error starting TTS:', error);
        alert('Failed to start text-to-speech. Please try again.');
      }
    });
  };

  const handleStopSpeak = () => {
    if (window.speechSynthesis && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const presets = PRESETS_MAP[language] || PRESETS_MAP['en'];
  const sendLabel = SEND_LABELS[language] || SEND_LABELS['en'];

  // Helper to render pretty counselor text
  const renderCounselorText = (text) => {
    if (!text) return null;
    let cleaned = text.replace(/\*\*+/g, '').replace(/\* /g, '').trim();
    const lines = cleaned.split(/\n|\r/).filter(line => line.trim() !== '');
    return lines.map((line, idx) => {
      if (/^(\d+\.|•|-|\u2022)/.test(line.trim())) {
        return <div key={idx} className="counselor-bullet">{line.replace(/^(\d+\.|•|-|\u2022)\s*/, '• ')}</div>;
      }
      if (/^__.*__$/.test(line.trim())) {
        return <div key={idx} style={{fontWeight: 'bold'}}>{line.replace(/__/g, '')}</div>;
      }
      return <div key={idx} style={{marginBottom: 2}}>{line}</div>;
    });
  };

  return (
    <div className="counselor-root">
      <div className="counselor-container">
        {/* Back Button */}
        <button className="counselor-back-btn" onClick={() => navigate('/student-home')}>
          <FaArrowLeft />
          Back
        </button>

        {/* Header Section */}
        <div className="counselor-header">
          <div className="counselor-header-content">
            <div className="counselor-header-text">
              <h1 className="counselor-title">
                <FaComments className="counselor-title-icon" />
                Counselor Chat
              </h1>
              <p className="counselor-subtitle">
                Get personalized guidance and support for your academic and personal challenges
              </p>
            </div>
            <div className="counselor-header-image">
              <img src={counselorImage} alt="AI Counselor" className="counselor-image" />
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="counselor-controls">
          <div className="counselor-select-row">
            <div className="counselor-select-group">
              <label className="counselor-label">Language</label>
              <select 
                className="counselor-select" 
                value={language} 
                onChange={e => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="counselor-preset-section">
            <h3 className="counselor-preset-title">Quick Start Questions</h3>
            <div className="counselor-preset-buttons">
              {presets.map((preset, i) => (
                <button 
                  key={i} 
                  className="counselor-preset-btn" 
                  onClick={() => handlePreset(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="counselor-chat-section">
          <div className="counselor-chatbox">
            {messages.map((msg, i) => (
              <div key={i} className={`counselor-msg ${msg.sender}`}>
                {msg.sender === 'counselor' ? (
                  <div>
                    {renderCounselorText(msg.text)}
                    <div className="counselor-audio-controls">
                      <button 
                        className="counselor-audio-btn" 
                        onClick={() => handleSpeak(msg.text)} 
                        title="Listen"
                      >
                        <FaVolumeUp />
                      </button>
                      {isSpeaking && (
                        <button 
                          className="counselor-audio-btn" 
                          onClick={handleStopSpeak} 
                          title="Stop"
                        >
                          <FaPause />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            ))}
            {loading && (
              <div className="counselor-msg counselor-loading">
                <span className="counselor-loading-spinner"></span>
                Thinking...
              </div>
            )}
          </div>

          {/* Input Section */}
          <form className="counselor-input-section" onSubmit={handleSubmit}>
            <div className="counselor-input-row">
              <input
                type="text"
                className="counselor-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button 
                type="button" 
                className={`counselor-mic-btn ${recognitionRef.current ? 'recognizing' : ''}`}
                onClick={handleMic}
                disabled={loading}
                title="Voice Input"
              >
                <FaMicrophone />
              </button>
              <button 
                type="submit" 
                className="counselor-send-btn"
                disabled={loading || !input.trim()}
              >
                {sendLabel}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="counselor-footer">
          <p className="counselor-footer-text">
            Made with ❤️ for students | AI counseling is not a substitute for professional help.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chat;