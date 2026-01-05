# Academic Website

This repository contains the source code for my personal academic website, designed to showcase my research, publications, and professional updates in a clean and accessible format.

## Credits

The design relies on a minimalist aesthetic inspired by the [al-folio](https://github.com/alshedivat/al-folio) theme, but simplified into a lightweight implementation.

## Features

- **Dynamic Projects**: The projects module (`src/js/projects.js`) supports dual modes:
  - **Embedded Fragment**: Automatically injects content into `<div id="projects-container"></div>` on the homepage.
  - **Standalone Page**: Accessible via `/projects/` for a dedicated view.
- **Publications System**: Renders publications from JSON/BibTeX.


## Setup & Development

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Run local server**
   ```bash
   bunx vite 
   ```

3. **Build for production**
   ```bash
   bunx vite build
   ```

## Managing Content

- **Publications**: Edit `publications/publications.json` and `publications.bib`.
- **Projects**: Edit `projects/projects.json`. Images are referenced relative to the public root.

> **Note:** Blog page is currently under development.
