# Trello Clone
 
 A Trello-inspired Kanban application built with Next.js App Router. The project includes authentication with email verification, board privacy, collaboration, and an interactive drag-and-drop experience for lists and cards.
 
 ## Table of Contents
 
 - [Features](#features)
 - [Tech Stack](#tech-stack)
 - [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Install dependencies](#install-dependencies)
   - [Configure environment variables](#configure-environment-variables)
   - [Database setup and migrations](#database-setup-and-migrations)
   - [Run the development server](#run-the-development-server)
 - [Available Scripts](#available-scripts)
 - [Project Structure](#project-structure)
 - [Architecture Overview](#architecture-overview)
 - [Database Schema (High Level)](#database-schema-high-level)
 - [Code Quality](#code-quality)
 - [Contributing](#contributing)
 - [Authentication Notes](#authentication-notes)
 - [Deployment](#deployment)
 - [License](#license)
 
 ## Features
 
 - **Authentication**
   - Email/password sign up and sign in
   - Email verification
   - Session-based authentication via better-auth
 - **Boards**
   - Create and manage boards
   - Public/private board visibility
   - Board listing with pagination and filtering
 - **Collaboration**
   - Board membership (owner/member)
   - Access checks for protected resources
 - **Lists and Cards**
   - Lists (columns) and cards (tasks) with persistent ordering
   - Drag and drop reordering
   - Optional card due dates
 - **Labels**
   - Create labels per board
   - Assign labels to cards (many-to-many)
   - Label usage counts
 
 ## Tech Stack
 
 - **Framework**: Next.js 16 (App Router), React 19, TypeScript
 - **Database**: PostgreSQL
 - **ORM / Migrations**: Drizzle ORM + Drizzle Kit
 - **Authentication**: better-auth
 - **UI**: Tailwind CSS v4, shadcn/ui (Radix UI), Lucide icons
 - **Drag and drop**: dnd-kit
 - **State**: Zustand (client-only UI state)
 - **Linting / formatting**: Biome
 
 ## Getting Started
 
 ### Prerequisites
 
 - Node.js and pnpm
 - A PostgreSQL database
 
 ### Install dependencies
 
 ```bash
 pnpm install
 ```
 
 ### Configure environment variables
 
 Create a `.env` file in the project root.
 
 ```bash
 DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
 
 # You must set at least one of these:
 BETTER_AUTH_URL="http://localhost:3000"
 # or
 NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
 
 NODE_ENV="development"
 ```
 
 Notes:
 
 - `DATABASE_URL` must be a valid URL. The database connection is configured with `ssl: true` in `db/index.ts`. If you are using a local database without SSL, you may need to adjust the connection settings.
 - At least one of `BETTER_AUTH_URL` or `NEXT_PUBLIC_BETTER_AUTH_URL` is required by `lib/env.ts`.
 
 ### Database setup and migrations
 
 This project uses Drizzle Kit with the configuration in `drizzle.config.ts`. SQL migrations are stored in `./drizzle`.
 
 Common commands:
 
 ```bash
 # Generate a new migration from schema changes
 pnpm drizzle-kit generate
 
 # Apply migrations to the database
 pnpm drizzle-kit migrate
 ```
 
 Schema files:
 
 - Authentication tables: `auth-schema.ts`
 - Application tables: `db/schema.ts`
 
 ### Run the development server
 
 ```bash
 pnpm dev
 ```
 
 The app will be available at `http://localhost:3000`.
 
 ## Available Scripts
 
 ```bash
 pnpm dev
 pnpm build
 pnpm start
 pnpm lint
 pnpm format
 ```
 
 ## Project Structure
 
 - `app/`
   - `(auth)/`: authentication pages (login, signup, email verification)
   - `boards/`: board listing and board detail pages
   - `api/auth/[...all]/route.ts`: better-auth Next.js handler
 - `lib/`
   - `auth.ts`: better-auth server configuration
   - `auth-client.ts`: better-auth React client
   - `auth/actions.ts`: server actions for sign in/up/out
   - `board/`, `list/`, `label/`, `board-member/`: domain queries and actions
   - `env.ts`: environment variable validation
 - `db/`
   - `index.ts`: Drizzle database connection
   - `schema.ts`: application database schema
 - `drizzle/`: generated SQL migrations
 
 ## Architecture Overview
 
 - **Routing**: Next.js App Router (`app/`) with server components by default.
 - **Data access**: Drizzle ORM queries live under `lib/**/queries.ts` and use the shared connection in `db/index.ts`.
 - **Mutations**: Implemented primarily as Next.js Server Actions (for example `lib/auth/actions.ts`).
 - **Caching**: Several read queries use `unstable_cache` with tags for targeted invalidation.
 - **Access control**: Board privacy and membership checks are enforced on the server (see `lib/board-member/queries.ts`).
 
 ## Database Schema (High Level)
 
 The main tables are:
 
 - `board`: boards owned by a user, with privacy (`public` / `private`)
 - `board_member`: board membership (owner/member semantics)
 - `list`: columns within a board, ordered by `position`
 - `card`: tasks within a list, ordered by `position`, with optional `due_date`
 - `label`: labels owned by a board
 - `card_label`: many-to-many between cards and labels
 
 Authentication tables are managed by better-auth and are defined in `auth-schema.ts`.
 
 ## Code Quality
 
 This repository uses Biome for formatting and linting:
 
 ```bash
 pnpm format
 pnpm lint
 ```
 
 ## Contributing
 
 - Follow the existing patterns for Server Actions and input validation.
 - Keep database access in `lib/**/queries.ts` and prefer server-side enforcement for permissions.
 - Run `pnpm format` and `pnpm lint` before opening a pull request.
 
 ## Authentication Notes
 
 During development, email verification links are printed to the server console. For production, you should integrate an email provider inside `lib/auth.ts`.
 
 ## Deployment
 
 - Set the same environment variables as in local development.
 - Ensure your database is reachable from your hosting provider.
 - Apply migrations during deployment (or as a separate migration step) using Drizzle Kit.
 
 ## License
 
 No license file is included in this repository.
