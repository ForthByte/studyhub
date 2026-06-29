import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, groups, notes

load_dotenv()

# initialise the FastAPI application instance with metadata for auto generated documentation
app = FastAPI(title="Study Hub API")

# allow the frontend to make cross-origin requests to the API.
# allow_credentials=True is required for the httpOnly refresh token cookie to be sent.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount the authentication routes under the main application
app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(notes.router)

@app.get("/api/v1/health")
def health():
    """
    perform a basic application health check.
    used by deployment platforms, container orchestrators or monitoring tools to verify the web server is up, responsive and running normally.
    :return: a dictionary containing the operational status string
    """
    return {"status": "ok"}