# HevyX MERN Fitness Tracker

Full-stack fitness tracking web app inspired by Hevy, built with React + Tailwind + Redux Toolkit and Node/Express/MongoDB.

## Project Structure

- client: React frontend (Vite, Tailwind, Redux Toolkit, Recharts)
- server: Express backend (MVC, MongoDB, JWT, Cloudinary)

## Features

- Auth UI: login/signup with validation
- Dashboard: total workouts, calories chart, steps chart, recent workouts, social feed preview
- Workout tracker: add exercises with sets/reps/weight, save and history
- Calories tracker: input daily calories, charted trend
- Step tracker: input daily steps, progress bar, weekly chart
- Progress feed: post media URL + caption, like button UI
- Profile page: user info, workout stats, progress history
- API backend: auth, users, workouts CRUD, calories, steps analytics, posts
- Frontend integration: Axios + JWT token handling with API-first fallback to dummy data

## Setup

1. Install dependencies:
   - npm install
   - npm install --prefix client
   - npm install --prefix server
2. Configure environment files:
   - copy server/.env.example to server/.env
   - copy client/.env.example to client/.env
3. Start development servers:
   - npm run dev

4. Run backend API smoke checks (requires backend running):
   - npm run test:smoke --prefix server

Client runs on http://localhost:5173 and server on http://localhost:5000.

## Vercel Deployment

This repo is configured to deploy as a single Vercel project:

- The frontend builds from `client/dist`.
- The Express API runs from the root `api/[...path].js` function.
- The client uses `/api` automatically in production, so no extra API URL is required on Vercel.

Set these environment variables in Vercel before deploying:

- `JWT_SECRET`
- `MONGO_URI`
- Optional: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Optional: `OPENAI_API_KEY` or `GEMINI_API_KEY`
- Optional: `OPENAI_MODEL`, `GEMINI_MODEL`

Recommended deploy flow:

1. Import the repository root into Vercel.
2. Let Vercel use the root `vercel.json` and `package.json`.
3. Add the environment variables above in the Vercel dashboard.
4. Deploy the project.

## API Routes

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/users/me
- PUT /api/users/me
- GET /api/workouts
- POST /api/workouts
- PUT /api/workouts/:id
- DELETE /api/workouts/:id
- GET /api/calories
- POST /api/calories
- GET /api/steps
- POST /api/steps
- GET /api/steps/analytics/weekly
- GET /api/posts
- POST /api/posts
