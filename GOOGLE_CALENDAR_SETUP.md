# Google Calendar API Setup Guide

To enable Google Calendar integration, you need to set up a Google Cloud project and configure OAuth credentials.

## 🚀 **Step 1: Create Google Cloud Project**

1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Note your Project ID** - you'll need this later

## 🔧 **Step 2: Enable Google Calendar API**

1. **Go to APIs & Services > Library**
2. **Search for "Google Calendar API"**
3. **Click on it and press "Enable"**

## 🔑 **Step 3: Create OAuth 2.0 Credentials**

1. **Go to APIs & Services > Credentials**
2. **Click "Create Credentials" > "OAuth client ID"**
3. **If prompted, configure OAuth consent screen first:**
   - Choose "External" user type
   - Fill in required fields:
     - App name: `Lemur AI`
     - User support email: `aditi@synatechsolutions.com`
     - Developer contact: `aditi@synatechsolutions.com`
   - Add scopes: `https://www.googleapis.com/auth/calendar.readonly`
   - Add test users: `aditi@synatechsolutions.com`

4. **Create OAuth Client ID:**
   - Application type: `Web application`
   - Name: `Lemur AI Calendar Integration`
   - Authorized redirect URIs: `http://localhost:8000/auth/google/callback`

5. **Download the credentials** or copy the Client ID and Client Secret

## 📝 **Step 4: Update Environment Variables**

Add these to your `Recall/.env` file:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI_CALENDAR=http://localhost:8000/auth/google/callback

# Existing variables
RECALL_API_KEY=your_recall_api_key
JWT_SECRET_KEY=your_jwt_secret_key
```

## 🧪 **Step 5: Test the Integration**

1. **Install Google dependencies:**
   ```bash
   cd Recall
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Start the backend:**
   ```bash
   python main.py
   ```

3. **Start the frontend:**
   ```bash
   cd project
   npm run dev
   ```

4. **Test Google Calendar connection:**
   - Register/login with `aditi@synatechsolutions.com`
   - Go to Settings > Integrations
   - Click "Connect" for Google Calendar
   - Complete OAuth flow
   - Check calendar events in the Meetings page

## 🔍 **Verification Steps**

1. **Backend logs should show:**
   ```
   INFO: Google OAuth credentials configured successfully
   ```

2. **Test OAuth endpoint:**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:8000/auth/google/calendar
   ```

3. **Check calendar events:**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:8000/calendar/google-events/YOUR_USER_ID
   ```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"OAuth credentials not configured"**
   - Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
   - Restart the backend after adding credentials

2. **"Redirect URI mismatch"**
   - Ensure redirect URI in Google Console matches: `http://localhost:8000/auth/google/callback`
   - Check for typos in the URL

3. **"Access blocked"**
   - Make sure your email is added as a test user in OAuth consent screen
   - Verify the app is in "Testing" mode for development

4. **"Calendar API not enabled"**
   - Go to Google Cloud Console > APIs & Services > Library
   - Search for "Google Calendar API" and enable it

### **Debug Steps:**

1. **Check backend logs** for detailed error messages
2. **Verify environment variables** are loaded correctly
3. **Test OAuth flow** step by step using curl commands
4. **Check Google Cloud Console** for API usage and errors

## 🎯 **Expected Result**

After successful setup:
- ✅ Google Calendar connection works in Settings
- ✅ Real calendar events appear in the calendar view
- ✅ Events are marked with 📅 icon (Google) vs local events
- ✅ Calendar shows both local and Google events merged

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are correct
3. Ensure Google Cloud project is properly configured
4. Check backend logs for specific error messages
