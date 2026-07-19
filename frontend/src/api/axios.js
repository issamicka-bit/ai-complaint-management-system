// src/api/axios.js
// Sehemu moja ya kuunganisha frontend na backend.
// Faili zote nyingine zita-import kutoka hapa badala ya
// kuandika "http://localhost:5000" kila mahali.
//
// Kwa development: inatumia localhost. Kwa production (baada ya deploy):
// inatumia VITE_API_URL iliyowekwa kwenye Vercel/Netlify environment variables.

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

// Kila request inayotoka, ongeza token (kama ipo) kiotomatiki
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;