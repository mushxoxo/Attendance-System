import requests
import json

def test_process_attendance():
    print("Testing process attendance API...")
    
    try:
        response = requests.post(
            'http://localhost:8000/process-attendance',
            json={"filename": "20251029_015742_Screenshot 2025-10-25 214733.png"}
        )
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Found {len(data.get('records', []))} students in the photo.")
            print(f"CSV filename: {data.get('csv_filename', 'N/A')}")
            
            # Print the first few records
            records = data.get('records', [])
            for i, record in enumerate(records[:3]):
                print(f"Record {i+1}: {record}")
                
            if len(records) > 3:
                print(f"... and {len(records) - 3} more records")
        else:
            print(f"Error response: {response.text}")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_process_attendance()
