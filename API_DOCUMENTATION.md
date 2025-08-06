# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, the API uses GitHub Personal Access Token for GitHub operations. Set this in your `.env` file:
```
GITHUB_ACCESS_TOKEN=your_github_token_here
```

## Endpoints

### Health Check
**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

### GitHub Integration

#### Get User Repositories
**GET** `/github/repositories`

Get all repositories for the authenticated user.

**Response:**
```json
{
  "success": true,
  "repositories": [
    {
      "id": 123456789,
      "name": "my-repo",
      "full_name": "username/my-repo",
      "owner": "username",
      "description": "Repository description",
      "language": "JavaScript",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "private": false,
      "html_url": "https://github.com/username/my-repo"
    }
  ]
}
```

#### Get Repository Files
**GET** `/github/files/{owner}/{repo}?path={path}`

Get files and directories in a repository.

**Parameters:**
- `owner` (path): Repository owner username
- `repo` (path): Repository name
- `path` (query, optional): Directory path (default: root)

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "name": "example.js",
      "path": "src/example.js",
      "type": "file",
      "size": 1024,
      "sha": "abc123...",
      "url": "https://github.com/username/repo/blob/main/src/example.js",
      "download_url": "https://raw.githubusercontent.com/username/repo/main/src/example.js"
    }
  ],
  "path": "/"
}
```

#### Get File Content
**GET** `/github/file/{owner}/{repo}?path={file_path}`

Get the content of a specific file.

**Parameters:**
- `owner` (path): Repository owner username
- `repo` (path): Repository name
- `path` (query): File path

**Response:**
```json
{
  "success": true,
  "file": {
    "name": "example.js",
    "path": "src/example.js",
    "content": "function add(a, b) { return a + b; }",
    "size": 1024,
    "sha": "abc123...",
    "encoding": "utf-8"
  }
}
```

#### Create Pull Request
**POST** `/github/create-pr`

Create a pull request with generated test cases.

**Request Body:**
```json
{
  "owner": "username",
  "repo": "repository-name",
  "branch": "main",
  "title": "Add test cases",
  "body": "Generated test cases for improved code coverage",
  "files": [
    {
      "path": "tests/test_example.py",
      "content": "import pytest\ndef test_function():\n    assert True"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "pull_request": {
    "id": 123456789,
    "number": 42,
    "title": "Add test cases",
    "html_url": "https://github.com/username/repo/pull/42",
    "state": "open",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### AI Test Generation

#### Get Supported Frameworks
**GET** `/ai/frameworks`

Get list of supported testing frameworks.

**Response:**
```json
{
  "success": true,
  "frameworks": [
    {
      "id": "junit",
      "name": "JUnit 5",
      "language": "Java",
      "description": "Unit testing framework for Java",
      "fileExtension": ".java"
    },
    {
      "id": "pytest",
      "name": "PyTest",
      "language": "Python",
      "description": "Testing framework for Python",
      "fileExtension": ".py"
    }
  ]
}
```

#### Generate Test Case Summaries
**POST** `/ai/generate-summaries`

Generate test case summaries for selected files.

**Request Body:**
```json
{
  "files": [
    {
      "name": "calculator.js",
      "path": "src/calculator.js",
      "content": "function add(a, b) { return a + b; }",
      "language": "JavaScript"
    }
  ],
  "framework": "jest"
}
```

**Response:**
```json
{
  "success": true,
  "summaries": [
    {
      "id": "test_001",
      "title": "Test basic addition functionality",
      "description": "Verify that the add function correctly adds two numbers",
      "type": "unit",
      "scenarios": [
        "Add two positive numbers",
        "Add positive and negative numbers",
        "Add zero to a number"
      ],
      "expectedOutcomes": [
        "Returns correct sum",
        "Handles negative numbers",
        "Returns original number when adding zero"
      ],
      "framework": "jest"
    }
  ],
  "framework": "jest",
  "filesAnalyzed": 1
}
```

#### Generate Detailed Test Case
**POST** `/ai/generate-test-case`

Generate complete test case code.

**Request Body:**
```json
{
  "files": [
    {
      "name": "calculator.js",
      "path": "src/calculator.js",
      "content": "function add(a, b) { return a + b; }",
      "language": "JavaScript"
    }
  ],
  "framework": "jest",
  "testType": "unit",
  "description": "Test the add function with various inputs"
}
```

**Response:**
```json
{
  "success": true,
  "testCase": {
    "fileName": "test_calculator_1705312200000.js",
    "content": "import { describe, it, expect } from '@jest/globals';\n\ndescribe('Calculator', () => {\n  it('should add two positive numbers', () => {\n    expect(add(2, 3)).toBe(5);\n  });\n});",
    "framework": "jest",
    "language": "JavaScript",
    "type": "unit",
    "description": "Test the add function with various inputs"
  }
}
```

---

### Test Case Management

#### Save Test Case Summaries
**POST** `/test-cases/summaries`

Save generated test case summaries.

**Request Body:**
```json
{
  "summaries": [
    {
      "id": "test_001",
      "title": "Test basic addition functionality",
      "description": "Verify that the add function correctly adds two numbers",
      "type": "unit",
      "scenarios": ["Add two positive numbers"],
      "expectedOutcomes": ["Returns correct sum"],
      "framework": "jest"
    }
  ],
  "framework": "jest",
  "sourceFiles": [
    {
      "name": "calculator.js",
      "path": "src/calculator.js"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "summaryId": "uuid-here",
  "message": "Test case summaries saved successfully"
}
```

#### Get All Summaries
**GET** `/test-cases/summaries`

Get all saved test case summaries.

**Response:**
```json
{
  "success": true,
  "summaries": [
    {
      "id": "uuid-here",
      "framework": "jest",
      "sourceFiles": [
        {
          "name": "calculator.js",
          "path": "src/calculator.js"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "status": "pending",
      "summaryCount": 1
    }
  ]
}
```

#### Get Specific Summary
**GET** `/test-cases/summaries/{id}`

Get a specific test case summary by ID.

**Response:**
```json
{
  "success": true,
  "summary": {
    "id": "uuid-here",
    "summaries": [...],
    "framework": "jest",
    "sourceFiles": [...],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "status": "pending"
  }
}
```

#### Save Generated Test Case
**POST** `/test-cases/save`

Save a generated test case.

**Request Body:**
```json
{
  "fileName": "test_calculator.js",
  "content": "import { describe, it, expect } from '@jest/globals';\n\ndescribe('Calculator', () => {\n  it('should add two numbers', () => {\n    expect(add(2, 3)).toBe(5);\n  });\n});",
  "framework": "jest",
  "language": "JavaScript",
  "type": "unit",
  "description": "Test the add function",
  "sourceFiles": [
    {
      "name": "calculator.js",
      "path": "src/calculator.js"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "testCaseId": "uuid-here",
  "message": "Test case saved successfully"
}
```

#### Get All Test Cases
**GET** `/test-cases`

Get all saved test cases.

**Response:**
```json
{
  "success": true,
  "testCases": [
    {
      "id": "uuid-here",
      "fileName": "test_calculator.js",
      "framework": "jest",
      "language": "JavaScript",
      "type": "unit",
      "description": "Test the add function",
      "sourceFiles": [...],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "status": "generated"
    }
  ]
}
```

#### Get Specific Test Case
**GET** `/test-cases/{id}`

Get a specific test case by ID.

**Response:**
```json
{
  "success": true,
  "testCase": {
    "id": "uuid-here",
    "fileName": "test_calculator.js",
    "content": "import { describe, it, expect } from '@jest/globals';\n...",
    "framework": "jest",
    "language": "JavaScript",
    "type": "unit",
    "description": "Test the add function",
    "sourceFiles": [...],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "status": "generated"
  }
}
```

#### Delete Test Case
**DELETE** `/test-cases/{id}`

Delete a test case by ID.

**Response:**
```json
{
  "success": true,
  "message": "Test case deleted successfully"
}
```

#### Delete Test Case Summary
**DELETE** `/test-cases/summaries/{id}`

Delete a test case summary by ID.

**Response:**
```json
{
  "success": true,
  "message": "Test case summary deleted successfully"
}
```

#### Get Statistics
**GET** `/test-cases/stats/overview`

Get statistics about test cases and summaries.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTestCases": 10,
    "totalSummaries": 5,
    "frameworks": {
      "jest": 6,
      "pytest": 4
    },
    "types": {
      "unit": 8,
      "integration": 2
    },
    "recentActivity": [
      {
        "id": "uuid-here",
        "fileName": "test_calculator.js",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "itemType": "testCase"
      }
    ]
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human readable error message",
  "details": "Additional error details (if available)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

### Example Error Response

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "message": "\"files\" is required",
      "path": ["files"],
      "type": "any.required"
    }
  ]
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes
- **Limit**: 100 requests per window per IP
- **Headers**: Rate limit information is included in response headers

---

## CORS

CORS is enabled for development:
- **Origin**: `http://localhost:3000` (development)
- **Credentials**: Enabled
- **Methods**: GET, POST, PUT, DELETE, OPTIONS

For production, update the CORS configuration in `server.js`. 