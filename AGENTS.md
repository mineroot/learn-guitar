# AGENTS.md

## Project

React + Vite guitar practice app. It is intended to deploy to GitHub Pages.

## Commands

```bash
npm install
npm run dev
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
- Keep the UI mobile-first.
- Prefer small focused modules over growing `App.jsx`.
- Run `npm run build` before finishing changes.
