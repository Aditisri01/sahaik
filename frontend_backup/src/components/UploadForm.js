import React, { useState } from 'react';
import axios from 'axios';
import './UploadForm.css';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh-cn', name: 'Chinese (Simplified)' },
  // Add more as needed
];

export default function UploadForm({ setResult, selectedLanguage, setSelectedLanguage }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setError('');
    setResult(null);
    setSelectedLanguage('en');
    document.getElementById('file-input').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image.');
      return;
    }
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', image);
    formData.append('language', selectedLanguage);
    try {
      const res = await axios.post(`${API_BASE_URL}/process`, formData);
      setResult(res.data);
    } catch (err) {
      setError('Failed to process image.');
    }
    setLoading(false);
  };

  return (
    <div className="upload-container">
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom: 18}}>
        <FaCloudUploadAlt size={54} color="#2563eb" style={{marginBottom: 8}} />
        <h1 className="upload-title">Image Text Extractor</h1>
        <h2 className="upload-subtitle">Extract and translate text from images in one click</h2>
      </div>
      <form onSubmit={handleSubmit} style={{marginTop: 18}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 18, marginBottom: 18}}>
          <label htmlFor="file-input" style={{fontWeight:600, color:'#2563eb', marginBottom: 6}}>Select Image:</label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{maxWidth: 180, maxHeight: 180, borderRadius: 10, boxShadow: '0 2px 8px #e6f0fa', marginTop: 8}} />
          )}
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 8, marginBottom: 18}}>
          <label htmlFor="lang-select" style={{fontWeight:600, color:'#2563eb', marginBottom: 6}}>Output Language:</label>
          <select id="lang-select" value={selectedLanguage} onChange={handleLanguageChange} className="language-select">
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        <div className="button-row">
          <button type="submit" className="upload-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : 'Extract Text'}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </form>
    </div>
  );
} 