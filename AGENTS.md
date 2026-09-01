# Memory

## Project Overview
Botanica (Botanical Essence) — a premium edibles & essential oils storefront.

- Built with Astro 7 (`.astro` pages + React 19 islands hydrated via `client:load`), TypeScript (strict).
- Styled with Tailwind CSS 4 using `@theme` tokens in `src/styles/global.css` (no `tailwind.config`).
- Backed by Supabase: DB, Auth, and Storage initialized in `src/lib/supabase.ts`.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- See `README.md` for AI Studio app details and `package.json` for scripts (pnpm).

## Code Style Guidelines
- Keep TypeScript strict; use descriptive variable names; extract complex conditions into named booleans.
- Mark interactive/browser-dependent React components with `'use client'`; Astro pages are server-rendered by default.
- Prefer `@/` imports over relative imports.
- Use `cn()` from `src/lib/utils.ts` to merge Tailwind classes.
- Use the design tokens (font-*, text-*, spacing-*, color-*) instead of arbitrary values.
- Existing Supabase rows are typed as `any`; introduce typed interfaces for new logic.
- Mobile-first: base styles target small screens; use `md:`/`lg:` (min-width) variants to layer desktop styles.
- Use `dvh` (not `vh`) for mobile containers; use `aspect-ratio` over fixed heights; use `clamp()` for fluid type/spacing.

## Architecture Notes
- Routes live under `src/pages/`:
  - Storefront: `/`, `/oils`, `/edibles`, `/product/[slug]`, `/cart`.
  - Checkout: `/checkout`, `/checkout/shipping`, `/checkout/confirmation`.
  - Admin: `/admin`, `/admin/products`, `/admin/orders`.
- Layouts: `src/layouts/Layout.astro` (storefront: Header, skip link, MotionProvider, BottomNav) and `src/layouts/AdminLayout.astro` (sidebar + AdminBottomNav on mobile).
- Storefront pages fetch Supabase and fall back to placeholder data when the DB is empty or policies block access.
- Cart state is client-only in a `nanostores` store (`src/store/cart.ts`), read via `useStore()` from `@nanostores/react`.
- Checkout flow: shipping form → bank-transfer instructions + receipt upload → creates an `orders` row with status `Pending Verification`; receipt upload uses Supabase Storage (`src/lib/orders.ts`).
- Admin:
  - `/admin` overview is currently static placeholder stats.
  - Product CRUD in `src/pages/admin/products.astro` + `src/components/admin/ProductFormModal.tsx` (gated by `AdminGate`).
  - Order status updates in `src/pages/admin/orders.astro` + `src/components/admin/OrderDetailsModal.tsx` (gated by `AdminGate`).
  - Admin auth helpers in `src/lib/auth.ts`.
- Animations use the `motion` package via `src/components/FadeIn.tsx` (`FadeIn`, `StaggerContainer`, `StaggerItem`), wrapped in `MotionProvider` (`reducedMotion="user"`).
- External images: use plain `<img>` with `referrerpolicy="no-referrer"`; host allowlisting is not needed (no Next Image).
- Mobile bottom navs: `src/components/BottomNav.tsx` (storefront) and `src/components/admin/AdminBottomNav.tsx` (admin), both fixed with `pb-safe` (safe-area-inset).

## Data Model
- `products`: `name`, `slug`, `description`, `price`, `inventory`, `category`, `image`, `is_active`, `created_at`, `updated_at` (snake_case Supabase columns).
- `orders`: `user_id` (email used for guest checkout), `items[]`, `total`, `status`, `shipping_address`, `receipt_url`, `created_at`.
- Admin users: `src/lib/auth.ts` (`isAdmin()`, `signInWithPassword`, `signOut`).

## Design System
- Defined in `src/styles/global.css` under `@theme`.
- Colors: `surface*`, `primary` (#18231a), `secondary`, `tertiary`, `error`, plus `on-*` and `*-container` variants.
- Fonts: Bodoni Moda for display/headline, Plus Jakarta Sans for body/label.
- Typography: `text-display-lg`, `text-headline-*`, `text-body-*`, `text-label-sm` — fluid `clamp()` values.
- Spacing tokens: `unit`, `gutter`, `margin-mobile`, `margin-desktop`, `stack-sm/md/lg`, `section-gap`, `container-max` — fluid `clamp()` where responsive.
- Radius tokens: `radius-sm/md/lg/xl/full`.
- Custom utilities: `botanical-shadow`, `hide-scrollbar`, `input-underline`, `pb-safe`, `touch-target`, `visually-hidden`, `skip-link`; global `:focus-visible` outline styles.

## Common Workflows
- `pnpm dev` — start the local dev server.
- `pnpm build` — production build.
- `pnpm preview` — serve the production build.
- `pnpm check` — Astro type check.
- `pnpm clean` — clear `dist`/`.astro` caches.
