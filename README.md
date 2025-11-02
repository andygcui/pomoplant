# Pomoplant 🌱

A plant-growing Pomodoro timer app for macOS! Grow digital plants by completing focus sessions and taking productive breaks.

<img src="screenshot.png" width="400" alt="Pomoplant Screenshot" />

## About

Pomoplant combines the proven Pomodoro Technique with the satisfying progression of growing plants. Complete focus sessions to water your plants and watch them grow through multiple stages. The more you focus, the more plants you'll grow!

## Features

- **Four Plant Types**: Choose from cactus, bonsai, orchid, and bamboo
- **Flexible Timer Settings**: Customize focus, short break, and long break durations
- **Visual Plant Growth**: Watch your plants grow through multiple stages with hand-drawn pixel art animations
- **Progress Tracking**: Level up system based on total plants grown
- **Achievements**: Unlock special achievements as you grow your garden
- **Offline & Persistent**: All data stored locally - your progress never disappears

## Download

### Pre-built Binaries

Download the latest release DMG from [Latest Release](https://github.com/andygcui/pomoplant/releases/tag/v1.0.0)

1. Download the DMG file for macOS
2. Open the DMG file
3. Drag Pomoplant to your Applications folder
4. Run Pomoplant from Applications (you may need to right-click and select "Open" on first launch)

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/pomoplant.git
cd pomoplant

# Install dependencies
npm install

# Run the app in development
npm start

# Build for distribution
npm run dist
```

The built DMG will be in the `dist/` directory.

## How It Works

1. **Select a Plant**: Choose your plant type from the home screen
2. **Start Focusing**: Click "Start" and complete a focus session
3. **Water Your Plant**: When the timer ends, click your plant to water it
4. **Take Breaks**: Take short or long breaks between focus sessions
5. **Watch It Grow**: Your plant progresses through stages as you complete sessions
6. **Level Up**: Unlock achievements and track your total plants grown

## Development

Built with:
- Electron
- Vanilla JavaScript
- HTML/CSS

## License

MIT License
