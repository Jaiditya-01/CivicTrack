# CivicTrack - Quick Start Guide

## 🚀 Step-by-Step Installation

### Step 1: Prerequisites Check
- [ ] Node.js installed? Check: `node --version` (should be v14+)
- [ ] npm installed? Check: `npm --version`
- [ ] MongoDB running? Check: `mongod` in terminal (for local) or MongoDB Atlas account

### Step 2: Backend Installation

**Open Terminal 1**

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file in backend directory
# Copy the template from .env file (already created)

# Start MongoDB (if local - different terminal)
mongod

# Start the server
npm start
```

Expected output:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Step 3: Frontend Installation

**Open Terminal 2**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

Expected output:
```
Compiled successfully!
You can now view civictrack-frontend in the browser
Local: http://localhost:3000
```

## 📝 Database Setup

### Option A: Local MongoDB

1. **Install MongoDB**: https://docs.mongodb.com/manual/installation/
2. **Start MongoDB**:
   ```bash
   mongod
   ```
3. **Verify** by checking `mongodb://localhost:27017/civictrack`

### Option B: MongoDB Atlas (Cloud)

1. **Sign up**: https://www.mongodb.com/cloud/atlas
2. **Create cluster** and get connection string
3. **Update .env**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civictrack
   ```

## 🧪 Test the Application

### 1. Register New Account
- Go to `http://localhost:3000/register`
- Create account as **Citizen**
- Fill in all required fields

### 2. Create Complaint
- Login with your account
- Click on "Register a New Complaint"
- Select issue type (Pothole, Garbage, etc.)
- Add description and address
- **Click on map** to select location (required!)
- Upload image (optional)
- Click "Register Complaint"

### 3. View Complaints
- See your complaints in the list below
- Click on any complaint to see details
- Filter by status or issue type

### 4. Admin Testing
- Create another account
- Update the user's role to "admin" in MongoDB
- Login and see all complaints
- Click "Update" to change status and add notes

## 🔑 Default Test Credentials

You'll need to create these by registering:
- **Citizen**: Create via register form
- **Admin**: Create via register, then update role in MongoDB to "admin"

### To Update User Role in MongoDB

**Using MongoDB Compass**:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Go to `civictrack` database → `users` collection
4. Find your user document
5. Edit and change `role` field to "admin"

**Using MongoDB CLI**:
```bash
mongo
use civictrack
db.users.updateOne({email: "admin@test.com"}, {$set: {role: "admin"}})
```

## 📁 File Structure Explanation

### Backend Files
- `server.js` - Main Express server entry point
- `config/database.js` - MongoDB connection setup
- `models/` - Database schemas (User, Complaint)
- `controllers/` - Business logic for routes
- `routes/` - API endpoint definitions
- `middleware/auth.js` - JWT verification and role checking
- `.env` - Environment variables (DON'T commit this!)

### Frontend Files
- `App.js` - Main app component and routing
- `AuthContext.js` - Global authentication state
- `api.js` - Axios HTTP client with interceptors
- `components/` - Reusable UI components
- `pages/` - Full page components (Dashboards)
- `index.js` - React app entry point

## 🐛 Troubleshooting

### Problem: Port 5000 already in use
```bash
# Kill the process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in backend/.env
PORT=5001
```

### Problem: Cannot connect to MongoDB
```bash
# Make sure MongoDB is running
# Terminal: mongod

# Or update connection string in .env to MongoDB Atlas
MONGODB_URI=mongodb+srv://...
```

### Problem: CORS error on frontend
- Check that `CORS_ORIGIN` in backend/.env matches frontend URL
- Should be: `CORS_ORIGIN=http://localhost:3000`

### Problem: Map not showing
- Ensure internet connection (Leaflet uses CDN)
- Check browser console for errors
- Clear browser cache and refresh

### Problem: npm install failing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## 📱 Features Demo

### For Citizens:
1. **Register** → **Create Complaint** → **Track Status** → **Rate when Resolved**

### For Admin:
1. **Login** → **View Dashboard** → **See Statistics** → **Update Complaint Status**

## 🔐 Security Notes

- Passwords are hashed with bcryptjs
- JWT tokens expire in 7 days (configurable)
- Protected routes require valid token
- Admin routes check user role

## 📊 API Testing

### Using Postman

**Register User**
```
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "John Doe",
  "email": "john@test.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "citizen",
  "city": "Gandhinagar"
}
```

**Login**
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "email": "john@test.com",
  "password": "password123"
}
```

**Create Complaint**
```
POST http://localhost:5000/api/complaints
Headers:
  Authorization: Bearer <token_from_login>
Body (JSON):
{
  "issueType": "pothole",
  "description": "Large pothole on Main Street causing accidents",
  "address": "Main Street, Downtown",
  "latitude": 20.5937,
  "longitude": 78.9629
}
```

## 📞 Getting Help

1. Check the error message in browser console (F12)
2. Check backend terminal for error logs
3. Verify `.env` files are correctly configured
4. Ensure all dependencies are installed (`npm install`)
5. Check MongoDB is running

## ✨ Next Steps

- Customize colors in `frontend/tailwind.config.js`
- Add more issue types in models
- Implement image upload to Cloudinary
- Add email notifications
- Deploy to production (Heroku, Vercel, AWS)

Happy Coding! 🎉
