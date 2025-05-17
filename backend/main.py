from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from vedari import get_vedari_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vednova.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ask_vedari")
async def ask_vedari(request: Request):
    try:
        data = await request.json()
        # process your data here
        return {"message": "Received", "data": data}
    except Exception as e:
        # Log or return error
        return {"error": f"Server error: {str(e)}"}