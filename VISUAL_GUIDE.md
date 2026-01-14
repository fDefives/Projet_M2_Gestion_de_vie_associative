# 🎬 Step-by-Step Visual Guide

## 🚀 Getting Started

### Step 1: Start the Application

#### Option A: Docker (Recommended)
```bash
# Run this single command
docker-compose up

# Wait for output:
# ✓ postgres_asso (PostgreSQL)
# ✓ django_backend (Django API)
# ✓ react_frontend (React)
```

#### Option B: Local Development
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py init_db
python manage.py runserver
# Shows: "Starting development server at http://127.0.0.1:8000/"

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Shows: "VITE v4.x.x  ready in xxx ms"
```

### Step 2: Open Your Browser

Go to one of these URLs:

| Setup | URL |
|-------|-----|
| Docker | http://localhost:3001 |
| Local Dev | http://localhost:5173 |

You should see:

```
┌───────────────────────────────────────┐
│   Plateforme Vie Associative          │
│   La Rochelle Université              │
│                                       │
│   [Username/Email input]              │
│   [Password input]                    │
│   [Se connecter button]               │
│                                       │
│   --- Comptes de test disponibles --- │
│   [👨‍💼 Admin / admin123]               │
│   [👥 User 1 / pass123]               │
│   [👥 User 2 / pass123]               │
└───────────────────────────────────────┘
```

---

## 👤 Login as Admin

### Option 1: Quick Click
```
Click: [👨‍💼 Admin] button

This is equivalent to:
┌─────────────────┐
│ Username: admin │
│ Password: admin123
└─────────────────┘
```

### Option 2: Manual Entry
```
1. Type "admin" in username field
2. Type "admin123" in password field
3. Click "Se connecter"
```

### What Happens Behind the Scenes

```
1. Frontend sends:
   POST /api/auth/login/
   { "username": "admin", "password": "admin123" }

2. Backend validates credentials
   ✓ User exists
   ✓ Password correct
   ✓ Check is_staff flag

3. Backend returns:
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     "user": {
       "id": 1,
       "username": "admin",
       "email": "admin@example.com",
       "is_staff": true
     }
   }

4. Frontend stores in localStorage:
   localStorage.setItem('access_token', token)
   localStorage.setItem('refresh_token', token)

5. Frontend redirects to dashboard
```

### Result

You'll see the **Admin Dashboard**:

```
┌────────────────────────────────────────────┐
│  Admin Dashboard                    [Logout]
├────────────────────────────────────────────┤
│                                             │
│  📊 Overview                                │
│  ├─ Total Associations: 2                 │
│  ├─ Total Users: 3                        │
│  ├─ Pending Documents: 5                  │
│  └─ Total Documents: 15                   │
│                                             │
│  📋 Associations List                      │
│  ├─ [BDE] (5 members, 3 documents)       │
│  ├─ [Culturelle] (8 members, 7 docs)     │
│  └─ [Sports] (12 members, 5 docs)        │
│                                             │
│  📄 Recent Documents                       │
│  ├─ Statuts (BDE) - Approved             │
│  ├─ Assurance (Culturelle) - Pending     │
│  └─ Budget (Sports) - Approved           │
│                                             │
│  ✅ Admin sees EVERYTHING                  │
│                                             │
└────────────────────────────────────────────┘
```

---

## 👥 Login as Regular User

### Quick Click
```
Click: [👥 User 1] button

This logs in as: user1 / pass123
```

### What's Different

The backend sees:
```
{
  "user_id": 2,
  "username": "user1",
  "is_staff": false  ← Different from admin!
}

→ Data gets FILTERED
→ User sees ONLY their association's data
```

### Result

You'll see the **User Dashboard**:

```
┌────────────────────────────────────────────┐
│  My Association                     [Logout]
├────────────────────────────────────────────┤
│                                             │
│  My Association: [BDE]                    │
│  Members: 5                                │
│                                             │
│  📄 My Documents                           │
│  ├─ Statuts - ✅ Approved                │
│  ├─ Assurance - ⏳ Pending                │
│  └─ Budget - ❌ Rejected                  │
│                                             │
│  📤 Upload New Document                   │
│  [Choose File] [Select Type] [Upload]    │
│                                             │
│  ❌ User sees ONLY their data              │
│  ❌ Cannot see other associations         │
│                                             │
└────────────────────────────────────────────┘
```

### Compare Admin vs User

```
Same API endpoint: GET /api/documents/

Admin sees:
├─ BDE Statuts
├─ BDE Assurance
├─ Culturelle Budget
├─ Culturelle Assurance
├─ Sports Statuts
└─ Sports Budget
(6 documents from all associations)

User1 sees:
├─ BDE Statuts
├─ BDE Assurance
└─ (only BDE documents - 2 documents)

User2 sees:
├─ Culturelle Budget
├─ Culturelle Assurance
└─ (only Culturelle documents - 2 documents)
```

---

## 🔐 Verify Tokens Are Stored

### Using Browser DevTools

#### Method 1: Application Tab
```
1. Press F12 to open DevTools
2. Click "Application" tab
3. Left sidebar → "Local Storage"
4. Click "http://localhost:3001" (or 5173)
5. You should see:
   ┌─────────────────────────────────────┐
   │ Key                 │ Value         │
   ├─────────────────────────────────────┤
   │ access_token        │ eyJ0eXAi...  │
   │ refresh_token       │ eyJ0eXAi...  │
   │ (+ other values)    │               │
   └─────────────────────────────────────┘
```

#### Method 2: Console
```javascript
// In DevTools Console, type:
console.log(localStorage.getItem('access_token'));

// Output:
// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## 🌐 Monitor API Calls

### Using Network Tab

```
1. Open DevTools (F12)
2. Click "Network" tab
3. Refresh page or make an action
4. You'll see requests like:

POST /api/auth/login/           [200] ✓
GET  /api/documents/            [200] ✓
GET  /api/associations/         [200] ✓

5. Click any request to see:
   ├─ Request Headers
   │  ├─ Authorization: Bearer eyJ0eXAi...
   │  └─ Content-Type: application/json
   ├─ Response
   │  └─ JSON data returned
   └─ Timing (how long it took)
```

### Example: API Call with Authorization

```
▶ GET /api/documents/

Request Headers:
  Host: localhost:8000
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
  Accept: application/json
  Accept-Encoding: gzip, deflate, br
  User-Agent: Mozilla/5.0...

Response Headers:
  Content-Type: application/json
  Content-Length: 1234
  Allow: GET, POST, HEAD, OPTIONS
  X-Frame-Options: DENY
  Vary: Accept, Cookie

Response Body:
  {
    "count": 2,
    "results": [
      {
        "id": 1,
        "title": "Statuts",
        "status": "approved",
        ...
      },
      ...
    ]
  }
```

---

## 🔄 Watch Token Auto-Refresh (Advanced)

### Scenario: Token Expires During Use

```
Situation:
- Admin logged in 24 hours ago
- Access token expired
- Clicks "Get Documents"

1. Frontend sends: GET /api/documents/ with expired token

2. Backend responds: 401 Unauthorized

3. Frontend's interceptor:
   ✓ Detects 401 error
   ✓ Has refresh_token?
   ✓ Not already retrying?
   → YES, proceed!

4. Frontend sends: POST /api/auth/refresh/
   { "refresh": "eyJ0eXAi..." }

5. Backend validates refresh token
   ✓ Valid
   → Generate new access_token

6. Backend returns: { "access": "new_token" }

7. Frontend updates localStorage:
   localStorage.setItem('access_token', 'new_token')

8. Frontend retries original request:
   GET /api/documents/ (with new token)

9. Backend responds: 200 OK
   [documents data]

10. Frontend shows data to user
    User: "Didn't notice anything!"
```

### See It Happen

```
1. Login as admin
2. Open DevTools → Network tab
3. Do an action (click something)
4. Watch the requests:
   - Some might show 401 first (expired)
   - Then POST to /api/auth/refresh/
   - Then retry with 200 (success)
```

---

## 🚪 Logout

### Manual Logout
```
1. Click [Logout] button
2. Frontend clears localStorage:
   localStorage.removeItem('access_token')
   localStorage.removeItem('refresh_token')
3. Frontend redirects to login page
```

### Check It Worked

```javascript
// In Console:
localStorage.getItem('access_token')
// Returns: null (was deleted!)
```

---

## 📱 Testing Different Users

### Switch Between Users

```
Login as: admin / admin123
[See Admin Dashboard - all documents]
        ↓ Click Logout
        ↓
Login as: user1 / pass123
[See User Dashboard - only user1's docs]
        ↓ Click Logout
        ↓
Login as: user2 / pass123
[See User Dashboard - only user2's docs]
        ↓
Compare results!
```

### What You'll Notice

```
API Call: GET /api/documents/

As Admin (is_staff=true):
└─ Returns all 10 documents
   ├─ From BDE (3)
   ├─ From Culturelle (4)
   └─ From Sports (3)

As User1 (user_id=2):
└─ Returns 3 documents
   └─ Only from user1's association (BDE)

As User2 (user_id=3):
└─ Returns 4 documents
   └─ Only from user2's association (Culturelle)

Same endpoint, different data!
```

---

## 🧪 Test Specific Features

### Test 1: Document Upload
```
1. Login as user1
2. Click "Upload Document"
3. Fill form:
   Title: "Statuts 2024"
   File: [Select PDF]
   Type: "Statuts"
   Association: "BDE"
4. Click "Upload"
5. Document appears with status: "pending"
6. Login as admin
7. Document appears in admin dashboard
8. Admin clicks "Approve"
9. Document status changes to "approved"
10. Login as user1
11. Document now shows "✅ Approved"
```

### Test 2: Role-Based Access
```
1. Login as user1
2. Try to access: /api/associations/2/ (another association)
   Result: ❌ 403 Forbidden

3. Login as admin
4. Try to access: /api/associations/2/ 
   Result: ✅ 200 OK

5. Same endpoint, different permissions!
```

### Test 3: Token Expiration
```
(For testing, you can manually delete the token)

1. Login as admin
2. Open DevTools Console
3. Run: localStorage.removeItem('access_token')
4. Try to click something
5. Result: ❌ 401 Unauthorized
6. Frontend redirects to login
7. Login again
8. Everything works
```

---

## 📊 Architecture Check

### Database View

```
You can also check the data directly:

1. Open http://localhost:8000/admin
2. Login with admin / admin123
3. See:
   ├─ Users (admin, user1, user2)
   ├─ Associations (BDE, Culturelle, Sports)
   ├─ Documents (with status, owner, etc.)
   ├─ Notifications
   └─ And more...

4. Make changes directly in admin
5. Refresh frontend to see changes
```

---

## ✅ Checklist: Everything Works If...

- [ ] You can login with admin / admin123
- [ ] You can login with user1 / pass123
- [ ] Admin dashboard shows all documents
- [ ] User dashboard shows only their documents
- [ ] You see tokens in localStorage
- [ ] Network tab shows Authorization headers
- [ ] You can upload documents
- [ ] You can logout
- [ ] Admin can approve documents
- [ ] Different users see different data

**All checked?** → Your integration is working perfectly! ✨

---

## 🎓 Learn More

For deeper understanding, read:
- `FRONTEND_BACKEND_INTEGRATION.md` - Complete guide
- `ARCHITECTURE_DIAGRAMS.md` - System diagrams
- `backend/API_DOCUMENTATION.md` - All endpoints
- `backend/ROLES_AND_PERMISSIONS.md` - Permission system

---

## 🚀 You're Ready!

Start exploring your fully-integrated application!

```bash
docker-compose up
# or
cd backend && python manage.py runserver
cd frontend && npm run dev
```

Then visit: **http://localhost:3001** (or 5173)

Enjoy! 🎉
