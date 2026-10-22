# Penlight - Full-Stack Blog Website

A complete blog platform with a public reading experience, user accounts, comments and likes, and a full admin panel for writing and managing content. The frontend is built with React and the backend is a Node.js/Express REST API on MongoDB. Both parts deploy to Vercel.

## Features

### Visitors
- Home page with the latest post, recent posts, most-read list and topic browsing
- Blog page with search, category filter, tag filter, sorting (newest or most viewed) and pagination
- Post page with Markdown rendering, reading time, view count, tags and related posts
- Light and dark themes (follows the system setting, switchable by the user)
- Responsive layout for phone, tablet and desktop

### Registered users
- Sign up, log in and log out (JWT authentication)
- Like and unlike posts
- Comment on posts and delete their own comments
- Profile page to update the name and change the password

### Admin panel (`/admin`)
- Dashboard with totals (posts, drafts, views, comments, users), recent posts and most viewed posts
- Create, edit, publish, unpublish and delete posts
- Markdown editor with live preview, cover image preview, category, tags and featured flag
- Draft mode (drafts are visible only to admins)
- Comment moderation (delete any comment)
- User management (promote or demote admins, delete users)

## Tech Stack

| Part | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS 4, DaisyUI 5, react-markdown |
| Backend | Node.js, Express 5, Mongoose, JWT, bcryptjs, Helmet, CORS |
| Database | MongoDB Atlas |
| Hosting | Vercel (two projects: `client` and `server`) |

## Project Structure

```
blog-project/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Navbar, PostCard, Comments, ProtectedRoute...
│   │   ├── context/         # Auth context and provider
│   │   ├── hooks/           # useAuth, useApi, usePageTitle
│   │   ├── layouts/         # PublicLayout, AdminLayout
│   │   ├── lib/             # API helper, formatting helpers
│   │   ├── pages/           # Home, Posts, PostDetail, Login, Register, Profile
│   │   │   └── admin/       # Dashboard, AdminPosts, PostEditor, AdminComments, AdminUsers
│   │   ├── config.js        # Site name and tagline
│   │   └── index.css        # Tailwind + DaisyUI themes
│   ├── vercel.json
│   └── .env.example
└── server/                  # Express backend
    ├── api/index.js         # Vercel serverless entry
    ├── src/
    │   ├── config/          # MongoDB connection (cached for serverless)
    │   ├── controllers/
    │   ├── middleware/      # auth, error handling
    │   ├── models/          # User, Post, Comment
    │   ├── routes/
    │   ├── app.js           # Express app
    │   ├── server.js        # Local dev server
    │   └── seed.js          # Creates the admin account and sample posts
    ├── vercel.json
    └── .env.example
```

## Getting Started (Local)

### Prerequisites
- Node.js 20.19+ (or 22.12+)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or a local MongoDB)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env     # on Windows: copy .env.example .env
```

Open `server/.env` and fill in `MONGODB_URI`, `JWT_SECRET`, and the `ADMIN_*` values. Then:

```bash
npm run seed:samples     # creates the admin account + 4 sample posts
npm run dev              # API on http://localhost:5000
```

Use `npm run seed` instead if you only want the admin account without sample posts.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env     # on Windows: copy .env.example .env
npm run dev              # App on http://localhost:5173
```

Log in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`. Admins are redirected to `/admin`.

## Environment Variables

### `server/.env`

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign login tokens |
| `CLIENT_URL` | Frontend URL(s) allowed by CORS, comma separated, no trailing slash |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by `npm run seed` |
| `PORT` | Local port (default 5000) |

### `client/.env`

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API URL ending in `/api`, e.g. `http://localhost:5000/api` |

## Deploying to Vercel

Push the repository to GitHub, then create **two** Vercel projects from the same repo.

### Backend (`server`)
1. Add New Project and import the repo.
2. Set **Root Directory** to `server`.
3. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (you can set the real value after deploying the frontend).
4. Deploy and copy the URL, e.g. `https://your-blog-api.vercel.app`. Opening it should show `Blog API is running`.
5. In MongoDB Atlas, open **Network Access** and allow `0.0.0.0/0` (Vercel uses changing IP addresses).

### Frontend (`client`)
1. Add New Project and import the same repo.
2. Set **Root Directory** to `client` (Vercel detects Vite automatically).
3. Add `VITE_API_URL` = `https://your-blog-api.vercel.app/api`.
4. Deploy and copy the frontend URL.

### Finish up
1. Go back to the backend project, set `CLIENT_URL` to the frontend URL, and **redeploy** the backend.
2. Create the admin account once from your computer by running `npm run seed:samples` inside `server` with `MONGODB_URI` pointing to the same Atlas database.
3. Log in on the live site with your admin email and password.

> Vite reads `VITE_API_URL` at build time, so redeploy the frontend after changing it.

## API Overview

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in |
| GET | `/api/auth/me` | User | Current user |
| PUT | `/api/auth/profile` | User | Update name or password |
| GET | `/api/posts` | Public | List published posts (`search`, `category`, `tag`, `sort`, `page`, `limit`) |
| GET | `/api/posts/meta` | Public | Categories and popular tags |
| GET | `/api/posts/:slug` | Public | Single post (increments views) |
| POST | `/api/posts/:id/like` | User | Like or unlike |
| GET | `/api/posts/:postId/comments` | Public | List comments |
| POST | `/api/posts/:postId/comments` | User | Add a comment |
| DELETE | `/api/comments/:id` | Owner/Admin | Delete a comment |
| GET | `/api/admin/stats` | Admin | Dashboard numbers |
| GET/POST | `/api/admin/posts` | Admin | List or create posts |
| GET/PUT/DELETE | `/api/admin/posts/:id` | Admin | Read, update or delete a post |
| GET | `/api/admin/comments` | Admin | All comments |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/role` | Admin | Change a user's role |
| DELETE | `/api/admin/users/:id` | Admin | Delete a user |

## Troubleshooting

- **"Cannot reach the server"**: check that `VITE_API_URL` is correct and ends with `/api`, then redeploy the frontend.
- **CORS errors**: `CLIENT_URL` on the backend must exactly match the frontend URL (no trailing slash). Redeploy the backend after changing it.
- **Database errors on Vercel**: make sure Atlas Network Access allows `0.0.0.0/0` and the connection string password has no unescaped special characters.
- **404 on page refresh**: `client/vercel.json` rewrites all paths to `index.html`; make sure the Root Directory is `client`.
- **Cannot log in as admin**: run `npm run seed` again with the correct `ADMIN_EMAIL` and `ADMIN_PASSWORD`. It promotes an existing account to admin.

## Notes and Ideas for Later

- Cover images use a URL because Vercel has no permanent disk. For uploads, connect a service such as Cloudinary.
- The login token is stored in `localStorage` and sent as a `Bearer` header, which works across two different Vercel domains without cookie setup.
- Possible additions: newsletter, bookmarks, comment replies, rate limiting, image uploads.

## Author

Built by Rahim as a full-stack practice project.
