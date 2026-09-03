import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.api.auth.router import router as auth_router
from backend.app.api.users.router import router as users_router
from backend.app.api.friends.router import router as friends_router
from backend.app.api.trips.router import router as trips_router
from backend.app.api.itinerary.router import router as itinerary_router
from backend.app.api.recommendations.router import router as recommendations_router
from backend.app.api.flights.router import router as flights_router
from backend.app.api.expenses.router import router as expenses_router
from backend.app.api.chat.router import router as chat_router
from backend.app.api.notifications.router import router as notifications_router
from backend.app.api.exports.router import router as exports_router
from backend.app.workers.flight_worker import start_flight_worker_loop

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("arc_nomade")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ARC-NOMADE database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Start background flight monitoring worker
    worker_task = asyncio.create_task(start_flight_worker_loop(interval_seconds=120))
    logger.info("ARC-NOMADE backend started successfully.")
    
    yield
    
    worker_task.cancel()
    logger.info("ARC-NOMADE backend shut down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="ARC-NOMADE — Your Journey, Perfectly Mapped. 🧭✈️ (AI-Powered Collaborative Travel Platform)",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again."}
    )

# Include API V1 Routers
api_v1_prefix = settings.API_V1_STR

app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(users_router, prefix=api_v1_prefix)
app.include_router(friends_router, prefix=api_v1_prefix)
app.include_router(trips_router, prefix=api_v1_prefix)
app.include_router(itinerary_router, prefix=api_v1_prefix)
app.include_router(recommendations_router, prefix=api_v1_prefix)
app.include_router(flights_router, prefix=api_v1_prefix)
app.include_router(expenses_router, prefix=api_v1_prefix)
app.include_router(chat_router, prefix=api_v1_prefix)
app.include_router(notifications_router, prefix=api_v1_prefix)
app.include_router(exports_router, prefix=api_v1_prefix)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "tagline": "Your Journey, Perfectly Mapped. 🧭✈️",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
