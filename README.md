# Trello Clone

A modern, full-stack task management application inspired by Trello, built with Next.js 16 and the latest web technologies.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Development](#development)
  - [Available Commands](#available-commands)
  - [Project Structure](#project-structure)
- [Code Style & Conventions](#code-style--conventions)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project is a production-ready Trello clone that demonstrates modern web development practices with Next.js 16 App Router, TypeScript, and PostgreSQL. It features a complete authentication system, real-time board management, and a responsive UI with dark mode support.

## ✨ Features

### 🔐 Authentication
- **User Registration** - Sign up with email and password
- **Email Verification** - Secure email verification flow
- **User Login** - Secure authentication with better-auth
- **Session Management** - Persistent user sessions

### 📊 Board Management
- **Create Boards** - Create new boards with custom titles and colors
- **View Boards** - Grid view of all user boards with preview cards
- **Filter Boards** - Advanced filtering by:
  - Text (search by title/description)
  - Color (filter by background color)
  - Date (filter by creation date)
- **Delete Boards** - Soft delete with confirmation dialog
- **Board Pagination** - Efficient pagination for large board collections

### 🎨 User Experience
- **Dark/Light Theme** - System-aware theme switching
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Animations** - Smooth transitions with Framer Motion
- **Loading States** - Skeleton loaders for better UX
- **Toast Notifications** - User feedback with Sonner

### 🏗️ Database Structure
- **Boards** - Main project containers with customization options
- **Lists** - Vertical columns within boards (planned feature)
- **Cards** - Individual tasks with descriptions and due dates (planned feature)
- **Labels** - Color-coded tags for cards (planned feature)
- **Board Members** - Collaboration and role-based access (planned feature)

## 🛠 Tech Stack

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript (strict mode)

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe ORM with migrations
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migration toolkit

### Authentication
- **[better-auth](https://www.better-auth.com/)** - Modern authentication library
- **[Zod](https://zod.dev/)** - Runtime validation and schema definition

### State Management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management

### UI & Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn UI](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### Form Management
- **[React Hook Form](https://react-hook-form.com/)** - Performant form validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Zod integration

### Developer Tools
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[date-fns](https://date-fns.org/)** - Modern date utility library

### Planned Features
- **[@dnd-kit](https://dndkit.com/)** - Drag and drop functionality for cards

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - v18.17 or higher
- **pnpm** - v8.0 or higher (recommended package manager)
- **PostgreSQL** - v14 or higher

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/trello-clone.git
cd trello-clone
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### Environment Variables

Configure the following environment variables in your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/trello_clone"

# Authentication (better-auth)
BETTER_AUTH_URL="http://localhost:3000/api/auth"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000/api/auth"

# Environment
NODE_ENV="development"
```

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `BETTER_AUTH_URL` | Server-side auth endpoint | `http://localhost:3000/api/auth` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Client-side auth endpoint | `http://localhost:3000/api/auth` |
| `NODE_ENV` | Environment mode | `development` \| `production` \| `test` |

> **Note:** Either `BETTER_AUTH_URL` or `NEXT_PUBLIC_BETTER_AUTH_URL` must be set.

### Database Setup

1. **Create the database**

```bash
createdb trello_clone
```

2. **Run migrations**

```bash
pnpm drizzle-kit push
```

Or generate and run migrations manually:

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

3. **Verify the setup**

```bash
pnpm drizzle-kit studio
```

This opens Drizzle Studio to inspect your database.

## 💻 Development

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server on `http://localhost:3000` |
| `pnpm build` | Create an optimized production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run Biome linter to check code quality |
| `pnpm format` | Format code with Biome |

### Development Workflow

1. **Start the development server**

```bash
pnpm dev
```

2. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

3. **Make changes**

The application will automatically reload when you save files thanks to Fast Refresh.

### Project Structure

```
trello-clone/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (grouped)
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   └── verify-email/         # Email verification
│   ├── _components/              # Private app-level components
│   ├── api/                      # API routes
│   │   └── auth/                 # better-auth API handler
│   ├── boards/                   # Boards page
│   │   └── _components/          # Board-specific components
│   │       └── filters/          # Filtering UI components
│   ├── error.tsx                 # Error boundary
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Global loading state
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # Shared React components
│   ├── animations/               # Framer Motion wrappers
│   ├── kibo-ui/                  # Custom UI components
│   ├── ui/                       # Shadcn UI components
│   └── navbar.tsx                # Navigation components
├── db/                           # Database layer
│   ├── index.ts                  # Database client
│   └── schema.ts                 # Drizzle schema definitions
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication logic
│   │   ├── actions.ts            # Server actions for auth
│   │   ├── get-user.ts           # User retrieval helpers
│   │   ├── schemas.ts            # Zod validation schemas
│   │   └── types.ts              # TypeScript types
│   ├── board/                    # Board management
│   │   ├── actions.ts            # Server actions for boards
│   │   ├── queries.ts            # Database queries
│   │   ├── schemas.ts            # Validation schemas
│   │   ├── types.ts              # TypeScript types
│   │   └── filter-types.ts       # Filter type definitions
│   ├── utils/                    # Utility functions
│   │   ├── form.ts               # Form helpers
│   │   └── rate-limit.ts         # Rate limiting
│   ├── auth.ts                   # better-auth configuration
│   ├── auth-client.ts            # Client-side auth helpers
│   ├── env.ts                    # Environment validation
│   ├── errors.ts                 # Error definitions
│   ├── fonts.ts                  # Font configuration
│   └── utils.ts                  # General utilities (cn, etc.)
├── store/                        # Zustand state management
│   └── board-store.ts            # Board filter state
├── drizzle/                      # Database migrations
├── public/                       # Static assets
├── .env                          # Environment variables (gitignored)
├── auth-schema.ts                # better-auth database schema
├── biome.json                    # Biome configuration
├── components.json               # Shadcn UI configuration
├── drizzle.config.ts             # Drizzle ORM configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration (implied)
└── tsconfig.json                 # TypeScript configuration
```

## 📐 Code Style & Conventions

This project follows strict coding standards enforced by Biome and TypeScript.

### TypeScript

- **Strict mode enabled** - No implicit `any`, strict null checks
- **Type exports** - Prefix all exported types with `T` (e.g., `TUser`, `TBoard`)
- **Explicit return types** - All public functions must have explicit return types
- **Avoid type assertions** - Use type guards and narrowing instead of `as`
- **Runtime validation** - Use Zod schemas for runtime type checking

### Code Formatting

- **Indentation** - 2 spaces
- **Line width** - 80 characters
- **Quotes** - Single quotes for strings
- **Semicolons** - As needed (Biome decides)
- **Trailing commas** - ES5 style

### Import Organization

- Use **absolute imports** with `@/*` path alias
- Import order: external → internal → relative
- Group related imports together

```typescript
// External packages
import { useState } from 'react'
import { toast } from 'sonner'

// Internal modules (@ alias)
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

// Relative imports
import { LoginForm } from './_components/login-form'
```

### React Components

- **Server Components by default** - Only use Client Components when necessary
- **Mark Client Components** - Add `"use client"` directive at the top
- **Functional components** - Use function declarations, not arrow functions
- **Props typing** - Always type component props
- **Single props object** - Components accept one `props` parameter

```typescript
// ✅ Good
type TLoginFormProps = {
  redirectUrl?: string
}

export function LoginForm({ redirectUrl }: TLoginFormProps) {
  return <form>...</form>
}
```

### Server Actions

- **Pure functions** - Server actions must be pure and deterministic
- **Validation** - Always validate inputs with Zod schemas
- **Error handling** - Return typed result objects
- **No UI logic** - Keep UI concerns in components

```typescript
// Server action pattern
export async function createBoard(
  input: TCreateBoardInput
): Promise<TActionResult<TBoard>> {
  try {
    // Validate input
    const validated = createBoardSchema.parse(input)
    
    // Business logic
    const board = await db.insert(board).values(validated)
    
    return { success: true, data: board }
  } catch (error) {
    return { success: false, error: 'Failed to create board' }
  }
}
```

### Styling

- **Tailwind utility classes** - Primary styling method
- **Shadcn UI components** - Use for common UI patterns
- **Use `cn()` helper** - For conditional classes
- **Consistent spacing** - Use Tailwind's spacing scale

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "flex items-center gap-2",
  isActive && "bg-primary text-white"
)} />
```

### State Management

- **Zustand for client state** - UI state only, not server data
- **Server Actions for mutations** - Data fetching and updates
- **React Query for caching** - (If added in the future)

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `BoardCard`, `LoginForm` |
| Functions | camelCase | `createBoard`, `getUser` |
| Types | PascalCase with `T` prefix | `TUser`, `TBoard` |
| Constants | UPPER_SNAKE_CASE | `MAX_BOARDS`, `API_URL` |
| Files (components) | kebab-case | `board-card.tsx` |
| Files (utilities) | kebab-case | `get-user.ts` |

### Linting & Formatting

Format your code before committing:

```bash
pnpm format
pnpm lint
```

The project uses Biome for both linting and formatting. Configuration is in `biome.json`.

## 🗄 Database Schema

The application uses PostgreSQL with Drizzle ORM. The schema includes:

### Tables

- **`user`** - User accounts (managed by better-auth)
- **`board`** - Task boards with customization
- **`list`** - Columns within boards (planned feature)
- **`card`** - Individual tasks (planned feature)
- **`label`** - Color-coded tags (planned feature)
- **`card_label`** - Many-to-many relationship (planned feature)
- **`board_member`** - Board collaboration (planned feature)

### Key Relationships

```
user (1) ──< (many) board
board (1) ──< (many) list
list (1) ──< (many) card
board (1) ──< (many) label
card (many) ──< (many) label (through card_label)
board (many) ──< (many) user (through board_member)
```

### Indexes

Optimized indexes on:
- `board.owner_id` - Fast user board lookups
- `board.created_at` - Date-based filtering
- `list.board_id`, `list.position` - Efficient list ordering
- `card.list_id`, `card.position` - Card ordering
- `card.due_date` - Date filtering

View the complete schema in [`db/schema.ts`](./db/schema.ts).

## 🔐 Authentication

This project uses **[better-auth](https://www.better-auth.com/)** for authentication.

### Features

- ✅ Email/password authentication
- ✅ Email verification
- ✅ Session management
- ✅ Secure password hashing
- ✅ CSRF protection

### Auth Flow

1. **Sign Up** → User creates account with email/password
2. **Email Verification** → User verifies email with token
3. **Login** → User authenticates and receives session
4. **Protected Routes** → Middleware checks session
5. **Sign Out** → Session is invalidated

### Implementation

The auth system is configured in:
- **Server config**: `lib/auth.ts`
- **Client helpers**: `lib/auth-client.ts`
- **API route**: `app/api/auth/[...all]/route.ts`
- **Database schema**: `auth-schema.ts`

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow code style** - Run `pnpm format` and `pnpm lint`
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] All Server Actions have input validation
- [ ] Components are properly typed
- [ ] Code follows project conventions
- [ ] No console errors or warnings
- [ ] Responsive design on mobile
- [ ] Accessible UI (keyboard navigation, ARIA labels)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Vercel](https://vercel.com/) - Deployment platform
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful component library
- [better-auth](https://www.better-auth.com/) - Modern authentication
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM

---

**Built with ❤️ using Next.js 16**

For questions or support, please open an issue on GitHub.
