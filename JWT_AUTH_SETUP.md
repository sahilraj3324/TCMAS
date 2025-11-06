# 🔐 JWT Authentication Setup - COMPLETE!

## ✅ What's Been Implemented

### 1. **Packages Installed**
- ✅ `jsonwebtoken` - For creating and verifying JWT tokens
- ✅ `cookie-parser` - For parsing cookies from requests

### 2. **Environment Variables (.env)**
Add these to your `.env` file:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 3. **Backend Configuration**

#### **index.js** ✅
- Added `cookie-parser` middleware
- Updated CORS to allow credentials:
  ```javascript
  credentials: true  // Enables cookies
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174']
  ```

#### **Middleware** ✅
Created `/Backend/middleware/auth.js` with:
- `authenticateToken` - Verifies JWT from cookies
- `authorizeRole(...roles)` - Checks user role
- `optionalAuth` - Optional authentication

### 4. **Controllers Updated**

#### **userController.js** ✅
- **login** - Now generates JWT and sets in httpOnly cookie
- **logout** - NEW! Clears authentication cookie
- **getCurrentUser** - NEW! Gets user info from token

#### **receptionistController.js** ✅
- **login** - Now generates JWT and sets in httpOnly cookie

### 5. **Routes Updated**

#### **userRoutes.js** ✅
- `POST /api/users/login` - Login with JWT
- `POST /api/users/logout` - Logout (clear cookie)
- `GET /api/users/me` - Get current user (protected)

---

## 🔑 How JWT Authentication Works

### Login Flow:
1. User sends email + password to `/api/users/login`
2. Server validates credentials
3. Server generates JWT token with user data
4. Server sets token in **httpOnly cookie** (JavaScript can't access it)
5. Server also returns token in response (for clients that prefer it)

### Authenticated Requests:
1. Browser automatically sends cookie with requests
2. `authenticateToken` middleware verifies the token
3. User data is attached to `req.user`
4. Route handler can access user info

### Logout Flow:
1. User calls `/api/users/logout`
2. Server clears the cookie
3. User is logged out

---

## 🛡️ Security Features

### 1. **httpOnly Cookies**
- ✅ JavaScript cannot access the token
- ✅ Protects against XSS attacks
- ✅ Browser automatically sends with requests

### 2. **sameSite: 'lax'**
- ✅ Protects against CSRF attacks
- ✅ Cookie only sent with same-site requests

### 3. **secure (Production)**
- ✅ In production, cookies only sent over HTTPS
- ✅ Set `NODE_ENV=production` in production

### 4. **Token Expiration**
- ✅ Tokens expire after 7 days (configurable)
- ✅ Users must re-login after expiration

---

## 📝 API Endpoints

### User Authentication

#### **Login**
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": "...",
    "email": "user@example.com",
    "role": "patient",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **Logout**
```http
POST /api/users/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### **Get Current User**
```http
GET /api/users/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "...",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### Receptionist Authentication

#### **Login**
```http
POST /api/receptionist/login
Content-Type: application/json

{
  "email": "receptionist@hospital.com",
  "password": "password123"
}
```
OR
```json
{
  "username": "receptionist1",
  "password": "password123"
}
```

---

## 🔒 Using Protected Routes

### Example: Protect a route with authentication

```javascript
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Only authenticated users can access
router.get('/profile', authenticateToken, getProfile);

// Only patients can access
router.get('/my-appointments', 
  authenticateToken, 
  authorizeRole('patient'), 
  getMyAppointments
);

// Only receptionist or admin
router.post('/appointments', 
  authenticateToken, 
  authorizeRole('receptionist', 'admin'), 
  createAppointment
);
```

---

## 🌐 Frontend Integration

### Option 1: Automatic (Recommended)
**With credentials enabled, cookies are sent automatically:**

```typescript
// Frontend API call (cookies sent automatically)
const response = await fetch('http://localhost:4000/api/users/me', {
  method: 'GET',
  credentials: 'include', // Important!
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Option 2: Manual Token (Alternative)
**If you prefer to handle tokens manually:**

```typescript
// Save token from login response
localStorage.setItem('token', data.token);

// Send token in header
const response = await fetch('http://localhost:4000/api/users/me', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

---

## 🚀 Frontend Updates Needed

### 1. **Update API Service**
Add `credentials: 'include'` to all fetch calls:

```typescript
// services/api.ts
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // IMPORTANT!
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  // ... rest of code
}
```

### 2. **Update Login**
```typescript
// Login - cookie is set automatically
const response = await api.post('/users/login', { email, password });
// No need to manually store token!
```

### 3. **Update Logout**
```typescript
// Logout - cookie is cleared
const response = await api.post('/users/logout');
localStorage.removeItem('user'); // Clear local user data
```

### 4. **Check Authentication**
```typescript
// Check if user is logged in
const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    // Not logged in
    return null;
  }
};
```

---

## 🧪 Testing

### Test Login (curl)
```bash
curl -c cookies.txt -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Protected Route (curl)
```bash
curl -b cookies.txt http://localhost:4000/api/users/me
```

### Test Logout (curl)
```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:4000/api/users/logout
```

---

## 🔍 JWT Token Contents

The JWT contains:

**For Users:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "patient",
  "first_name": "John",
  "last_name": "Doe",
  "iat": 1234567890,
  "exp": 1235172690
}
```

**For Receptionists:**
```json
{
  "id": "uuid",
  "email": "receptionist@hospital.com",
  "username": "receptionist1",
  "name": "Jane Smith",
  "role": "receptionist",
  "iat": 1234567890,
  "exp": 1235172690
}
```

---

## ✅ Benefits of This Setup

1. ✅ **Secure** - httpOnly cookies prevent XSS attacks
2. ✅ **Automatic** - Cookies sent automatically with requests
3. ✅ **Simple** - No need to manually manage tokens in frontend
4. ✅ **Scalable** - Easy to add role-based access control
5. ✅ **Standard** - Industry-standard JWT authentication
6. ✅ **Flexible** - Token also returned in response for flexibility

---

## 🎯 Next Steps

1. ✅ **Update your .env file** with JWT_SECRET
2. ✅ **Restart backend server** (nodemon will auto-restart)
3. ✅ **Update frontend API calls** to include `credentials: 'include'`
4. ✅ **Test login/logout** from frontend
5. ✅ **Use `authenticateToken` middleware** on routes you want to protect

---

## 🎉 Ready to Use!

Your backend now has **complete JWT authentication** with secure httpOnly cookies! 🔐

The server will auto-restart with nodemon, and all your authentication endpoints are ready to use.

