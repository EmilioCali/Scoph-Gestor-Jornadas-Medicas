const fs = require('fs');
try {
  require('dotenv').config({ path: './.env' });
} catch (e) {
  // dotenv is optional at runtime; if not installed in some envs, ignore
}

const API_HOST = process.env.API_HOST || 'http://localhost';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || process.env.API_URL || `${API_HOST}:3020`;
const WORKDAY_SERVICE_URL = process.env.WORKDAY_SERVICE_URL || `${API_HOST}:3021`;
const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL || `${API_HOST}:3022`;
const REPORTS_SERVICE_URL = process.env.REPORTS_SERVICE_URL || `${API_HOST}:3023`;
const API_URL = process.env.API_URL || AUTH_SERVICE_URL;
const REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || 'scoph_refresh_token';

module.exports = ({ config }) => ({
  ...config,
  extra: {
    API_HOST,
    API_URL,
    AUTH_SERVICE_URL,
    WORKDAY_SERVICE_URL,
    CORE_SERVICE_URL,
    REPORTS_SERVICE_URL,
    REFRESH_TOKEN_KEY
  }
});
