# Data Science Quest (Codédex-style clone)

Static, GitHub-Pages-friendly learning game with **one curriculum**: Data Science.

## Run locally
Because lessons are fetched with `fetch()`, run a local server:

- VS Code: Live Server → open `index.html`
- Or Python: `python -m http.server 8000`

Open: http://localhost:8000/

## Deploy to GitHub Pages
1) Create a GitHub repo and commit all files.
2) Repo **Settings → Pages**
3) Source: **Deploy from a branch**
4) Branch: **main** / folder: **/(root)**
5) Save → GitHub gives you a Pages URL.

## Edit content
- Curriculum: `assets/curriculum.json`
- Lesson text: `assets/lessons/*.md`
- Styling: `assets/style.css`

## Saving + exporting
Progress + your code are stored in `localStorage`.
Use **Profile → Export all code (ZIP)** to download your lesson code and commit it to GitHub.
