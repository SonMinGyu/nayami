from fastapi import APIRouter

from app.reply.schemas import ReplyCheckRequest, ReplyCheckResponse
from app.reply.service import reply_service

router = APIRouter(tags=["reply"])


@router.post("/check", response_model=ReplyCheckResponse)
async def check_reply(request: ReplyCheckRequest):
    return await reply_service.check(request)