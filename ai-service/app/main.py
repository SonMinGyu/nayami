import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.reply.router import router as reply_router
from app.health.router import router as health_router
from app.sqs.consumer import start_concern_consumer, start_reply_consumer


@asynccontextmanager
async def lifespan(app: FastAPI):
    reply_task = start_reply_consumer()
    concern_task = start_concern_consumer()
    yield
    reply_task.cancel()
    concern_task.cancel()
    await asyncio.gather(reply_task, concern_task, return_exceptions=True)


app = FastAPI(title="AI Service", lifespan=lifespan)

app.include_router(health_router)
app.include_router(reply_router, prefix="/reply")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", reload=True)