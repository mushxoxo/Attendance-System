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
    print(f"\n===== STARTING ATTENDANCE PROCESSING =====")
    print(f"Processing photo: {photo_path}")
    print(f"Number of reference faces: {len(reference_faces)}")
    print(f"Reference student IDs: {list(reference_faces.keys())}")
    
    img = cv2.imread(photo_path)
    if img is None:
        print("Error: Could not load image")
        return []
    
    print(f"Image loaded successfully. Shape: {img.shape}")

    # Detect faces in class photo
    try:
        print("Detecting faces in class photo...")
        detections = DeepFace.extract_faces(
            img_path=photo_path,
            detector_backend='opencv',
            enforce_detection=False
        )
        print(f"Face detection completed successfully")
    except Exception as e:
        print(f"Error detecting faces: {e}")
        return []

    print(f"Detected {len(detections)} faces in class photo")
    if len(detections) == 0:
        print("No faces detected in the class photo. Please try another image.")
        return []

    attendance_records = []
    matched_students = set()

    # Match each detected face with reference faces
    print("\n===== STARTING FACE MATCHING PROCESS =====")
    for idx, detection in enumerate(detections):
        print(f"\nProcessing detected face #{idx+1}/{len(detections)}")
        face = detection["face"]

        # Convert to proper format
        if face.dtype != np.uint8:
            face = (face * 255).astype(np.uint8) if face.max() <= 1.0 else face.astype(np.uint8)
        print(f"Face shape: {face.shape}")

        best_match = None
        best_distance = float('inf')
        match_count = 0

        # Compare with all reference faces
        print(f"Comparing with {len(reference_faces)} reference faces...")
        for student_id, ref_face in reference_faces.items():
            if student_id in matched_students:
                print(f"Skipping {student_id} - already matched")
                continue

            try:
                print(f"  Comparing with student ID: {student_id}")
                result = DeepFace.verify(
                    img1_path=face,
                    img2_path=ref_face,
                    model_name='VGG-Face',
                    detector_backend='skip',
                    enforce_detection=False
                )
                match_count += 1
                print(f"  Result: Verified={result['verified']}, Distance={result['distance']:.4f}")

                if result['verified'] and result['distance'] < best_distance:
                    best_distance = result['distance']
                    best_match = student_id
                    print(f"  New best match: {student_id} with distance {best_distance:.4f}")
            except Exception as e:
                print(f"  Error comparing with {student_id}: {e}")
                continue

        print(f"Completed {match_count} comparisons for face #{idx+1}")
        if best_match:
            matched_students.add(best_match)
            confidence = (1 - best_distance) * 100
            print(f"MATCH FOUND: Student {best_match} with {confidence:.2f}% confidence")
            attendance_records.append({
                'Student_ID': best_match,
                'Timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'Status': 'Present',
                'Confidence': f"{confidence:.2f}%",
                'Confidence_Value': confidence
            })
        else:
            print(f"NO MATCH FOUND for face #{idx+1}")
    
    print(f"\n===== FACE MATCHING COMPLETE =====")
    print(f"Total faces detected: {len(detections)}")
    print(f"Total matches found: {len(attendance_records)}")
    print(f"Matched students: {list(matched_students)}")
    print(f"===== END OF ATTENDANCE PROCESSING =====")

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
