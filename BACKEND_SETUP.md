# Backend API Setup Guide

## Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 2. Configure Environment (Optional)
Create `backend/.env` file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-openai-api-key
```

**Note:** If you don't add an API key, the backend will use smart mock responses.

### 3. Run Both Frontend & Backend
From the root directory:
```bash
npm install concurrently
npm run start:all
```

Or run them separately:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

## API Endpoints

### Health Check
```
GET http://localhost:3001/api/health
```

### AI Chat
```
POST http://localhost:3001/api/chat
Body: {
  "question": "How does authentication work?",
  "slideTitle": "Authentication",
  "slideSummary": "User identity verification..."
}
```

## Features

✅ **Smart AI Responses** - OpenAI integration with fallback to mock responses
✅ **CORS Enabled** - Frontend can communicate with backend
✅ **Error Handling** - Graceful fallbacks if API fails
✅ **Connection Status** - Visual indicator in the UI
✅ **Loading States** - User feedback during API calls

## Troubleshooting

**Port Already in Use:**
```bash
# Change PORT in backend/.env
PORT=3002
```

**OpenAI API Errors:**
- Check your API key is valid
- Ensure you have credits in your OpenAI account
- The app will automatically fall back to mock responses

**CORS Issues:**
- Backend is configured for http://localhost:5173
- Update CORS settings in server.js if needed

## Get OpenAI API Key

1. Visit https://platform.openai.com/
2. Sign up/login
3. Go to API Keys section
4. Create a new secret key
5. Add to `backend/.env`
