# Clock

A faithful replica of the macOS Clock app for Windows, built with Tauri for an incredibly lightweight footprint.

## Features

- **World Clock** — Analog clocks with day/night faces, timezone offsets, 50+ searchable cities
- **Alarm** — Create alarms with labels, repeat days, and toggle switches
- **Stopwatch** — Precision timing with lap tracking (fastest/slowest highlighting)
- **Timer** — Scroll-wheel picker, circular progress ring, pause/resume, chime sound
- **Pomodoro** — Built-in focus timer with cycles, presets (e.g., 25/5/15), and custom durations
- **Dark/Light Mode** — Toggleable theme that perfectly replicates native macOS dark mode aesthetics

All settings (clocks, alarms, timers, themes) are persistently saved to your local machine using Tauri's native file system APIs.

## Getting Started

Because this project uses Tauri, you will need [Rust](https://rustup.rs/) installed on your machine.

```bash
# Install dependencies
npm install

# Run the app in development mode
npm run dev
```

## Build Installer

To build a standalone, highly-optimized `.exe` installer:

```bash
npm run build
```

The installer will be output to the `src-tauri/target/release/bundle/nsis/` folder.

## Tech Stack

- **Tauri** — Native window, small build size (uses Windows WebView2)
- **Rust** — Backend IPC logic and local file I/O
- **HTML/CSS/JS** — Vanilla, no frameworks
- **Inter** — Typography (closest match to SF Pro on Windows)

## License

ISC
