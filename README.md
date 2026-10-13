# AI Insider — AI News Guide Website

A responsive AI resources landing page built with Flask, HTML, CSS and JavaScript.

## Files
- `app.py` — Flask application
- `requirements.txt` — Python dependencies
- `Procfile` — Gunicorn start command
- `render.yaml` — Render deployment configuration
- `templates/index.html` — page structure and resource links
- `static/style.css` — responsive styling
- `static/script.js` — share button and current year
- `github-pages/index.html` — static version for free GitHub Pages hosting

## Run locally
1. Install Python 3.10+.
2. In this folder run:
   ```bash
   pip install -r requirements.txt
   python app.py
   ```
3. Open `http://127.0.0.1:5000`.

## Deploy Flask app to Render
1. Upload these files to a GitHub repository.
2. In Render, create a new **Web Service** and connect the repository.
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Deploy. The free service may sleep when idle.

## Free GitHub Pages option (recommended for this simple guide)
GitHub Pages serves static files and does **not** run Python/Flask. Use the standalone `github-pages/index.html` file:
1. Create a public GitHub repository.
2. Upload `github-pages/index.html` to the repository root and rename it to `index.html` (or copy its contents into a root `index.html`).
3. Open Settings → Pages.
4. Choose Deploy from a branch, branch `main`, folder `/ (root), then Save.
5. Your URL will look like `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Customize
- Change the name `AI INSIDER` and page title in `templates/index.html` and `github-pages/index.html`.
- Update resource card names, descriptions and URLs in those files.
- Replace sample links with your own published guide when ready.

## Instagram comment-to-DM
After the site is published, copy the complete live URL into your Manychat Instagram comment automation message. Test it from a second Instagram account before promoting it.
