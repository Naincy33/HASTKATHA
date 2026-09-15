from fastapi import FastAPI

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
# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="HASTKATHA API",
    description="AI-powered digital ecosystem for Indian traditional crafts",
    version="1.0.0"
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