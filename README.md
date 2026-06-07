# Learn Guitar

A small React app for guitar practice, built with Vite and hosted on GitHub Pages.

Live: https://mineroot.github.io/learn-guitar

## Features

- Metronome with tempo, beats, subdivisions, and Space key toggle
- Tuner using microphone pitch detection
- Interactive 24-fret guitar fretboard for standard E tuning
- Chord library with diagrams and chords by key
- Rhythm generator with notation, playback, rests, repeat, and metronome overlay
- Section URLs with hash routing for GitHub Pages

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.
Set Pages source to GitHub Actions, then push to `main`.

## License

MIT
