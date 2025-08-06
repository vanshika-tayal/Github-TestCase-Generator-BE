const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');

// Set global fetch and Headers for Google Generative AI
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = fetch.Headers;
  globalThis.Request = fetch.Request;
  globalThis.Response = fetch.Response;
}

const router = express.Router();

// Helper function to get Gemini model with user's API key
const getGeminiModel = (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// Validation schemas
const generateSummarySchema = Joi.object({
  files: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    path: Joi.string().required(),
    content: Joi.string().allow('').required(),
    language: Joi.string().required()
  })).min(1).required(),
  framework: Joi.string().valid('junit', 'pytest', 'jest', 'mocha', 'selenium', 'cypress').required()
});

const generateTestCaseSchema = Joi.object({
  files: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    path: Joi.string().required(),
    content: Joi.string().allow('').required(),
    language: Joi.string().required()
  })).min(1).required(),
  framework: Joi.string().valid('junit', 'pytest', 'jest', 'mocha', 'selenium', 'cypress').required(),
  testType: Joi.string().required(),
  description: Joi.string().required()
});

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
      `File: ${file.name}\nPath: ${file.path}\nLanguage: ${file.language}\nContent:\n${file.content || '// No content available'}\n`
    ).join('\n---\n');

    const prompt = `
You are an expert software testing engineer. Analyze the following code files and generate 5 different test case summaries for ${framework.toUpperCase()} testing framework.

Code Files:
${fileContents}

For each test case summary, provide:
1. A descriptive title
2. Brief description of what the test will cover
3. Type of test (unit, integration, e2e, or ui)
4. Key scenarios to test (2-3 scenarios)
5. Expected outcomes (2-3 outcomes)

Format your response as a valid JSON array with the following structure:
[
  {
    "id": "tc_001",
    "title": "Test case title",
    "description": "Brief description",
    "type": "unit",
    "scenarios": ["scenario1", "scenario2"],
    "expectedOutcomes": ["outcome1", "outcome2"]
  }
]

Important: Return ONLY the JSON array, no markdown formatting, no code blocks, no additional text.
`;

    const model = getGeminiModel(req.geminiKey);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response - remove any markdown formatting
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    // Parse the JSON response
    let summaries;
    try {
      summaries = JSON.parse(cleanedText);
      // Add unique IDs and framework to each summary
      summaries = summaries.map((summary, index) => ({
        ...summary,
        id: summary.id || `tc_${uuidv4().substring(0, 8)}`,
        framework: framework
      }));
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanedText);
      console.error('Parse error:', parseError);
      
      // Generate default summaries as fallback
      summaries = [
        {
          id: uuidv4().substring(0, 8),
          title: "Basic Functionality Test",
          description: "Test the core functionality of the provided code",
          type: "unit",
          scenarios: ["Test main function with valid inputs", "Test edge cases"],
          expectedOutcomes: ["Function returns expected values", "Proper error handling"],
          framework: framework
        },
        {
          id: uuidv4().substring(0, 8),
          title: "Error Handling Test",
          description: "Test error handling and edge cases",
          type: "unit",
          scenarios: ["Test with invalid inputs", "Test boundary conditions"],
          expectedOutcomes: ["Appropriate errors are thrown", "System handles errors gracefully"],
          framework: framework
        },
        {
          id: uuidv4().substring(0, 8),
          title: "Integration Test",
          description: "Test integration between different components",
          type: "integration",
          scenarios: ["Test component interactions", "Test data flow"],
          expectedOutcomes: ["Components work together correctly", "Data is properly processed"],
          framework: framework
        }
      ];
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
      `File: ${file.name}\nPath: ${file.path}\nLanguage: ${file.language}\nContent:\n${file.content || '// No content available'}\n`
    ).join('\n---\n');

    const frameworkConfigs = {
      'junit': {
        language: 'Java',
        extension: 'java',
        template: 'JUnit 5 test with @Test annotations'
      },
      'pytest': {
        language: 'Python',
        extension: 'py',
        template: 'PyTest functions with assert statements'
      },
      'jest': {
        language: 'JavaScript',
        extension: 'js',
        template: 'Jest test with describe and it blocks'
      },
      'mocha': {
        language: 'JavaScript',
        extension: 'js',
        template: 'Mocha test with describe and it blocks'
      },
      'selenium': {
        language: 'Python',
        extension: 'py',
        template: 'Selenium WebDriver test for UI automation'
      },
      'cypress': {
        language: 'JavaScript',
        extension: 'js',
        template: 'Cypress end-to-end test'
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
- Template: ${config.template}

Requirements:
1. Generate a complete test file with proper imports for ${framework}
2. Include all necessary setup and teardown methods
3. Write comprehensive test cases that cover the functionality described
4. Include proper assertions and error handling
5. Follow best practices for ${framework} testing
6. Make the tests realistic and practical
7. Include comments explaining the test logic
8. Ensure the code is syntactically correct for ${config.language}

Generate the complete test file content. Return only the code, no markdown formatting, no explanations.
`;

    const model = getGeminiModel(req.geminiKey);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let testCaseCode = response.text();
    
    // Clean the response - remove any markdown formatting
    if (testCaseCode.includes('```')) {
      testCaseCode = testCaseCode.replace(/```[a-zA-Z]*\n?/g, '').replace(/```\n?$/g, '');
    }
    testCaseCode = testCaseCode.trim();

    // Generate appropriate file name
    const timestamp = Date.now();
    const fileName = `test_${testType}_${timestamp}.${config.extension}`;

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
      id: 'jest',
      name: 'Jest',
      language: 'JavaScript/React',
      description: 'Testing for React & JS',
      fileExtension: '.js'
    },
    {
      id: 'junit',
      name: 'JUnit 5',
      language: 'Java',
      description: 'Unit testing for Java',
      fileExtension: '.java'
    },
    {
      id: 'pytest',
      name: 'PyTest',
      language: 'Python',
      description: 'Testing for Python',
      fileExtension: '.py'
    },
    {
      id: 'mocha',
      name: 'Mocha',
      language: 'JavaScript',
      description: 'JS test framework',
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
      description: 'E2E testing framework',
      fileExtension: '.js'
    }
  ];

  res.json({
    success: true,
    frameworks: frameworks
  });
});

module.exports = router;