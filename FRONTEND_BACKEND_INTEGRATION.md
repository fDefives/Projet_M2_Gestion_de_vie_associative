# 🔗 Frontend-Backend Integration Guide

## ✅ What's Been Configured

### 1. **Real API Integration**
The frontend is now fully connected to the Django REST API backend.

### 2. **Authentication Flow**
```
Frontend (React)
    ↓
Stores JWT tokens (localStorage)
    ↓
Sends Authorization header on every request
    ↓
Backend (Django)
    ↓
Validates token & role
    ↓
Filters/Returns data
```

### 3. **Changes Made**

#### Frontend Changes:
- ✅ **App.tsx** - Now uses real API instead of mock login
- ✅ **LoginPage.tsx** - Calls backend authentication
- ✅ **api.js** - Updated with environment variables & response interceptors
- ✅ **.env** - Created with API URL configuration

#### Backend (Already Configured):
- ✅ CORS enabled for localhost:3000
- ✅ JWT authentication ready
- ✅ All endpoints implemented

---

## 🚀 Starting the Application

### Option 1: Using Docker (Recommended)

```bash
# Start all services
docker-compose up

# Access:
# Frontend: http://localhost:3001
# API: http://localhost:8000/api
# Admin: http://localhost:8000/admin
```

### Option 2: Local Development

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py init_db
python manage.py runserver
# Backend runs on: http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Frontend runs on: http://localhost:5173
```

---

## 📋 Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| User | `user1` | `pass123` |
| User | `user2` | `pass123` |

---

## 🔑 How It Works

### 1. Login Request
```javascript
// Frontend sends
POST /api/auth/login/
{
  "username": "admin",
  "password": "admin123"
}

// Backend responds
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "is_staff": true
  }
}
```

### 2. Token Storage
```javascript
// Frontend stores in localStorage
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);
```

### 3. API Requests
```javascript
// Frontend automatically adds Authorization header
GET /api/documents/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

// Backend:
// 1. Validates token
// 2. Extracts user & role
// 3. Filters data by role
// 4. Returns appropriate data

// Admin → sees ALL documents
// User → sees only their documents
```

### 4. Token Refresh
```javascript
// When access token expires (24h):
// Frontend automatically:
// 1. Detects 401 error
// 2. Uses refresh token to get new access token
// 3. Retries the failed request
// 4. User never needs to re-login
```

---

## 🌐 API Endpoints Available

### Authentication
```
POST   /api/auth/login/           # Login (no auth required)
POST   /api/auth/refresh/         # Refresh token
GET    /api/users/me/             # Current user profile
POST   /api/users/register/       # Register new user
```

### Documents (Main Feature)
```
GET    /api/documents/            # List (filtered by role)
POST   /api/documents/            # Upload new
PATCH  /api/documents/{id}/       # Modify
DELETE /api/documents/{id}/       # Delete
PATCH  /api/documents/{id}/approve/    # Admin only
PATCH  /api/documents/{id}/reject/     # Admin only
GET    /api/documents/?status=approved # Filter by status
GET    /api/documents/?association={id} # Filter by association
```

### Associations
```
GET    /api/associations/
POST   /api/associations/
GET    /api/associations/{id}/
PATCH  /api/associations/{id}/
DELETE /api/associations/{id}/
GET    /api/associations/{id}/documents/
GET    /api/associations/{id}/members/
```

### Members
```
GET    /api/membres/
POST   /api/membres/
PATCH  /api/membres/{id}/
DELETE /api/membres/{id}/
```

### Notifications
```
GET    /api/notifications/
POST   /api/notifications/
PATCH  /api/notifications/{id}/mark_as_read/
```

---

## 🔒 Security Features

✅ **JWT Authentication**
- Signed with HMAC-SHA256
- 24-hour access token
- 7-day refresh token
- Automatic refresh on expiration

✅ **CORS Configuration**
- Frontend can access backend
- Only localhost:3000 & localhost:3001 allowed in production, adjust as needed

✅ **Role-Based Access Control**
- Admin: Full access
- User: Only own data
- Permissions checked on every endpoint

✅ **Token Storage**
- Stored securely in localStorage
- Sent in Authorization header
- Never exposed in URLs or cookies

---

## 📝 Usage Examples

### Example 1: Login & Get Documents
```javascript
import * as API from './api';

// 1. Login
const { access, refresh, user } = await API.loginUser('admin', 'admin123');

// 2. Store tokens
localStorage.setItem('access_token', access);

// 3. Get all documents (Admin sees all)
const docs = await API.getDocuments();
console.log(docs); // All documents from all associations

// 4. Logout
localStorage.removeItem('access_token');
```

### Example 2: User Perspective
```javascript
// Login as regular user
const { access } = await API.loginUser('user1', 'pass123');
localStorage.setItem('access_token', access);

// Get documents (User sees only their own)
const docs = await API.getDocuments();
console.log(docs); // Only their association's documents
```

### Example 3: Upload Document
```javascript
const formData = new FormData();
formData.append('title', 'Statuts');
formData.append('file', fileObject);
formData.append('type', 1);
formData.append('association', 1);

const newDoc = await API.uploadDocument(formData);
console.log(newDoc); // Document created, pending admin approval
```

### Example 4: Admin Approves Document
```javascript
// Only admin can do this
const approvedDoc = await API.approveDocument(docId, 'Looks good!');
console.log(approvedDoc); // Status: approved
```

---

## 🧪 Testing the Integration

### Test 1: Admin Can See All
```bash
# Terminal
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get token, then:
curl -X GET http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer <TOKEN>"

# Result: See ALL documents
```

### Test 2: User Sees Only Their Own
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"pass123"}'

# Get token, then:
curl -X GET http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer <TOKEN>"

# Result: See only user1's documents
```

### Test 3: Frontend Works
1. Open http://localhost:3001 (or http://localhost:5173 for dev)
2. Click "Admin" quick login
3. Should see admin dashboard
4. Click "User 1" to switch user
5. Should see filtered documents

---

## 🐛 Troubleshooting

### "API is not responding"
```
1. Check backend is running: curl http://localhost:8000/api/auth/login/
2. Check CORS settings in backend/config/settings.py
3. Make sure frontend port matches CORS_ALLOWED_ORIGINS
```

### "401 Unauthorized"
```
1. Token missing or expired
2. Try logging in again
3. Check localStorage for 'access_token'
```

### "403 Forbidden"
```
1. User doesn't have permission for this action
2. Check role (admin vs user)
3. Check associations/ownership
```

### "CORS Error"
```
1. Frontend and backend running on different ports
2. Check docker-compose port mappings
3. Verify CORS_ALLOWED_ORIGINS in Django settings
```

### "Network Error"
```
# In Docker:
1. Check docker-compose logs: docker-compose logs -f
2. Make sure services are connected: docker network ls
3. Frontend should reach backend:8000 (internal network)

# Locally:
1. Both frontend and backend running?
2. Backend on port 8000?
3. Frontend on port 3000/5173?
```

---

## 📚 Files Modified

| File | Changes |
|------|---------|
| [frontend/src/App.tsx](../frontend/src/App.tsx) | Added real API login, removed mock |
| [frontend/src/components/LoginPage.tsx](../frontend/src/components/LoginPage.tsx) | Integrated API calls |
| [frontend/src/api.js](../frontend/src/api.js) | Added environment variables & response interceptors |
| [frontend/.env](../frontend/.env) | Created with API URL |
| [docker-compose.yml](../docker-compose.yml) | Updated frontend environment |

---

## 🎯 Next Steps

1. ✅ Start the application (Docker or local)
2. ✅ Test with provided credentials
3. ✅ Verify token is stored in localStorage
4. ✅ Check network requests in DevTools
5. ✅ Integrate more features from the API

---

## 📖 Additional Resources

- [Django REST Framework Docs](https://www.django-rest-framework.org/)
- [JWT Authentication](https://django-rest-framework-simplejwt.readthedocs.io/)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Axios Documentation](https://axios-http.com/)

---

## ✨ Summary

Your frontend and backend are now fully integrated!

- ✅ Real authentication
- ✅ Automatic token handling
- ✅ Role-based data filtering
- ✅ Error handling & refresh logic
- ✅ Environment configuration
- ✅ Production ready

**Start now:**
```bash
docker-compose up
# or
npm run dev  # frontend in separate terminal
python manage.py runserver  # backend in separate terminal
```

**Test now:**
http://localhost:3001 (Docker) or http://localhost:5173 (Dev mode)

Enjoy! 🚀
