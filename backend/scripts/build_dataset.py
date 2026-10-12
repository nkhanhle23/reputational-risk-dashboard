"""Builds backend/data/ from the pipeline's external outputs, trimmed to only the
columns this app actually serves (drops copyrighted NYT article text and unused
diagnostic columns). Rerun this if the source pipeline's outputs change.
"""
import shutil
from pathlib import Path

import pandas as pd

SHARED = Path("/home/le/reputational-risk-pipeline-shared")
PIPELINE_RESULTS = Path("/home/le/reputational-risk-pipeline/results")
OUT_DIR = Path(__file__).parent.parent / "data"


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)

    articles = pd.read_parquet(
        SHARED / "phase2-entity-linked-corpus" / "articles_entity_linked_cleaned.parquet"
    )
    articles = articles[["article_id", "title", "section", "published_date", "url"]]
    articles.to_parquet(OUT_DIR / "articles.parquet", index=False)

    matches = pd.read_parquet(
        SHARED / "phase2-entity-linked-corpus" / "entity_matches_cleaned.parquet"
    )
    matches = (
        matches[["article_id", "ticker", "company_name", "sector", "location"]]
        .dropna(subset=["article_id"])
        .drop_duplicates()
    )
    matches.to_parquet(OUT_DIR / "entity_matches.parquet", index=False)

    labeled = pd.read_parquet(
        PIPELINE_RESULTS / "full_dataset_classification" / "full_dataset_labeled.parquet"
    )
    labeled.to_parquet(OUT_DIR / "full_dataset_labeled.parquet", index=False)

    peaks = pd.read_parquet(SHARED / "phase5-emotion-peaks" / "all_peaks_loose_threshold.parquet")
    peaks.to_parquet(OUT_DIR / "all_peaks_loose_threshold.parquet", index=False)

    event_study = pd.read_parquet(SHARED / "phase6-event-study" / "event_study_results_v3.parquet")
    event_study = event_study.drop(columns=["topic_hhi"])
    event_study.to_parquet(OUT_DIR / "event_study_results_v3.parquet", index=False)

    crosstab = pd.read_csv(SHARED / "phase7-cross-tabulation" / "crosstab_results.csv")
    crosstab.to_csv(OUT_DIR / "crosstab_results.csv", index=False)

    shutil.copy(
        PIPELINE_RESULTS / "full_dataset_classification" / "summary_stats.json",
        OUT_DIR / "summary_stats.json",
    )

    print(f"Wrote 7 files to {OUT_DIR}")
    for f in sorted(OUT_DIR.iterdir()):
        print(f"  {f.name}: {f.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
