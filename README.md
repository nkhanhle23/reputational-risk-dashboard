# Reputational Risk Dashboard

Read-only React + FastAPI dashboard over the pre-computed outputs of
`/home/le/reputational-risk-pipeline`. No ML inference happens here — it just
serves and visualizes parquet/CSV files already produced by that pipeline's
notebooks, mirroring the paper's "reputational risk chain": article
classification → company emotion peaks → event-study/CAR.

## Run it

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

## Data sources

Reads directly from (no copies):
- `/home/le/reputational-risk-pipeline-shared/` — curated per-phase outputs
- `/home/le/reputational-risk-pipeline/results/full_dataset_classification/` —
  classification output + `summary_stats.json` (not mirrored in the shared folder)

See `backend/app/data.py` for exact file paths and join logic.

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
