# Test Case Generator Backend

A powerful Node.js backend application that integrates with GitHub to automatically generate test cases for code files using AI. The application supports multiple testing frameworks and provides a comprehensive API for test case generation and management.

## Features

- 🔗 **GitHub Integration**: Connect to GitHub repositories and browse code files
- 🤖 **AI-Powered Test Generation**: Generate test cases using Google's Gemini AI
- 📋 **Multiple Frameworks**: Support for JUnit, PyTest, Jest, Mocha, Selenium, and Cypress
- 📊 **Test Case Management**: Save, organize, and manage generated test cases
- 🔄 **Pull Request Creation**: Automatically create PRs with generated test cases
- 🛡️ **Security**: Rate limiting, input validation, and error handling
- 📈 **Statistics**: Track test case generation metrics

## Supported Languages & Frameworks

| Language | Frameworks | File Extensions |
|----------|------------|-----------------|
| JavaScript/TypeScript | Jest, Mocha, Cypress | `.js`, `.jsx`, `.ts`, `.tsx` |
| Python | PyTest, Selenium | `.py`, `.pyw` |
| Java | JUnit | `.java` |
| C/C++ | Google Test | `.c`, `.cpp`, `.cc`, `.cxx` |
| C# | NUnit, xUnit | `.cs` |
| PHP | PHPUnit | `.php` |
| Ruby | RSpec | `.rb` |
| Go | Testing | `.go` |
| Rust | Cargo Test | `.rs` |

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub Personal Access Token
- Google Gemini API Key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test-case-generator-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # GitHub Configuration
   GITHUB_ACCESS_TOKEN=your_github_personal_access_token
   
   # AI Configuration
   GEMINI_API_KEY=your_gemini_api_key
   
   # Security
   JWT_SECRET=your_jwt_secret_key
   SESSION_SECRET=your_session_secret
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /health
```

### GitHub Integration

#### Get User Repositories
```http
GET /github/repositories
```

#### Get Repository Files
```http
GET /github/files/{owner}/{repo}?path={path}
```

#### Get File Content
```http
GET /github/file/{owner}/{repo}?path={file_path}
```

#### Create Pull Request
```http
POST /github/create-pr
Content-Type: application/json

{
  "owner": "username",
  "repo": "repository-name",
  "branch": "main",
  "title": "Add test cases",
  "body": "Generated test cases for improved code coverage",
  "files": [
    {
      "path": "tests/test_example.py",
      "content": "test code content"
    }
  ]
}
```

### AI Test Generation

#### Get Supported Frameworks
```http
GET /ai/frameworks
```

#### Generate Test Case Summaries
```http
POST /ai/generate-summaries
Content-Type: application/json

{
  "files": [
    {
      "name": "example.js",
      "path": "src/example.js",
      "content": "function add(a, b) { return a + b; }",
      "language": "JavaScript"
    }
  ],
  "framework": "jest"
}
```

#### Generate Detailed Test Case
```http
POST /ai/generate-test-case
Content-Type: application/json

{
  "files": [
    {
      "name": "example.js",
      "path": "src/example.js",
      "content": "function add(a, b) { return a + b; }",
      "language": "JavaScript"
    }
  ],
  "framework": "jest",
  "testType": "unit",
  "description": "Test the add function with various inputs"
}
```

### Test Case Management

#### Save Test Case Summaries
```http
POST /test-cases/summaries
Content-Type: application/json

{
  "summaries": [...],
  "framework": "jest",
  "sourceFiles": [...]
}
```

#### Get All Summaries
```http
GET /test-cases/summaries
```

#### Save Generated Test Case
```http
POST /test-cases/save
Content-Type: application/json

{
  "fileName": "test_example.js",
  "content": "test code...",
  "framework": "jest",
  "language": "JavaScript",
  "type": "unit",
  "description": "Test description",
  "sourceFiles": [...]
}
```

#### Get All Test Cases
```http
GET /test-cases
```

#### Get Statistics
```http
GET /test-cases/stats/overview
```

## Usage Examples

### 1. Generate Test Cases for a JavaScript Function

```javascript
// Example: Generate Jest tests for a calculator function
const response = await fetch('/api/ai/generate-summaries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    files: [{
      name: 'calculator.js',
      path: 'src/calculator.js',
      content: `
        function add(a, b) { return a + b; }
        function subtract(a, b) { return a - b; }
        function multiply(a, b) { return a * b; }
        function divide(a, b) { return a / b; }
      `,
      language: 'JavaScript'
    }],
    framework: 'jest'
  })
});

const { summaries } = await response.json();
```

### 2. Create a Pull Request with Generated Tests

```javascript
const prResponse = await fetch('/api/github/create-pr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    owner: 'your-username',
    repo: 'your-repo',
    branch: 'main',
    title: 'Add comprehensive test suite',
    body: 'Generated test cases for improved code coverage and reliability',
    files: [{
      path: 'tests/calculator.test.js',
      content: generatedTestCode
    }]
  })
});
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human readable error message",
  "details": "Additional error details (if available)"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

## Security Features

- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **Input Validation**: Joi schema validation for all inputs
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers middleware
- **Error Sanitization**: Sensitive information is not exposed in errors

## Development

### Project Structure
```
├── server.js              # Main server file
├── routes/                # API route handlers
│   ├── github.js         # GitHub integration
│   ├── ai.js             # AI test generation
│   └── testCases.js      # Test case management
├── middleware/            # Custom middleware
│   └── errorHandler.js   # Error handling
├── utils/                 # Utility functions
│   └── fileUtils.js      # File handling utilities
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

### Running Tests
```bash
npm test
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `GITHUB_ACCESS_TOKEN` | GitHub API token | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `JWT_SECRET` | JWT signing secret | No | random string |
| `SESSION_SECRET` | Session secret | No | random string |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error handling section

## Roadmap

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Test case templates and customization
- [ ] Integration with CI/CD pipelines
- [ ] Support for more testing frameworks
- [ ] Test case execution and reporting
- [ ] Webhook support for automatic generation 