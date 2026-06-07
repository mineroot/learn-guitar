# AGENTS.md

## Project

React + Vite guitar practice app. It is intended to deploy to GitHub Pages.

## Commands

```bash
npm install
npm run dev
npm test
npm run build
```

## Structure

- `src/App.jsx`: app composition and section selection
- `src/components/`: shared layout components
- `src/sections/`: feature sections
- `src/data/`: static music and app data
- `src/utils/`: shared pure helpers
- `src/hooks/`: shared React hooks
- `src/styles.scss`: global Sass styles, mobile-first

## Notes

- Keep hash routes such as `#/metronome`; they work well on GitHub Pages.
- Keep the UI mobile-first and preserve the light/dark theme variables in `src/styles.scss`.
- Prefer small focused modules over growing `App.jsx`.
- Chord shapes come from `@tombatossals/chords-db`; avoid hand-writing replacement chord diagrams.
- Metronome and rhythm playback use Web Audio plus an HTML audio fallback for iPhone. Keep both paths unless mobile audio has been tested.
- If app shell assets or PWA behavior change, bump the cache name in `public/sw.js`.
- Run `npm test` and `npm run build` before finishing changes.
