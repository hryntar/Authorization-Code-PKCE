# Time Tracking App

Modern full-stack monorepo with **Turborepo**, **pnpm**, **React**, **NestJS**, and **Prisma**.

## Structure

```
apps/
├── web/                    # React + Vite + shadcn/ui
└── api/                    # NestJS + Prisma
packages/
└── database/               # Prisma schema + client
tooling/
├── eslint-config/          # Shared ESLint configs
├── prettier-config/        # Shared Prettier config
└── typescript-config/      # Shared TypeScript configs
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up -d

# Setup database
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm db:studio

# Start dev servers
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Commands

```bash
pnpm dev          # Start all apps
pnpm build        # Build all apps
pnpm lint         # Lint code
pnpm type-check   # Type check
pnpm format       # Format code

pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to DB
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
```

## Tech Stack

- **Frontend**: React 19, Vite, shadcn/ui, Tailwind CSS
- **Backend**: NestJS, Express
- **Database**: PostgreSQL, Prisma
- **Monorepo**: Turborepo, pnpm workspaces
- **Quality**: Husky, commitlint, lint-staged, ESLint, Prettier

## Git Hooks

Pre-commit hooks automatically:

- Format code with Prettier
- Fix linting issues with ESLint
- Validate commit messages (conventional commits)

### Commit Format

```
feat: add user authentication
fix: resolve database connection issue
docs: update README
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Frontend:**

```bash
cd apps/web
pnpm preview
```

**Backend:**

```bash
cd apps/api
pnpm start:prod
```

## 📚 Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Documentation](https://pnpm.io/)
- [Vite Documentation](https://vitejs.dev/)
- [NestJS Documentation](https://nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/)
- [Docker Documentation](https://docs.docker.com/)
