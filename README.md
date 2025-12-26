# Trello Clone

A Trello-inspired Kanban application built with Next.js App Router. The project includes authentication with email verification, board privacy, collaboration, real-time notifications, and an interactive drag-and-drop experience for lists and cards.

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
  - Optional card due dates
  - Card descriptions and attachments

- **Labels**
  - Create labels per board
  - Assign labels to cards (many-to-many)
  - Label usage counts and filtering

- **Notifications**
  - Real-time activity notifications
  - User notification preferences
  - Activity feed per board
  - Email digest options

- **Activity Tracking**
  - Comprehensive activity logging
  - Activity formatters for user-friendly messages
  - Automatic cleanup of old activities
  - Activity-driven notifications

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: PostgreSQL
- **ORM / Migrations**: Drizzle ORM + Drizzle Kit
- **Authentication**: better-auth
- **Email**: Resend + React Email
- **UI**: Tailwind CSS v4, shadcn/ui (Radix UI), Lucide icons
- **Drag and drop**: dnd-kit
- **State**: Zustand (client-only UI state)
- **Linting / formatting**: Biome
- **Testing**: Vitest + Testing Library

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
RESEND_API_KEY="your_resend_api_key"
RESEND_FROM="Trello Clone <onboarding@resend.dev>"

# Environment
NODE_ENV="development"
```

**Notes:**

- `DATABASE_URL` must be a valid PostgreSQL URL. The database connection is configured with `ssl: true` in `db/index.ts`. For local databases without SSL, adjust the connection settings.
- At least one of `BETTER_AUTH_URL` or `NEXT_PUBLIC_BETTER_AUTH_URL` is required.
- Email variables are optional in development (verification links appear in console).

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
```

## Project Structure

```
trello-clone/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup, verify-email)
│   ├── boards/                   # Board listing and detail pages
│   ├── notifications/            # Notification pages
│   ├── settings/                 # User settings
│   ├── api/                      # API routes
│   └── _components/              # Shared app components
├── components/                   # UI components
│   ├── ui/                       # shadcn/ui components
│   ├── animations/               # Animation components
│   └── kibo-ui/                  # Custom UI components
├── lib/                          # Business logic
│   ├── auth/                     # Authentication
│   ├── board/                    # Board domain
│   ├── card/                     # Card domain
│   ├── list/                     # List domain
│   ├── label/                    # Label domain
│   ├── activity/                 # Activity tracking
│   ├── notification/             # Notifications
│   ├── email/                    # Email service
│   └── utils/                    # Shared utilities
├── emails/                       # Email templates (React Email)
│   ├── templates/                # Email template components
│   └── README.md                 # Email configuration guide
├── db/                           # Database
│   ├── index.ts                  # Drizzle connection
│   └── schema.ts                 # Application schema
├── drizzle/                      # SQL migrations
├── store/                        # Zustand stores
├── __tests__/                    # Tests
└── public/                       # Static assets
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

- **`board`**: Boards with privacy settings (`public`/`private`)
- **`board_member`**: Board membership with roles (owner/member)
- **`list`**: Columns within boards, ordered by `position`
- **`card`**: Tasks within lists, ordered by `position`
- **`label`**: Labels per board with colors
- **`card_label`**: Many-to-many card-label relationships

### Activity & Notifications

- **`activity_log`**: All user activities with metadata
- **`notification`**: User notifications from activities
- **`user_notification_preferences`**: Per-user notification settings

### Authentication

Authentication tables are managed by better-auth (see `auth-schema.ts`):

- `user`, `session`, `account`, `verification`

## Code Quality

### Standards

This project follows strict code quality standards documented in [`AGENTS.md`](./AGENTS.md):

- **Language**: Spanish for user-facing messages, English for code
- **TypeScript**: Strict mode, no `any`, explicit return types
- **Testing**: Unit tests for business logic, integration tests for flows
- **Formatting**: Biome with 2-space indentation

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
├── components/          # Component tests
├── lib/                 # Business logic tests
│   ├── auth/
│   ├── board/
│   ├── card/
│   ├── email/          # Email service tests
│   └── ...
└── store/              # Zustand store tests
```

### Running Tests

```bash
pnpm test                   # Run all tests
pnpm test:watch             # Watch mode
pnpm test lib/email/        # Run specific tests
```

### Test Coverage

- **Server Actions**: Mocked database queries
- **Email Service**: Mocked Resend client
- **UI Components**: React Testing Library
- **Stores**: Zustand state tests

## Contributing

### Guidelines

1. Follow existing patterns for Server Actions and validation
2. Keep database access in `lib/**/queries.ts`
3. Enforce permissions server-side
4. Write tests for new features
5. Update documentation as needed

### Development Workflow

1. Create feature branch from `main`
2. Implement feature with tests
3. Run `pnpm format && pnpm lint && pnpm test`
4. Create pull request

### Code Review Checklist

- [ ] TypeScript strict mode compliant
- [ ] User messages in Spanish
- [ ] Server-side validation and auth checks
- [ ] Tests included and passing
- [ ] Documentation updated

## Deployment

### Environment Variables

Set all required environment variables:

```bash
DATABASE_URL="postgresql://..."
BETTER_AUTH_URL="https://yourdomain.com"
RESEND_API_KEY="re_..."
RESEND_FROM="Your App <noreply@yourdomain.com>"
NODE_ENV="production"
```

### Database Migrations

Apply migrations during deployment:

```bash
pnpm drizzle-kit migrate
```

### Hosting Recommendations

- **Vercel**: Seamless Next.js deployment
- **Neon**: PostgreSQL serverless database
- **Resend**: Email delivery service

### Post-Deployment

1. Verify domain for Resend emails
2. Test email verification flow
3. Monitor error logs and performance
4. Set up database backups

## License

No license file is included in this repository.

---

**Built with ❤️ using Next.js 16, React 19, and TypeScript**
