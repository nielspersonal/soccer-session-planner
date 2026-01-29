# Contributing to Soccer Session Planner

Thank you for your interest in contributing! 🎉

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/soccer-session-planner.git`
3. Follow the [Setup Guide](SETUP.md)
4. Create a branch: `git checkout -b feature/your-feature-name`

## 💻 Development Workflow

### Running Locally
```bash
npm run dev              # Start both frontend & backend
npm run dev:backend      # Backend only (port 3000)
npm run dev:frontend     # Frontend only (port 4200)
```

### Making Changes

1. **Backend changes** (NestJS):
   - Code is in `backend/src/`
   - Run migrations if changing schema: `cd backend && npx prisma migrate dev`
   - Update DTOs if changing API contracts

2. **Frontend changes** (Angular):
   - Code is in `frontend/src/app/`
   - Follow Angular style guide
   - Use standalone components
   - Use signals for reactive state

3. **Database changes**:
   - Edit `backend/prisma/schema.prisma`
   - Run: `cd backend && npx prisma migrate dev --name your_migration_name`
   - Update seed data if needed in `backend/prisma/seed.ts`

### Code Style

- **TypeScript**: Use strict mode, proper types
- **Naming**: camelCase for variables/functions, PascalCase for classes/components
- **Comments**: Add JSDoc for public APIs
- **Formatting**: Consistent indentation (2 spaces)

## 🧪 Testing

Before submitting:
- [ ] Test locally with `npm run dev`
- [ ] Verify all features work end-to-end
- [ ] Check for console errors
- [ ] Test with seed data

## 📝 Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add drill filtering by age group"
git commit -m "Fix PDF export for sessions with multiple drills"

# Bad
git commit -m "fix stuff"
git commit -m "updates"
```

### Commit Message Format
```
<type>: <subject>

<body (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🔀 Pull Requests

1. Push your branch: `git push origin feature/your-feature-name`
2. Open a Pull Request on GitHub
3. Fill out the PR template
4. Wait for review

### PR Checklist
- [ ] Code follows project style
- [ ] Self-reviewed the changes
- [ ] Added comments for complex logic
- [ ] Updated documentation if needed
- [ ] Tested locally
- [ ] No new warnings or errors

## 🐛 Reporting Bugs

Use GitHub Issues with:
- Clear title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment (OS, Node version, browser)

## 💡 Feature Requests

Open an issue with:
- Clear description of the feature
- Use case / why it's needed
- Proposed implementation (optional)

## 📚 Areas to Contribute

### High Priority
- [ ] Complete diagram editor implementation with Konva.js
- [ ] Session detail page with drill reordering
- [ ] Session form for creating/editing sessions
- [ ] User profile management
- [ ] Drill search and filtering

### Nice to Have
- [ ] Dark mode
- [ ] Export drills as images
- [ ] Drill templates library
- [ ] Team management
- [ ] Player attendance tracking
- [ ] Mobile responsive improvements

### Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Video tutorials
- [ ] More examples in README

## 🏗️ Architecture

### Backend (NestJS)
```
backend/src/
├── auth/           # JWT authentication
├── drills/         # Drill CRUD operations
├── sessions/       # Session management
├── export/         # PDF generation
└── prisma/         # Database service
```

### Frontend (Angular)
```
frontend/src/app/
├── core/           # Services, guards, interceptors
├── features/       # Feature modules (auth, drills, sessions)
└── shared/         # Shared components (diagram editor)
```

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## ❓ Questions?

- Open a [Discussion](../../discussions)
- Check existing [Issues](../../issues)
- Review the [Setup Guide](SETUP.md)

---

Thank you for contributing! ⚽
