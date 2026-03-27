# Flipflap

A split-flap display that runs fullscreen in a browser. Think airport departure boards from the 70s — each character lives on a mechanical flap that physically flips to reveal the next one. Pure CSS 3D transforms, no Canvas or WebGL.

Built with [Aurelia 2](https://aurelia.io) and [Vite](https://vite.dev).

## Screenshots

<img width="1502" height="753" alt="image" src="https://github.com/user-attachments/assets/1a4eeaf0-5af4-4557-adb4-d5b4093628d3" />

<img width="1505" height="749" alt="image" src="https://github.com/user-attachments/assets/d654a398-3149-4ce0-8e35-cc4ba385d303" />

## Features

- **Mechanical flip animation** — CSS 3D transforms simulate a real split-flap drum cycling through characters
- **Staggered transitions** — Flaps ripple across the board in wave patterns (left-to-right, center-out, top-down, random)
- **Content rotation** — Cycles between quotes, time, weather, and custom messages
- **50+ built-in quotes** — Ships with a curated library, shuffled each rotation
- **Custom quotes** — Add your own via the settings panel
- **Weather display** — Current conditions via OpenWeatherMap API
- **Live clock** — Day, time, and date display
- **Themes** — Airport Classic, Brass Terminal, and Polar Signal palettes
- **Audio** — Synthesized mechanical clack sound synced to each flip
- **Configurable board** — Adjust rows (1-12), columns (12-40), cycle speed, and volume
- **Fullscreen ready** — Designed for TVs and large displays at 16:9

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:9000](http://localhost:9000) in your browser. Hit F11 for fullscreen.

## Settings

Click the gear icon in the bottom-right corner to open the settings panel. Press Escape to close it.

| Setting | Description |
|---------|-------------|
| **Content Modes** | Toggle quotes, custom messages, weather, and time display |
| **Cycle Duration** | How long each item shows before transitioning (15s-120s) |
| **Rows / Columns** | Board dimensions — more rows for longer quotes, more columns for wider text |
| **Theme** | Switch between color palettes |
| **Sound** | Toggle mechanical clack audio and adjust volume |
| **Weather** | Enter a location and OpenWeatherMap API key for live weather |
| **Custom Quotes** | One per line, use `quote text | author` format |

## Weather Setup

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Open settings and enter your location (e.g. `Brisbane, AU`)
3. Paste your API key
4. Enable the Weather content mode

## Deployment

Build for production:

```bash
npm run build
```

The `dist/` folder can be served from any static host — Vercel, Netlify, Cloudflare Pages, or plain nginx.

## Tech Stack

- **Aurelia 2** — Custom elements, dependency injection, reactive bindings
- **Vite** — Dev server with HMR, production bundling
- **CSS 3D Transforms** — Hardware-accelerated flip animations
- **Web Audio API** — Low-latency synthesized clack sounds
- **Google Fonts** — IBM Plex Mono (flap text) and IBM Plex Sans (UI)

## License

MIT
