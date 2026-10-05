# React Performance Optimization Lab

A deliberately unoptimized React + TypeScript application for learning how to measure and improve frontend performance. It uses Vite, TanStack Query, Router, Table, and Virtual (installed but intentionally unused at first).

## Run it

```bash
npm install
npm run dev
```

Other useful commands:

```bash
npm run lint
npm run build
```

## Project structure

```text
src/
├── app/
│   ├── providers/       # Query and deliberately broad notifications state
│   └── router/          # TanStack Router route tree
├── components/ui/       # App shell and shared UI
├── features/
│   ├── dashboard/
│   ├── notifications/
│   ├── orders/
│   ├── products/
│   └── users/
├── lib/
│   ├── api/             # Promise + timeout fake API
│   └── data/            # Local dataset generators
├── types/
└── styles.css
```

## Intentional performance practice areas

- Dashboard runs an expensive score calculation during every render and passes several props to an un-memoized child.
- The Users page filters and sorts 5,000 records during rendering, renders all matching rows normally, and creates callbacks as it renders.
- The Products page recomputes filtering, sorting, averages, inventory value, and category counts during rendering.
- The Orders page uses a fresh TanStack Table columns definition on each render. It paginates but does not virtualize rows.
- Notification state is deliberately held high in a provider, so read-state changes can cause broad context updates.
- Queries use a basic default configuration: no tuned `staleTime`, prefetching, selectors, or advanced invalidation strategy.
- Routes are eagerly imported; there is no route code splitting or lazy loading.

## Suggested optimization path

1. Profile the dashboard, then split/relocate state and compare `React.memo`, `useCallback`, and `useMemo`.
2. Measure Users filtering, sorting, and rendering; add memoization and input debouncing before introducing TanStack Virtual.
3. Memoize Products derived calculations only after measuring their effect.
4. Inspect Orders table renders; stabilize data/columns and then experiment with virtualized rows.
5. Move or narrow notification state, then test memoized rows and stable handlers.
6. Tune TanStack Query caching and request behavior.
7. Add route lazy loading, `React.lazy`, Suspense boundaries, and analyze the production bundle.

The code has `PERFORMANCE PRACTICE` comments at the intentionally expensive or broad-update boundaries. Do not treat these as production patterns—they are learning targets.
