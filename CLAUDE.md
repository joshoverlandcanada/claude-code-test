# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps + prisma generate + migrate
npm run dev          # Dev server with Turbopack (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run db:reset     # Drop and recreate SQLite database
```

Run a single test file:
```bash
npx vitest run src/path/to/__tests__/file.test.ts
```

## Architecture

UIGen is an AI-powered React component generator. The user chats with Claude, which edits a **virtual file system** (in-memory) via tool calls. Files are rendered live in a sandboxed iframe using Babel transpilation and import maps.

### Core Data Flow

1. User sends message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. `streamText()` (Vercel AI SDK) calls Claude with two tools:
   - `str_replace_editor` — create/view/edit files in virtual FS
   - `file_manager` — rename/delete files
3. Tool calls execute in `FileSystemContext`, updating in-memory state
4. `jsx-transformer.ts` transpiles JSX via `@babel/standalone` → preview HTML with import maps
5. Preview iframe re-renders; Monaco editor reflects current file
6. On completion, project state (messages + serialized FS) is persisted to SQLite via Prisma

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/file-system.ts` | Virtual file system (tree, serialize/deserialize) |
| `src/lib/contexts/file-system-context.tsx` | React context; executes tool calls |
| `src/lib/contexts/chat-context.tsx` | Wraps `useChat`; serializes FS in each request |
| `src/lib/transform/jsx-transformer.ts` | JSX → browser-runnable HTML with import maps |
| `src/lib/provider.ts` | Language model setup; falls back to `MockLanguageModel` if no API key |
| `src/lib/prompts/generation.tsx` | System prompt for Claude |
| `src/lib/tools/str-replace.ts` | Zod schema + executor for str_replace_editor tool |
| `src/lib/tools/file-manager.ts` | Zod schema + executor for file_manager tool |
| `src/app/api/chat/route.ts` | Streaming chat endpoint |
| `src/app/main-content.tsx` | Resizable panel layout (chat 35% / editor+preview 65%) |
| `src/lib/auth.ts` | JWT sessions (7-day, httpOnly cookies) |
| `src/actions/index.ts` | Server actions: signUp, signIn, signOut |

### State Management

- **FileSystemContext** — virtual FS state and file operations
- **ChatContext** — chat messages and AI streaming state
- No Redux; plain React context throughout

### Database Schema

- Defined in `prisma/schema.prisma` — reference it to understand data structure
- **User**: id, email, password, createdAt, updatedAt
- **Project**: id, name, userId (nullable), messages (JSON string), data (JSON string), createdAt, updatedAt
- Project.userId is optional (supports anonymous projects); cascades on user delete

### Authentication & Persistence

- JWT via `jose`, passwords via `bcrypt`
- Prisma + SQLite (`prisma/dev.db`)
- Anonymous users: work tracked via `anon-work-tracker.ts` (localStorage)
- Authenticated users: projects saved to DB (User → Project with JSON `messages` and `data` fields)

### Code Style

- Use comments sparingly. Only comment complex code.

### Environment

- `ANTHROPIC_API_KEY` in `.env` — optional; app works without it using `MockLanguageModel`
- Path alias `@/*` maps to `src/*`
- Tailwind CSS v4, shadcn/ui (New York style), Lucide icons
