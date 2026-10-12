import json

from fastapi import APIRouter

from app.data import DATA_DIR, store

router = APIRouter()

_summary_stats_path = DATA_DIR / "summary_stats.json"


@router.get("/overview")
def overview():
    with open(_summary_stats_path) as f:
        summary = json.load(f)
    return {
        "summary": summary,
        "n_articles": int(len(store.articles)),
        "n_companies": int(len(store.companies)),
        "n_peaks": int(len(store.peaks)),
        "n_event_studies": int(len(store.event_study)),
    }


@router.get("/crosstab")
def crosstab():
    df = store.crosstab
    return df.astype(object).where(df.notna(), None).to_dict(orient="records")
