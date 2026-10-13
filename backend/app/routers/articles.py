from fastapi import APIRouter

from app.data import store

router = APIRouter()


@router.get("")
def list_articles(category: str | None = None, limit: int = 50, offset: int = 0):
    page, total = store.articles_by_category(category, limit, offset)
    items = page.astype(object).where(page.notna(), None).to_dict(orient="records")
    return {"items": items, "total": total}
