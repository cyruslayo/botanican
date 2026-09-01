<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Botanica

Premium edibles & essential oils storefront, built with Astro, React islands, Tailwind CSS 4, and Firebase.

## Run Locally

**Prerequisites:** Node.js (>= 22.12.0)

1. Install dependencies:
   `pnpm install`
2. Start the dev server:
   `pnpm dev`
3. Build the static site:
   `pnpm build`
4. Preview the production build:
   `pnpm preview`
5. Type-check the project:
   `pnpm check`

## Firebase

Firebase (Firestore, Auth, Storage) is initialized in `src/lib/firebase.ts` from `firebase-applet-config.json`. Firestore security rules live in `firestore.rules`.
