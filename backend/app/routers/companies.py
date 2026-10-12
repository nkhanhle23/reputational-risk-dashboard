from fastapi import APIRouter, HTTPException

from app.data import store

router = APIRouter()


@router.get("")
def list_companies():
    df = store.companies.sort_values("n_peaks", ascending=False)
    return df.to_dict(orient="records")


@router.get("/{company_id}")
def company_detail(company_id: str):
    company_row = store.find_company(company_id)
    if company_row is None:
        raise HTTPException(status_code=404, detail="Unknown company_id")
    company = company_row.to_dict()
    ticker = company["ticker"]
    company_name = company["company_name"]

    peaks = store.company_peaks(ticker, company_name).drop(columns=["category_evolution"])
    peaks_records = peaks.astype(object).where(peaks.notna(), None).to_dict(orient="records")
    for row in peaks_records:
        for key in ("start_date", "end_date"):
            if row.get(key) is not None:
                row[key] = row[key].isoformat()

    es_by_peak = store.event_study.set_index("peak_id")
    for row in peaks_records:
        if row["peak_id"] in es_by_peak.index:
            es_row = es_by_peak.loc[row["peak_id"]]
            es_dict = es_row.where(es_row.notna(), None).to_dict()
            es_dict["event_date"] = (
                es_dict["event_date"].isoformat() if es_dict["event_date"] is not None else None
            )
            row["event_study"] = {k: v for k, v in es_dict.items() if k not in ("peak_id", "ticker")}
        else:
            row["event_study"] = None

    articles = store.company_articles(ticker, company_name)
    articles_records = articles.astype(object).where(articles.notna(), None).to_dict(orient="records")

    return {
        "company": company,
        "peaks": peaks_records,
        "articles": articles_records,
    }
