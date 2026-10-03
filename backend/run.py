import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("Starting GeoHub FastAPI Backend Server...")
    print("Swagger Documentation: http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
