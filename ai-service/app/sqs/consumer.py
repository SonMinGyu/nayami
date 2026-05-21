import asyncio
import json
import logging

import aioboto3

from app.config import settings
from app.concern.schemas import ConcernCheckRequest
from app.concern.service import concern_service
from app.reply.schemas import ReplyCheckRequest
from app.reply.service import reply_service

logger = logging.getLogger(__name__)

_session = aioboto3.Session(
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region,
)


async def _process_reply(sqs, message: dict) -> None:
    body = json.loads(message["Body"])
    reply_id = body["reply_id"]

    request = ReplyCheckRequest(
        concern_content=body["concern_content"],
        reply_content=body["reply_content"],
    )
    result = await reply_service.check(request)

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
    logger.info("답변 검사 완료: reply_id=%s is_safe=%s", reply_id, result.is_safe)


async def _process_concern(sqs, message: dict) -> None:
    body = json.loads(message["Body"])
    concern_id = body["concernId"]

    request = ConcernCheckRequest(concern_content=body["concernContent"])
    result = await concern_service.check(request)

    await sqs.send_message(
        QueueUrl=settings.sqs_concern_check_result_queue_url,
        MessageBody=json.dumps({
            "concernId": concern_id,
            "isSafe": result.is_safe,
            "reason": result.reason,
        }),
    )
    await sqs.delete_message(
        QueueUrl=settings.sqs_concern_check_request_queue_url,
        ReceiptHandle=message["ReceiptHandle"],
    )
    logger.info("고민 검사 완료: concern_id=%s is_safe=%s", concern_id, result.is_safe)


async def _poll_reply() -> None:
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
                        await _process_reply(sqs, message)
                    except Exception:
                        logger.exception("답변 메시지 처리 실패: message_id=%s", message.get("MessageId"))
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("답변 SQS 폴링 오류, 5초 후 재시도")
                await asyncio.sleep(5)


async def _poll_concern() -> None:
    async with _session.client("sqs") as sqs:
        while True:
            try:
                response = await sqs.receive_message(
                    QueueUrl=settings.sqs_concern_check_request_queue_url,
                    MaxNumberOfMessages=1,
                    WaitTimeSeconds=20,
                )
                for message in response.get("Messages", []):
                    try:
                        await _process_concern(sqs, message)
                    except Exception:
                        logger.exception("고민 메시지 처리 실패: message_id=%s", message.get("MessageId"))
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("고민 SQS 폴링 오류, 5초 후 재시도")
                await asyncio.sleep(5)


def start_reply_consumer() -> asyncio.Task:
    return asyncio.create_task(_poll_reply())


def start_concern_consumer() -> asyncio.Task:
    return asyncio.create_task(_poll_concern())