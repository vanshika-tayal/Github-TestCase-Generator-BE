const express = require('express');
const router = express.Router();

// Store user-provided tokens in memory (in production, use a secure session store)
let userConfig = {
  githubToken: process.env.GITHUB_ACCESS_TOKEN,
  geminiKey: process.env.GEMINI_API_KEY
};

// Middleware to extract tokens from headers
const extractTokens = (req, res, next) => {
  const githubToken = req.headers['x-github-token'];
  const geminiKey = req.headers['x-gemini-key'];
  
  // Use user-provided tokens if available, otherwise fall back to env vars
  req.githubToken = githubToken || userConfig.githubToken || process.env.GITHUB_ACCESS_TOKEN;
  req.geminiKey = geminiKey || userConfig.geminiKey || process.env.GEMINI_API_KEY;
  
  next();
};

// Update configuration endpoint
router.post('/update', (req, res) => {
  const { githubToken, geminiKey } = req.body;
  
  if (githubToken) {
    userConfig.githubToken = githubToken;
  }
  if (geminiKey) {
    userConfig.geminiKey = geminiKey;
  }
  
  res.json({
    success: true,
    message: 'Configuration updated successfully'
  });
});

// Get configuration status (without exposing actual keys)
router.get('/status', (req, res) => {
  res.json({
    githubConfigured: !!req.githubToken,
    geminiConfigured: !!req.geminiKey
  });
});

module.exports = { router, extractTokens, userConfig };