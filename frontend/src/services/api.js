import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadReferencePhotos = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/upload-reference', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadClassPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload-class-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const processAttendance = async (filename) => {
  const response = await api.post('/process-attendance', { filename });
  return response.data;
};

export const getAttendanceRecords = async () => {
  const response = await api.get('/attendance-records');
  return response.data;
};

export const downloadCSV = async (filename) => {
  const response = await api.get(`/download-csv/${filename}`, {
    responseType: 'blob',
  });
  return response.data;
};

export default {
  uploadReferencePhotos,
  uploadClassPhoto,
  processAttendance,
  getAttendanceRecords,
  downloadCSV,
};
