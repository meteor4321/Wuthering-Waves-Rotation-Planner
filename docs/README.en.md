<p align="center">
  <img src="../public/Phoebe.svg" width="96" alt="logo" />
</p>

<h1 align="center">Wuthering Waves Rotation Planner</h1>

<p align="center">
  A visual rotation planner for Wuthering Waves — drag, drop, done. No install, no sign-up, zero learning curve.
</p>

<p align="center">
  <a href="../README.md">繁體中文</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <b>English</b> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vue.js" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="#-live-demo">🔗 Live Demo</a> ·
  <a href="#-showcase">📸 Showcase</a> ·
  <a href="#-features">✨ Features</a> ·
  <a href="#️-keyboard-shortcuts">⌨️ Shortcuts</a> ·
  <a href="#-tech-stack--architecture">🛠 Tech Stack</a> ·
  <a href="#-local-development">🚀 Development</a>
</p>

---

## 🔗 Live Demo

**👉 [wuthering-waves-rotation-planner.vercel.app](https://wuthering-waves-rotation-planner.vercel.app/)**

Works right in your browser — no install, no account. First-time visitors get an interactive tour that walks through building your first rotation.

## 📸 Showcase

<img width="1920" alt="Main screen" src="https://github.com/user-attachments/assets/6603d736-5f24-42e0-9c8f-84e1c59390e3" />

<!-- TODO: add an animated GIF (drag blocks → export image) -->

## ✨ Features

### Rotation Editing
- **Drag & drop**: drag skill blocks from the sidebar onto the timeline; following blocks shift smoothly and snap tight
- **Full editing**: add, delete, copy, paste, cut, inline text editing
- **Multi-select**: Ctrl+click, marquee selection (across lanes), whole-lane selection
- **Undo/redo**: every action is reversible with Ctrl+Z; history depth is configurable

### Templates & Saves
- **Template library**: built-in general blocks, plus drag any combo back to the sidebar to save it as a custom template
- **Team saves**: snapshot your whole workspace under a name; load, rename, pin. Unsaved changes show a "*" marker and guard against closing the tab
- **Multiple rotation tabs**: keep several rotations in one document and compare cycles

### Output & Experience
- **HD image export**: single rotation as PNG or all tabs bundled as ZIP — easy to share
- **5 interface languages**: Traditional Chinese, Simplified Chinese, English, Japanese, Korean
- **Auto-updated character data**: a GitHub Actions crawler fetches new characters weekly — no manual maintenance

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `A` / `D` | Step selection left/right block by block (selects the rightmost/leftmost block if nothing is selected) |
| `W` / `S` | Cycle whole-lane selection among assigned lanes |
| `Space` | Append a block at the end (or after the selection) |
| `Enter` | Edit the selected block |
| `Delete` / `Backspace` | Delete selected blocks |
| `Ctrl+A` | Select all blocks |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy / cut / paste |
| `Ctrl+D` | Duplicate selection to the right |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Escape` | Clear selection |
| `Tab` | Toggle the sidebar |

## 🌐 Supported Languages

UI strings and character names are fully localized: 繁體中文, 简体中文, English, 日本語, 한국어.

## 🛠 Tech Stack & Architecture

- **Framework**: Vue 3 (Composition API) + TypeScript + Vite + Pinia + TailwindCSS
- **Drag & drop**: VueDraggablePlus (SortableJS underneath, forceFallback mode)
- **Export**: html-to-image + JSZip
- **i18n**: vue-i18n
- **Onboarding tour**: driver.js
- **Persistence**: LocalStorage (templates, team saves, user settings)

Core design: each rotation is backed by a **single 1D array** (single-thread model). Blocks of the three characters are filtered and rendered into three swimlanes by array order — blocks express casting order only, not exact seconds, so inserts/deletes always stay tightly packed with no overlaps or gaps.

## 🚀 Local Development

```bash
npm install      # install dependencies
npm run dev      # start dev server
npm run build    # type-check + production build
```

## 📄 License

<!-- TODO: pick a license (MIT recommended) and add a LICENSE file -->
