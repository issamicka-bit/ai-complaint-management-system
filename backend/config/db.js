// config/db.js - Sehemu moja ya kuunganisha na PostgreSQL
// Faili zote nyingine (routes) zita-import kutoka hapa badala ya
// kuunda connection mpya kila mahali.
//
// Kwa DEVELOPMENT (kwenye kompyuta yako): inatumia DB_USER, DB_PASSWORD, n.k.
// Kwa PRODUCTION (Render): inatumia DATABASE_URL moja (Render inaitoa yenyewe)

require('dotenv').config();
const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  // Production (Render, Railway, n.k.) - DATABASE_URL moja yenye kila kitu
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  // Development (kompyuta yako) - taarifa tofauti tofauti
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });
}

module.exports = pool;