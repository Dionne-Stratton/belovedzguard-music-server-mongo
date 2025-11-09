# BelovedZGuard Music Server

![Node.js](https://img.shields.io/badge/Node.js-16.x-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-%2332BA7C?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-%23000000?logo=express)
![Auth0](https://img.shields.io/badge/Auth0-%23EB5424?logo=auth0&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

A secure REST API for music streaming with user playlists and admin content management. Features JWT authentication, role-based access control, and comprehensive security measures.

## Quicklinks

- [Tech Stack](#tech-stack)
- [Security Model](#security-model)
- [Data Structures](#data-structures)
  - [Song](#song)
  - [Album](#album)
  - [Playlist](#playlist)
  - [User](#user)
- [API Endpoints](#api-endpoints)
  - [Public Routes](#public-routes)
  - [Song Routes](#song-routes)
  - [Album Routes](#album-routes)
  - [Upload Routes](#upload-routes)
  - [User Routes](#user-routes)
  - [Playlist Routes](#playlist-routes)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)

---

## Tech Stack

- **MongoDB** / **Mongoose** - Database and ODM
- **Node.js** / **Express.js** - REST API framework
- **Auth0** - Authentication and authorization
- **JWT** - JSON Web Tokens for secure API access
- **CORS** - Cross-origin resource sharing
- **Jwks-rsa** - JSON Web Key Set validation
- **Nodemailer** - Email service for contact form
- **Express-rate-limit** - Rate limiting middleware

---

## Security Model

### Authentication

- **Auth0 Integration** - Secure user authentication
- **JWT Tokens** - Stateless authentication
- **Middleware Protection** - All routes except public require valid tokens

### Authorization

- **Admin Access** - Only admin can CREATE/UPDATE/DELETE songs and albums
- **User Ownership** - Users can only manage their own playlists
- **Public Read Access** - Everyone can read songs, albums, and playlists
- **Privacy Protection** - Owner information hidden from API responses

### Security Features

- **Role-based Access Control** - Admin vs User permissions
- **Data Validation** - Input validation on all endpoints
- **Error Handling** - Comprehensive error responses
- **CORS Configuration** - Secure cross-origin requests

---

## Data Structures

### Song

| Data                  | Type     | Required  | Description                            |
| --------------------- | -------- | --------- | -------------------------------------- |
| \_id                  | ObjectId | generated | Unique song identifier                 |
| title                 | String   | yes       | Song title                             |
| genre                 | String   | yes       | Musical genre                          |
| mp3                   | String   | no        | MP3 file URL                           |
| songThumbnail         | String   | no        | Static thumbnail image URL             |
| animatedSongThumbnail | String   | no        | Animated thumbnail video URL           |
| videoThumbnail        | String   | no        | Video thumbnail image URL              |
| youTube               | String   | no        | YouTube video URL                      |
| bandcamp              | String   | no        | Bandcamp track URL (slug-based)        |
| lyrics                | String   | no        | Lyrics file URL                        |
| description           | String   | no        | Song description                       |
| verse                 | String   | no        | Featured verse or excerpt              |
| isDraft               | Boolean  | no        | Draft flag (hidden from public routes) |

### Album

| Data      | Type       | Required  | Description                            |
| --------- | ---------- | --------- | -------------------------------------- |
| \_id      | ObjectId   | generated | Unique album identifier                |
| title     | String     | yes       | Album title                            |
| songs     | [ObjectId] | no        | Array of song references               |
| isDraft   | Boolean    | no        | Draft flag (hidden from public routes) |
| createdAt | Date       | generated | Album creation timestamp               |
| updatedAt | Date       | generated | Album last modified timestamp          |

### Playlist

| Data      | Type       | Required  | Description                      |
| --------- | ---------- | --------- | -------------------------------- |
| \_id      | ObjectId   | generated | Unique playlist identifier       |
| name      | String     | yes       | Playlist name                    |
| owner     | String     | yes       | Auth0 user ID (hidden in API)    |
| songs     | [ObjectId] | no        | Array of song references         |
| theme     | String     | no        | Playlist theme (default: Faith)  |
| createdAt | Date       | generated | Playlist creation timestamp      |
| updatedAt | Date       | generated | Playlist last modified timestamp |

### User

| Data      | Type     | Required  | Description                  |
| --------- | -------- | --------- | ---------------------------- |
| \_id      | ObjectId | generated | Unique user identifier       |
| auth0Id   | String   | yes       | Auth0 user identifier        |
| createdAt | Date     | generated | User creation timestamp      |
| updatedAt | Date     | generated | User last modified timestamp |

---

## API Endpoints

### Public Routes

_No authentication required_

| Method | Endpoint                    | Description                                    |
| ------ | --------------------------- | ---------------------------------------------- |
| GET    | `/api/public/songs`         | Get all published songs (drafts hidden)        |
| GET    | `/api/public/songs/:id`     | Get single published song by ID                |
| GET    | `/api/public/albums`        | Get all published albums (drafts hidden)       |
| GET    | `/api/public/albums/:id`    | Get single published album by ID               |
| GET    | `/api/public/playlists/:id` | Get playlist by ID (songs populated)           |
| POST   | `/api/public/contact`       | Send contact form email (rate limited: 3/hour) |

### Song Routes

_Authentication required - Admin only for CREATE/UPDATE/DELETE_

| Method | Endpoint         | Auth  | Description           |
| ------ | ---------------- | ----- | --------------------- |
| POST   | `/api/songs`     | Admin | Create new song       |
| GET    | `/api/songs`     | User  | Get all songs         |
| GET    | `/api/songs/:id` | User  | Get single song by ID |
| PUT    | `/api/songs/:id` | Admin | Update song by ID     |
| DELETE | `/api/songs/:id` | Admin | Delete song by ID     |

#### Create / Update Song Payload

```json
{
  "title": "Amazing Grace",
  "genre": "Gospel",
  "youTube": "https://youtube.com/watch?v=example",
  "description": "Optional description",
  "verse": "Amazing grace...",
  "isDraft": false,
  "assets": {
    "mp3": {
      "key": "music-files/amazing-grace.mp3",
      "publicUrl": "https://media.belovedzguard.com/music-files/amazing-grace.mp3"
    },
    "songThumbnail": {
      "key": "song-thumbnails/amazing-grace.jpg",
      "publicUrl": "https://media.belovedzguard.com/song-thumbnails/amazing-grace.jpg"
    }
  }
}
```

- `assets` is optional but recommended for new uploads; any missing asset keeps its previous value.
- Response returns the full song document, including stored `mp3Key`, `songThumbnailKey`, etc.

### Album Routes

_Authentication required - Admin only for CREATE/UPDATE/DELETE_

| Method | Endpoint          | Auth  | Description            |
| ------ | ----------------- | ----- | ---------------------- |
| POST   | `/api/albums`     | Admin | Create new album       |
| GET    | `/api/albums`     | User  | Get all albums         |
| GET    | `/api/albums/:id` | User  | Get single album by ID |
| PUT    | `/api/albums/:id` | Admin | Update album by ID     |
| DELETE | `/api/albums/:id` | Admin | Delete album by ID     |

#### Create / Update Album Payload

```json
{
  "title": "Greatest Hits",
  "songs": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"],
  "isDraft": true
}
```

- `songs` must be an array of song ObjectIds.
- Response returns the album document with populated song references when requested via GET.

### Upload Routes

_Authentication required - Admin only_

| Method | Endpoint               | Auth  | Description                               |
| ------ | ---------------------- | ----- | ----------------------------------------- |
| POST   | `/api/uploads/presign` | Admin | Request a presigned URL for asset uploads |

#### Presigned Upload Workflow

1. **Request a presign**  
   Send a `POST /api/uploads/presign` request with JSON body:

   ```json
   {
     "assetType": "mp3",
     "fileName": "amazing-grace.mp3"
   }
   ```

   - `assetType` must be one of `mp3`, `songThumbnail`, `animatedThumbnail`, `videoThumbnail`, `lyrics`.
   - `fileName` must already be slugified; the server will ensure the correct extension and folder.

2. **Use the response**  
   Response fields:

   - `uploadUrl`: signed PUT URL (valid for 5 minutes). Upload the file with a `PUT` request and matching `Content-Type`.
   - `key`: final object key in R2 (e.g. `music-files/amazing-grace.mp3`).
   - `publicUrl`: the CDN/base URL where the asset will be served.
   - `field`: the property name to include in the song payload (`mp3`, `songThumbnail`, etc.).
   - `expiresIn`: seconds until the presign expires (always `300`).

   Example response:

   ```json
   {
     "uploadUrl": "https://a....r2.cloudflarestorage.com/music-files/amazing-grace.mp3?...",
     "key": "music-files/amazing-grace.mp3",
     "publicUrl": "https://media.belovedzguard.com/music-files/amazing-grace.mp3",
     "field": "mp3",
     "expiresIn": 300
   }
   ```

3. **Create or update the song**  
   When calling `POST /api/songs` or `PUT /api/songs/:id`, include the returned key and publicUrl inside an `assets` object:
   ```json
   {
     "title": "Amazing Grace",
     "genre": "Gospel",
     "description": "A timeless hymn",
     "assets": {
       "mp3": {
         "key": "music-files/amazing-grace.mp3",
         "publicUrl": "https://media.belovedzguard.com/music-files/amazing-grace.mp3"
       },
       "songThumbnail": {
         "key": "song-thumbnails/amazing-grace.jpg",
         "publicUrl": "https://media.belovedzguard.com/song-thumbnails/amazing-grace.jpg"
       }
     },
     "isDraft": true
   }
   ```
   - Any asset omitted from the `assets` object will keep its existing value (on update) or default to the legacy generated URL (on create).
   - The server copies the `publicUrl` onto the top-level field (`mp3`, `songThumbnail`, etc.) and stores the `key` in `mp3Key`, `songThumbnailKey`, and so on for future reference.

### User Routes

_Authentication required_

| Method | Endpoint     | Auth | Description                 |
| ------ | ------------ | ---- | --------------------------- |
| GET    | `/api/users` | User | Get current user profile    |
| PUT    | `/api/users` | User | Update current user profile |
| DELETE | `/api/users` | User | Delete current user account |

#### Update User Payload

```json
{
  "displayName": "Beloved ZGuard",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

- Only whitelisted fields are updated; others are ignored.

### Playlist Routes

_Authentication required - User can only manage their own playlists_

| Method | Endpoint                           | Auth | Description               |
| ------ | ---------------------------------- | ---- | ------------------------- |
| POST   | `/api/users/playlists`             | User | Create new playlist       |
| GET    | `/api/users/playlists`             | User | Get user's playlists      |
| GET    | `/api/users/playlists/:id`         | User | Get single playlist by ID |
| PUT    | `/api/users/playlists/:id`         | User | Update playlist by ID     |
| DELETE | `/api/users/playlists/:id`         | User | Delete playlist by ID     |
| PATCH  | `/api/users/playlists/:id/addSong` | User | Add song to playlist      |

#### Create / Update Playlist Payload

```json
{
  "name": "Sunday Worship",
  "theme": "Faith",
  "songs": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"]
}
```

#### Add Song to Playlist Payload

```json
{
  "songId": "64a1b2c3d4e5f6789012345"
}
```

---

## Installation and Setup

```bash
# Clone the repository
git clone <repository-url>
cd belovedzguard-music-server-mongo

# Install dependencies
npm install

# Start development server
npm run server

# Start production server
npm start
```

### Available Scripts

```bash
npm start          # Run app with Node (production)
npm run server     # Run app with nodemon (development)
```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URL=mongodb://localhost:27017/belovedzguard-music

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier

# Admin Configuration
ADMIN_AUTH0_ID=google-oauth2|your-admin-user-id

# Email Configuration (for contact form)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=your-email@gmail.com

```

### Required Environment Variables

| Variable                          | Description                                        | Example                                         |
| --------------------------------- | -------------------------------------------------- | ----------------------------------------------- | ----------- |
| `MONGODB_URL`                     | MongoDB connection string                          | `mongodb://localhost:27017/music`               |
| `AUTH0_DOMAIN`                    | Your Auth0 domain                                  | `your-app.auth0.com`                            |
| `AUTH0_AUDIENCE`                  | Auth0 API identifier                               | `https://api.belovedzguard.com`                 |
| `ADMIN_AUTH0_ID`                  | Admin user's Auth0 ID                              | `google-oauth2                                  | 1234567890` |
| `EMAIL_USER`                      | Email account username                             | `your-email@gmail.com`                          |
| `EMAIL_PASSWORD`                  | Email account app password                         | `your-16-char-app-password`                     |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`     | Cloudflare R2 access key for S3 operations         | `K0ExampleAccessKey`                            |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key for S3 operations         | `exampleSecretKeyValue`                         |
| `CLOUDFLARE_R2_BUCKET`            | R2 bucket name for uploads                         | `belovedzguard-media`                           |
| `CLOUDFLARE_R2_ENDPOINT`          | R2 S3 endpoint                                     | `https://<account-id>.r2.cloudflarestorage.com` |
| `CLOUDFLARE_R2_PUBLIC_BASE_URL`   | Public base URL (CDN) for accessing uploaded media | `https://media.belovedzguard.com`               |

### Optional Environment Variables

| Variable                   | Description                                                     | Default      |
| -------------------------- | --------------------------------------------------------------- | ------------ |
| `EMAIL_SERVICE`            | Email service provider                                          | `gmail`      |
| `CONTACT_EMAIL`            | Recipient email for contact form (if different from EMAIL_USER) | `EMAIL_USER` |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare account identifier (used by some tooling)            | -            |

---

## Deployment

This API is deployed on **Heroku** and automatically deploys from the main branch.

### Heroku Setup

1. **Connect GitHub repository** to Heroku app
2. **Set environment variables** in Heroku dashboard:

   - `MONGODB_URL`
   - `AUTH0_DOMAIN`
   - `AUTH0_AUDIENCE`
   - `ADMIN_AUTH0_ID`
   - `EMAIL_SERVICE`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `CONTACT_EMAIL` (optional)

3. **Manual deployment** (if needed):
   ```bash
   heroku git:remote -a your-app-name
   git push heroku main
   ```

### Production URL

- **API Base URL:** `https://belovedzguard-ebf890192e0e.herokuapp.com`
- **Contact Endpoint:** `https://belovedzguard-ebf890192e0e.herokuapp.com/api/public/contact`

---

## API Response Examples

### Contact Form Submission

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about your music",
  "message": "Hi, I love your work! Can I use your music in my project?"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Your message has been sent successfully!"
}
```

**Error Response (Rate Limited):**

```json
{
  "error": "Too many contact form submissions. Please try again in an hour.",
  "retryAfter": "1 hour",
  "limit": 3,
  "windowMs": "1 hour"
}
```

### Successful Song Creation (Admin)

```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "title": "Amazing Grace",
  "genre": "Gospel",
  "mp3": "https://media.belovedzguard.com/music-files/amazing-grace.mp3",
  "songThumbnail": "https://media.belovedzguard.com/song-thumbnails/amazing-grace.jpg",
  "animatedSongThumbnail": "https://media.belovedzguard.com/animated-song-thumbnails/amazing-grace.mp4",
  "videoThumbnail": "https://media.belovedzguard.com/video-thumbnails/amazing-grace.jpg",
  "youTube": "https://youtube.com/watch?v=example",
  "lyrics": "https://media.belovedzguard.com/lyrics/amazing-grace.md",
  "description": "A timeless hymn of grace and redemption",
  "verse": "Amazing grace, how sweet the sound, That saved a wretch like me"
}
```

### Error Response (Non-Admin)

```json
{
  "error": "Admin access required"
}
```

### Playlist Response (Owner Hidden)

```json
{
  "_id": "64a1b2c3d4e5f6789012346",
  "name": "My Favorite Songs",
  "songs": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "title": "Amazing Grace",
      "genre": "Gospel"
    }
  ],
  "theme": "Faith",
  "createdAt": "2023-07-01T12:00:00.000Z",
  "updatedAt": "2023-07-01T12:00:00.000Z"
}
```

---

## Security Notes

- **JWT Tokens**: Include `Authorization: Bearer <token>` header for authenticated requests
- **Admin Access**: Only users with matching `ADMIN_AUTH0_ID` can modify songs/albums
- **User Privacy**: Owner information is never exposed in API responses
- **CORS**: Configured for secure cross-origin requests
- **Input Validation**: All endpoints validate required fields and data types

---

## Contributing

This API is designed for the BelovedZGuard Music platform. For questions or contributions, please contact the development team.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
