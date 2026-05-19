from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import enhancement, transform, filter, color, segment, compress, histogram, cnn

app = FastAPI(
    title="Mini Photoshop API",
    description="API pengolahan citra digital untuk proyek mata kuliah",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(enhancement.router, prefix="/enhance",   tags=["Enhancement"])
app.include_router(transform.router,   prefix="/transform", tags=["Transform"])
app.include_router(filter.router,      prefix="/filter",    tags=["Filter"])
app.include_router(color.router,       prefix="/color",     tags=["Color"])
app.include_router(segment.router,     prefix="/segment",   tags=["Segmentation"])
app.include_router(compress.router,    prefix="/compress",  tags=["Compression"])
app.include_router(histogram.router,   prefix="/histogram", tags=["Histogram"])
app.include_router(cnn.router,         prefix="/cnn",       tags=["CNN"])

@app.get("/")
def root():
    return {"message": "Mini Photoshop API is running!"}