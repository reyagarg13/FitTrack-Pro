# FitTrack Pro

FitTrack Pro is a single-file front-end fitness dashboard (runs from `index.html`) built with plain HTML, CSS and modern JavaScript (ES modules). TailwindCSS is used via CDN for quick utility styles and layout. There is no backend.

How to run

- Open the `FitTrackPro/index.html` with Live Server (recommended) or any static server. Browsers may restrict ES module imports from file:// so using Live Server or a simple http server is recommended.
- The app uses localStorage to persist Activities and Meals.

Features

- Page 1: Daily Wellness Overview (steps, calories, water + live clock)
- Page 2: Activity Log (preloaded activities, filters, add/delete, modal on add)
- Page 3: Meal Planner (breakfast/lunch/dinner, add/remove meals, live total calories)
- Page 4: Insights & Summary (weekly charts, simulated download, reset storage)

Project structure

All files are inside this folder and organized into `assets/`, `components/`, `css/`, `data/`, `js/` and top-level `index.html`, `style.css`, `script.js`.

Notes

- Designed to be lightweight and run on static hosting (GitHub Pages). Use Live Server for local development.
- No external JS libraries used except Tailwind via CDN for styling.
