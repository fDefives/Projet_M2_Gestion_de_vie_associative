# 🏗️ Frontend-Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  React Frontend (http://localhost:3001)                 │   │
│  │                                                           │   │
│  │  ┌──────────────┐         ┌──────────────┐              │   │
│  │  │ LoginPage    │ ─────→ │ AdminDashboard               │   │
│  │  └──────────────┘         └──────────────┘              │   │
│  │         ↓                                                 │   │
│  │    Call API                                              │   │
│  │  (axios)                                                 │   │
│  │         ↓                                                 │   │
│  │  Store Tokens                                            │   │
│  │  (localStorage)                                          │   │
│  │                                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│                    HTTP Requests                                 │
│               (with JWT Authorization)                           │
│                           ↓                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │  The Internet  │
                    └───────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              DJANGO SERVER (localhost:8000)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Django REST API                                          │  │
│  │                                                            │  │
│  │  ┌──────────────┐    ┌──────────────┐   ┌────────────┐  │  │
│  │  │ JWT Handler  │───→│ Role-Based   │─→ │ Serialize  │  │  │
│  │  │              │    │ Permissions  │   │ Data       │  │  │
│  │  └──────────────┘    └──────────────┘   └────────────┘  │  │
│  │         ↓                                    ↓              │  │
│  │  Validate Token           Admin: See ALL    Return JSON   │  │
│  │  Extract User ID          User: See OWN     ↓              │  │
│  │  Check Role               Data              HTTP Response  │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                      │  │
│  │                                                            │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐     │  │
│  │  │ Users       │  │ Documents    │  │ Association │     │  │
│  │  │ - id        │  │ - id         │  │ - id        │     │  │
│  │  │ - username  │  │ - title      │  │ - name      │     │  │
│  │  │ - is_staff  │  │ - file       │  │ - members   │     │  │
│  │  └─────────────┘  │ - status     │  └─────────────┘     │  │
│  │                   │ - owner      │                       │  │
│  │                   └──────────────┘                       │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
                    Frontend (React)
                         │
                         ▼
                   User clicks "Login"
                         │
                         ▼
        POST /api/auth/login/ with username & password
                         │
                         ▼
              Backend (Django) validates
                         │
         ┌───────────────┴────────────────┐
         │                                │
    Credentials OK              Credentials Invalid
         │                                │
         ▼                                ▼
    Generate Tokens              Return 401 Error
    - access_token                   │
    - refresh_token                  ▼
         │                    Show error message
         ▼
    Return user data + tokens
         │
         ▼
    Frontend stores in localStorage:
    - localStorage.setItem('access_token')
    - localStorage.setItem('refresh_token')
         │
         ▼
    Add to every future request:
    Headers: {
      'Authorization': 'Bearer <access_token>'
    }
```

## API Request-Response Flow

### Admin Makes Request

```
Admin clicks "Get Documents"
         │
         ▼
axios GET /api/documents/
    Authorization: Bearer <admin_token>
         │
         ▼
Backend receives request
         │
    ┌────┴────┐
    │Validate  │
    │Token     │
    └────┬────┘
         ▼
    Extract: user_id=1, is_staff=true
         │
    ┌────┴──────┐
    │Check Role │
    └────┬──────┘
         ▼
    Role = 'admin'
    → No filtering needed!
         │
         ▼
    Query ALL documents
         │
         ▼
    Return [{doc1}, {doc2}, {doc3}, ...]
         │
         ▼
    Frontend receives data
         │
         ▼
    Display all documents
```

### Regular User Makes Same Request

```
User clicks "Get Documents"
         │
         ▼
axios GET /api/documents/
    Authorization: Bearer <user_token>
         │
         ▼
Backend receives request
         │
    ┌────┴────┐
    │Validate  │
    │Token     │
    └────┬────┘
         ▼
    Extract: user_id=5, is_staff=false
         │
    ┌────┴──────┐
    │Check Role │
    └────┬──────┘
         ▼
    Role = 'user'
    → Filter by association!
         │
         ▼
    Get user's association_id (e.g., 2)
         │
         ▼
    Query documents where:
    association_id = 2
         │
         ▼
    Return [{doc_from_assoc_2}]
         │
         ▼
    Frontend receives data
         │
         ▼
    Display only their documents
```

## Token Refresh Flow

```
User logged in for 25 hours (token expired at 24h)
         │
         ▼
    Clicks "Get Documents"
         │
         ▼
    GET /api/documents/ with expired token
         │
         ▼
    Backend: "401 Unauthorized - Token Expired"
         │
    Frontend's response interceptor:
    ┌─────────────────────────────────┐
    │ Check: Is 401?                  │
    │ Check: Have refresh_token?      │
    │ Check: Already tried to refresh?│
    └─────┬───────────────────────────┘
         ▼
    POST /api/auth/refresh/ with refresh_token
         │
         ▼
    Backend validates refresh_token
         │
         ▼
    Generate new access_token
         │
         ▼
    Return new access_token
         │
         ▼
    Frontend:
    localStorage.setItem('access_token', new_token)
         │
         ▼
    Retry original request GET /api/documents/
         │
         ▼
    Success! ✅
         │
         ▼
    User never knew token expired!
    No re-login needed!
```

## Database Schema

```
┌──────────────────┐
│  CustomUser      │
├──────────────────┤
│ id (PK)          │
│ username         │
│ email            │
│ password_hash    │
│ is_staff (bool)  │ ← Determines role
│ first_name       │
│ last_name        │
│ created_at       │
└──────────────────┘
         │
         │ (1 to Many)
         ↓
┌──────────────────────┐
│  Document            │
├──────────────────────┤
│ id (PK)              │
│ title                │
│ file                 │
│ uploaded_by (FK)  ──→ CustomUser
│ association (FK)  ──→ Association
│ status               │ (pending/approved/rejected)
│ type (FK)         ──→ TypeDocument
│ created_at       │
│ updated_at       │
└──────────────────────┘
         
┌──────────────────────┐
│  Association         │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ description          │
│ created_at           │
└──────────────────────┘
         │
         ↑ (Many to Many)
         │
    Members (Membre)
         │
         ↑ (1 to Many)
         │
    CustomUser

┌──────────────────────┐
│  TypeDocument        │
├──────────────────────┤
│ id (PK)              │
│ name (Statuts,       │
│       Assurance,     │
│       Budget)        │
│ description          │
└──────────────────────┘

┌──────────────────────┐
│  Notification        │
├──────────────────────┤
│ id (PK)              │
│ user (FK)         ──→ CustomUser
│ message              │
│ is_read              │
│ association (FK)  ──→ Association
│ created_at           │
└──────────────────────┘
```

## Docker Network

```
┌─────────────────────────────────────────────────────┐
│          Docker Compose Network                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────┐    ┌──────────────────┐         │
│  │ postgres:5432  │ ←→ │ backend:8000     │         │
│  │ (PostgreSQL)   │    │ (Django API)     │         │
│  └────────────────┘    └────────┬─────────┘         │
│                                 │                    │
│                                 ↓ HTTP:8000         │
│                        ┌──────────────────┐         │
│                        │ frontend:3000    │         │
│                        │ (React App)      │         │
│                        └──────────────────┘         │
│                                                       │
│  External Access:                                    │
│  - DB:       localhost:5432                          │
│  - API:      localhost:8000                          │
│  - Frontend: localhost:3001                          │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Request Headers Example

### Login Request
```
POST /api/auth/login/ HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Content-Length: 45

{
  "username": "admin",
  "password": "admin123"
}
```

### API Request (with Token)
```
GET /api/documents/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json
```

### Response (Success)
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Statuts",
      "status": "approved",
      "uploaded_by": 1,
      "association": 1,
      ...
    }
  ]
}
```

### Response (Error)
```
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "detail": "Invalid token."
}
```

## Environment Variables

```
Frontend (.env):
├── VITE_API_URL=http://localhost:8000/api
│   └── Used in development
│   └── In production: https://api.example.com/api

Backend (.env):
├── SECRET_KEY=your-secret-key
├── DEBUG=True/False
├── ALLOWED_HOSTS=localhost,127.0.0.1
├── DB_HOST=db (Docker) or localhost (Local)
├── DB_NAME=gestion_associative
├── DB_USER=postgres
├── DB_PASSWORD=postgres
├── CORS_ALLOWED_ORIGINS=http://localhost:3000
└── JWT_SECRET_KEY=your-jwt-secret

Docker (docker-compose.yml):
├── VITE_API_URL=http://backend:8000/api
│   └── Internal Docker network URL
│   └── Backend container name: backend
└── Other Django variables...
```

---

## Summary

1. **User logs in** → Frontend calls `/api/auth/login/`
2. **Backend validates** → Returns JWT tokens
3. **Frontend stores tokens** → In localStorage
4. **Frontend makes API calls** → Adds Authorization header
5. **Backend validates token** → Filters data by role
6. **Admin sees all**, **User sees own** → Return appropriate data
7. **Token expires?** → Auto refresh, retry
8. **Stay logged in** → Until manually logout

**Result:** Seamless, secure, role-based API integration! 🚀
