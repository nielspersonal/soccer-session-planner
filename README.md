# ⚽ Soccer Session Planner

> A full-stack web application for soccer coaches to create drills with visual diagrams and organize them into training sessions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-18-red.svg)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-10-ea2845.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd soccer-session-planner

# 2. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm install

# 3. Setup environment
cp .env.example backend/.env

# 4. Start PostgreSQL (Docker)
npm run db:start

# 5. Setup database (creates tables + seed data)
npm run setup

# 6. Start development servers
npm run dev
```

**Open http://localhost:4200** and login with:
- Email: `coach@example.com`
- Password: `password123`

📖 **[Full Setup Guide](SETUP.md)** | 🐛 **[Troubleshooting](SETUP.md#-troubleshooting)**

---

## Architecture

### Tech Stack
- **Frontend**: Angular 18, TypeScript, Angular Material, Konva.js (diagram editor - direct integration)
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **PDF Generation**: Playwright
- **Auth**: JWT with bcrypt
- **Deployment**: Docker & Docker Compose

### Key Features
- ✅ User authentication (JWT)
- ✅ Create and manage drills with visual diagrams
- ✅ Interactive diagram editor (players, cones, balls, arrows, zones)
- ✅ Build training sessions from drills
- ✅ Print-friendly HTML and PDF export
- ✅ Seed data with 3 example drills and 1 session

## Project Structure

```
soccer-session-planner/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── drills/         # Drills CRUD
│   │   ├── sessions/       # Sessions CRUD
│   │   ├── export/         # PDF/Print generation
│   │   ├── prisma/         # Database service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Services, guards, interceptors
│   │   │   ├── features/   # Feature modules (auth, drills, sessions)
│   │   │   ├── shared/     # Shared components (diagram editor)
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Option 1: Local Development

#### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### 2. Setup Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Wait for PostgreSQL to be ready (about 10 seconds)
```

#### 3. Configure Environment

```bash
# Copy environment template
cp .env.example backend/.env

# Edit backend/.env with your settings
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/soccer_planner"
# JWT_SECRET="your-secret-key-change-in-production"
```

#### 4. Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

#### 5. Seed Database

```bash
cd backend
npm run prisma:seed
```

This creates:
- Demo user: `coach@example.com` / `password123`
- 3 example drills
- 1 sample session

#### 6. Start Development Servers

```bash
# Terminal 1: Start backend (port 3000)
cd backend
npm run start:dev

# Terminal 2: Start frontend (port 4200)
cd frontend
npm start
```

#### 7. Access Application

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- Login with: `coach@example.com` / `password123`

### Option 2: Docker Deployment

#### 1. Build and Run

```bash
# Build and start all services
docker-compose up --build
```

This will:
- Build the application image
- Start PostgreSQL
- Run migrations
- Start the application on port 3000

#### 2. Seed Database (First Time Only)

```bash
# Run seed in the app container
docker-compose exec app sh -c "cd backend && npx prisma db seed"
```

#### 3. Access Application

- Application: http://localhost:3000
- Login with: `coach@example.com` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Drills
- `GET /api/drills` - List all drills (protected)
- `GET /api/drills/:id` - Get drill by ID (protected)
- `POST /api/drills` - Create drill (protected)
- `PATCH /api/drills/:id` - Update drill (protected)
- `DELETE /api/drills/:id` - Delete drill (protected)

### Sessions
- `GET /api/sessions` - List all sessions (protected)
- `GET /api/sessions/:id` - Get session by ID (protected)
- `POST /api/sessions` - Create session (protected)
- `PATCH /api/sessions/:id` - Update session (protected)
- `DELETE /api/sessions/:id` - Delete session (protected)
- `POST /api/sessions/:id/drills` - Add drill to session (protected)
- `PATCH /api/sessions/drills/:sessionDrillId` - Update session drill (protected)
- `DELETE /api/sessions/drills/:sessionDrillId` - Remove drill from session (protected)

### Export
- `GET /api/export/session/:id/pdf` - Download session as PDF (protected)
- `GET /api/export/session/:id/print` - Print-friendly HTML view (protected)

## Database Schema

### Users
- id, email, password_hash, name, created_at, updated_at

### Drills
- id, user_id, title, objective, age_group, duration_minutes, notes, tags[], diagram_json (JSONB), created_at, updated_at

### Sessions
- id, user_id, title, date, team, total_duration, theme, notes, created_at, updated_at

### Session_Drills (Join Table)
- id, session_id, drill_id, order, duration_override, session_notes

## Diagram Editor

The diagram editor supports:
- **Backgrounds**: Full pitch, half pitch, blank grid
- **Objects**:
  - Players (circles with labels, customizable colors)
  - Equipment (cones, balls, goals, mini goals)
  - Arrows (movement, passes, runs - solid/dashed)
  - Zones (rectangles/circles with transparent fill)
- **Actions**: Select, move, resize, delete, undo, redo
- **Features**: Snap-to-grid, export as PNG

Diagrams are stored as structured JSON in PostgreSQL (JSONB field).

## PDF Export

Sessions can be exported as:
1. **PDF**: Server-side generation using Playwright
2. **Print HTML**: Print-friendly HTML page (Ctrl+P to print)

Both include:
- Session header (title, date, team, duration, theme)
- All drills with diagrams, durations, and notes
- Professional styling

## Development Notes

### Frontend (Angular)
- Standalone components (no NgModules)
- Signals for reactive state
- Lazy-loaded routes
- HTTP interceptor for JWT auth
- Angular Material for UI components
- Konva.js for canvas-based diagram editor (direct integration, not ng2-konva wrapper)

### Backend (NestJS)
- Modular architecture
- Prisma for type-safe database access
- JWT authentication with Passport
- Class-validator for DTO validation
- Serves Angular build in production

### Database
- PostgreSQL with JSONB for diagram storage
- Prisma migrations for schema management
- Cascade deletes for data integrity

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
cd backend && npx prisma migrate dev
```

### Clear Docker Cache
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

## Production Deployment

1. Set strong JWT_SECRET in environment
2. Use proper PostgreSQL credentials
3. Enable HTTPS
4. Set NODE_ENV=production
5. Configure CORS for your domain
6. Use a process manager (PM2) or container orchestration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Angular](https://angular.io/), [NestJS](https://nestjs.com/), and [Prisma](https://www.prisma.io/)
- Diagram editor powered by [Konva.js](https://konvajs.org/)
- PDF generation via [Playwright](https://playwright.dev/)

## 📧 Support

For issues or questions:
- 🐛 [Create an issue](../../issues)
- 💬 [Start a discussion](../../discussions)

---

Made with ⚽ for soccer coaches everywhere
