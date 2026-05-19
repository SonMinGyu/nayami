from fastapi import FastAPI

from app.content.router import router as content_router
from app.health.router import router as health_router

app = FastAPI(title="AI Service")

app.include_router(health_router)
app.include_router(content_router, prefix="/content")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", reload=True)