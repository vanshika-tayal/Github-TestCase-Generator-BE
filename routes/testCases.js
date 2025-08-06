const express = require('express');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory storage (in production, use a database)
let testCases = [];
let testCaseSummaries = [];

// Validation schemas
const saveTestCaseSchema = Joi.object({
  fileName: Joi.string().required(),
  content: Joi.string().required(),
  framework: Joi.string().required(),
  language: Joi.string().required(),
  type: Joi.string().required(),
  description: Joi.string().required(),
  sourceFiles: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    path: Joi.string().required()
  })).required()
});

const saveSummarySchema = Joi.object({
  summaries: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().required(),
    scenarios: Joi.array().items(Joi.string()).required(),
    expectedOutcomes: Joi.array().items(Joi.string()).required(),
    framework: Joi.string().required()
  })).required(),
  framework: Joi.string().required(),
  sourceFiles: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    path: Joi.string().required()
  })).required()
});

// Save test case summaries
router.post('/summaries', (req, res) => {
  try {
    const { error, value } = saveSummarySchema.validate(req.body);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameters',
        details: error.details 
      });
    }

    const { summaries, framework, sourceFiles } = value;
    const summaryId = uuidv4();
    const timestamp = new Date().toISOString();

    const summaryData = {
      id: summaryId,
      summaries: summaries,
      framework: framework,
      sourceFiles: sourceFiles,
      createdAt: timestamp,
      status: 'pending'
    };

    testCaseSummaries.push(summaryData);

    res.json({
      success: true,
      summaryId: summaryId,
      message: 'Test case summaries saved successfully'
    });

  } catch (error) {
    console.error('Error saving test case summaries:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save test case summaries',
      message: error.message 
    });
  }
});

// Get all test case summaries
router.get('/summaries', (req, res) => {
  try {
    const summaries = testCaseSummaries.map(summary => ({
      id: summary.id,
      framework: summary.framework,
      sourceFiles: summary.sourceFiles,
      createdAt: summary.createdAt,
      status: summary.status,
      summaryCount: summary.summaries.length
    }));

    res.json({
      success: true,
      summaries: summaries
    });

  } catch (error) {
    console.error('Error fetching test case summaries:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch test case summaries',
      message: error.message 
    });
  }
});

// Get specific test case summary by ID
router.get('/summaries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const summary = testCaseSummaries.find(s => s.id === id);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'Test case summary not found'
      });
    }

    res.json({
      success: true,
      summary: summary
    });

  } catch (error) {
    console.error('Error fetching test case summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch test case summary',
      message: error.message 
    });
  }
});

// Save generated test case
router.post('/save', (req, res) => {
  try {
    const { error, value } = saveTestCaseSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid parameters',
        details: error.details 
      });
    }

    const { fileName, content, framework, language, type, description, sourceFiles } = value;
    const testCaseId = uuidv4();
    const timestamp = new Date().toISOString();

    const testCaseData = {
      id: testCaseId,
      fileName: fileName,
      content: content,
      framework: framework,
      language: language,
      type: type,
      description: description,
      sourceFiles: sourceFiles,
      createdAt: timestamp,
      status: 'generated'
    };

    testCases.push(testCaseData);

    res.json({
      success: true,
      testCaseId: testCaseId,
      message: 'Test case saved successfully'
    });

  } catch (error) {
    console.error('Error saving test case:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save test case',
      message: error.message 
    });
  }
});

// Get all test cases
router.get('/', (req, res) => {
  try {
    const cases = testCases.map(testCase => ({
      id: testCase.id,
      fileName: testCase.fileName,
      framework: testCase.framework,
      language: testCase.language,
      type: testCase.type,
      description: testCase.description,
      sourceFiles: testCase.sourceFiles,
      createdAt: testCase.createdAt,
      status: testCase.status
    }));

    res.json({
      success: true,
      testCases: cases
    });

  } catch (error) {
    console.error('Error fetching test cases:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch test cases',
      message: error.message 
    });
  }
});

// Get specific test case by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const testCase = testCases.find(tc => tc.id === id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: 'Test case not found'
      });
    }

    res.json({
      success: true,
      testCase: testCase
    });

  } catch (error) {
    console.error('Error fetching test case:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch test case',
      message: error.message 
    });
  }
});

// Delete test case
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = testCases.findIndex(tc => tc.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Test case not found'
      });
    }

    testCases.splice(index, 1);

    res.json({
      success: true,
      message: 'Test case deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting test case:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete test case',
      message: error.message 
    });
  }
});

// Delete test case summary
router.delete('/summaries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = testCaseSummaries.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Test case summary not found'
      });
    }

    testCaseSummaries.splice(index, 1);

    res.json({
      success: true,
      message: 'Test case summary deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting test case summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete test case summary',
      message: error.message 
    });
  }
});

// Get statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = {
      totalTestCases: testCases.length,
      totalSummaries: testCaseSummaries.length,
      frameworks: {},
      types: {},
      recentActivity: []
    };

    // Count frameworks
    testCases.forEach(tc => {
      stats.frameworks[tc.framework] = (stats.frameworks[tc.framework] || 0) + 1;
    });

    // Count types
    testCases.forEach(tc => {
      stats.types[tc.type] = (stats.types[tc.type] || 0) + 1;
    });

    // Recent activity (last 10 items)
    const allItems = [
      ...testCases.map(tc => ({ ...tc, itemType: 'testCase' })),
      ...testCaseSummaries.map(s => ({ ...s, itemType: 'summary' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

    stats.recentActivity = allItems;

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

module.exports = router; 