// File utility functions for handling code files and language detection

const languageExtensions = {
  // JavaScript/TypeScript
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  
  // Python
  '.py': 'Python',
  '.pyw': 'Python',
  
  // Java
  '.java': 'Java',
  
  // C/C++
  '.c': 'C',
  '.cpp': 'C++',
  '.cc': 'C++',
  '.cxx': 'C++',
  '.h': 'C/C++',
  '.hpp': 'C++',
  
  // C#
  '.cs': 'C#',
  
  // PHP
  '.php': 'PHP',
  
  // Ruby
  '.rb': 'Ruby',
  
  // Go
  '.go': 'Go',
  
  // Rust
  '.rs': 'Rust',
  
  // Swift
  '.swift': 'Swift',
  
  // Kotlin
  '.kt': 'Kotlin',
  '.kts': 'Kotlin',
  
  // Scala
  '.scala': 'Scala',
  
  // Clojure
  '.clj': 'Clojure',
  
  // Web technologies
  '.html': 'HTML',
  '.css': 'CSS',
  '.scss': 'SCSS',
  '.sass': 'Sass',
  '.vue': 'Vue',
  '.svelte': 'Svelte'
};

/**
 * Detect programming language from file extension
 * @param {string} fileName - The name of the file
 * @returns {string} - The detected language
 */
function detectLanguage(fileName) {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return languageExtensions[extension] || 'Unknown';
}

/**
 * Check if file is a code file based on extension
 * @param {string} fileName - The name of the file
 * @returns {boolean} - True if it's a code file
 */
function isCodeFile(fileName) {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return Object.keys(languageExtensions).includes(extension);
}

/**
 * Get appropriate test framework for a language
 * @param {string} language - The programming language
 * @returns {Array} - Array of suitable test frameworks
 */
function getTestFrameworks(language) {
  const frameworkMap = {
    'JavaScript': ['jest', 'mocha', 'cypress'],
    'TypeScript': ['jest', 'mocha', 'cypress'],
    'Python': ['pytest', 'selenium'],
    'Java': ['junit'],
    'C#': ['nunit', 'xunit'],
    'PHP': ['phpunit'],
    'Ruby': ['rspec'],
    'Go': ['testing'],
    'Rust': ['cargo-test']
  };
  
  return frameworkMap[language] || ['jest', 'pytest', 'junit'];
}

/**
 * Generate appropriate test file name
 * @param {string} originalFileName - Original file name
 * @param {string} framework - Test framework
 * @returns {string} - Generated test file name
 */
function generateTestFileName(originalFileName, framework) {
  const nameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
  const frameworkExtensions = {
    'junit': '.java',
    'pytest': '.py',
    'jest': '.js',
    'mocha': '.js',
    'selenium': '.py',
    'cypress': '.js'
  };
  
  const ext = frameworkExtensions[framework] || '.js';
  return `test_${nameWithoutExt}${ext}`;
}

/**
 * Get file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Human readable size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Sanitize file content for AI processing
 * @param {string} content - File content
 * @param {number} maxLength - Maximum length allowed
 * @returns {string} - Sanitized content
 */
function sanitizeContent(content, maxLength = 50000) {
  if (!content) return '';
  
  // Remove null characters and other problematic characters
  let sanitized = content.replace(/\0/g, '');
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '\n// ... (content truncated)';
  }
  
  return sanitized;
}

/**
 * Extract function names from code content
 * @param {string} content - Code content
 * @param {string} language - Programming language
 * @returns {Array} - Array of function names
 */
function extractFunctions(content, language) {
  const functions = [];
  
  if (!content) return functions;
  
  const patterns = {
    'JavaScript': /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|let\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|var\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function))/g,
    'TypeScript': /(?:function\s+(\w+)|const\s+(\w+)\s*:\s*[^=]*=\s*(?:\([^)]*\)\s*=>|function)|let\s+(\w+)\s*:\s*[^=]*=\s*(?:\([^)]*\)\s*=>|function))/g,
    'Python': /def\s+(\w+)\s*\(/g,
    'Java': /(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(?:<[^>]*>\s+)?(?:[\w<>\[\]]+\s+)?(\w+)\s*\(/g,
    'C#': /(?:public|private|protected|internal)?\s*(?:static\s+)?(?:virtual\s+)?(?:override\s+)?(?:async\s+)?(?:[\w<>\[\]]+\s+)?(\w+)\s*\(/g
  };
  
  const pattern = patterns[language] || patterns['JavaScript'];
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    const functionName = match[1] || match[2] || match[3] || match[4];
    if (functionName && !functions.includes(functionName)) {
      functions.push(functionName);
    }
  }
  
  return functions;
}

module.exports = {
  detectLanguage,
  isCodeFile,
  getTestFrameworks,
  generateTestFileName,
  formatFileSize,
  sanitizeContent,
  extractFunctions
}; 