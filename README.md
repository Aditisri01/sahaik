# Sahaik - Educational Platform

A modern educational platform with AI-powered features for teachers and students.

## ✨ What it does

**For Teachers:**
- Create tests using AI or upload images
- Manage students and view their performance
- Generate learning content and lesson plans

**For Students:**
- Take tests with instant feedback
- View your performance history
- Get help from AI assistant

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- Git

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/Aditisri01/sahaik.git
   cd sahaik
   ```

2. **Start Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Open in browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

## 🔧 Setup API Keys

Create a `.env` file in the `backend` folder:
```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_google_credentials.json
```

## 📱 Features

- **AI Test Generation** - Create tests from text or images
- **Multilingual Support** - Tests in multiple languages
- **Text-to-Speech** - Audio playback for content
- **Student Management** - Enroll and track students
- **Performance Analytics** - Detailed progress reports
- **Image Text Extraction** - Extract text from images

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Database**: SQLite
- **AI**: Google Gemini, Google Cloud TTS
- **Deployment**: Firestudio

## 📁 Project Structure

```
sahaik/
├── frontend/          # React app
├── backend/           # Flask API
├── firestudio.yaml    # Deployment config
└── README.md
```

## 🚀 Deploy

### Using Firestudio
```bash
npm install -g @firestudio/cli
firestudio deploy
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Deploy backend to any cloud platform
3. Set environment variables

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Submit a pull request

## 📄 License

MIT License

## 🆘 Support

Create an issue in the repository for questions or bugs.

---

**Made with ❤️ for better education** 
