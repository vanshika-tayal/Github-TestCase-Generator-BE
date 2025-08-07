# GitForge.AI Backend - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Environment Variables**: Gather all required API keys and tokens

## Deployment Steps

### 1. Install Vercel CLI and Login
```bash
npm install -g vercel
vercel login
```

### 2. Deploy to Vercel
```bash
# Navigate to the backend directory
cd Github-TestCase-Generator-BE

# Deploy (first time will ask for configuration)
vercel --prod
```

### 3. Configure Environment Variables
Set these environment variables in your Vercel dashboard or via CLI:

#### Required Environment Variables:
```bash
# Set via Vercel CLI
vercel env add NODE_ENV
# Enter: production

vercel env add GEMINI_API_KEY
# Enter: your_gemini_api_key_from_google_ai_studio

vercel env add GITHUB_ACCESS_TOKEN
# Enter: your_github_personal_access_token

# Optional but recommended
vercel env add JWT_SECRET
# Enter: your_secure_jwt_secret

vercel env add SESSION_SECRET
# Enter: your_secure_session_secret

vercel env add RATE_LIMIT_WINDOW_MS
# Enter: 900000

vercel env add RATE_LIMIT_MAX_REQUESTS
# Enter: 100
```

#### Set via Vercel Dashboard:
1. Go to your project in Vercel dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable with appropriate values

### 4. Update Frontend CORS Configuration
After deployment, update your backend server.js CORS configuration:

```javascript
// In server.js, update the CORS origin
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app', 'https://your-custom-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
```

### 5. Verify Deployment
Check these endpoints after deployment:
- `https://your-backend-url.vercel.app/health` - Should return status OK
- `https://your-backend-url.vercel.app/api/github/repositories` - Should work with proper tokens

## API Endpoints

### Base URL
```
https://your-backend-url.vercel.app
```

### Available Endpoints:
- `GET /health` - Health check
- `POST /api/config/tokens` - Set API tokens
- `GET /api/github/repositories` - Get user repositories
- `GET /api/github/files/:owner/:repo/:path?` - Get repository files
- `POST /api/ai/generate-summaries` - Generate test summaries
- `POST /api/ai/generate-test-case` - Generate test cases
- `POST /api/test-cases` - Save test cases
- `POST /api/github/pull-request` - Create pull requests

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | `AIzaSy...` |
| `GITHUB_ACCESS_TOKEN` | GitHub personal access token | Yes | `ghp_...` |
| `JWT_SECRET` | JWT signing secret | Recommended | `secure-random-string` |
| `SESSION_SECRET` | Session secret key | Recommended | `another-secure-string` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | No | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `100` |

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Update the CORS origin in server.js to include your frontend URL
2. **Environment Variables**: Ensure all required env vars are set in Vercel dashboard
3. **Function Timeout**: Increase maxDuration in vercel.json if needed (max 30s for free tier)
4. **Rate Limiting**: Adjust rate limits if getting 429 errors

### Logs and Debugging:
```bash
# View function logs
vercel logs your-deployment-url

# View recent deployments
vercel list
```

## Security Notes

1. **Never commit** `.env` files or actual API keys
2. **Rotate API keys** regularly
3. **Use strong secrets** for JWT and session secrets
4. **Monitor rate limits** to prevent abuse
5. **Keep dependencies updated** for security patches

## Frontend Integration

After backend deployment, update your frontend API base URL to:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.vercel.app/api'
  : 'http://localhost:5000/api';
```