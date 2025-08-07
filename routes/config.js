const express = require('express');
const router = express.Router();

// Store user-provided tokens in memory (in production, use a secure session store)
let userConfig = {
  githubToken: null,
  geminiKey: null
};

// Middleware to extract tokens from headers
const extractTokens = (req, res, next) => {
  const githubToken = req.headers['x-github-token'];
  const geminiKey = req.headers['x-gemini-key'];
  
  // ONLY use user-provided tokens from headers (no fallback to .env)
  req.githubToken = githubToken || userConfig.githubToken;
  req.geminiKey = geminiKey || userConfig.geminiKey;
  
  // Check if tokens are provided for protected routes
  if (req.path.includes('/github') && !req.githubToken) {
    return res.status(401).json({
      success: false,
      error: 'GitHub token not configured',
      message: 'Please configure your GitHub Personal Access Token in Settings'
    });
  }
  
  if (req.path.includes('/ai') && req.path !== '/ai/frameworks' && !req.geminiKey) {
    return res.status(401).json({
      success: false,
      error: 'Gemini API key not configured',
      message: 'Please configure your Google Gemini API key in Settings'
    });
  }
  
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