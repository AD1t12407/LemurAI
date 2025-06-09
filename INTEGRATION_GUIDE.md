# Frontend-Backend Integration Guide

This guide explains how to run and test the integrated Lemur AI application with both frontend and backend components.

## Architecture Overview

- **Backend**: FastAPI application (`Recall/main.py`) running on port 8000
- **Frontend**: React + Vite application (`project/`) running on port 5173
- **Integration**: REST API communication with CORS enabled

## Prerequisites

1. **Python 3.8+** for the backend
2. **Node.js 16+** for the frontend
3. **Recall AI API Key** (for meeting recording functionality)

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd Recall

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables (optional - you can also set them in the code)
# Create a .env file with:
# RECALL_API_KEY=your_recall_api_key_here
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret

# Start the backend server
python main.py
```

The backend will be available at: http://localhost:8000

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd project

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: http://localhost:5173

## Testing the Integration

### 1. Health Check
Visit http://localhost:5173/api-test to access the API test page where you can:
- Test backend connectivity
- Verify API endpoints are working
- Test bot creation functionality

### 2. Manual Testing
1. **Login**: Use the demo account (demo@lemurai.com / demo1234)
2. **Dashboard**: Click "Record Meeting" to test the recording functionality
3. **Settings**: Go to Integrations tab to test calendar connection

### 3. API Endpoints
The backend exposes these main endpoints:

**Bot Management:**
- `GET /health` - Health check
- `POST /create-bot` - Create recording bot
- `GET /bot/{bot_id}/status` - Get bot status
- `GET /bot/{bot_id}/download-urls` - Get download URLs
- `GET /bots` - List all active bots
- `DELETE /bot/{bot_id}` - Remove bot from tracking

**Calendar Integration:**
- `POST /calendar/auth-token` - Generate calendar auth token
- `POST /calendar/connect/google` - Initiate Google Calendar OAuth
- `GET /calendar/status/{user_id}` - Check calendar connection status

**Calendar Events:**
- `GET /calendar/events/{user_id}` - Get calendar events for user
- `POST /calendar/events` - Create new calendar event
- `PUT /calendar/events/{event_id}` - Update calendar event
- `DELETE /calendar/events/{event_id}` - Delete calendar event

## Key Integration Features

### 1. Meeting Recording
- **Component**: `MeetingRecorder.tsx`
- **Service**: `meetingRecording.ts`
- **Backend**: `/create-bot`, `/bot/{id}/status`, `/bot/{id}/download-urls`

### 2. Calendar Integration
- **Component**: Settings page integrations tab
- **Service**: `calendarIntegration.ts`
- **Backend**: `/calendar/auth-token`, `/calendar/connect/google`, `/calendar/status/{user_id}`

### 3. Calendar Events Management
- **Components**: `Calendar.tsx`, `MeetingScheduler.tsx`
- **Service**: `calendarEvents.ts`
- **Backend**: `/calendar/events/*` endpoints
- **Features**: Create, read, update, delete calendar events

### 4. API Service Layer
- **File**: `services/api.ts`
- **Features**:
  - Axios configuration with interceptors
  - Error handling
  - Type-safe API calls
  - Calendar events CRUD operations

## Environment Configuration

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_NODE_ENV=development
VITE_APP_NAME=Lemur AI
VITE_APP_VERSION=1.0.0
```

### Backend (.env)
```
RECALL_API_KEY=your_recall_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

## CORS Configuration

The backend is configured to allow requests from:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000 (alternative dev port)
- http://127.0.0.1:5173

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS middleware is properly configured
   - Check that frontend is running on allowed origins

2. **Connection Refused**
   - Verify backend is running on port 8000
   - Check firewall settings

3. **API Key Issues**
   - Ensure Recall AI API key is valid
   - Check environment variable configuration

4. **Import Errors**
   - Run `npm install` in frontend directory
   - Run `pip install -r requirements.txt` in backend directory

### Debug Steps

1. Check browser console for JavaScript errors
2. Check browser Network tab for failed API calls
3. Check backend terminal for Python errors
4. Use the `/api-test` page for systematic testing

## Production Deployment

For production deployment:

1. **Backend**: Deploy to a cloud service (AWS, GCP, Heroku)
2. **Frontend**: Build with `npm run build` and deploy to CDN/static hosting
3. **Environment**: Update `VITE_API_BASE_URL` to production backend URL
4. **CORS**: Update allowed origins in backend CORS configuration

## Next Steps

1. Add authentication tokens for API security
2. Implement proper error boundaries in React
3. Add loading states and better UX
4. Set up proper logging and monitoring
5. Add unit and integration tests

## Support

If you encounter issues:
1. Check this guide first
2. Review the browser console and network tab
3. Check backend logs
4. Use the API test page to isolate issues
