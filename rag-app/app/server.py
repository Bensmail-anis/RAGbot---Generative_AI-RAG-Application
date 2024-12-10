from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
from starlette.staticfiles import StaticFiles
import os
import shutil
import subprocess
from app.rag_chain import final_chain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/rag/static", StaticFiles(directory="./pdf-documents"), name="static")
@app.get("/")
async def redirect_root_to_docs():
    return RedirectResponse("/docs")

pdf_directory = "./pdf-documents"

import logging
from fastapi.responses import JSONResponse

logger = logging.getLogger("uvicorn")

@app.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    uploaded_files = []
    for file in files:
        try:
            file_path = os.path.join(pdf_directory, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            uploaded_files.append(file.filename)
            logger.info(f"Uploaded file: {file.filename}")
        except Exception as e:
            logger.error(f"Error saving file {file.filename}: {e}")
            raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    
    return JSONResponse(
        content={"message": "Files uploaded successfully", "filenames": uploaded_files},
        status_code=200
    )



@app.post("/load-and-process-pdfs")
async def load_and_process_pdfs():
    try:
        # Run the script using poetry's virtual environment
        result = subprocess.run(
            ["poetry", "run", "python", "./rag-data-loader/rag_load_and_process.py"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        logger.info(f"Script executed successfully. Output:\n{result.stdout}")
        return JSONResponse(
            content={"message": "PDFs loaded and processed successfully", "output": result.stdout},
            status_code=200
        )
    except subprocess.CalledProcessError as e:
        logger.error(f"Script execution failed. Error:\n{e.stderr}")
        return JSONResponse(
            content={"error": "Failed to execute script", "details": e.stderr},
            status_code=500
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JSONResponse(
            content={"error": "An unexpected error occurred", "details": str(e)},
            status_code=500
        )

# Edit this to add the chain you want to add
add_routes(app, final_chain, path="/rag")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)