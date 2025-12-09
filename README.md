# Flowmate - Pomodoro Timer

A beautiful and functional Pomodoro timer built with Next.js, TypeScript, and Tailwind CSS. Features audio ticking, high-quality voice announcements, and Picture-in-Picture support.

## Features

### Timer Modes
- **Pomodoro Mode**: Traditional 25-minute focus sessions with 5-minute breaks
- **Flow Club Mode**: Custom timing patterns designed for deep work sessions

### Session Durations
- **30 minutes**: 1 Pomodoro cycle or Flow Club quick session
- **60 minutes**: 2 Pomodoro cycles or Flow Club standard session
- **90 minutes**: 3 Pomodoro cycles or Flow Club extended session
- **120 minutes**: 4 Pomodoro cycles or Flow Club marathon session (Flow Club only)
- **180 minutes**: 6 Pomodoro cycles or Flow Club ultra-marathon session

### Audio Features
- **Audio Ticking**: Subtle tick sound every second to maintain rhythm
- **High-Quality Voice Announcements**:
  - Generated using ElevenLabs Sarah voice for natural, clear announcements
  - Minute countdowns (25 minutes, 24 minutes, etc.)
  - Seconds countdowns (50, 40, 30, 20, 10 seconds)
  - Final countdown (9, 8, 7... 1)
  - Session transitions (Focus, Break, Done)
- **Mute Options**:
  - Mute all sounds (ticks + announcements)
  - Mute during breaks only
  - Real-time mute/unmute without interrupting timer

### Picture-in-Picture
- **Always-On-Top Timer**: Click the PiP button to open a floating timer window
- **Works Across Tabs**: Timer stays visible while working in other applications
- **Interactive Controls**: Pause/Resume and Mute buttons in PiP window
- **Auto-Close**: PiP automatically closes when returning to the main tab
- **Real-Time Updates**: Timer and session status update live in PiP window

### User Interface
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Time Adjustment**: Add or subtract time in 1-minute or 5-minute increments
- **Progress Tracking**: Visual progress bar and session indicators
- **Session Overview**: See all upcoming focus and break sessions at a glance
- **Responsive Design**: Beautiful UI that works on all devices

## Audio File Structure

All voice announcements are stored in `/public/audio/countdown/`:

```
/audio/
  /countdown/
    /minutes/
      m01.mp3 - m25.mp3  (1-25 minute announcements)
    /seconds/
      s01.mp3 - s09.mp3  (1-9 second countdown)
      s10.mp3, s20.mp3, s30.mp3, s40.mp3, s50.mp3  (10-second intervals)
    /transitions/
      focus.mp3          ("Focus")
      break.mp3          ("Break")
      done.mp3           ("Done")
  /effects/
    tick.m4a             (Clock tick sound)
```

Voice files generated using **ElevenLabs Sarah voice** for high-quality, natural-sounding announcements.

## Pomodoro Mode Structure

Each cycle consists of 25 minutes focus + 5 minutes break:
- 30 minutes = 1 cycle (1x 25/5)
- 60 minutes = 2 cycles (2x 25/5)
- 90 minutes = 3 cycles (3x 25/5)
- 180 minutes = 6 cycles (6x 25/5)

## Flow Club Mode Structure

Flow Club mode uses custom timing patterns optimized for deep work:
- **30 min**: 3 min break → 24 min focus → 3 min break
- **60 min**: 5 min break → 25 min focus → 5 min break → 20 min focus → 5 min break
- **90 min**: Repeats 60-minute pattern with extended sessions
- **120 min**: Double 60-minute pattern for marathon sessions
- **180 min**: Triple 60-minute pattern for ultra-marathon sessions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Add your audio files to `/public/audio/countdown/` (or use the provided ones)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Choose Mode**: Select between Pomodoro or Flow Club mode
2. **Select Duration**: Choose your desired session duration
3. **Start Timer**: Timer automatically starts with first session
4. **Listen**: Enjoy high-quality voice announcements at key intervals
5. **Controls**:
   - **Pause/Resume**: Control timer playback
   - **Reset**: Start over with new duration selection
   - **PiP**: Open Picture-in-Picture for always-visible timer
   - **Mute**: Silence sounds as needed
   - **+/- Time**: Adjust remaining time in 1 or 5-minute increments
   - **Add Pomodoro**: Extend session with additional cycles (Pomodoro mode only)

## Keyboard Shortcuts & Tips

- Use the time adjustment buttons to fine-tune your session length
- Mute during breaks keeps ticks and announcements silent during rest periods
- PiP window stays on top of all applications - perfect for full-screen work
- Dark mode preference is saved and persists across sessions

## Browser Compatibility

### Full Support
- **Chrome/Edge 116+**: All features including Picture-in-Picture
- **Firefox**: All features except Picture-in-Picture
- **Safari**: Core timer functionality (PiP support varies)

### Required Features
- HTML5 Audio API (all modern browsers)
- Document Picture-in-Picture API (Chrome/Edge only)

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with modern hooks
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling with dark mode
- **Document PiP API** - Always-on-top timer window
- **HTML5 Audio API** - High-quality audio playback
- **ElevenLabs** - Professional voice generation (Sarah voice)

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
flowmate/
├── app/
│   ├── page.tsx           # Main timer component
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── public/
│   └── audio/
│       ├── countdown/     # Voice announcements
│       └── effects/       # Sound effects
├── tailwind.config.ts     # Tailwind configuration
└── package.json
```

## License

MIT

---

Built with focus and flow in mind. 🎯
