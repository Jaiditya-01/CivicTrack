# CivicTrack API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "citizen",
  "department": null,
  "address": "123 Main Street",
  "city": "Gandhinagar"
}
```

**Response** (201):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

**Errors**:
- `400`: User already exists
- `400`: Invalid email format
- `400`: Missing required fields

---

### Login User
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen",
    "phone": "9876543210"
  }
}
```

**Errors**:
- `400`: Email or password missing
- `401`: Invalid credentials

---

### Get Current User
**Endpoint**: `GET /auth/me`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "citizen",
    "address": "123 Main Street",
    "city": "Gandhinagar",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors**:
- `401`: No token provided
- `401`: Invalid token

---

### Update Profile
**Endpoint**: `PUT /auth/profile`

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "John Updated",
  "phone": "9876543210",
  "address": "456 New Street",
  "city": "Ahmedabad"
}
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "phone": "9876543210",
    "address": "456 New Street",
    "city": "Ahmedabad",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

---

## Complaint Endpoints

### Create Complaint
**Endpoint**: `POST /complaints`

**Authorization**: Citizen only

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "issueType": "pothole",
  "description": "Large pothole causing damage to vehicles",
  "address": "Main Street, Downtown",
  "latitude": 20.5937,
  "longitude": 78.9629,
  "image": "data:image/jpeg;base64,..." (optional)
}
```

**Response** (201):
```json
{
  "success": true,
  "complaint": {
    "_id": "507f1f77bcf86cd799439011",
    "complaintId": "CT1705330200000001",
    "citizen": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "issueType": "pothole",
    "description": "Large pothole causing damage to vehicles",
    "location": {
      "address": "Main Street, Downtown",
      "latitude": 20.5937,
      "longitude": 78.9629
    },
    "status": "pending",
    "priority": "medium",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors**:
- `400`: Missing required fields
- `400`: Description less than 10 characters
- `401`: Not authenticated
- `403`: Only citizens can create complaints

---

### Get All Complaints
**Endpoint**: `GET /complaints`

**Authorization**: All authenticated users (Citizens see only their complaints)

**Headers**: 
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `status`: Filter by status (pending, in_progress, resolved, rejected)
- `issueType`: Filter by issue type (pothole, garbage, streetlight, etc.)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Example**: 
```
GET /complaints?status=pending&issueType=pothole&page=1&limit=10
```

**Response** (200):
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "page": 1,
  "pages": 3,
  "complaints": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "complaintId": "CT1705330200000001",
      "citizen": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "issueType": "pothole",
      "description": "Large pothole causing damage to vehicles",
      "location": {
        "address": "Main Street, Downtown",
        "latitude": 20.5937,
        "longitude": 78.9629
      },
      "status": "pending",
      "priority": "medium",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Single Complaint
**Endpoint**: `GET /complaints/:id`

**Authorization**: All authenticated users

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "complaint": {
    "_id": "507f1f77bcf86cd799439011",
    "complaintId": "CT1705330200000001",
    "citizen": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "address": "123 Main Street",
      "city": "Gandhinagar"
    },
    "issueType": "pothole",
    "description": "Large pothole causing damage to vehicles",
    "location": {
      "address": "Main Street, Downtown",
      "latitude": 20.5937,
      "longitude": 78.9629
    },
    "image": "image_url",
    "status": "in_progress",
    "priority": "high",
    "assignedDepartment": "roads",
    "assignedOfficer": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Officer Name",
      "email": "officer@example.com"
    },
    "resolutionNotes": "Repair work in progress",
    "ratings": {
      "rating": null,
      "feedback": null
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Errors**:
- `404`: Complaint not found
- `403`: Not authorized to view this complaint

---

### Update Complaint Status
**Endpoint**: `PUT /complaints/:id/status`

**Authorization**: Admin or Department Officer only

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "status": "in_progress",
  "priority": "high",
  "assignedDepartment": "roads",
  "assignedOfficer": "507f1f77bcf86cd799439013",
  "resolutionNotes": "Repair work started. Will be completed by tomorrow."
}
```

**Response** (200):
```json
{
  "success": true,
  "complaint": {
    "_id": "507f1f77bcf86cd799439011",
    "complaintId": "CT1705330200000001",
    "status": "in_progress",
    "priority": "high",
    "assignedDepartment": "roads",
    "assignedOfficer": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Officer Name",
      "email": "officer@example.com",
      "phone": "9876543211"
    },
    "resolutionNotes": "Repair work started. Will be completed by tomorrow.",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

**Errors**:
- `404`: Complaint not found
- `403`: Only admin/department_officer can update

---

### Rate Complaint
**Endpoint**: `PUT /complaints/:id/rate`

**Authorization**: Citizen only (who created the complaint)

**Headers**: 
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "rating": 5,
  "feedback": "Excellent work! Issue resolved quickly."
}
```

**Response** (200):
```json
{
  "success": true,
  "complaint": {
    "_id": "507f1f77bcf86cd799439011",
    "complaintId": "CT1705330200000001",
    "ratings": {
      "rating": 5,
      "feedback": "Excellent work! Issue resolved quickly."
    }
  }
}
```

**Errors**:
- `404`: Complaint not found
- `403`: Not authorized to rate this complaint
- `400`: Invalid rating (must be 1-5)

---

### Get Statistics
**Endpoint**: `GET /complaints/stats/overview`

**Authorization**: Admin or Department Officer only

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "totalComplaints": 45,
    "pending": 12,
    "inProgress": 18,
    "resolved": 13,
    "rejected": 2,
    "issueTypeStats": [
      {
        "_id": "pothole",
        "count": 15
      },
      {
        "_id": "garbage",
        "count": 12
      },
      {
        "_id": "streetlight",
        "count": 10
      },
      {
        "_id": "water_leakage",
        "count": 5
      },
      {
        "_id": "public_safety",
        "count": 3
      }
    ]
  }
}
```

---

### Delete Complaint
**Endpoint**: `DELETE /complaints/:id`

**Authorization**: Citizen (own complaints) or Admin

**Headers**: 
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "message": "Complaint deleted"
}
```

**Errors**:
- `404`: Complaint not found
- `403`: Not authorized to delete this complaint

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - User doesn't have permission |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Issue Types
- `pothole` - Road potholes
- `garbage` - Garbage overflow
- `streetlight` - Broken streetlights
- `water_leakage` - Water leakage issues
- `public_safety` - Public safety concerns
- `other` - Other issues

---

## Status Flow
```
pending → in_progress → resolved
              ↓
           rejected
```

---

## Priority Levels
- `low` - Can be handled anytime
- `medium` - Should be handled soon (default)
- `high` - Urgent, needs immediate attention

---

## Departments
- `roads` - Roads and infrastructure
- `water` - Water supply and sewage
- `electricity` - Electrical services
- `sanitation` - Sanitation and cleanliness
- `public_safety` - Safety and security

---

## User Roles
- `citizen` - Can create and rate complaints
- `admin` - Full access to all complaints
- `department_officer` - Can manage assigned complaints

---

## Example Workflows

### Complete Complaint Flow (Citizen)
1. Register: `POST /auth/register`
2. Login: `POST /auth/login` (get token)
3. Create Complaint: `POST /complaints` (with token)
4. View Complaints: `GET /complaints` (with token)
5. View Details: `GET /complaints/:id` (with token)
6. Rate (when resolved): `PUT /complaints/:id/rate` (with token)

### Admin Workflow
1. Login: `POST /auth/login` (get token)
2. Get Stats: `GET /complaints/stats/overview` (with token)
3. Get All Complaints: `GET /complaints` (with token)
4. Update Complaint: `PUT /complaints/:id/status` (with token)
5. Repeat steps 2-4

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "role": "citizen",
    "city": "Gandhinagar"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Complaint
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "issueType": "pothole",
    "description": "Large pothole on Main Street",
    "address": "Main Street, Downtown",
    "latitude": 20.5937,
    "longitude": 78.9629
  }'
```

---

## Rate Limiting
Currently not implemented. Will be added in future versions.

## Pagination
Default: 10 items per page
Maximum: 100 items per page

---

For more information, refer to the main README.md file.
