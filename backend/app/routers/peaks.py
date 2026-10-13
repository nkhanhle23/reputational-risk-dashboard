from fastapi import APIRouter, HTTPException

from app.data import store

router = APIRouter()


@router.get("/{peak_id}")
def peak_detail(peak_id: str):
    rows = store.peaks[store.peaks["peak_id"] == peak_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail="Unknown peak_id")
    peak = rows.iloc[0].to_dict()
    peak["start_date"] = peak["start_date"].isoformat()
    peak["end_date"] = peak["end_date"].isoformat()
    peak["category_evolution"] = [
        {**point, "date": point["date"].isoformat()} for point in peak["category_evolution"]
    ]

    es = store.peak_event_study(peak_id)
    if es is not None:
        es_dict = es.where(es.notna(), None).to_dict()
        es_dict["event_date"] = es_dict["event_date"].isoformat() if es_dict["event_date"] else None
        peak["event_study"] = {k: v for k, v in es_dict.items() if k not in ("peak_id", "ticker")}
    else:
        peak["event_study"] = None

    peak["company_id"] = store.company_id_for(peak["ticker"], peak["company_name"])

    return peak
