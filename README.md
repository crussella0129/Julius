<p align="center">
  <img src="resources/icon.png" alt="Julius" width="128" />
</p>

<h1 align="center">Julius</h1>

<p align="center">
  An open-source Python teaching app so good it could teach my ball python,<br>
  <strong>Julius Squeezer</strong>, to become a Python master.<br>
  <em>It's funny because Julius isn't very smart OR cooperative.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/license-GPLv3-green" alt="License" />
  <img src="https://img.shields.io/badge/electron-34.1.0-9feaf9" alt="Electron" />
  <img src="https://img.shields.io/badge/react-19-61dafb" alt="React" />
</p>

---

## What is Julius?

Julius is a cross-platform desktop app for learning Python from absolute zero to specialized topics like machine learning, CUDA, and web development. It uses **research-backed pedagogy** — not just "here's some code, figure it out" — with four scientifically-grounded exercise types, spaced repetition for long-term retention, and a modular curriculum that the community can extend.

The app is primarily GUI-based. When terminal work is needed, it can be loaded through the GUI so the pedagogical aide is always with you.

### Key Features

- **4 research-backed exercise types** — trace, Parsons problems, fill-in-the-blank, and free-write
- **110 lessons across 15 modules** — from "Hello, World!" to computer vision and LLMs
- **440 exercises** with hints, tests, and immediate feedback
- **Spaced repetition** — FSRS algorithm schedules reviews at optimal intervals
- **Built-in Python execution** — sandboxed subprocess with friendly error messages
- **Progress tracking** — local SQLite database, no account required
- **Dark/light themes** — CSS variable theming with system preference detection
- **Offline-first** — everything runs locally, no internet required
- **Community-extensible** — add modules by dropping Markdown + YAML into `content/`

---

## Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 18+ (recommended: 22 LTS) | Includes npm |
| **Python** | 3.x | Must be available as `python3` on PATH |
| **OS** | Linux, macOS, or Windows | Tested on Ubuntu 24.04, should work on any modern desktop OS |

No Python packages need to be installed — exercises use only the Python standard library.

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/crussella0129/Julius.git
cd Julius

# Install dependencies
npm install

# Run in development mode (hot reload)
npm run dev
```

The app will open an Electron window with the sidebar showing all available modules.

---

## Building for Distribution

```bash
# Linux (AppImage)
npm run build:linux

# Windows (NSIS installer)
npm run build:win

# macOS (DMG)
npm run build:mac
```

Built artifacts are output to `dist/`. The content directory is bundled as an extra resource automatically.

---

## Curriculum

Julius covers Python from the ground up, organized into five tiers:

### Beginner

| # | Module | Lessons | Topics |
|---|--------|---------|--------|
| 1 | **Python Fundamentals** | 8 | Variables, types, operators, I/O, conditionals, loops, functions |
| 2 | **Intermediate Python** | 8 | Strings, lists, tuples, dicts, comprehensions, error handling, file I/O, modules |

### Intermediate

| # | Module | Lessons | Topics |
|---|--------|---------|--------|
| 3 | **Advanced Python** | 7 | OOP, inheritance, decorators, generators, context managers, design patterns, concurrency |
| 4 | **Data Structures & Algorithms** | 10 | Complexity, arrays, linked lists, stacks, queues, hash tables, trees, heaps, graphs, sorting, dynamic programming |

### Applied

| # | Module | Lessons | Topics |
|---|--------|---------|--------|
| 5 | **Web Development** | 8 | HTTP, Flask, forms, databases, FastAPI, REST APIs, web scraping, deployment |
| 6 | **Data Science** | 7 | NumPy, pandas, matplotlib, seaborn, EDA |
| 7 | **Machine Learning & Deep Learning** | 10 | Regression, classification, trees, model eval, unsupervised, neural networks, PyTorch, CNNs |

### Practical

| # | Module | Lessons | Topics |
|---|--------|---------|--------|
| 8 | **Automation & Scripting** | 6 | OS/filesystem, regex, subprocess, scheduling, email/API automation |
| 9 | **Testing & Software Quality** | 6 | unittest, pytest, test patterns, debugging, code quality, CI/CD |

### Specialized

| # | Module | Lessons | Topics |
|---|--------|---------|--------|
| 10 | **Game Development** | 6 | Pygame, sprites, physics, game state, audio, complete game |
| 11 | **Cybersecurity** | 6 | Security fundamentals, cryptography, network scanning, web security, forensics |
| 12 | **Finance & Quantitative Python** | 7 | Portfolio analysis, technical indicators, risk management, backtesting, OpenBB |
| 13 | **Embedded, IoT & GPU Python** | 7 | MicroPython, CircuitPython, IoT, NumPy perf, Numba, CuPy, CUDA |
| 14 | **NLP, LLMs & AI Applications** | 8 | spaCy, text classification, embeddings, transformers, HuggingFace, LLMs, LangChain |
| 15 | **Computer Vision** | 6 | OpenCV, image processing, feature detection, object detection, segmentation |

---

## How It Teaches

Each lesson contains four exercise types, ordered by increasing cognitive demand:

### 1. Trace

Step through code line by line and predict what each line does, what variables hold, and what the final output will be. This builds **mental models** of how Python executes.

### 2. Parsons Problems

Drag-and-drop code blocks into the correct order. Distractor lines (incorrect code) are mixed in. This develops **code structure recognition** with reduced cognitive load — you read and reason about code without the burden of syntax recall.

### 3. Fill-in-the-Blank

Complete a partially-written program by filling in missing pieces. Each blank has a hint. This provides **scaffolded practice** — you're guided toward the solution while still actively producing code.

### 4. Write

Write code from scratch in a CodeMirror editor with Python syntax highlighting. Your code runs in a sandboxed subprocess and is checked against automated tests. If something goes wrong, Python errors are translated into **plain-English explanations** designed to teach rather than frustrate.

### Spaced Repetition

Completed exercises are scheduled for review using the [FSRS algorithm](https://github.com/open-spaced-repetition/ts-fsrs). Exercises you struggle with come back sooner; ones you nail are spaced further apart. This optimizes for **long-term retention** rather than short-term cramming.

### Placement Test

Not a beginner? Take the placement questionnaire from the dashboard to skip ahead to the module that matches your experience level.

---

## Architecture

```
src/
├── main/                  # Electron main process
│   ├── index.ts           # Window creation, IPC setup
│   ├── db.ts              # SQLite database (better-sqlite3, WAL mode)
│   ├── python-runner.ts   # Sandboxed Python subprocess + error translation
│   └── content-loader.ts  # YAML/Markdown content loading
├── preload/               # Context bridge (window.julius API)
│   └── index.ts
└── renderer/              # React frontend
    └── src/
        ├── views/         # Dashboard, Lesson, Exercise, Review, Settings, Placement
        ├── components/    # Sidebar, CodeEditor, Feedback, ConceptMap
        ├── stores/        # Zustand stores (app state, progress)
        ├── assets/        # SVG logo
        └── lib/           # FSRS integration

content/
└── modules/               # 15 curriculum modules
    └── NN-name/
        ├── module.yaml    # Module metadata
        └── lessons/
            └── NN-topic/
                ├── lesson.md      # Markdown lesson with YAML frontmatter
                └── exercises/
                    ├── 01-trace.yaml
                    ├── 02-parsons.yaml
                    ├── 03-fill-in.yaml
                    └── 04-write.yaml
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Electron 34 + electron-vite |
| Frontend | React 19 + TypeScript |
| State | Zustand |
| Code editor | CodeMirror 6 (Python mode) |
| Database | SQLite via better-sqlite3 |
| Spaced repetition | ts-fsrs (FSRS4) |
| Content format | Markdown (gray-matter) + YAML |
| Drag-and-drop | dnd-kit |
| Markdown rendering | react-markdown + rehype-highlight + remark-gfm |
| Python execution | Node.js child_process (sandboxed, 10s timeout) |
| Routing | React Router v7 (HashRouter) |
| Theming | CSS variables (dark/light) |

---

## Adding Content

Julius is designed so that modules can be added by the community. Fork the repo, add your module, and submit a PR.

### Module structure

```
content/modules/NN-your-module/
├── module.yaml
└── lessons/
    └── 01-your-lesson/
        ├── lesson.md
        └── exercises/
            ├── 01-trace.yaml
            ├── 02-parsons.yaml
            ├── 03-fill-in.yaml
            └── 04-write.yaml
```

### module.yaml

```yaml
id: "NN-your-module"
title: "Your Module Title"
description: "A brief description of what this module covers."
order: 16
lessons:
  - "01-your-lesson"
  - "02-another-lesson"
```

### lesson.md

```markdown
---
id: "01-your-lesson"
title: "Your Lesson Title"
concepts:
  - concept-tag-1
  - concept-tag-2
why: "A sentence or two explaining why this topic matters."
prerequisites: []
sources:
  - repo: "author/repo"
    section: "Relevant section"
    license: "MIT"
---

Your lesson content in Markdown goes here.
```

### Exercise YAML

Each exercise type has its own fields. See `content/modules/01-fundamentals/lessons/01-hello-world/exercises/` for working examples of all four types.

**Trace** — provide code, step-by-step execution trace, and expected output.

**Parsons** — provide code blocks, distractor lines, and the correct order.

**Fill-in** — provide a template with blanks (`____`), answers for each blank, and the complete solution.

**Write** — provide a prompt, optional starter code, and test expressions that validate the output.

---

## Data & Privacy

All data stays on your machine:

- **Database:** `~/.config/julius/julius-learner.db` (Linux), `~/Library/Application Support/julius/julius-learner.db` (macOS), `%APPDATA%/julius/julius-learner.db` (Windows)
- **No telemetry, no accounts, no cloud sync**
- Export your progress as JSON from Settings

---

## Regenerating Icons

If you modify the SVG logo at `src/renderer/src/assets/logo.svg`, regenerate the app icons:

```bash
pip install cairosvg Pillow
python3 scripts/generate_icons.py
```

This renders the SVG to `resources/icon.png` (512x512), `resources/icon.ico` (multi-size), and `resources/icon.icns` (macOS).

---

## License

Julius is licensed under the [GNU General Public License v3.0](LICENSE).
