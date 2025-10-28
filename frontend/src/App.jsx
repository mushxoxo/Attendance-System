import { useState, useRef, useEffect } from 'react';
import './styles/globals.css';
import { uploadReferencePhotos, uploadClassPhoto, processAttendance } from './services/api';
import { Toaster, toast } from 'react-hot-toast';
import { School } from 'lucide-react';
import AttendanceTable from './components/AttendanceTable';

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
    if (referenceFiles.length === 0) {
      toast.error('Please select reference photos first');
      return;
    }
    
    setIsUploadingReference(true);
    setError('');
    
    const loadingToast = toast.loading(`Uploading ${referenceFiles.length} reference photos...`);
    
    try {
      const response = await uploadReferencePhotos(referenceFiles);
      setIsReferenceUploaded(true);
      toast.success(`Successfully uploaded ${referenceFiles.length} reference photos`, { id: loadingToast });
    } catch (err) {
      toast.error('Failed to upload reference photos', { id: loadingToast });
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
    if (!classPhoto) {
      toast.error('Please select a class photo first');
      return;
    }
    
    setIsClassPhotoUploaded(false);
    setError('');
    
    const loadingToast = toast.loading('Uploading class photo...');
    
    try {
      const response = await uploadClassPhoto(classPhoto);
      setUploadedFilename(response.filename);
      setIsClassPhotoUploaded(true);
      toast.success('Class photo uploaded successfully', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to upload class photo', { id: loadingToast });
      setError('Failed to upload class photo. Please try again.');
      console.error('Error uploading class photo:', err);
    }
  };

  // Handle attendance processing
  const handleProcessAttendance = async () => {
    if (!isClassPhotoUploaded || !uploadedFilename) {
      toast.error('Please upload a class photo first');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    // Create a multi-step loading toast
    const loadingToast = toast.loading(
      <div>
        <div className="font-medium">Processing attendance...</div>
        <div className="text-xs mt-1">Step 1/3: Detecting faces in class photo</div>
      </div>
    );
    
    try {
      // Update toast to show progress after a short delay
      setTimeout(() => {
        toast.loading(
          <div>
            <div className="font-medium">Processing attendance...</div>
            <div className="text-xs mt-1">Step 2/3: Matching with reference photos</div>
          </div>,
          { id: loadingToast }
        );
      }, 2000);
      
      // Call the API
      const response = await processAttendance(uploadedFilename);
      
      // Final update before success
      setTimeout(() => {
        toast.loading(
          <div>
            <div className="font-medium">Processing attendance...</div>
            <div className="text-xs mt-1">Step 3/3: Generating attendance report</div>
          </div>,
          { id: loadingToast }
        );
      }, 1000);
      
      // Set the data
      setAttendanceData(response.records);
      setCsvFilename(response.csv_filename);
      
      // Show success message after a short delay
      setTimeout(() => {
        toast.success(
          <div>
            <div className="font-medium">Attendance processed successfully!</div>
            <div className="text-xs mt-1">Found {response.records.length} students in the photo</div>
          </div>,
          { id: loadingToast }
        );
      }, 1500);
    } catch (err) {
      toast.error(
        <div>
          <div className="font-medium">Failed to process attendance</div>
          <div className="text-xs mt-1">Please check console for details</div>
        </div>,
        { id: loadingToast }
      );
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
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <School size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">DeepFace Attendance System</h1>
          </div>
          <p className="text-gray-600">
            Upload reference photos and class images to process attendance using facial recognition
          </p>
        </header>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <main>
          {/* Reference Photos Section */}
          <div className="card">
            <h2 className="flex items-center gap-2">
              <span className="text-blue-600">Reference Photos</span>
            </h2>
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
            <h2 className="flex items-center gap-2">
              <span className="text-blue-600">Class Photo</span>
            </h2>
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
            <AttendanceTable 
              attendanceData={attendanceData} 
              csvFilename={csvFilename} 
            />
          )}
        </main>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>DeepFace Attendance System &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
