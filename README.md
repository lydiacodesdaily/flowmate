# Flowmate - Pomodoro Timer

A beautiful and functional Pomodoro timer built with Next.js, TypeScript, and Tailwind CSS. Features audio ticking and verbal announcements at every minute.

## Features

- **Multiple Session Durations**: Choose from 30, 60, 90, or 180 minutes
- **Audio Ticking**: Subtle tick sound every second
- **Verbal Announcements**: Speech synthesis announces remaining time at every minute
- **Visual Progress**: Track your progress through focus and break sessions
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode Support**: Automatically adapts to system preferences

## Pomodoro Structure

- Each cycle consists of 25 minutes focus + 5 minutes break
- 30 minutes = 1 cycle (1x 25/5)
- 60 minutes = 2 cycles (2x 25/5)
- 90 minutes = 3 cycles (3x 25/5)
- 180 minutes = 6 cycles (6x 25/5)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Select your desired session duration (30, 60, 90, or 180 minutes)
2. The timer will automatically start with the first focus session
3. Listen for verbal announcements at the start of each minute
4. Use Pause/Resume to control the timer
5. Click Reset to start over

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Web Speech API** - Voice announcements

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
