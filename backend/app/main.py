from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine

# Import models so SQLAlchemy knows about all tables
from app.models import User, Artisan, Craft, Product, ProductImage

from app.routers import auth
from app.routers import artisan
from app.routers import craft
from app.routers import auth
from app.routers import artisan
from app.routers import product
from app.routers import product_image
from app.routers import order
from app.routers import review
from app.routers import ml
from app.routers import rag
# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="HASTKATHA API",
    description="AI-powered digital ecosystem for Indian traditional crafts",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routers
app.include_router(auth.router)
app.include_router(artisan.router)
app.include_router(craft.router)
app.include_router(auth.router)
app.include_router(artisan.router)
app.include_router(product.router)
app.include_router(product_image.router)
app.include_router(order.router)
app.include_router(review.router)
app.include_router(ml.router)
app.include_router(rag.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to HASTKATHA API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
    
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "HASTKATHA API"
    }