# Admin Development Guide

This guide provides everything needed to build an admin interface for the BelovedZGuard Music API.

## Overview

The admin interface allows authorized users to manage songs and albums through the API. Only users with the admin Auth0 ID can perform CREATE, UPDATE, and DELETE operations on songs and albums.

## Authentication

### Admin Requirements

- Must have Auth0 account
- Auth0 ID must match `ADMIN_AUTH0_ID` environment variable
- Must obtain valid JWT token from Auth0

### Getting Admin Tokens

#### Option 1: Auth0 Dashboard

1. Go to your Auth0 dashboard
2. Navigate to Users & Roles → Users
3. Find your admin user
4. Use Auth0's testing tools to generate tokens

#### Option 2: Frontend Integration

1. Implement Auth0 login in your admin site
2. Extract JWT token from Auth0 response
3. Include token in API requests

#### Option 3: Direct API Testing

```bash
# Example curl request with admin token
curl -X GET "http://localhost:9000/api/songs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Token Format

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Admin-Only Endpoints

### Songs Management

#### Create Song (Admin Only)

```http
POST /api/songs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Song Title",
  "genre": "Gospel",
  "youTube": "https://youtube.com/watch?v=example"
}
```

**Response:**

```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "title": "Song Title",
  "genre": "Gospel",
  "youTube": "https://youtube.com/watch?v=example"
}
```

#### Update Song (Admin Only)

```http
PUT /api/songs/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "genre": "Updated Genre"
}
```

#### Delete Song (Admin Only)

```http
DELETE /api/songs/{id}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Song deleted"
}
```

### Albums Management

#### Create Album (Admin Only)

```http
POST /api/albums
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Album Title",
  "songs": ["song_id_1", "song_id_2"]
}
```

#### Update Album (Admin Only)

```http
PUT /api/albums/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Album Title",
  "songs": ["song_id_1", "song_id_3"]
}
```

#### Delete Album (Admin Only)

```http
DELETE /api/albums/{id}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "message": "Album deleted"
}
```

## Public Endpoints (No Auth Required)

These endpoints can be used for testing and don't require authentication:

```http
GET /api/public/songs
GET /api/public/songs/{id}
GET /api/public/albums
GET /api/public/albums/{id}
GET /api/public/playlists/{id}
```

## Error Responses

### Authentication Errors

```json
{
  "error": "Invalid or mismatched token"
}
```

**Status:** 401 Unauthorized

### Authorization Errors

```json
{
  "error": "Admin access required"
}
```

**Status:** 403 Forbidden

### Validation Errors

```json
{
  "error": "Title and genre are required"
}
```

**Status:** 400 Bad Request

### Not Found Errors

```json
{
  "error": "Song not found"
}
```

**Status:** 404 Not Found

## Admin Interface Development Tips

### 1. Token Management

- Store JWT tokens securely (localStorage, sessionStorage, or secure cookies)
- Implement token refresh logic
- Handle token expiration gracefully

### 2. Error Handling

- Display user-friendly error messages
- Handle network errors
- Show loading states during API calls

### 3. Data Management

- Implement CRUD operations for songs and albums
- Add validation on the frontend
- Provide feedback for successful operations

### 4. UI/UX Considerations

- Show admin-only features clearly
- Implement confirmation dialogs for destructive actions
- Provide bulk operations where appropriate

## Environment Setup

### Development Environment

```env
# Required for admin functionality
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
ADMIN_AUTH0_ID=google-oauth2|your-admin-user-id
MONGODB_URL=mongodb://localhost:27017/belovedzguard-music
```

### Admin Site Configuration

```javascript
// Example configuration for admin site
const API_BASE_URL = "http://localhost:9000/api";
const AUTH0_CONFIG = {
  domain: "your-domain.auth0.com",
  clientId: "your-client-id",
  audience: "your-api-identifier",
};
```

## Testing Admin Functionality

### 1. Verify Admin Access

```bash
# Test admin song creation
curl -X POST "http://localhost:9000/api/songs" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Song","genre":"Test"}'
```

### 2. Test Non-Admin Access

```bash
# This should return 403 Forbidden
curl -X POST "http://localhost:9000/api/songs" \
  -H "Authorization: Bearer NON_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Song","genre":"Test"}'
```

### 3. Test Public Endpoints

```bash
# This should work without authentication
curl -X GET "http://localhost:9000/api/public/songs"
```

## Security Considerations

### 1. Admin Token Security

- Never log or expose admin tokens
- Implement proper token storage
- Use HTTPS in production

### 2. Input Validation

- Validate all inputs on both client and server
- Sanitize user inputs
- Implement rate limiting

### 3. Error Information

- Don't expose sensitive error details
- Log errors server-side for debugging
- Provide generic error messages to users

## Development Workflow

### 1. Setup

1. Clone the API repository
2. Set up environment variables
3. Start the API server
4. Create admin site project

### 2. Authentication

1. Implement Auth0 login
2. Extract and store JWT tokens
3. Include tokens in API requests

### 3. Feature Development

1. Start with public endpoints for testing
2. Implement admin authentication
3. Build CRUD operations
4. Add error handling and validation

### 4. Testing

1. Test all admin endpoints
2. Verify authorization works correctly
3. Test error scenarios
4. Validate data integrity

## Support

For questions about admin functionality or API integration, refer to:

- Main README.md for general API documentation
- Auth0 documentation for authentication setup
- Express.js documentation for API patterns

---

**Note:** This guide assumes you have admin access to the Auth0 configuration. Contact the development team if you need admin privileges or have questions about the authentication setup.
