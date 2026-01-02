# Trello Clone

A modern Trello-inspired Kanban application built with Next.js 16 App Router. The project features comprehensive authentication with email verification, board privacy controls, team collaboration, real-time notifications, file attachments system, and an interactive drag-and-drop experience for lists and cards.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install dependencies](#install-dependencies)
  - [Configure environment variables](#configure-environment-variables)
  - [Database setup and migrations](#database-setup-and-migrations)
  - [Run the development server](#run-the-development-server)
- [Email Configuration](#email-configuration)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Database Schema (High Level)](#database-schema-high-level)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [License](#license)

## Features

- **Authentication**
  - Email/password sign up and sign in
  - Email verification with Resend
  - Session-based authentication via better-auth
  - Secure password handling

- **Boards**
  - Create and manage boards
  - Public/private board visibility
  - Board listing with pagination and filtering
  - Board archiving and deletion

- **Collaboration**
  - Board membership (owner/member)
  - Access checks for protected resources
  - Real-time activity tracking

- **Lists and Cards**
  - Lists (columns) and cards (tasks) with persistent ordering
  - Drag and drop reordering (dnd-kit)
  - Optional card due dates and descriptions
  - Card member assignments
  - File attachments with Vercel Blob storage
  - Rich text editor for card descriptions (Lexical)

- **Labels**
  - Create custom labels per board with colors
  - Assign multiple labels to cards (many-to-many)
  - Label usage counts and filtering
  - Predefined color palette for labels

- **Notifications**
  - Real-time in-app notifications
  - Customizable user notification preferences
  - Activity feed per board
  - Email digest options
  - Notification priority levels
  - Mark as read/unread functionality

- **Activity Tracking**
  - Comprehensive activity logging for all actions
  - Activity formatters for user-friendly messages
  - Automatic cleanup of old activities
  - Activity-driven notifications
  - Full audit trail with metadata and change history

- **Comments**
  - Add comments to cards
  - View comment history with timestamps
  - User attribution for all comments

- **File Attachments**
  - Upload files to cards (images, documents, etc.)
  - Secure storage with Vercel Blob
  - File size validation and type checking
  - Download and preview attachments
  - Track upload history and user attribution

## Key Features Highlights

### 🎨 Modern UI/UX

- **Responsive Design**: Mobile-first design with Tailwind CSS v4
- **Dark Mode**: System-aware theme switching with next-themes
- **Smooth Animations**: Framer Motion for polished interactions
- **Accessible**: WCAG-compliant components from Radix UI

### 🚀 Performance

- **React Server Components**: Optimal bundle sizes and faster initial loads
- **Server Actions**: Type-safe mutations without API routes
- **Streaming**: Progressive page rendering with Suspense boundaries
- **Optimized Images**: Automatic optimization with next/image

### 🔒 Security

- **Session-based Auth**: Secure authentication with better-auth
- **Server-side Validation**: All inputs validated with Zod schemas
- **Permission Enforcement**: Access control at the database query level
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM

### 📊 Data Management

- **Type-safe Queries**: End-to-end type safety with Drizzle ORM
- **Migration System**: Version-controlled database migrations
- **Activity Audit Trail**: Complete history of all board changes
- **Optimistic Updates**: Instant UI feedback with background sync

### 🧪 Developer Experience

- **TypeScript Strict Mode**: Catch errors at compile time
- **Automated Testing**: Vitest + Testing Library for confidence
- **Code Quality**: Biome for consistent formatting and linting
- **Domain-driven Structure**: Organized by feature, not file type

## Tech Stack

- **Framework**: Next.js 16.0.8 (App Router), React 19.2.1, TypeScript 5
- **Database**: PostgreSQL with Drizzle ORM 0.45.1
- **ORM / Migrations**: Drizzle ORM + Drizzle Kit 0.31.8
- **Authentication**: better-auth 1.4.6
- **Email**: Resend 6.6.0 + React Email 5.1.0
- **File Storage**: Vercel Blob 2.0.0
- **UI Components**: Tailwind CSS v4, shadcn/ui (Radix UI), Lucide icons 0.559.0
- **Rich Text Editor**: Lexical 0.39.0
- **Drag and Drop**: dnd-kit 6.3.1
- **Animations**: Framer Motion 12.23.26
- **State Management**: Zustand 5.0.9 (client-only UI state)
- **Form Handling**: React Hook Form 7.68.0 + Zod 4.1.13
- **Date Handling**: date-fns 4.1.0
- **Linting / Formatting**: Biome 2.2.0
- **Testing**: Vitest 4.0.16 + Testing Library 16.3.1

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A PostgreSQL database
- (Optional) Resend account for email verification in production

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"

# Authentication (at least one required)
BETTER_AUTH_URL="http://localhost:3000"
# or
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Email (optional in development)
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM="Trello Clone <onboarding@resend.dev>"

# Environment
NODE_ENV="development"

# SEO - Public app URL (REQUIRED for production)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Vercel Blob Storage (for file attachments)
BLOB_READ_WRITE_TOKEN="<vercel_blob_token_here>"

# Better Auth Secret (auto-generated or custom)
BETTER_AUTH_SECRET="your-secret-here"

# AI Integration
GROQ_API_KEY="your-groq-api-key"
```

**Notes:**

- `DATABASE_URL` must be a valid PostgreSQL URL. The database connection is configured with `ssl: true` in `db/index.ts`. For local databases without SSL, adjust the connection settings.
- At least one of `BETTER_AUTH_URL` or `NEXT_PUBLIC_BETTER_AUTH_URL` is required.
- `BETTER_AUTH_SECRET` is required for session encryption. Generate a secure random string.
- Email variables are optional in development (verification links appear in console).
- `BLOB_READ_WRITE_TOKEN` is required for file upload functionality (get from Vercel dashboard).
- `NEXT_PUBLIC_APP_URL` is required for proper email links and SEO metadata.
- `GROQ_API_KEY` is required for AI integration (get from Groq dashboard).

### Database setup and migrations

This project uses Drizzle Kit with configuration in `drizzle.config.ts`. SQL migrations are stored in `./drizzle`.

```bash
# Generate a new migration from schema changes
pnpm drizzle-kit generate

# Apply migrations to the database
pnpm drizzle-kit migrate

# Open Drizzle Studio (database GUI)
pnpm drizzle-kit studio
```

**Schema files:**

- Authentication tables: `auth-schema.ts`
- Application tables: `db/schema.ts`

### Run the development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Email Configuration

This project uses **Resend** for email verification. See detailed configuration in [`emails/README.md`](./emails/README.md).

### Development

- Email verification links are printed to console
- Emails only sent if using verified Resend email
- No email configuration required for testing

### Production

To send emails in production:

1. Verify a domain at [resend.com/domains](https://resend.com/domains)
2. Update `RESEND_FROM=Trello Clone <noreply@yourdomain.com>`
3. Configure DNS records (SPF, DKIM, DMARC)

See [`emails/README.md`](./emails/README.md) for complete setup instructions.

## Available Scripts

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # Run Biome linter
pnpm format                 # Format code with Biome

# Database
pnpm drizzle-kit generate   # Generate migration
pnpm drizzle-kit migrate    # Apply migrations
pnpm drizzle-kit studio     # Database GUI

# Testing
pnpm test                   # Run all tests
pnpm test:watch             # Run tests in watch mode
pnpm test:coverage          # Run tests with coverage report

# Email Development
pnpm email:dev              # Preview email templates
```

## Project Structure

```
trello-clone/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup, verify-email, forgot-password)
│   ├── boards/                   # Board listing and detail pages
│   │   ├── [id]/                 # Board detail view
│   │   └── _components/          # Board-specific components
│   ├── notifications/            # Notification pages and components
│   ├── profile/                  # User profile and analytics
│   ├── settings/                 # User settings (notifications)
│   ├── api/                      # API routes (auth, send)
│   ├── about/                    # About page
│   └── _components/              # Shared app components (dialogs, dropdowns)
├── components/                   # UI components
│   ├── ui/                       # shadcn/ui components (25+ components)
│   ├── animations/               # Animation components (FadeIn, StaggerChildren)
│   ├── editor/                   # Lexical rich text editor components
│   ├── blocks/                   # Pre-built editor blocks
│   ├── kibo-ui/                  # Custom UI components (Dropzone, ThemeSwitcher)
│   ├── base-autocomplete/        # Autocomplete component base
│   └── profile/                  # Profile-specific components
├── lib/                          # Business logic (domain-driven organization)
│   ├── auth/                     # Authentication (actions, schemas, session)
│   ├── board/                    # Board domain (actions, queries, schemas)
│   ├── board-member/             # Board membership (actions, queries, schemas)
│   ├── card/                     # Card domain (actions, queries, schemas)
│   ├── card-member/              # Card assignments (actions, queries, schemas)
│   ├── card-attachment/          # File attachments (actions, queries, schemas, validation)
│   ├── list/                     # List domain (actions, queries, schemas)
│   ├── label/                    # Label domain (actions, queries, schemas, constants)
│   ├── comment/                  # Comments (actions, queries, schemas)
│   ├── activity/                 # Activity tracking (actions, queries, formatters, cleanup)
│   ├── notification/             # Notifications (actions, queries, formatters, types)
│   ├── email/                    # Email service (Resend integration)
│   ├── user/                     # User queries and types
│   ├── routes/                   # Route constants
│   └── utils/                    # Shared utilities (form, editor, validation)
├── emails/                       # Email templates (React Email)
│   ├── templates/                # Email template components
│   │   ├── verification-email.tsx
│   │   └── reset-password-email.tsx
│   └── README.md                 # Email configuration guide
├── db/                           # Database
│   ├── index.ts                  # Drizzle connection
│   └── schema.ts                 # Application schema
├── drizzle/                      # SQL migrations (11 migrations)
│   ├── meta/                     # Migration metadata
│   └── *.sql                     # Migration files
├── store/                        # Zustand stores
│   └── board-store.ts            # Board UI state management
├── scripts/                      # Utility scripts
│   └── migrate-production.ts    # Production migration script
├── mocks/                        # Test mocks
│   ├── auth.ts
│   ├── db.ts
│   └── server-only.ts
├── __tests__/                    # Tests (Vitest + Testing Library)
│   ├── app/                      # Page tests
│   ├── components/               # Component tests
│   ├── lib/                      # Business logic tests
│   └── store/                    # Store tests
├── docs/                         # Documentation
│   └── plan-card-attachments.md # Feature planning docs
└── public/                       # Static assets
    ├── icon-192.png              # PWA icons
    ├── icon-512.png
    └── og-image.png              # Social sharing image
```

## Architecture Overview

### Server-First Architecture

- **Routing**: Next.js App Router with server components by default
- **Data access**: Drizzle ORM queries in `lib/**/queries.ts`
- **Mutations**: Next.js Server Actions (e.g., `lib/*/actions.ts`)
- **Caching**: `unstable_cache` with tags for targeted revalidation
- **Access control**: Server-side enforcement (see `lib/board-member/queries.ts`)

### Key Patterns

- **Domain-driven organization**: Code organized by feature/domain
- **Type safety**: Zod schemas for validation + TypeScript
- **Result-style returns**: `{ success: boolean, error?: string }` pattern
- **Activity logging**: Automatic activity tracking with notifications
- **Optimistic updates**: Client-side optimistic UI with Zustand

### State Management

- **Server state**: Cached in React Server Components
- **Client state**: Zustand for UI-only state (modals, drag state)
- **Form state**: React Hook Form + Server Actions

## Database Schema (High Level)

### Core Tables

- **`board`**: Boards with privacy settings (`public`/`private`), background colors/images
- **`board_member`**: Board membership with roles (owner/member)
- **`list`**: Columns within boards, ordered by `position`
- **`card`**: Tasks within lists, ordered by `position`, with optional due dates
- **`card_member`**: Card assignments (many-to-many user-card relationships)
- **`label`**: Labels per board with colors and optional names
- **`card_label`**: Many-to-many card-label relationships
- **`comment`**: Card comments with user attribution
- **`card_attachment`**: File attachments for cards (stored in Vercel Blob)

### Activity & Notifications

- **`activity_log`**: Comprehensive audit trail with metadata, previous/new values, indexed by board and user
- **`notification`**: User notifications linked to activities, with read status and priority levels
- **`user_notification_preferences`**: Granular per-user notification settings (email, card assignments, due dates, comments, mentions, digest frequency)

### Authentication

Authentication tables are managed by better-auth (see `auth-schema.ts`):

- `user`, `session`, `account`, `verification`

## Code Quality

### Standards

This project follows strict code quality standards documented in [`AGENTS.md`](./AGENTS.md):

- **Language**: Spanish (es-ES) for all user-facing messages and content, English for code and technical documentation
- **TypeScript**: Strict mode enabled, no `any`, explicit return types on all public functions, typed domain models
- **Architecture**: Server-first with React Server Components (RSC), Server Actions for mutations
- **Code Organization**: Domain-driven structure, prefer `@/*` imports, group by feature not file type
- **Components**: Use `"use client"` only when necessary, prefer Server Components by default
- **State Management**: Zustand for UI-only state, React Hook Form for forms, Server Actions for data mutations
- **Testing**: Unit tests for business logic (actions, queries, schemas), component tests with Testing Library
- **Formatting**: Biome 2.2.0 with 2-space indentation, 80 char line width, single quotes

### Tools

```bash
pnpm lint       # Biome linter
pnpm format     # Biome formatter
pnpm test       # Vitest tests
```

### Pre-commit

- Run `pnpm format` and `pnpm lint` before commits
- Ensure tests pass with `pnpm test`
- Follow patterns in existing code

## Testing

### Test Structure

```
__tests__/
├── app/                 # Page tests
│   └── about/
├── components/          # Component tests
│   ├── ui/              # UI component tests
│   ├── profile/         # Profile component tests
│   └── ...
├── lib/                 # Business logic tests
│   ├── auth/            # Auth actions and schemas
│   ├── board/           # Board actions and schemas
│   ├── card/            # Card actions and schemas
│   ├── label/           # Label actions and schemas
│   ├── activity/        # Activity formatters
│   └── utils.test.ts    # Utility function tests
└── store/               # Zustand store tests
    └── board-store.test.ts
```

### Running Tests

```bash
pnpm test                   # Run all tests once
pnpm test:watch             # Watch mode (re-run on file changes)
pnpm test:coverage          # Run tests with coverage report
```

### Test Coverage

Current test coverage includes:

- **Server Actions**: Unit tests with mocked database queries
  - Auth actions (login, signup, password reset)
  - Board actions (create, update, delete)
  - Card actions (create, update, move)
  - Label actions (create, assign, remove)
- **Schemas**: Zod schema validation tests
  - Input validation for all domain models
  - Edge cases and error scenarios
- **UI Components**: React Testing Library
  - Navigation components (NavLinks, AppFooter)
  - Profile components (ProfileHeader, ProfileStats, ProfileInfo, ProfileAnalytics)
  - UI primitives (Button, Input)
  - Page components (About page)
- **Utilities**: Helper function tests
  - Form utilities
  - Activity formatters
- **Stores**: Zustand state management tests
  - Board store (drag & drop state)

**Coverage Target**: Aim for >80% coverage on critical paths (auth, board operations, data mutations)

## Contributing

### Guidelines

1. **Architecture**: Follow existing patterns for Server Actions and validation
2. **Data Access**: Keep all database queries in `lib/**/queries.ts` files
3. **Security**: Enforce permissions server-side, never trust client input
4. **Validation**: Use Zod schemas for all inputs, validate both client and server-side
5. **Testing**: Write tests for all new features (minimum: actions, schemas, critical UI)
6. **Documentation**: Update README and inline comments for significant changes
7. **Language**: User-facing text in Spanish, code/comments in English
8. **Types**: Export domain types with `T` prefix (e.g., `TBoard`, `TCard`)

### Development Workflow

1. Create feature branch from `main`
2. Implement feature with tests
3. Run `pnpm format && pnpm lint && pnpm test`
4. Create pull request

### Code Review Checklist

- [ ] TypeScript strict mode compliant (no `any`, explicit return types)
- [ ] User-facing messages in Spanish (es-ES)
- [ ] Server-side validation and auth checks implemented
- [ ] Zod schemas for input validation
- [ ] Tests included and passing (`pnpm test`)
- [ ] Code formatted with Biome (`pnpm format`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Database queries in `queries.ts`, mutations in `actions.ts`
- [ ] Domain types exported with `T` prefix
- [ ] Documentation updated (README, inline comments)
- [ ] Environment variables documented in `.env.example`

## Deployment

### Production on Vercel

The application is designed for deployment on Vercel with:

- **Database**: PostgreSQL on Neon (production-ready)
- **Authentication**: Better Auth with secure session handling
- **Email**: Transactional emails via Resend
- **File Storage**: Vercel Blob for card attachments
- **Deployment**: Automatic deployment from GitHub

### Required Environment Variables

See [.env.example](./.env.example) for the complete list of required variables.

**Critical Production Variables:**

- `DATABASE_URL` - PostgreSQL connection string (Neon recommended)
- `BETTER_AUTH_SECRET` - Secure random string for session encryption
- `BETTER_AUTH_URL` - Production URL (e.g., `https://your-domain.vercel.app`)
- `NEXT_PUBLIC_APP_URL` - Public URL for email links and SEO
- `RESEND_API_KEY` - Resend API key for email sending
- `RESEND_FROM` - Verified sender email address
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

### Deployment Guide

For detailed deployment instructions and production maintenance procedures, see the deployment documentation (if available) or follow these steps:

1. **Database Setup**
   - Create PostgreSQL database on Neon
   - Run migrations: `pnpm db:migrate:production`
   - Verify tables with Drizzle Studio

2. **Vercel Configuration**
   - Connect GitHub repository
   - Configure environment variables
   - Set build command: `pnpm build`
   - Set output directory: `.next`

3. **Post-Deployment Checklist**
   - Verify authentication flow
   - Test email verification
   - Test file upload functionality
   - Check database connectivity
   - Monitor application logs

### Deployment Scripts

```bash
# Migrate production database
pnpm db:migrate:production

# View database in browser (Drizzle Studio)
pnpm db:studio

# Pull environment variables from Vercel
pnpm vercel:env
```

### Hosting Services

- **Application**: Vercel (serverless Next.js deployment)
- **Database**: Neon PostgreSQL (serverless Postgres)
- **Email**: Resend (transactional email service)
- **File Storage**: Vercel Blob (object storage)

### Monitoring & Logs

- **Application Logs**: Vercel Dashboard > Logs (runtime and build logs)
- **Database**: Neon Dashboard > Monitoring (query performance, connections)
- **Email Delivery**: Resend Dashboard > Logs (delivery status, bounce tracking)
- **File Storage**: Vercel Dashboard > Storage > Blob (usage and uploads)

## Project Status

### ✅ Completed Features

- [x] Full authentication system with email verification
- [x] Board creation and management with privacy controls
- [x] Drag-and-drop interface for lists and cards
- [x] Card members, labels, and comments
- [x] File attachments with Vercel Blob storage
- [x] Rich text editor for card descriptions (Lexical)
- [x] Real-time notifications system
- [x] Activity tracking and audit logs
- [x] User profile and analytics
- [x] Customizable notification preferences
- [x] Dark mode support
- [x] Responsive mobile design
- [x] Comprehensive test coverage

### 🚧 Known Limitations

- File attachments limited to images and common document types
- No real-time collaboration (WebSocket/Server-Sent Events)
- Board templates not implemented
- No card cover images
- Limited search functionality

### 🎯 Potential Enhancements

- [ ] Real-time collaboration with presence indicators
- [ ] Board templates and starter kits
- [ ] Advanced search and filtering
- [ ] Card cover images and custom backgrounds
- [ ] Calendar view for cards with due dates
- [ ] Time tracking and estimates
- [ ] Board archiving and restore
- [ ] Bulk card operations
- [ ] Keyboard shortcuts
- [ ] Export boards to JSON/CSV
- [ ] Integration with third-party services (Slack, GitHub)
- [ ] Mobile native app (React Native)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

**Built with ❤️ using Next.js 16, React 19, and TypeScript**
