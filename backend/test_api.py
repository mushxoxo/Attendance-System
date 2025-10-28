import requests
import os
import time

# API base URL
BASE_URL = "http://localhost:8000"

def test_upload_reference():
    """Test uploading reference photos"""
    url = f"{BASE_URL}/upload-reference"
    
    # Path to reference photos directory
    ref_dir = "ref_Photos"
    
    if not os.path.exists(ref_dir):
        print(f"Reference directory {ref_dir} not found")
        return
    
    files = []
    for filename in os.listdir(ref_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            file_path = os.path.join(ref_dir, filename)
            files.append(
                ('files', (filename, open(file_path, 'rb'), 'image/jpeg'))
            )
    
    if not files:
        print("No reference photos found")
        return
    
    response = requests.post(url, files=files)
    print("Upload Reference Response:", response.json())
    
    # Close all opened files
    for _, (_, file_obj, _) in files:
        file_obj.close()


def test_upload_class_photo():
    """Test uploading class photo"""
    url = f"{BASE_URL}/upload-class-photo"
    
    # Path to class photo
    class_photo = "uploads/class_photo.jpg"
    
    if not os.path.exists(class_photo):
        print(f"Class photo {class_photo} not found")
        return
    
    with open(class_photo, 'rb') as f:
        response = requests.post(
            url,
            files={'file': ('class_photo.jpg', f, 'image/jpeg')}
        )
    
    print("Upload Class Photo Response:", response.json())
    return response.json().get('filename')


def test_process_attendance(filename):
    """Test processing attendance"""
    url = f"{BASE_URL}/process-attendance"
    
    response = requests.post(
        url,
        json={'filename': filename}
    )
    
    print("Process Attendance Response:", response.json())
    return response.json().get('csv_filename')


def test_list_attendance_records():
    """Test listing attendance records"""
    url = f"{BASE_URL}/attendance-records"
    
    response = requests.get(url)
    print("List Attendance Records Response:", response.json())


def test_download_csv(filename):
    """Test downloading CSV file"""
    url = f"{BASE_URL}/download-csv/{filename}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        # Save the downloaded file
        with open(f"downloaded_{filename}", 'wb') as f:
            f.write(response.content)
        print(f"Downloaded CSV file saved as downloaded_{filename}")
    else:
        print("Download CSV Response:", response.text)


def run_tests():
    """Run all tests"""
    print("Testing API endpoints...")
    
    # Test uploading reference photos
    test_upload_reference()
    
    # Test uploading class photo
    filename = test_upload_class_photo()
    if not filename:
        print("Failed to upload class photo")
        return
    
    # Test processing attendance
    csv_filename = test_process_attendance(filename)
    if not csv_filename:
        print("Failed to process attendance")
        return
    
    # Test listing attendance records
    test_list_attendance_records()
    
    # Test downloading CSV file
    test_download_csv(csv_filename)


if __name__ == "__main__":
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(2)
    
    run_tests()
