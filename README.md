# CivicTrack - Smart City Complaint Management System

## Project Overview

CivicTrack is a comprehensive MERN Stack application for managing city-related complaints efficiently. Citizens can report issues like potholes, garbage overflow, broken streetlights, water leakage, and public safety concerns. Administrators and department officers can track and resolve these complaints through a centralized dashboard.

## Features

- **Role-Based Authentication**: Citizen, Admin, and Department Officer roles
- **Complaint Management**: Create, track, and manage complaints in real-time
- **Location Mapping**: Use Leaflet.js for location-based complaint registration
- **Status Tracking**: Monitor complaints through Pending → In Progress → Resolved workflow
- **Dashboard Analytics**: View statistics and issue heatmaps
- **Image Upload**: Attach proof images to complaints
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + bcryptjs
- **Image Storage**: Cloudinary (Optional)
- **Server Port**: 5000

### Frontend
- **Framework**: React.js
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Maps**: Leaflet.js + React-Leaflet
- **HTTP Client**: Axios
- **Dev Port**: 3000

## Project Structure

```
projects/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── complaintController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── complaints.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Header.js
    │   │   ├── ComplaintForm.js
    │   │   └── ComplaintList.js
    │   ├── pages/
    │   │   ├── CitizenDashboard.js
    │   │   └── AdminDashboard.js
    │   ├── App.js
    │   ├── AuthContext.js
    │   ├── ProtectedRoute.js
    │   ├── api.js
    │   ├── index.js
    │   ├── index.css
    │   ├── tailwind.config.js
    │   └── postcss.config.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** with the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/civictrack
   JWT_SECRET=civictrack_jwt_secret_key_2026
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start MongoDB** (if using local):
   ```bash
   mongod
   ```

5. **Start the backend server**:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file** (optional, uses defaults):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server**:
   ```bash
   npm start
   ```

   The frontend will open at `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Complaint Endpoints

- `POST /api/complaints` - Create complaint (Citizen only)
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get single complaint
- `PUT /api/complaints/:id/status` - Update complaint status (Admin/Officer)
- `PUT /api/complaints/:id/rate` - Rate resolved complaint (Citizen)
- `GET /api/complaints/stats/overview` - Get statistics (Admin/Officer)
- `DELETE /api/complaints/:id` - Delete complaint

## User Roles

### Citizen
- Register and login
- Create complaints with location and images
- Track complaint status
- Rate resolved complaints
- View only their own complaints

### Admin/Department Officer
- View all complaints
- Update complaint status (Pending → In Progress → Resolved)
- Assign complaints to departments
- Add resolution notes
- View analytics and statistics

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (citizen/admin/department_officer),
  department: String (roads/water/electricity/sanitation/public_safety),
  address: String,
  city: String,
  profileImage: String,
  isActive: Boolean,
  timestamps: true
}
```

### Complaint Model
```javascript
{
  complaintId: String (unique, auto-generated),
  citizen: ObjectId (User reference),
  issueType: String (pothole/garbage/streetlight/water_leakage/public_safety/other),
  description: String,
  location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  image: String,
  status: String (pending/in_progress/resolved/rejected),
  priority: String (low/medium/high),
  assignedDepartment: String,
  assignedOfficer: ObjectId (User reference),
  resolutionNotes: String,
  completedAt: Date,
  ratings: {
    rating: Number (1-5),
    feedback: String
  },
  timestamps: true
}
```

## Workflow

### Citizen Workflow
1. Register with email and phone
2. Login to dashboard
3. Create complaint with:
   - Issue type
   - Description
   - Location (click on map)
   - Optional image proof
4. View complaint in list
5. Track status in real-time
6. Rate complaint once resolved

### Admin/Officer Workflow
1. Login to admin dashboard
2. View all complaints and statistics
3. Click "Update" on any complaint
4. Update status and add resolution notes
5. Assign to appropriate department
6. Set priority level
7. Mark as resolved when complete

## Testing the Application

### Test Citizen Account
- Email: `citizen@test.com`
- Password: `password123`

### Test Admin Account
- Email: `admin@test.com`
- Password: `password123`

> Create these accounts by registering in the application first and updating their role in MongoDB.

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/civictrack |
| JWT_SECRET | JWT signing secret | civictrack_secret_2026 |
| JWT_EXPIRE | JWT token expiration | 7d |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| CORS_ORIGIN | Frontend URL for CORS | http://localhost:3000 |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API base URL | http://localhost:5000/api |

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017/civictrack`

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution**: Ensure MongoDB is running. Start with `mongod` or use MongoDB Atlas connection string.

### Issue: CORS Error
**Solution**: Update `CORS_ORIGIN` in backend `.env` to match frontend URL.

### Issue: Map Not Loading
**Solution**: Check internet connection. Leaflet requires CDN access for tiles.

### Issue: Image Upload Not Working
**Solution**: Configure Cloudinary credentials in `.env` or remove image feature temporarily.

### Issue: Port Already in Use
**Solution**: Change PORT in backend `.env` or kill the process using the port.

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

## Features Implementation Details

### Authentication Flow
1. User registers with email and password
2. Password is hashed using bcryptjs (10 salt rounds)
3. JWT token is generated on successful login
4. Token is stored in localStorage
5. Token is sent in Authorization header for protected routes

### Complaint Creation
1. Citizen fills form with issue details
2. Clicks on map to set location coordinates
3. Optionally uploads image (converted to base64)
4. System generates unique complaint ID
5. Complaint is saved to MongoDB

### Status Tracking
- **Pending**: Initial state when complaint is created
- **In Progress**: Admin has assigned and started work
- **Resolved**: Issue has been fixed with resolution notes
- **Rejected**: Complaint found invalid or duplicate

### Real-time Updates
Frontend polls the backend for updates when viewing complaint list/details.

## Future Enhancements

- AI-based automatic complaint categorization
- Real-time notifications using Socket.io
- Heatmap analytics for problem zones
- Mobile app version
- IoT sensor integration
- Push notifications
- SMS alerts
- Admin reports and exports

## Security Measures

- Passwords hashed with bcryptjs
- JWT token-based authentication
- CORS enabled for specific origin
- Protected routes with role-based access
- Input validation on both frontend and backend
- MongoDB injection prevention with Mongoose
- XSS protection via React's built-in sanitization

## Performance Optimization

- Lazy loading of components
- Pagination for complaint lists (10 items per page)
- Optimized MongoDB queries with indexing
- Frontend caching with localStorage
- CSS bundling with Tailwind

## Deployment

### Backend Deployment (Heroku Example)
```bash
cd backend
heroku create civictrack-api
git push heroku main
```

### Frontend Deployment (Vercel Example)
```bash
cd frontend
npm run build
# Deploy using Vercel CLI or GitHub integration
```

## License

This project is for educational purposes under PDEU AWT Lab.

## Support

For issues or questions, please refer to the project documentation or contact your instructor.

---

**Project**: CivicTrack - Smart City Complaint Management System  
**Semester**: Sem 6  
**Course**: Advanced Web Technology (MERN Stack)  
**Institution**: PDEU
