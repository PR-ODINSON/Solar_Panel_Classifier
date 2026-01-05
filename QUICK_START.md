# 🚀 Quick Start Guide - O&M Module

## Starting the Application

### Method 1: Complete System (Recommended)
```batch
start_all_servers.bat
```
This starts both backend and frontend in separate windows.

### Method 2: Individual Servers

**Backend:**
```batch
start_backend_checked.bat
```

**Frontend:**
```batch
cd frontend
npm start
```

## Testing the Setup

### Quick CORS Test
Open in browser: `test-cors.html`

This will test:
- ✅ Backend connectivity
- ✅ CORS configuration
- ✅ API endpoints
- ✅ Authentication flow

### Manual Testing

1. **Backend Health Check:**
   - Open: http://localhost:8000/health
   - Should show: `{"status":"healthy"}`

2. **Frontend:**
   - Open: http://localhost:3000
   - Should load login page
   - No CORS errors in console

## Common Issues & Quick Fixes

### ❌ CORS Error
**Symptoms:** "Access-Control-Allow-Origin header is present"

**Fix:**
```batch
1. Close all terminal windows
2. Run: start_backend_checked.bat
3. Wait for "Server running" message
4. Start frontend
```

### ❌ Port Already in Use
**Fix:**
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use the checked startup script - it does this automatically
```

### ❌ MongoDB Connection Failed
**Note:** Server will still run! Database features won't work but you can still:
- Access the health endpoint
- Test CORS
- See if authentication works

**Long-term fix:**
- Check internet connection
- Verify MongoDB URI in `.env`

### ❌ Cannot Login
**Check:**
1. Backend is running (http://localhost:8000/health)
2. No CORS errors in browser console (F12)
3. MongoDB is connected (check backend terminal)
4. Using correct credentials

## File Overview

| File | Purpose |
|------|---------|
| `start_all_servers.bat` | Start both servers together |
| `start_backend_checked.bat` | Start backend with health checks |
| `test-cors.html` | Test CORS configuration |
| `CORS_FIX_PERMANENT.md` | Detailed CORS fix documentation |
| `backend/server.js` | Backend server (updated with CORS fix) |
| `backend/config/database.js` | Database connection (resilient) |

## Demo Credentials

**Admin:**
- Email: admin@insolare.ac.in
- Password: admin123

**Maintenance Staff:**
- Email: maintenance@solarpanel.com
- Password: maintenance123

## Server URLs

| Service | URL |
|---------|-----|
| Backend | http://localhost:8000 |
| Frontend | http://localhost:3000 |
| Health Check | http://localhost:8000/health |
| MongoDB Atlas | (Cloud - check .env) |

## Need Help?

1. Check server logs in terminal windows
2. Run CORS test: open `test-cors.html`
3. Review: `CORS_FIX_PERMANENT.md`
4. Check browser console (F12) for errors

## Development Tips

- Keep both terminal windows visible
- Watch for errors in backend terminal
- Use browser DevTools Network tab to debug API calls
- Backend logs all requests in development mode
