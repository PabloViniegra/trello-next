Dalse, error: 'Failed to create board' }
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
- **`session`** - User sessions (managed by better-auth)
- **`verification`** - Email verification tokens (managed by better-auth)
- **`board`** - Task boards with titles, descriptions, and colors
- **`board_member`** - Board collaboration with owner/member roles
- **`list`** - Vertical columns within boards with positioning
- **`card`** - Individual tasks with titles, descriptions, and due dates
- **`label`** - Color-coded tags with optional names
- **`card_label`** - Many-to-many relationship between cards and labels

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
- `board_member.board_id`, `board_member.user_id` - Member lookups
- `list.board_id`, `list.position` - Efficient list ordering
- `card.list_id`, `card.position` - Card ordering within lists
- `card.due_date` - Date filtering for deadlines
- `label.board_id` - Fast label retrieval per board
- `card_label.card_id`, `card_label.label_id` - Label assignment lookups

### Constraints

- **Unique constraints**:
  - `board_member(board_id, user_id)` - One membership per user per board
  - `card_label(card_id, label_id)` - One assignment per label per card
- **Foreign keys** - Cascading deletes for data integrity
- **Position fields** - Integer-based ordering for drag & drop

View the complete schema in [`db/schema.ts`](./db/schema.ts).

## 🎯 Key Implementation Features

### Drag & Drop System
- **Keyboard accessible** - WCAG 2.1 AA compliant with arrow key navigation
- **Optimistic updates** - Instant UI feedback with server reconciliation
- **Mouse & touch support** - Works on desktop and mobile devices
- **Position management** - Automatic position recalculation on card moves
- **Cross-list dragging** - Move cards between different lists seamlessly

### Label System Architecture
- **Permission-based CRUD** - Board owners manage labels, members assign them
- **Efficient queries** - Single query loads with Drizzle relations (no N+1)
- **Race condition safe** - Database constraints prevent duplicate assignments
- **Color normalization** - Automatic uppercase conversion for consistency
- **Usage tracking** - Real-time card count per label
- **Flexible naming** - Labels can have names or be color-only

### Board Collaboration
- **Role-based access** - Owner vs Member permissions
- **Invite system** - Add members by email
- **Access control** - Members can view and edit, owners can manage
- **Cascading permissions** - Board access extends to lists and cards

### Performance Optimizations
- **Server Components** - Minimized client-side JavaScript
- **Efficient caching** - Next.js cache with revalidation strategies
- **Optimistic UI** - Instant feedback without waiting for server
- **Indexed queries** - Strategic database indexes for fast lookups
- **Lazy loading** - Dynamic imports for heavy components

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
