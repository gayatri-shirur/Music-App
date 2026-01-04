# High-level design (HLD)

**Goal:** show a junior developer what happens from the moment the page loads until music plays, without diving into line-by-line code.

## 1. User journey summary

1. User opens the site (Vite serves `index.html`).
2. React mounts `App` inside `#root`.
3. `App` immediately calls the Audius trending API (through the `useAudiusTrending` hook).
4. While the request runs, the UI shows a loading message.
5. When tracks arrive, the first one auto-loads into a hidden `<audio>` tag.
6. The now-playing card, control buttons, and track list render using that data.
7. The user can play/pause, skip, or scrub through the song—the `<audio>` element and React state stay in sync.

## 2. Major building blocks

| Block | What it does |
| --- | --- |
| **Vite + React 19 app** | Handles bundling, dev server, and hydration. No SSR or routing needed. |
| **`useAudiusTrending` hook** | Fetches Audius data, normalizes it to the format the UI expects, and exposes `tracks`, `loading`, and `error`. |
| **`App` component** | Orchestrates everything: picks the current track, controls playback, renders state (loading/error/empty vs. player). |
| **`PlayerControls` component** | Presents previous / play / next buttons with icons and wires them to callbacks from `App`. |
| **Global styles (`src/App.css`, `src/index.css`)** | Provide the glassmorphism look and responsive layout. |
| **Audius API** | Supplies trending track metadata plus the stream URL per track. |

## 3. Deployment story

- **Development**: `npm run dev` (Vite with HMR).
- **Production build**: `npm run build` outputs static assets in `dist/` which any static host (Vercel, Netlify, S3) can serve.

## 4. Cross-cutting concerns

- **State management**: Local React state only. No Redux or context is required for this small app.
- **Error resilience**: User-friendly strings for loading, API failures, and empty playlists are all baked into `App`.
- **Accessibility**: Buttons have `aria-label`s, and links open Audius in a new tab with `rel="noreferrer"`.
- **Performance**: Single API call on load, no polling. Audio playback is native to the browser.

This HLD should make it clear that the project is a single-page React app with one data source and a straightforward control surface.
