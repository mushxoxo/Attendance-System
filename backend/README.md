# DeepFace Attendance System API

A FastAPI backend for facial recognition-based attendance system using DeepFace.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python main.py
   ```
   
   Or with uvicorn directly:
   ```bash
   uvicorn main:app --reload
   ```

3. Access the API documentation at: http://localhost:8000/docs

## API Endpoints

### Upload Reference Photos

```
POST /upload-reference
```

Upload reference photos for students. Each file should be named with the student ID (e.g., student123.jpg).

### Upload Class Photo

```
POST /upload-class-photo
```

Upload a class photo for attendance processing.

### Process Attendance

```
POST /process-attendance
```

Process attendance for a previously uploaded class photo.

### List Attendance Records

```
GET /attendance-records
```

List all available attendance CSV files.

### Download CSV

```
GET /download-csv/{filename}
```

Download a specific attendance CSV file.

## Directory Structure

- `uploads/`: Class photos uploaded from frontend
- `ref_Photos/`: Reference faces of students
- `attendance_records/`: CSV files saved here
- `temp/`: Temporary extracted faces etc.

## Requirements

- Python 3.13
- FastAPI
- DeepFace
- OpenCV
- Pandas
- NumPy
