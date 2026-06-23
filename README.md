# Clock

A faithful replica of the macOS Clock app, built with Electron for Windows.

## Features

- **World Clock** — Analog clocks with day/night faces, timezone offsets, 50+ searchable cities
- **Alarm** — Create alarms with labels, repeat days, and toggle switches
- **Stopwatch** — Precision timing with lap tracking (fastest/slowest highlighting)
- **Timer** — Scroll-wheel picker, circular progress ring, pause/resume, chime sound

All settings (clocks, alarms, last tab, timer values, recent timers) persist across sessions via localStorage.

## Getting Started

```bash
# Install dependencies
npm install

# Run the app
npm start
```

## Build Installer

```bash
# Build a Windows installer (.exe)
npm run build
```

The installer will be output to the `dist/` folder.

## Tech Stack

- **Electron** — Native window and packaging
- **HTML/CSS/JS** — Vanilla, no frameworks
- **Inter** — Typography (closest match to SF Pro on Windows)

## License

ISC
