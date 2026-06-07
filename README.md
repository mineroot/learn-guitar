# Learn Guitar

A small React app for guitar practice, built with Vite and hosted on GitHub Pages.

Live: https://mineroot.github.io/learn-guitar

## Features

- Metronome with tempo, beats, subdivisions, and Space key toggle
- Tuner using microphone pitch detection
- Interactive 24-fret guitar fretboard for standard E tuning
- Chord library with known chord diagrams and chords by key
- Rhythm generator with notation, playback, rests, repeat, and metronome overlay
- Section URLs with hash routing for GitHub Pages
- PWA support for installing to a phone home screen
- Light and dark themes based on system settings

## Development

```bash
npm install
npm run dev
npm test
```

## Build

```bash
npm run build
```

Run tests and a production build before deploying:

```bash
npm test
npm run build
```

## Deploy

GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.
Set Pages source to GitHub Actions, then push to `main`.

The live app is published at:

```text
https://mineroot.github.io/learn-guitar
```

## License

MIT
