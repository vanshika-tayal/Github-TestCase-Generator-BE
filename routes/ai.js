const express = require('express');
const axios = require('axios');
const Joi = require('joi');

const router = express.Router();

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Validation schemas
const generateSummarySchema = Joi.object({
  files: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    path: Joi.string().required(),
    content: Joi.string().required(),
    language: Joi.string().required()
  })).min(1).required(),
  framework: Joi.string().valid('junit', 'pytest', 'jest', 'mocha', 'selenium', 'cypress').required()
});

const generateTestCaseSchema = Joi.object({
  files: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    path: Joi.string().required(),
    content: Joi.string().required(),
    language: Joi.string().required()
  })).min(1).required(),
  framework: Joi.string().valid('junit', 'pytest', 'jest', 'mocha', 'selenium', 'cypress').required(),
  testType: Joi.string().required(),
  description: Joi.string().required()
});

// Helper function to call Gemini API
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate content with AI');
  }
}

// Generate test case summaries
router.post('/generate-summaries', async (req, res) => {
  try {
    const { error, value } = generateSummarySchema.validate(req.body);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameters',
        details: error.details 
      });
    }

    const { files, framework } = value;

    // Create prompt for generating test case summaries
    const fileContents = files.map(file => 
      `File: ${file.name}\nPath: ${file.path}\nLanguage: ${file.language}\nContent:\n${file.content}\n`
    ).join('\n---\n');

    const prompt = `
You are an expert software testing engineer. Analyze the following code files and generate 5 different test case summaries for ${framework.toUpperCase()} testing framework.

Code Files:
${fileContents}

For each test case summary, provide:
1. A descriptive title
2. Brief description of what the test will cover
3. Type of test (unit, integration, e2e, etc.)
4. Key scenarios to test
5. Expected outcomes

Format your response as a JSON array with the following structure:
[
  {
    "id": "unique_id",
    "title": "Test case title",
    "description": "Brief description",
    "type": "unit|integration|e2e|ui",
    "scenarios": ["scenario1", "scenario2"],
    "expectedOutcomes": ["outcome1", "outcome2"],
    "framework": "${framework}"
  }
]

Only return the JSON array, no additional text.
`;

    const aiResponse = await callGeminiAPI(prompt);
    
    // Parse the JSON response
    let summaries;
    try {
      summaries = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response'
      });
    }

    res.json({
      success: true,
      summaries: summaries,
      framework: framework,
      filesAnalyzed: files.length
    });

  } catch (error) {
    console.error('Error generating test case summaries:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate test case summaries',
      message: error.message 
    });
  }
});

// Generate detailed test case code
router.post('/generate-test-case', async (req, res) => {
  try {
    const { error, value } = generateTestCaseSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameters',
        details: error.details 
      });
    }

    const { files, framework, testType, description } = value;

    // Create prompt for generating detailed test case
    const fileContents = files.map(file => 
      `File: ${file.name}\nPath: ${file.path}\nLanguage: ${file.language}\nContent:\n${file.content}\n`
    ).join('\n---\n');

    const frameworkConfigs = {
      'junit': {
        language: 'Java',
        imports: 'import org.junit.jupiter.api.*;\nimport static org.junit.jupiter.api.Assertions.*;',
        template: '@Test\npublic void testMethod() {\n    // Test implementation\n}'
      },
      'pytest': {
        language: 'Python',
        imports: 'import pytest\nimport unittest',
        template: 'def test_function():\n    # Test implementation\n    pass'
      },
      'jest': {
        language: 'JavaScript',
        imports: 'import { describe, it, expect, beforeEach, afterEach } from \'@jest/globals\';',
        template: 'describe(\'Test Suite\', () => {\n    it(\'should test something\', () => {\n        // Test implementation\n    });\n});'
      },
      'mocha': {
        language: 'JavaScript',
        imports: 'const { describe, it } = require(\'mocha\');\nconst assert = require(\'assert\');',
        template: 'describe(\'Test Suite\', () => {\n    it(\'should test something\', () => {\n        // Test implementation\n    });\n});'
      },
      'selenium': {
        language: 'Python',
        imports: 'from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC',
        template: 'def test_ui_functionality():\n    driver = webdriver.Chrome()\n    try:\n        # Test implementation\n        pass\n    finally:\n        driver.quit()'
      },
      'cypress': {
        language: 'JavaScript',
        imports: '// Cypress test file',
        template: 'describe(\'Test Suite\', () => {\n    it(\'should test something\', () => {\n        // Test implementation\n    });\n});'
      }
    };

    const config = frameworkConfigs[framework];

    const prompt = `
You are an expert software testing engineer. Generate a complete, production-ready test case for the following code files using ${framework.toUpperCase()} framework.

Code Files:
${fileContents}

Test Requirements:
- Type: ${testType}
- Description: ${description}
- Framework: ${framework}
- Language: ${config.language}

Requirements:
1. Generate a complete test file with proper imports
2. Include all necessary setup and teardown methods
3. Write comprehensive test cases that cover the functionality
4. Include proper assertions and error handling
5. Follow best practices for ${framework} testing
6. Make the tests realistic and practical
7. Include comments explaining complex test logic

Required imports for ${framework}:
${config.imports}

Generate the complete test file content. Only return the code, no additional explanations.
`;

    const testCaseCode = await callGeminiAPI(prompt);

    // Generate appropriate file name
    const timestamp = Date.now();
    const fileName = `test_${framework}_${timestamp}.${config.language === 'Java' ? 'java' : config.language === 'Python' ? 'py' : 'js'}`;

    res.json({
      success: true,
      testCase: {
        fileName: fileName,
        content: testCaseCode,
        framework: framework,
        language: config.language,
        type: testType,
        description: description
      }
    });

  } catch (error) {
    console.error('Error generating test case:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate test case',
      message: error.message 
    });
  }
});

// Get supported frameworks
router.get('/frameworks', (req, res) => {
  const frameworks = [
    {
      id: 'junit',
      name: 'JUnit 5',
      language: 'Java',
      description: 'Unit testing framework for Java',
      fileExtension: '.java'
    },
    {
      id: 'pytest',
      name: 'PyTest',
      language: 'Python',
      description: 'Testing framework for Python',
      fileExtension: '.py'
    },
    {
      id: 'jest',
      name: 'Jest',
      language: 'JavaScript',
      description: 'Testing framework for JavaScript',
      fileExtension: '.js'
    },
    {
      id: 'mocha',
      name: 'Mocha',
      language: 'JavaScript',
      description: 'JavaScript test framework',
      fileExtension: '.js'
    },
    {
      id: 'selenium',
      name: 'Selenium',
      language: 'Python',
      description: 'Web automation testing',
      fileExtension: '.py'
    },
    {
      id: 'cypress',
      name: 'Cypress',
      language: 'JavaScript',
      description: 'End-to-end testing framework',
      fileExtension: '.js'
    }
  ];

  res.json({
    success: true,
    frameworks: frameworks
  });
});

module.exports = router; 