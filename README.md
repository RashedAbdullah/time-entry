# TimeTracker - Smart Time Tracking for Professionals

![TimeTracker Cover](/cover-image.png)

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-routes">API Routes</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/RashedAbdullah/time-entry" alt="License">
  <img src="https://img.shields.io/github/stars/RashedAbdullah/time-entry" alt="Stars">
  <img src="https://img.shields.io/github/issues/RashedAbdullah/time-entry" alt="Issues">
  <img src="https://img.shields.io/github/contributors/RashedAbdullah/time-entry" alt="Contributors">
</p>

TimeTracker is a powerful, full-stack time tracking application built with Next.js that helps professionals, freelancers, and teams visualize their work hours, analyze productivity, and generate comprehensive reports. Track time across projects, monitor daily activity, and export data in multiple formats.

## ✨ Features

### Core Functionality
- **⏱️ Real-time Timer** - Start/stop timers with live duration updates (upcoming feature)
- **📊 Interactive Dashboard** - Overview of today's activity, active timers, and quick actions
- **📅 Calendar View** - Visual representation of time entries with daily breakdowns
- **📈 Advanced Analytics** - Charts and graphs to visualize work patterns
- **📑 Multiple Export Formats** - Export reports as PDF, Excel, or JSON
- **🏢 Project Management** - Organize time entries by projects (Personal, Office, Client)
- **🏠 Workspace Tracking** - Distinguish between Office and Home work
- **⚡ Time Adjustments** - Add or subtract time with reason tracking

### User Experience
- **🎨 Modern UI** - Clean, professional interface with shadcn/ui components
- **🌓 Dark Mode** - Seamless light/dark theme switching (upcoming feature)
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **🔍 Advanced Filtering** - Filter reports by date, project, workspace
- **📊 Visual Analytics** - Bar, line, and pie charts for data visualization

### Security & Authentication
- **🔐 NextAuth.js Integration** - Secure authentication with multiple providers
- **👤 User Isolation** - Each user sees only their own data
- **🔒 Protected Routes** - Authentication required for all tracking features

## 🎯 Demo

[Live Demo](https://timetracker-demo.vercel.app)

Demo Credentials:
- Email: demo@timetracker.com
- Password: demo123

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Data Fetching**: [SWR](https://swr.vercel.app/)

### Backend
- **API**: Next.js API Routes
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Validation**: [Zod](https://zod.dev/)

### DevOps & Tooling
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Husky
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/timetracker.git
   cd timetracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables (see [Environment Variables](#environment-variables) section)

4. **Set up the database**
   ```bash
   # Run Prisma migrations
   npx prisma migrate dev --name init
   
   # Generate Prisma client
   npx prisma generate
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/timetracker"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 📁 Project Structure

```
timetracker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── projects/
│   │   │   ├── reports/
│   │   │   └── time-entries/
│   │   └── api/                 # API routes
│   │       ├── auth/
│   │       ├── projects/
│   │       ├── reports/
│   │       └── time-entries/
│   ├── components/              # React components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── reports/
│   │   ├── time-entry/
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities, configurations
│   │   ├── api/
│   │   ├── auth/
│   │   ├── utils/
│   │   └── validations/
│   └── types/                    # TypeScript type definitions
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data
├── public/                       # Static assets
└── ...config files
```

## 💾 Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String           @id @default(uuid())
  name        String
  email       String           @unique
  password    String?
  image       String?
  projects    Project[]
  timeEntries TimeEntry[]
  adjustments TimeAdjustment[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([email])
}

model Project {
  id          String      @id @default(uuid())
  name        String
  description String?
  type        ProjectType @default(OFFICE)

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  timeEntries TimeEntry[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model TimeEntry {
  id          String   @id @default(uuid())
  userId      String
  projectId   String?
  date        DateTime // Entry date (normalized to 00:00:00)
  startTime   DateTime
  endTime     DateTime?
  workspace   WorkspaceType @default(OFFICE)
  description String?

  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project?        @relation(fields: [projectId], references: [id], onDelete: SetNull)
  adjustments TimeAdjustment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([projectId])
  @@index([date])
}

model TimeAdjustment {
  id          String   @id @default(uuid())
  userId      String
  timeEntryId String
  minutes     Int      // Negative or positive
  reason      String?

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  timeEntry TimeEntry @relation(fields: [timeEntryId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([timeEntryId])
}

enum WorkspaceType {
  OFFICE
  HOME
}

enum ProjectType {
  PERSONAL
  OFFICE
  CLIENT
}
```

## 🔌 API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `GET/POST /api/auth/[...nextauth]` - NextAuth authentication

### Projects
- `GET /api/projects` - Get all projects for user
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Time Entries
- `GET /api/time-entries` - Get time entries (with filters)
- `POST /api/time-entries` - Create time entry
- `GET /api/time-entries/:date` - Get today's entries
- `GET /api/time-entries/active` - Get active timer
- `POST /api/time-entries/start` - Start timer
- `POST /api/time-entries/stop` - Stop timer
- `PATCH /api/time-entries/[id]` - Update entry
- `DELETE /api/time-entries/[id]` - Delete entry
- `POST /api/time-entries/[id]/adjust` - Add time adjustment

### Reports
- `GET /api/reports` - Generate report with filters
- `GET /api/reports/export/pdf` - Export as PDF
- `GET /api/reports/export/excel` - Export as Excel
- `GET /api/reports/export/json` - Export as JSON
- `GET /api/reports/monthly` - Get monthly summary

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, your help is appreciated.

### Contribution Guidelines

#### 1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/timetracker.git
   cd timetracker
   ```

#### 2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

#### 3. **Set Up Development Environment**
   - Follow the [Getting Started](#getting-started) guide
   - Ensure all tests pass locally
   - Maintain code quality with ESLint and Prettier

#### 4. **Make Your Changes**
   - Write clean, readable code
   - Add comments where necessary
   - Update documentation if needed
   - Add tests for new features

#### 5. **Commit Guidelines**
   We follow [Conventional Commits](https://www.conventionalcommits.org/):

   ```
   feat: add new feature
   fix: resolve bug
   docs: update documentation
   style: formatting changes
   refactor: code restructuring
   test: add tests
   chore: maintenance tasks
   ```

#### 6. **Run Quality Checks**
   ```bash
   # Lint code
   pnpm lint
   
   # Format code
   pnpm format
   
   # Run tests
   pnpm test
   
   # Type check
   pnpm type-check
   ```

#### 7. **Submit a Pull Request**
   - Push to your fork
   - Open a PR to the `main` branch
   - Describe your changes in detail
   - Link any related issues

### Development Workflow

1. **Pick an Issue** - Look for [good first issues](https://github.com/yourusername/timetracker/labels/good%20first%20issue)
2. **Discuss** - Comment on the issue to let others know you're working on it
3. **Code** - Follow the guidelines above
4. **Review** - Wait for maintainers to review your PR
5. **Merge** - Once approved, your PR will be merged

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use functional components with hooks
- Write meaningful component and variable names
- Add JSDoc comments for complex functions
- Keep components focused and modular

### Reporting Issues

Found a bug? Please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS)

### Feature Requests

Have an idea? Open an issue with:
- Clear description of the feature
- Use case and benefits
- Mockups or examples (if applicable)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting
- All our [contributors](https://github.com/yourusername/timetracker/graphs/contributors)

## 📞 Contact & Support

- **Documentation**: [docs.timetracker.com](https://docs.timetracker.com)
- **Discord**: [Join our community](https://discord.gg/timetracker)
- **Twitter**: [@timetracker](https://twitter.com/timetracker)
- **Email**: support@timetracker.com

---

<p align="center">
  Made with ❤️ by the TimeTracker Team
  <br>
  <a href="https://github.com/yourusername/timetracker">GitHub</a> •
  <a href="https://twitter.com/timetracker">Twitter</a> •
  <a href="https://discord.gg/timetracker">Discord</a>
</p>