# SkillBridge Local Setup

## Required server environment

Edit `server/.env` and keep your real secrets there:

```env
MONGO_URI=mongodb://localhost:27017/skillbridge
PORT=5000
FRONTEND_URL=http://localhost:5173
ADMIN_EMAILS=prathammagrawal1475@gmail.com,secondadmin@example.com
MARKETPLACE_INQUIRY_EMAIL=prathammagrawal1475@gmail.com

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FALLBACK_MODELS=gemini-2.5-flash-lite,gemini-2.0-flash

VERIFICATION_EXPIRES_MINUTES=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="SkillBridge <your_email@gmail.com>"
SMTP_DEBUG=false
```

For Gmail, `SMTP_PASS` must be an app password, not your normal Google account password.

## Required client environment

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run locally

```powershell
cd "C:\Users\DELL\Documents\New project\skillbridge"
npm install
npm run seed
npm run dev
```

Open `http://localhost:5173`.

## Check health

Open `http://localhost:5000/api/health`. It should show:

```json
{
  "database": {
    "state": "connected",
    "name": "skillbridge"
  },
  "integrations": {
    "geminiConfigured": true,
    "emailConfigured": true
  }
}
```
