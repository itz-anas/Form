# Full Stack Signup/Login Project

## Stack

- Frontend: HTML, CSS, JavaScript (`frontend/`)
- Backend: Node.js, Express (`backend/`)
- Database: Aiven MySQL (using provided credentials)

## Features

- Register form with: username, name, phone, email, password, confirm password
- Register API stores encrypted password (`bcryptjs`) and returns `201`
- Login form with email + password
- Successful login redirects to home page with large animated `Hello, <name>`
- Dark, minimal, glassmorphism UI with animated effects
- Backend auto-creates `users` table if missing
- User entries are not displayed on the website; view them in MySQL Workbench/Aiven SQL tools

## Run

1. Open terminal in `backend/`
2. Install dependencies (already done):
   - `npm install`
3. Start server:
   - `npm start`
4. Open:
   - `http://localhost:5000`

## API Endpoints

- `POST /api/register`
- `POST /api/login`

## To view Entries in tabular form
- Use in MYSQL Workbench
```
USE defaultdb;
SELECT uid, username, useremail, phone, password
FROM users
ORDER BY uid ASC;
```
