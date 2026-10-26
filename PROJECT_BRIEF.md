# Performance Lab — project brief

## What this website is

Performance Lab is a deliberately unoptimized React + TypeScript dashboard used to practice identifying, measuring, and improving frontend performance issues. It is a learning environment, not a production commerce or administration system.

The interface is a dark dashboard with five routes:

- **Dashboard** — shows high-level user, product, order, and notification counts; includes an intentionally expensive calculation and a button that forces parent re-renders.
- **Users** — displays a large, filterable and sortable user list. It intentionally renders all matching rows without virtualization.
- **Products** — displays a paginated product grid with client-side search/category filtering and basic price/rating sorting supplied by the API.
- **Orders** — displays a sortable, filterable virtualized table. Orders are derived in the frontend from carts and users.
- **Notifications** — displays notification items and lets the user mark one or all as read. Read state is currently local React state only.

## Primary learning goal

The app intentionally contains performance anti-patterns so a learner can profile them first, apply one improvement at a time, and compare the result. The performance-related comments in source code are intentional teaching markers.

Examples of intentional practice areas:

- Expensive derived calculation during Dashboard rendering.
- Broad notifications context stored high in the component tree.
- User filtering, sorting, callback creation, and large DOM rendering on every update.
- Product derived values recalculated during rendering.
- Data fetching with basic TanStack Query defaults rather than tuned caching.
- A mixture of eager and lazy route loading for code-splitting practice.

Do not remove or "fix" these patterns unless the requested task is specifically a performance exercise or a production-hardening task.

## Technology and architecture

| Area | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Build tool | Vite |
| Routing | TanStack Router |
| Server-state fetching/caching | TanStack Query |
| Table | TanStack Table |
| Virtual scrolling | TanStack Virtual |
| HTTP client | Axios |
| Styling | One global stylesheet: `src/styles.css` |
| Current data source | DummyJSON, through `src/lib/api/index.ts` |

Important directories:

```text
src/
├── app/                 # providers and router setup
├── components/ui/       # shared layout shell
├── features/            # one folder per route/feature
├── lib/api/             # API adapter and external-to-domain mappings
├── lib/data/            # sample-data generators; not the current runtime source
├── types/models.ts      # UI domain models
└── styles.css           # all shared styles
```

## Runtime data flow

1. Each route uses TanStack Query or the notification provider to request data.
2. `src/lib/api/index.ts` calls DummyJSON endpoints and maps their external shape into the UI domain models in `src/types/models.ts`.
3. Components render those mapped models. Components should not need to know DummyJSON field names.
4. Notification read actions update React state only; no write API exists yet.

Current backend API details and a Spring Boot-compatible local contract are documented in [BACKEND_API.md](BACKEND_API.md).

## Domain language

- A **user** has `id`, `name`, `email`, `age`, `status`, and `country`.
- A **product** has `id`, `name`, `category`, `price`, `quantity`, `rating`, and `imageUrl`.
- An **order** is a frontend-derived record from a cart line and its user; it has an ID, customer, product, calculated line price, status, and ISO date.
- A **notification** has an ID, title, message, read state, and ISO date.

The current UI does not have authentication, authorization, payment, checkout, product editing, or server-persisted notification state.

## UX and implementation expectations

- Preserve the existing dark visual style unless the task requests a redesign.
- Keep TypeScript strict and use the domain types from `src/types/models.ts`.
- Prefer feature-local components/hooks under `src/features/<feature>`.
- Keep external API transformations inside `src/lib/api/index.ts` rather than spreading API-specific shapes through UI components.
- Maintain responsive behavior; the sidebar and multi-column content collapse on narrow screens.
- Accessibility work should include semantic controls, visible keyboard focus, persistent form labels, and accessible updates for dynamic results.

## Useful commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Guidance for an AI or contributing developer

Before changing code, identify whether a request is:

1. **A learning/performance task** — preserve the intentional baseline until the task says which bottleneck to address; measure before and after where possible.
2. **A product feature** — add it within the established route/feature/API structure and update domain types as needed.
3. **A backend integration task** — consult `BACKEND_API.md`; the frontend currently expects DummyJSON-compatible read responses.
4. **An accessibility task** — prioritize keyboard access, semantic HTML, labels, focus visibility, and accessible dynamic state.

Avoid broad refactors or unrelated dependency changes. Keep changes small, scoped, and easy to profile or review.
