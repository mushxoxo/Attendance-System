import { useState, useRef } from 'react';
import './styles/globals.css';
import { uploadReferencePhotos, uploadClassPhoto, processAttendance, downloadCSV } from './services/api';

function App() {
  // State for reference photos
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [isReferenceUploaded, setIsReferenceUploaded] = useState(false);
  const [isUploadingReference, setIsUploadingReference] = useState(false);
  
  // State for class photo
  const [classPhoto, setClassPhoto] = useState(null);
  const [classPhotoPreview, setClassPhotoPreview] = useState(null);
  const [isClassPhotoUploaded, setIsClassPhotoUploaded] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState('');
  
  // State for attendance processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [csvFilename, setCsvFilename] = useState('');
  const [error, setError] = useState('');
  
  // Refs for file inputs
  const referenceInputRef = useRef(null);
  const classPhotoInputRef = useRef(null);

  // Handle reference photos selection
  const handleReferenceChange = (e) => {
    const files = Array.from(e.target.files);
    setReferenceFiles(files);
  };

  // Handle reference photos upload
  const handleUploadReference = async () => {
    if (referenceFiles.length === 0) return;
    
    setIsUploadingReference(true);
    setError('');
    
    try {
      await uploadReferencePhotos(referenceFiles);
      setIsReferenceUploaded(true);
    } catch (err) {
      setError('Failed to upload reference photos. Please try again.');
      console.error('Error uploading reference photos:', err);
    } finally {
      setIsUploadingReference(false);
    }
  };

  // Handle class photo selection
  const handleClassPhotoChange = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setClassPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setClassPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle class photo upload
  const handleUploadClassPhoto = async () => {
    if (!classPhoto) return;
    
    setIsClassPhotoUploaded(false);
    setError('');
    
    try {
      const response = await uploadClassPhoto(classPhoto);
      setUploadedFilename(response.filename);
      setIsClassPhotoUploaded(true);
    } catch (err) {
      setError('Failed to upload class photo. Please try again.');
      console.error('Error uploading class photo:', err);
    }
  };

  // Handle attendance processing
  const handleProcessAttendance = async () => {
    if (!isClassPhotoUploaded || !uploadedFilename) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const response = await processAttendance(uploadedFilename);
      setAttendanceData(response.records);
      setCsvFilename(response.csv_filename);
    } catch (err) {
      setError('Failed to process attendance. Please try again.');
      console.error('Error processing attendance:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle CSV download
  const handleDownloadCSV = async () => {
    if (!csvFilename) return;
    
    try {
      const blob = await downloadCSV(csvFilename);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', csvFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download CSV. Please try again.');
      console.error('Error downloading CSV:', err);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>DeepFace Attendance System</h1>
        <p>Upload reference photos and class images to process attendance</p>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <main>
        {/* Reference Photos Section */}
        <div className="card">
          <h2>Reference Photos</h2>
          <p>Upload reference photos of students (each named with student ID)</p>
          <div className="upload-section">
            <div className="file-input-wrapper">
              <button 
                onClick={() => referenceInputRef.current.click()}
                className="file-select-button"
              >
                Select Reference Photos
              </button>
              <input 
                ref={referenceInputRef}
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleReferenceChange}
                style={{ display: 'none' }}
              />
              {referenceFiles.length > 0 && (
                <span className="file-count">{referenceFiles.length} file(s) selected</span>
              )}
            </div>
            
            <button 
              onClick={handleUploadReference} 
              disabled={referenceFiles.length === 0 || isUploadingReference}
              className="primary-button"
            >
              {isUploadingReference ? 'Uploading...' : 'Upload References'}
            </button>
          </div>
          
          {isReferenceUploaded && (
            <div className="success-message">
              ✓ Reference photos uploaded successfully!
            </div>
          )}
        </div>

        {/* Class Photo Section */}
        <div className="card">
          <h2>Class Photo</h2>
          <p>Upload a photo of the class to process attendance</p>
          <div className="upload-section">
            <div className="file-input-wrapper">
              <button 
                onClick={() => classPhotoInputRef.current.click()}
                className="file-select-button"
              >
                Select Class Photo
              </button>
              <input 
                ref={classPhotoInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleClassPhotoChange}
                style={{ display: 'none' }}
              />
              {classPhoto && (
                <span className="file-name">{classPhoto.name}</span>
              )}
            </div>
            
            <div className="button-group">
              <button 
                onClick={handleUploadClassPhoto} 
                disabled={!classPhoto}
                className="secondary-button"
              >
                Upload Photo
              </button>
              
              <button 
                onClick={handleProcessAttendance} 
                disabled={!isClassPhotoUploaded || isProcessing}
                className="primary-button"
              >
                {isProcessing ? 'Processing...' : 'Process Attendance'}
              </button>
            </div>
          </div>
          
          {classPhotoPreview && (
            <div className="photo-preview">
              <h3>Preview:</h3>
              <img src={classPhotoPreview} alt="Class Photo Preview" />
              
              {isClassPhotoUploaded && (
                <div className="success-message">
                  ✓ Class photo uploaded successfully!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Attendance Results Section */}
        {attendanceData.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2>Attendance Results</h2>
              {csvFilename && (
                <button onClick={handleDownloadCSV} className="download-button">
                  Download CSV
                </button>
              )}
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={index}>
                      <td>{record.Student_ID}</td>
                      <td>
                        <span className="status-badge">{record.Status}</span>
                      </td>
                      <td>{record.Confidence}</td>
                      <td>{record.Timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>DeepFace Attendance System &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
