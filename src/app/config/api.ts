// Centralized API configuration
// In development: uses localhost
// In production: uses environment variables set in Vercel/Netlify

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const API_BASE = API_URL;
export const WS_BASE = WS_URL;
