import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.content.router import router as content_router
from app.health.router import router as health_router
from app.sqs.consumer import start_consumer


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = start_consumer()
    yield
    # 앱 종료 시 SQS 컨슈머 정상 종료
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="AI Service", lifespan=lifespan)

app.include_router(health_router)
app.include_router(content_router, prefix="/content")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", reload=True)
