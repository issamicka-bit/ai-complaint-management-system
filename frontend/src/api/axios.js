// src/api/axios.js
// Sehemu moja ya kuunganisha frontend na backend.
// Faili zote nyingine zita-import kutoka hapa badala ya
// kuandika "http://localhost:5000" kila mahali.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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