"""Loads this app's bundled parquet/CSV data (built by scripts/build_dataset.py
from the reputational-risk-pipeline's outputs) into memory once at startup."""
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).parent.parent / "data"


class Store:
    def __init__(self) -> None:
        articles = pd.read_parquet(DATA_DIR / "articles.parquet")
        matches = pd.read_parquet(DATA_DIR / "entity_matches.parquet")
        labeled = pd.read_parquet(DATA_DIR / "full_dataset_labeled.parquet")
        peaks = pd.read_parquet(DATA_DIR / "all_peaks_loose_threshold.parquet")
        event_study = pd.read_parquet(DATA_DIR / "event_study_results_v3.parquet")
        crosstab = pd.read_csv(DATA_DIR / "crosstab_results.csv")

        articles["article_id"] = articles["article_id"].astype("int64")
        matches["article_id"] = matches["article_id"].astype("Int64")
        labeled["article_id"] = labeled["article_id"].astype("int64")

        self.articles = articles
        self.matches = matches
        self.labeled = labeled
        self.peaks = peaks
        self.event_study = event_study
        self.crosstab = crosstab

        self.companies = (
            matches.dropna(subset=["ticker"])
            .groupby(["ticker", "company_name"])
            .agg(
                sector=("sector", "first"),
                location=("location", "first"),
                n_articles=("article_id", "nunique"),
            )
            .reset_index()
        )
        peak_counts = peaks.groupby(["ticker", "company_name"]).size().rename("n_peaks")
        self.companies = self.companies.merge(peak_counts, on=["ticker", "company_name"], how="left")
        self.companies["n_peaks"] = self.companies["n_peaks"].fillna(0).astype(int)

        # ticker is not unique (e.g. "ADP" = both Aeroports de Paris and Automatic
        # Data Processing), so routes/links use this composite id instead.
        self.companies["company_id"] = (
            self.companies["ticker"] + "__" + self.companies["company_name"].str.replace(
                r"[^A-Za-z0-9]+", "-", regex=True
            )
        )

    def find_company(self, company_id: str) -> pd.Series | None:
        rows = self.companies[self.companies["company_id"] == company_id]
        return rows.iloc[0] if len(rows) else None

    def company_articles(self, ticker: str, company_name: str) -> pd.DataFrame:
        mask = (self.matches["ticker"] == ticker) & (self.matches["company_name"] == company_name)
        article_ids = self.matches.loc[mask, "article_id"].dropna().unique()
        merged = self.articles[self.articles["article_id"].isin(article_ids)].merge(
            self.labeled, on="article_id", how="left"
        )
        return merged.sort_values("published_date")

    def company_peaks(self, ticker: str, company_name: str) -> pd.DataFrame:
        mask = (self.peaks["ticker"] == ticker) & (self.peaks["company_name"] == company_name)
        return self.peaks[mask].sort_values("start_date")

    def peak_event_study(self, peak_id: str) -> pd.Series | None:
        rows = self.event_study[self.event_study["peak_id"] == peak_id]
        return rows.iloc[0] if len(rows) else None


store = Store()
