import asyncio
import json
import logging

import aioboto3

from app.config import settings
from app.content.schemas import ContentCheckRequest
from app.content.service import content_service

logger = logging.getLogger(__name__)

_session = aioboto3.Session(
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region,
)


async def _process(sqs, message: dict) -> None:
    body = json.loads(message["Body"])
    reply_id = body["reply_id"]

    request = ContentCheckRequest(
        concern_content=body["concern_content"],
        reply_content=body["reply_content"],
    )
    result = await content_service.check(request)

    await sqs.send_message(
        QueueUrl=settings.sqs_reply_check_result_queue_url,
        MessageBody=json.dumps({
            "reply_id": reply_id,
            "is_safe": result.is_safe,
            "reason": result.reason,
        }),
    )
    await sqs.delete_message(
        QueueUrl=settings.sqs_reply_check_request_queue_url,
        ReceiptHandle=message["ReceiptHandle"],
    )
    logger.info("처리 완료: reply_id=%s is_safe=%s", reply_id, result.is_safe)


async def _poll() -> None:
    async with _session.client("sqs") as sqs:
        while True:
            try:
                response = await sqs.receive_message(
                    QueueUrl=settings.sqs_reply_check_request_queue_url,
                    MaxNumberOfMessages=1,
                    WaitTimeSeconds=20,
                )
                for message in response.get("Messages", []):
                    try:
                        await _process(sqs, message)
                    except Exception:
                        logger.exception("메시지 처리 실패: message_id=%s", message.get("MessageId"))
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("SQS 폴링 오류, 5초 후 재시도")
                await asyncio.sleep(5)


def start_consumer() -> asyncio.Task:
    return asyncio.create_task(_poll())
