### This is Julius

## An Open Source Python teaching tool so good that it could teach my Ball Python, Julius Squeezer, to become a python master.
- It's funny because Julius isn't very smart OR cooperative.

## Julius is a teaching tool for learning python and various python derived languages like pytorch, embedded python, python CUDA, and other languages in the Python ecosystem. Mastering python itself first is the priority though, before moving on to those specialized modules.
- The app uses *research backed methods* to teach syntax, pre-made projects, as well as "ideas of other things you can make" with the contents of each lesson, from the most basic to the most complex levels. The why behind everything is explained.
- It is designed in such a way that modules can be added by the community (via a fork) and if those modules are value-adding, can be easily merged back upstream (so very "modular" build for lack of a better description).
- We want the app to be primarily GUI Based but if there are terminal based lessons or if its required for the terminal, we can load a terminal *through* the GUI, thus having a pedagogical aide to the terminal always with you even when the work is terminal work.
- We want the app to work on Windows, Linux or MacOS

## Requirements

- **Node.js** 18+ (recommended: 22 LTS)
- **Python 3** installed and available as `python3` on your PATH
- npm (comes with Node.js)

## Development Setup

```bash
# Clone the repo
git clone https://github.com/crussella0129/Julius.git
cd Julius

# Install dependencies
npm install

# Run in development mode (hot reload)
npm run dev
```

## Building for Distribution

```bash
# Linux (AppImage)
npm run build:linux

# Windows (NSIS installer)
npm run build:win

# macOS (DMG)
npm run build:mac
```

Built artifacts go to `dist/`.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Electron + electron-vite |
| Renderer | React 19 + TypeScript |
| State | Zustand |
| Code Editor | CodeMirror 6 |
| Local DB | better-sqlite3 |
| Spaced Repetition | ts-fsrs |
| Styling | CSS variables (dark/light themes) |
| Content | Markdown + YAML |

## How It Works

Julius teaches Python through 4 research-backed exercise types:

1. **Trace** - Step through code and predict output (builds mental models)
2. **Parsons** - Drag-and-drop code blocks into the correct order (reduces cognitive load)
3. **Fill-in** - Complete blanks in code templates (scaffolded practice)
4. **Write** - Write code from scratch with immediate feedback and tests

Progress is tracked locally with SQLite. Spaced repetition (FSRS algorithm) schedules reviews of exercises you've completed, bringing them back at optimal intervals for long-term retention.

## Adding Content

Content lives in `content/modules/`. Each module has:

```
content/modules/01-fundamentals/
  module.yaml              # Module metadata (id, title, order, lessons list)
  lessons/
    01-hello-world/
      lesson.md            # Markdown with YAML frontmatter
      exercises/
        01-trace.yaml      # Exercise definitions
        02-parsons.yaml
        03-fill-in.yaml
        04-write.yaml
```

See existing content in `content/modules/01-fundamentals/` for examples of the format.

## License

MIT
