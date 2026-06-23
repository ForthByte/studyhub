from fastapi import FastAPI
from app.routers import auth

#initialise the code FastAPI application instance with metadata for auto generated documentation
app = FastAPI(title="Study Hub API")

#mount the authentication routes under the main application
app.include_router(auth.router)


@app.get("/api/v1/health")
def health():
    """
    perform a basic application health check.
    used by deployment platforms, container orchestrators or monitoring tools to verify the web server is up, responsive and running normally.
    :return: a dictionary containing the operational status string
    """
    return {"status": "ok"}