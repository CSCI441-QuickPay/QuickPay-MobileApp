import axios from 'axios';
import { Platform } from 'react-native';

// Default dev port used by your backend
const HOST_PORT = 4242;

// Optionally override by setting REMOTE_BACKEND to a deployed url for testing
const REMOTE_BACKEND: string = ''; // e.g. 'https://api.yourfriend.example.com'

const getBase = () => {
  if (REMOTE_BACKEND) return REMOTE_BACKEND;
  if (Platform.OS === 'android') return `http://10.0.2.2:${HOST_PORT}`;
  return `http://localhost:${HOST_PORT}`;
};

const api = axios.create({
  baseURL: getBase(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export default api;