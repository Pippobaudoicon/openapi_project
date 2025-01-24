# API Documentation

## Authentication Endpoints

### POST /api/auth/login
Authenticates a user and creates a session.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses:**
- `200 OK`: Login successful
  ```json
  {
    "message": "Logged in successfully"
  }
  ```
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "message": "No user found with that email" | "Password incorrect"
  }
  ```

### POST /api/auth/register
Creates a new user account and logs them in.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Responses:**
- `200 OK`: Registration successful
  ```json
  {
    "message": "User created and logged in successfully"
  }
  ```
- `500 Internal Server Error`: Registration failed
  ```json
  {
    "message": "Error creating user" | "Error logging in"
  }
  ```

### POST /api/auth/logout
Ends the user's session.

**Responses:**
- `200 OK`: Logout successful
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- `500 Internal Server Error`: Logout failed
  ```json
  {
    "message": "Error logging out"
  }
  ```

### GET /api/auth/check
Checks if the user is currently authenticated.

**Responses:**
- `200 OK`: Authentication status returned
  ```json
  {
    "isAuthenticated": true,
    "user": {
      "id": "string",
      "email": "string"
    }
  }
  ```
  or
  ```json
  {
    "isAuthenticated": false
  }
  ```

## Security
- All routes except `/login` and `/register` require authentication
- Sessions expire after 24 hours
- Passwords are hashed using bcrypt
- Cookies are HTTP-only and secure in production
