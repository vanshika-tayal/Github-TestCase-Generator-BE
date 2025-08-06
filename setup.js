#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Test Case Generator Backend Setup');
console.log('=====================================\n');

const questions = [
  {
    name: 'port',
    question: 'Enter server port (default: 5000): ',
    default: '5000'
  },
  {
    name: 'githubToken',
    question: 'Enter your GitHub Personal Access Token: ',
    required: true
  },
  {
    name: 'geminiKey',
    question: 'Enter your Google Gemini API Key: ',
    required: true
  },
  {
    name: 'jwtSecret',
    question: 'Enter JWT secret (or press enter for random): ',
    default: generateRandomString(32)
  },
  {
    name: 'sessionSecret',
    question: 'Enter session secret (or press enter for random): ',
    default: generateRandomString(32)
  }
];

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function askQuestion(questionObj) {
  return new Promise((resolve) => {
    rl.question(questionObj.question, (answer) => {
      if (questionObj.required && !answer.trim()) {
        console.log('❌ This field is required!');
        askQuestion(questionObj).then(resolve);
      } else {
        resolve(answer.trim() || questionObj.default);
      }
    });
  });
}

async function runSetup() {
  try {
    const answers = {};
    
    for (const question of questions) {
      answers[question.name] = await askQuestion(question);
    }

    const envContent = `# Server Configuration
PORT=${answers.port}
NODE_ENV=development

# GitHub Configuration
GITHUB_ACCESS_TOKEN=${answers.githubToken}

# AI Configuration
GEMINI_API_KEY=${answers.geminiKey}

# Security
JWT_SECRET=${answers.jwtSecret}
SESSION_SECRET=${answers.sessionSecret}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Environment file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the server: npm run dev');
    console.log('3. Test the API: curl http://localhost:' + answers.port + '/health');
    console.log('\n📚 For more information, check the README.md file');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Check if .env already exists
if (fs.existsSync('.env')) {
  rl.question('⚠️  .env file already exists. Overwrite? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      runSetup();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  runSetup();
} 