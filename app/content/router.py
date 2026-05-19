from fastapi import APIRouter

from app.content.schemas import ContentCheckRequest, ContentCheckResponse
from app.content.service import content_service

router = APIRouter(tags=["content"])


@router.post("/check", response_model=ContentCheckResponse)
async def check_content(request: ContentCheckRequest):
    return await content_service.check(request)