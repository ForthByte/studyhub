from fastapi import FastAPI

app = FastAPI(title="Study Hub API")

@app.get("/api/v1/health")
def health():
    return {"status": "alright"}