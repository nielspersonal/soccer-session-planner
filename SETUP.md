# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 20+ installed (you have v22.17.0 ✅)
- PostgreSQL running locally OR Docker installed

---

## Option 1: Using Docker for PostgreSQL (Recommended - Easiest!)

### Step 1: Copy environment file
```bash
cp .env.example backend/.env
```

### Step 2: Start PostgreSQL with Docker
```bash
npm run db:start
```
This starts PostgreSQL in a Docker container. Wait ~10 seconds for it to be ready.

### Step 3: Setup database (creates tables + seed data)
```bash
npm run setup
```
This will:
- Create all database tables (users, drills, sessions, etc.)
- Generate Prisma client
- Seed demo data (coach@example.com / password123)

### Step 4: Start both servers
```bash
npm run dev
```
This starts both backend (port 3000) and frontend (port 4200) simultaneously!

### 🎉 Done!
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- Login: coach@example.com / password123

---

## Option 2: Using Your Local PostgreSQL

### Step 1: Create the database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE soccer_planner;

# Exit
\q
```

### Step 2: Copy environment file
```bash
cp .env.example backend/.env
```

Edit `backend/.env` if your PostgreSQL credentials are different:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/soccer_planner"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
NODE_ENV=development
```

### Step 3: Setup database (creates tables + seed data)
```bash
npm run setup
```

### Step 4: Start both servers
```bash
npm run dev
```

### 🎉 Done!
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- Login: coach@example.com / password123

---

## 📝 Useful Commands

### Development
```bash
npm run dev              # Start both frontend & backend
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend
```

### Database
```bash
npm run db:start         # Start PostgreSQL (Docker)
npm run db:stop          # Stop PostgreSQL (Docker)
npm run setup            # Run migrations + seed data
npm run setup:db         # Run migrations only
npm run setup:seed       # Run seed data only
npm run db:reset         # Reset database (WARNING: deletes all data!)
```

### Building for Production
```bash
npm run build            # Build both frontend & backend
npm start                # Start production server
```

---

## 🐛 Troubleshooting

### "Port 5432 already in use"
You already have PostgreSQL running locally. Use **Option 2** instead, or stop your local PostgreSQL:
```bash
# macOS
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

### "Port 3000 already in use"
Kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

### "Port 4200 already in use"
Kill the process:
```bash
lsof -ti:4200 | xargs kill -9
```

### Database connection errors
1. Make sure PostgreSQL is running
2. Check `backend/.env` has correct credentials
3. Try: `npm run db:start` (if using Docker)

### Prisma errors
Regenerate the client:
```bash
cd backend
npx prisma generate
```

---

## 📊 What Gets Created

### Database Tables
- **users** - Coach accounts
- **drills** - Training drills with diagram JSON
- **sessions** - Training sessions
- **session_drills** - Join table linking sessions to drills

### Seed Data
- **1 User**: coach@example.com (password: password123)
- **3 Drills**: 
  - Passing Triangle (15 min, U12)
  - 1v1 Attacking (20 min, U14)
  - Small-Sided Game 4v4 (25 min, U16)
- **1 Session**: Tuesday Training Session with all 3 drills

---

## 🎯 Next Steps

1. Login at http://localhost:4200
2. Browse the pre-loaded drills
3. View the sample session
4. Create your own drills and sessions!

---

## 💡 Tips

- The frontend proxies `/api` requests to the backend automatically
- Diagrams are stored as JSON in PostgreSQL (JSONB field)
- PDF export uses Playwright to render HTML to PDF
- All routes except login/register require authentication
- JWT tokens are stored in localStorage

---

## 🔒 Security Note

The `.env` file contains secrets and is gitignored. Never commit it!
For production, use strong JWT_SECRET and secure database credentials.
