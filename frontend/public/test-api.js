// Test script to process attendance
async function testProcessAttendance() {
  console.log('Testing process attendance API...');
  
  try {
    const response = await fetch('http://localhost:8000/process-attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: '20251029_015742_Screenshot 2025-10-25 214733.png'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Process attendance response:', data);
    return data;
  } catch (error) {
    console.error('Error processing attendance:', error);
    return null;
  }
}

// Run the test
testProcessAttendance().then(data => {
  if (data) {
    console.log(`Found ${data.records.length} students in the photo`);
    console.log('Records:', data.records);
    console.log('CSV filename:', data.csv_filename);
  }
});
