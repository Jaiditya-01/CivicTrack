# How to Run CivicTrack - Complete Guide

## System Requirements

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MongoDB**: v4.4 or higher (Local or Atlas)
- **RAM**: Minimum 2GB
- **Storage**: Minimum 500MB
- **Browser**: Chrome, Firefox, Safari, Edge (latest versions)

## Pre-Run Checklist

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB running or Atlas connection string ready
- [ ] Port 3000 and 5000 available
- [ ] Internet connection (for Leaflet maps)

## Method 1: Automatic Setup (Windows)

### Step 1: Run Setup Script
Double-click `setup.bat` file in the project root directory.

This will automatically:
- Verify Node.js and npm
- Install backend dependencies
- Install frontend dependencies

### Step 2: Start MongoDB
Open a terminal and run:
```bash
mongod
```

### Step 3: Start Backend
Open a new terminal in the project folder:
```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Step 4: Start Frontend
Open another terminal in the project folder:
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view civictrack-frontend in the browser.

Local: http://localhost:3000
```

## Method 2: Automatic Setup (Linux/Mac)

### Step 1: Run Setup Script
Open terminal in project root and run:
```bash
chmod +x setup.sh
./setup.sh
```

### Step 2-4: Same as Windows method above

## Method 3: Manual Setup

### Step 1: Backend Setup
```bash
# Open Terminal 1
cd backend

# Install dependencies
npm install

# Create .env file (already created, just verify contents)
# MONGODB_URI=mongodb://localhost:27017/civictrack
# JWT_SECRET=civictrack_jwt_secret_key_2026
# JWT_EXPIRE=7d
# PORT=5000
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000

# Start MongoDB (different terminal)
mongod

# Start backend server
npm start
```

### Step 2: Frontend Setup
```bash
# Open Terminal 2
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start
```

## Running the Application

### Terminal 1 - MongoDB
```bash
mongod
```
Output: `Waiting for connections on port 27017`

### Terminal 2 - Backend
```bash
cd backend
npm start
```
Output:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Terminal 3 - Frontend
```bash
cd frontend
npm start
```
Output:
```
Compiled successfully!
Local: http://localhost:3000
```

## Access the Application

1. **Frontend**: Open browser and go to `http://localhost:3000`
2. **Backend API**: `http://localhost:5000/api`
3. **Health Check**: `http://localhost:5000/api/health`

## First Time Usage

### 1. Register as Citizen
- Click "Register here" on login page
- Fill in all required fields
- Select role: "Citizen"
- Click "Register"

### 2. Create a Complaint
- Login with your credentials
- Click "Register a New Complaint"
- Select issue type
- Add description (minimum 10 characters)
- Add address
- **Click on the map** to mark location
- Optionally upload an image
- Click "Register Complaint"

### 3. View Your Complaints
- See complaints listed below form
- Filter by status or issue type
- Click on complaint for details

### 4. Register as Admin (for testing)
- Create another account
- Switch to MongoDB and update user role to "admin"
- Login with admin account
- See admin dashboard with statistics
- Update complaint statuses

## Development vs Production

### Development Mode (Current Setup)
```bash
npm start           # For frontend
npm run dev         # For backend (with nodemon auto-reload)
```

Features:
- Hot module reloading
- Verbose error messages
- Console logs visible
- Source maps enabled

### Production Mode
```bash
npm run build       # Frontend build
node server.js      # Backend (without nodemon)
```

Features:
- Optimized bundle
- No source maps
- Production error handling
- Minimal logging

## Environment Variables

### Backend (.env)

**Required**:
```env
MONGODB_URI=mongodb://localhost:27017/civictrack
JWT_SECRET=civictrack_jwt_secret_key_2026
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

**Optional**:
```env
JWT_EXPIRE=7d
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)

**Default** (can be omitted):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting While Running

### Error: Port 3000 already in use
```bash
# Kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Or change in frontend
BROWSER=none npm start
```

### Error: Port 5000 already in use
```bash
# Change in backend .env
PORT=5001
```

### Error: MongoDB not connecting
```bash
# Check if MongoDB is running
# Terminal: mongod

# If local MongoDB doesn't work, use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civictrack
```

### Error: CORS error in browser
```
Access to XMLHttpRequest blocked by CORS policy
```

Solution:
- Verify `CORS_ORIGIN` in backend .env matches your frontend URL
- Should be: `CORS_ORIGIN=http://localhost:3000`
- Restart backend after changing

### Error: Map not loading
- Check internet connection
- Open browser console (F12) for errors
- Clear browser cache
- Try different browser
- Leaflet requires CDN access

### Error: Cannot find modules
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: 401 Unauthorized
- Token has expired (7 days)
- Logout and login again
- Check localStorage for token

### Error: 403 Forbidden
- Insufficient permissions for action
- Citizen cannot update complaint status
- Only admin/department_officer can update

## Stopping the Application

### To Stop Frontend
- Press `Ctrl+C` in frontend terminal

### To Stop Backend
- Press `Ctrl+C` in backend terminal

### To Stop MongoDB
- Press `Ctrl+C` in MongoDB terminal

## Database Inspection

### Using MongoDB Compass
1. Download MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Browse `civictrack` database
4. View `users` and `complaints` collections

### Using MongoDB CLI
```bash
mongo
use civictrack
db.users.find()
db.complaints.find()
```

## Testing Features

### Test Complaint Flow
1. Create account as citizen
2. Create multiple complaints with different issue types
3. Create admin account and update statuses
4. Rate resolved complaints as citizen
5. View admin dashboard statistics

### Test Different Roles
- **Citizen**: Can create, view, and rate complaints
- **Admin**: Can view and update all complaints
- **Officer**: Can update assigned complaints

## Performance Tips

1. **Optimize Database**: Add indexes for frequently queried fields
2. **Cache**: Browser caches API responses
3. **Lazy Loading**: Frontend lazy loads components
4. **Pagination**: Complaints paginated (10 per page)
5. **Images**: Convert to base64 for smaller size

## Common Commands Reference

```bash
# Backend commands
cd backend
npm install                  # Install dependencies
npm start                    # Start server
npm run dev                  # Start with nodemon (auto-reload)

# Frontend commands
cd frontend
npm install                  # Install dependencies
npm start                    # Start dev server
npm run build                # Create production build
npm test                     # Run tests

# MongoDB
mongod                       # Start MongoDB
mongo                        # Connect to MongoDB CLI
```

## Next Steps After Running

1. **Explore Features**: Create complaints, update statuses
2. **Customize**: Change colors, add more issue types
3. **Deploy**: Push to GitHub, deploy to production
4. **Extend**: Add email notifications, SMS alerts
5. **Scale**: Optimize for large number of complaints

## Getting Help

1. Check error messages in browser console (F12)
2. Check backend terminal for error logs
3. Verify all .env files are correct
4. Ensure MongoDB is running
5. Check API_DOCUMENTATION.md for endpoint details
6. Refer to QUICKSTART.md for quick reference

## System Health Check

Run this to verify setup:
```bash
# Terminal 1: Check Node/npm
node --version
npm --version

# Terminal 2: Check MongoDB
mongod --version

# Terminal 3: Check frontend build
cd frontend && npm list react

# Terminal 4: Check backend
cd backend && npm list express
```

All should show version numbers without errors.

---

**You're ready to go!** 🎉

Start the application and begin managing city complaints efficiently with CivicTrack.

For more details, see:
- README.md - Full documentation
- API_DOCUMENTATION.md - API reference
- QUICKSTART.md - Quick reference guide
