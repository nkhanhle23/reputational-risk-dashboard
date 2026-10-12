# Reputational Risk Dashboard

Read-only React + FastAPI dashboard over pre-computed outputs of the
`reputational-risk-pipeline` research project. No ML inference happens here — it
just serves and visualizes parquet/CSV files, mirroring the paper's "reputational
risk chain": article classification → company emotion peaks → event-study/CAR.

## Run it locally

Backend (FastAPI, port 8000):

```bash
cd backend
.venv/bin/uvicorn app.main:app --reload
```

Frontend (Vite dev server, port 5173, proxies `/api` to the backend):

```bash
cd frontend
npm run dev
```

Node.js is managed via nvm (`~/.nvm`) since none was installed system-wide:

```bash
export NVM_DIR="$HOME/.nvm"; \. "$NVM_DIR/nvm.sh"
```

Open http://localhost:5173.

## Data

`backend/data/` holds a trimmed, bundled copy of the pipeline's outputs (~5 MB,
committed to this repo) — no external paths needed to run this app. It was built
with `backend/scripts/build_dataset.py`, which reads from the original pipeline's
`reputational-risk-pipeline-shared/` and `reputational-risk-pipeline/results/`
folders, drops columns this app doesn't use, and drops the NYT article `summary`/
`entity_context` text (copyrighted; never rendered by the frontend, and not
something this project can relicense for public redistribution). Rerun that
script if the source pipeline's outputs change.

## Known data quirk

8 ticker symbols in the MSCI universe are shared by two unrelated companies
(e.g. `ADP` = Aéroports de Paris AND Automatic Data Processing). The backend
exposes a composite `company_id` (`{ticker}__{slugified company_name}`) for
routing/lookups — never key a company by ticker alone.

## Pages

- **Overview** — corpus-level stats, category distribution, model params/validation metrics
- **Companies** — searchable table of all 752 matched companies
- **Company detail** — emotion-peak timeline chart, peaks table (with CAR), matched articles
- **Cross-tab** — category × emotion CAR table (SCCT attribution test)

## Not yet built

- Parameter tuning (peak z-score threshold θ, SCCT margin, consecutive-day
  requirement) — currently just displays the paper's fixed values
- Pagination on the companies/articles tables (currently renders all rows client-side)
- Peak detail page showing `category_evolution` over time and the AR-day-by-day bar chart

## Deploying (Render)

Two services: the backend (Web Service) and the frontend (Static Site). Both
deploy from this same GitHub repo.

### 1. Backend

Render dashboard → **New +** → **Web Service** → connect this GitHub repo.

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | Free |

Deploy it, then copy its URL (looks like `https://reputational-risk-backend.onrender.com`).
Leave the `ALLOWED_ORIGIN` env var unset for now — set it after step 2.

### 2. Frontend

Render dashboard → **New +** → **Static Site** → same GitHub repo.

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | the backend URL from step 1, e.g. `https://reputational-risk-backend.onrender.com` |

Deploy it, then copy its URL (looks like `https://reputational-risk-dashboard.onrender.com`).

### 3. Close the loop

Go back to the **backend** service → Environment → add:

| Key | Value |
|---|---|
| `ALLOWED_ORIGIN` | the frontend URL from step 2 |

Save — this triggers a backend redeploy. Without this, the browser will block the
frontend's API calls with a CORS error.

### Notes

- Free-tier Render services spin down after inactivity and take ~30–60s to wake
  on the next request — the first load after idle time will be slow.
- To push a new commit from this machine: `git push origin main` (the remote is
  already configured). Render auto-deploys both services on push.
