from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import time
from datetime import datetime
import uvicorn
import shutil

from attendance.attendance_logic import load_reference_images, process_attendance, save_attendance_to_csv
from attendance.utils import save_uploaded_file, clean_temp_directory, get_csv_files

# Define base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
REF_PHOTOS_DIR = os.path.join(BASE_DIR, "ref_Photos")
ATTENDANCE_RECORDS_DIR = os.path.join(BASE_DIR, "attendance_records")
TEMP_DIR = os.path.join(BASE_DIR, "temp")

# Create directories if they don't exist
for directory in [UPLOAD_DIR, REF_PHOTOS_DIR, ATTENDANCE_RECORDS_DIR, TEMP_DIR]:
    os.makedirs(directory, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="DeepFace Attendance System API",
    description="API for facial recognition-based attendance system using DeepFace",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Cache for reference faces
reference_faces_cache = None
last_cache_update = 0
CACHE_TIMEOUT = 300  # 5 minutes


def get_reference_faces():
    """Get reference faces with caching"""
    global reference_faces_cache, last_cache_update
    
    current_time = time.time()
    if reference_faces_cache is None or current_time - last_cache_update > CACHE_TIMEOUT:
        reference_faces_cache = load_reference_images(REF_PHOTOS_DIR)
        last_cache_update = current_time
    
    return reference_faces_cache


def invalidate_cache():
    """Invalidate the reference faces cache"""
    global reference_faces_cache, last_cache_update
    reference_faces_cache = None
    last_cache_update = 0


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "DeepFace Attendance System API"}


@app.post("/upload-reference")
async def upload_reference(files: List[UploadFile] = File(...)):
    """
    Upload reference photos for students
    
    Each file should be named with the student ID (e.g., student123.jpg)
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    saved_files = []
    
    for file in files:
        if not file.filename:
            continue
        
        # Check file extension
        if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        
        # Save file
        file_path = await save_uploaded_file(file, REF_PHOTOS_DIR)
        saved_files.append(os.path.basename(file_path))
    
    # Invalidate cache to force reload of reference faces
    invalidate_cache()
    
    return JSONResponse(
        content={
            "message": f"Successfully uploaded {len(saved_files)} reference photos",
            "files": saved_files
        }
    )


@app.post("/upload-class-photo")
async def upload_class_photo(file: UploadFile = File(...)):
    """
    Upload a class photo for attendance processing
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Check file extension
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        raise HTTPException(status_code=400, detail="Invalid file format. Only JPG and PNG are supported.")
    
    # Save file with timestamp prefix to avoid overwriting
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename_parts = file.filename.split('.')
    new_filename = f"{timestamp}_{filename_parts[0]}.{filename_parts[-1]}"
    
    # Create a new UploadFile with the modified filename
    modified_file = UploadFile(
        filename=new_filename,
        file=file.file,
        content_type=file.content_type
    )
    
    # Save file
    file_path = await save_uploaded_file(modified_file, UPLOAD_DIR)
    
    return JSONResponse(
        content={
            "message": "Class photo uploaded successfully",
            "filename": os.path.basename(file_path),
            "path": file_path
        }
    )


@app.post("/process-attendance")
async def process_attendance_endpoint(
    background_tasks: BackgroundTasks,
    filename: str
):
    """
    Process attendance for a previously uploaded class photo
    
    Args:
        filename: Name of the uploaded class photo file
    """
    # Check if file exists
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File {filename} not found")
    
    # Get reference faces
    reference_faces = get_reference_faces()
    if not reference_faces:
        raise HTTPException(status_code=400, detail="No reference faces found. Please upload reference photos first.")
    
    # Process attendance
    attendance_records = process_attendance(file_path, reference_faces)
    
    # Sort by confidence (highest first)
    attendance_records.sort(key=lambda x: float(x.get('Confidence_Value', 0)), reverse=True)
    
    # Save to CSV
    csv_filename = save_attendance_to_csv(attendance_records, ATTENDANCE_RECORDS_DIR)
    
    # Clean up temp directory in the background
    background_tasks.add_task(clean_temp_directory, TEMP_DIR)
    
    return JSONResponse(
        content={
            "message": "Attendance processed successfully",
            "present_count": len(attendance_records),
            "records": attendance_records,
            "csv_filename": csv_filename
        }
    )


@app.get("/attendance-records")
async def list_attendance_records():
    """
    List all available attendance CSV files
    """
    csv_files = get_csv_files(ATTENDANCE_RECORDS_DIR)
    
    return JSONResponse(
        content={
            "records": csv_files
        }
    )


@app.get("/download-csv/{filename}")
async def download_csv(filename: str):
    """
    Download a specific attendance CSV file
    
    Args:
        filename: Name of the CSV file to download
    """
    file_path = os.path.join(ATTENDANCE_RECORDS_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File {filename} not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="text/csv"
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
