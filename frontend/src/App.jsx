import { useState, useRef } from 'react';
import './styles/globals.css';
import { uploadReferencePhotos, uploadClassPhoto, processAttendance } from './services/api';
import { Toaster as HotToaster, toast } from 'react-hot-toast';
import { Upload, Camera } from 'lucide-react';

// UI Components
import { Button } from './components/ui/button';
import Navbar from './components/Navbar';
import UploadCard from './components/UploadCard';
import ProcessingCard from './components/ProcessingCard';
import AttendanceResults from './components/AttendanceResults';

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
  
  // State for current view/step
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'processing', 'results'
  
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
    <div className="min-h-screen gradient-bg">
      {/* Toast notifications */}
      <HotToaster position="top-right" />
      
      {/* Navigation Bar */}
      <Navbar 
        currentStep={currentStep} 
        setCurrentStep={setCurrentStep} 
        attendanceData={attendanceData} 
      />

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm animate-fade-in">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto">
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reference Photos Card */}
                <UploadCard 
                  title="Reference Photos"
                  description="Upload reference photos of students. Each file should be named with the student ID (e.g., student123.jpg)."
                  icon={Upload}
                  files={referenceFiles}
                  isUploaded={isReferenceUploaded}
                  isUploading={isUploadingReference}
                  onDrop={(e) => {
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      setReferenceFiles(files);
                    }
                  }}
                  onUpload={handleUploadReference}
                  inputRef={referenceInputRef}
                  onChange={handleReferenceChange}
                  multiple={true}
                />
                
                {/* Class Photo Card */}
                <UploadCard 
                  title="Class Photo"
                  description="Upload a photo of the class to process attendance."
                  icon={Camera}
                  files={classPhoto ? [classPhoto] : []}
                  isUploaded={isClassPhotoUploaded}
                  isUploading={false}
                  preview={classPhotoPreview}
                  onDrop={(e) => {
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setClassPhoto(file);
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setClassPhotoPreview(e.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onUpload={handleUploadClassPhoto}
                  inputRef={classPhotoInputRef}
                  onChange={handleClassPhotoChange}
                />
              </div>
              
              {/* Process Attendance Button */}
              {isClassPhotoUploaded && (
                <div className="flex justify-center mt-8">
                  <div className="relative">
                    {/* Animated glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg blur opacity-30 animate-pulse"></div>
                    
                    <Button
                      variant="gradient"
                      size="xl"
                      onClick={() => {
                        handleProcessAttendance();
                        if (!isProcessing) {
                          setCurrentStep('processing');
                          setTimeout(() => {
                            if (attendanceData.length > 0) {
                              setCurrentStep('results');
                            } else {
                              setCurrentStep('upload');
                            }
                          }, 3000); // Show processing state for at least 3 seconds
                        }
                      }}
                      disabled={!isClassPhotoUploaded || isProcessing}
                      className="relative px-8 py-6 font-bold text-lg shadow-lg hover:shadow-xl"
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing Attendance...</span>
                        </div>
                      ) : (
                        <span>Process Attendance</span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Processing View */}
          {currentStep === 'processing' && (
            <div className="flex justify-center items-center py-12">
              <ProcessingCard />
            </div>
          )}
          
          {/* Results View */}
          {currentStep === 'results' && attendanceData.length > 0 && (
            <AttendanceResults 
              attendanceData={attendanceData} 
              csvFilename={csvFilename} 
            />
          )}
        </main>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>AI Attendance System &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
