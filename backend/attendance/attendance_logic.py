import cv2
import numpy as np
import pandas as pd
from datetime import datetime
import os
from deepface import DeepFace
import csv
import shutil
from typing import Dict, List, Any, Tuple


def load_reference_images(reference_folder: str) -> Dict[str, np.ndarray]:
    """
    Load and store cropped faces from all reference images
    
    Args:
        reference_folder: Path to folder containing reference images
        
    Returns:
        Dictionary mapping student IDs to face images
    """
    faces = {}

    if not os.path.exists(reference_folder):
        return faces

    for filename in os.listdir(reference_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            student_id = os.path.splitext(filename)[0]
            filepath = os.path.join(reference_folder, filename)
            try:
                img = cv2.imread(filepath)
                if img is not None:
                    detections = DeepFace.extract_faces(
                        img_path=filepath,
                        detector_backend='opencv',
                        enforce_detection=False
                    )
                    if detections and len(detections) > 0:
                        face = detections[0]["face"]
                        # Convert grayscale to RGB if needed
                        if face.dtype != np.uint8:
                            face = (face * 255).astype(np.uint8) if face.max() <= 1.0 else face.astype(np.uint8)
                        faces[student_id] = face
                    else:
                        print(f"No face detected in: {filename}")
                else:
                    print(f"Could not load image: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

    return faces


def process_attendance(photo_path: str, reference_faces: Dict[str, np.ndarray]) -> List[Dict[str, str]]:
    """
    Process attendance from uploaded photo
    
    Args:
        photo_path: Path to class photo
        reference_faces: Dictionary of reference faces
        
    Returns:
        List of attendance records
    """
    img = cv2.imread(photo_path)
    if img is None:
        print("Error: Could not load image")
        return []

    # Detect faces in class photo
    try:
        detections = DeepFace.extract_faces(
            img_path=photo_path,
            detector_backend='opencv',
            enforce_detection=False
        )
    except Exception as e:
        print(f"Error detecting faces: {e}")
        return []

    print(f"Detected {len(detections)} faces in class photo")

    attendance_records = []
    matched_students = set()

    # Match each detected face with reference faces
    for idx, detection in enumerate(detections):
        face = detection["face"]

        # Convert to proper format
        if face.dtype != np.uint8:
            face = (face * 255).astype(np.uint8) if face.max() <= 1.0 else face.astype(np.uint8)

        best_match = None
        best_distance = float('inf')

        # Compare with all reference faces
        for student_id, ref_face in reference_faces.items():
            if student_id in matched_students:
                continue

            try:
                result = DeepFace.verify(
                    img1_path=face,
                    img2_path=ref_face,
                    model_name='VGG-Face',
                    detector_backend='skip',
                    enforce_detection=False
                )

                if result['verified'] and result['distance'] < best_distance:
                    best_distance = result['distance']
                    best_match = student_id
            except Exception as e:
                continue

        if best_match:
            matched_students.add(best_match)
            confidence = (1 - best_distance) * 100
            attendance_records.append({
                'Student_ID': best_match,
                'Timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'Status': 'Present',
                'Confidence': f"{confidence:.2f}%",
                'Confidence_Value': confidence
            })

    return attendance_records


def save_attendance_to_csv(attendance_records: List[Dict[str, str]], output_dir: str) -> str:
    """
    Save attendance records to CSV file
    
    Args:
        attendance_records: List of attendance records
        output_dir: Directory to save CSV file
        
    Returns:
        Path to saved CSV file
    """
    if not attendance_records:
        return ""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Create DataFrame from attendance records
    df = pd.DataFrame(attendance_records)
    
    # Remove Confidence_Value column used for sorting
    if 'Confidence_Value' in df.columns:
        df = df.drop(columns=['Confidence_Value'])
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = f'attendance_{timestamp}.csv'
    csv_path = os.path.join(output_dir, csv_filename)
    
    # Save to CSV
    df.to_csv(csv_path, index=False)
    
    return csv_filename
