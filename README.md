# Spotify Backend API

A production-ready RESTful API backend for a Spotify-like music streaming platform. Built with Node.js and Express, featuring role-based authentication, music uploads via ImageKit, and album management.

---

## Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Runtime          | Node.js (ESM)           |
| Framework        | Express.js v5           |
| Database         | MongoDB (Mongoose)      |
| Authentication   | JWT (HTTP-only cookies) |
| Password Hashing | bcrypt                  |
| File Storage     | ImageKit                |
| File Uploads     | Multer (memory storage) |
| Validation       | Zod                     |
| Dev Server       | Nodemon                 |

---

## Project Structure

```
spotify-backend/
├── server.js                        # Entry point
├── .env                             # Environment variables (not committed)
├── .env.example                     # Environment variable template
├── Spotify-Backend-Api.postman_collection.json
└── src/
    ├── app.js                       # Express app setup
    ├── controllers/
    │   ├── auth.controller.js       # Register, Login, Logout
    │   └── music.controller.js      # Upload, Albums, Get music
    ├── db/
    │   └── db.js                    # MongoDB connection
    ├── middlewares/
    │   ├── auth.middleware.js       # JWT guard (authUser, authArtist)
    │   └── validate.middleware.js   # Zod request validation
    ├── models/
    │   ├── user.model.js
    │   ├── music.model.js
    │   └── album.model.js
    ├── routes/
    │   ├── auth.route.js
    │   └── music.routes.js
    ├── services/
    │   └── storage.service.js       # ImageKit upload logic
    ├── utils/
    │   └── tokenBlacklist.js        # In-memory JWT blacklist
    └── validations/
        ├── auth.validation.js
        └── music.validation.js
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- ImageKit account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/spotify-backend.git
cd spotify-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Start the development server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory. Refer to `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/spotify-backend
JWT_SECRET=your_strong_jwt_secret
SALT_ROUNDS=10
NODE_ENV=development

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_username
```

---

## API Reference

**Base URL:** `http://localhost:3000`

All authenticated routes use an HTTP-only cookie (`token`) set automatically on login/register.

---

### Auth Routes

#### Register User

```
POST /api/auth/register
```

**Body (JSON):**

```json
{
  "username": "neon",
  "email": "fastneon@gmail.com",
  "password": "fasterNeon04",
  "role": "artist"
}
```

> `role` can be `"user"`, `"artist"`, or `"admin"`. Defaults to `"user"` if omitted.

**Response `201`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "username": "neon",
    "email": "fastneon@gmail.com",
    "role": "artist"
  }
}
```

---

#### Login User

```
POST /api/auth/login
```

**Body (JSON):**

```json
{
  "username": "neon",
  "email": "fastneon@gmail.com",
  "password": "fasterNeon04"
}
```

> Either `username` or `email` can be used to login.

**Response `200`:** Sets `token` as an HTTP-only cookie.

```json
{
  "success": true,
  "message": "User logged in successfully",
  "user": { "id": "...", "username": "neon", "email": "...", "role": "artist" }
}
```

---

#### Logout User

```
POST /api/auth/logout
```

> Requires an active session cookie. Blacklists the token server-side and clears the cookie.

**Response `200`:**

```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

### Music Routes

#### Upload Music

```
POST /api/music/upload
```

**Auth required:** `artist` role  
**Content-Type:** `multipart/form-data`

| Field   | Type | Description          |
| ------- | ---- | -------------------- |
| `music` | File | Audio file to upload |
| `title` | Text | Title of the track   |

**Response `201`:** Music document with ImageKit URL.

---

#### Get All Music

```
GET /api/music/
```

**Auth required:** `user`, `artist`, or `admin`

**Response `200`:** Array of all music tracks.

---

#### Create Album

```
POST /api/music/album
```

**Auth required:** `artist` role  
**Body (JSON):**

```json
{
  "title": "neon_special_album",
  "musics": ["699f20540bbfd6ee0ef8a9ec", "699f20320bbfd6ee0ef8a9ea"]
}
```

> `musics` is an array of Music document `_id`s.

**Response `201`:** Created album document.

---

#### Get All Albums

```
GET /api/music/album
```

**Auth required:** `artist` role

**Response `200`:** Array of all albums.

---

#### Get Album By ID

```
GET /api/music/album/:albumId
```

**Auth required:** `user`, `artist`, or `admin`

**Params:**

- `albumId` — MongoDB ObjectId of the album

**Response `200`:** Single album with populated music tracks.

---

## Authentication & Authorization

| Route                      | Required Role          |
| -------------------------- | ---------------------- |
| `POST /api/auth/register`  | Public                 |
| `POST /api/auth/login`     | Public                 |
| `POST /api/auth/logout`    | Any authenticated user |
| `GET /api/music/`          | user / artist / admin  |
| `POST /api/music/upload`   | artist only            |
| `POST /api/music/album`    | artist only            |
| `GET /api/music/album`     | artist only            |
| `GET /api/music/album/:id` | user / artist / admin  |

---

## Token Blacklisting

On logout, the JWT is added to an **in-memory blacklist** (`Set`). All protected middleware checks this list before trusting any token — so even if the cookie is stolen, the token becomes immediately invalid after logout.

> **Note:** The current blacklist is in-memory and resets on server restart. For production with multiple instances, replace it with **Redis** using a TTL equal to the token's remaining expiry time.

---

## Scripts

```bash
npm run dev     # Start with nodemon (hot reload)
npm start       # Start with node (production)
```

---

## Postman Collection

A ready-to-use Postman collection is included at the root of the project:

```
Spotify-Backend-Api.postman_collection.json
```

Import it into Postman: **File → Import → Select the JSON file**

---

## License

ISC
