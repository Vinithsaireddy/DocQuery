import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const chatWithPDF = async (sessionId, question) => {
  const response = await api.post('/chat', {
    session_id: sessionId,
    question,
  });
  return response.data;
};
