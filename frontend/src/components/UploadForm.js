import React, { useState } from 'react';
import axios from 'axios';
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

export default function UploadForm({ setResult, selectedLanguage, setSelectedLanguage, setLoading }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLocalLoading] = useState(false);
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
    setLocalLoading(true);
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
    setLocalLoading(false);
    setLoading(false);
  };

  return (
    <div>
      <div className="text-upload-header">
        <FaCloudUploadAlt className="text-upload-icon" />
        <h2 className="text-upload-title">Upload Image</h2>
        <p className="text-upload-subtitle">Select an image containing text to extract</p>
      </div>
      
      <form onSubmit={handleSubmit} className="text-upload-form">
        <div className="text-file-section">
          <label htmlFor="file-input" className="text-file-label">Select Image:</label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-file-input"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="text-image-preview" />
          )}
        </div>
        
        <div className="text-language-section">
          <label htmlFor="lang-select" className="text-language-label">Output Language:</label>
          <select 
            id="lang-select" 
            value={selectedLanguage} 
            onChange={handleLanguageChange} 
            className="text-language-select"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        
        <div className="text-button-row">
          <button type="submit" className="text-extract-btn" disabled={loading}>
            {loading ? <span className="text-loading-spinner"></span> : 'Extract Text'}
          </button>
          <button type="button" className="text-reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
        
        {error && <div className="text-error-msg">{error}</div>}
      </form>
    </div>
  );
} 