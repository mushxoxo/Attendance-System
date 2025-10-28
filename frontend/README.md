# DeepFace Attendance System Frontend

A React-based frontend for the DeepFace Attendance System.

## Features

- Upload reference photos for students
- Upload class photos for attendance processing
- View attendance results with confidence scores
- Download attendance records as CSV files
- View history of attendance records

## Technologies Used

- React with Vite
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API requests
- Lucide React for icons

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Usage

1. Navigate to the home page
2. Upload reference photos for students (each named with student ID)
3. Upload a class photo
4. Process attendance
5. View results and download CSV
6. Check history page for past attendance records

## API Integration

The frontend connects to the backend API at `http://localhost:8000` with the following endpoints:

- `/upload-reference`: Upload reference photos
- `/upload-class-photo`: Upload class photo
- `/process-attendance`: Process attendance
- `/attendance-records`: Get list of attendance records
- `/download-csv/{filename}`: Download CSV file
