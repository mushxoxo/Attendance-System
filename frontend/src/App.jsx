import { useState, useRef } from 'react';
import './styles/globals.css';
import { uploadReferencePhotos, uploadClassPhoto, processAttendance } from './services/api';
import { Toaster as HotToaster, toast } from 'react-hot-toast';
import { Upload, Camera, Cpu } from 'lucide-react';

// UI Components
import { Button } from './components/ui/button';
import Navbar from './components/Navbar';
import UploadCard from './components/UploadCard';
import ProcessingCard from './components/ProcessingCard';
import AttendanceResults from './components/AttendanceResults';

// Sample image paths from /public/sample-images/
const SAMPLE_REF_FILES = ['101.png', '102.png', '103.png', '104.png'];
const SAMPLE_CLASS_FILES = [
  'new-york-new-york-mrbeast-and-rob-gronkowski-attend-youtube-brandcast-2025-at-david-geffen.png',
  'santa-monica-california-dee-choubey-mrbeast-and-bill-davaris-attend-as-mrbeast-celebrates-the.png',
];

/**
 * Fetch a sample file from /public/sample-images/ and return a File object
 */
async function fetchSampleFile(filename) {
  const base = import.meta.env.BASE_URL || './';
  const url = `${base}sample-images/${filename}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load sample: ${filename}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

function App() {
  // Reference photos state
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [isReferenceUploaded, setIsReferenceUploaded] = useState(false);
  const [isUploadingReference, setIsUploadingReference] = useState(false);

  // Class photo state
  const [classPhoto, setClassPhoto] = useState(null);
  const [classPhotoPreview, setClassPhotoPreview] = useState(null);
  const [isClassPhotoUploaded, setIsClassPhotoUploaded] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState('');

  // Processing / results state
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [csvFilename, setCsvFilename] = useState('');
  const [error, setError] = useState('');

  // View step
  const [currentStep, setCurrentStep] = useState('upload');

  // File input refs
  const referenceInputRef = useRef(null);
  const classPhotoInputRef = useRef(null);

  // ─── Reference photo handlers ──────────────────────────────────────
  const handleReferenceChange = (e) => {
    setReferenceFiles(Array.from(e.target.files));
  };

  const handleUploadReference = async () => {
    if (!referenceFiles.length) {
      toast.error('Please select reference photos first');
      return;
    }
    setIsUploadingReference(true);
    setError('');
    const t = toast.loading(`Uploading ${referenceFiles.length} reference photos...`);
    try {
      await uploadReferencePhotos(referenceFiles);
      setIsReferenceUploaded(true);
      toast.success(`Uploaded ${referenceFiles.length} reference photos`, { id: t });
    } catch (err) {
      toast.error('Failed to upload reference photos', { id: t });
      setError('Failed to upload reference photos. Please try again.');
    } finally {
      setIsUploadingReference(false);
    }
  };

  // ─── Load sample reference photos ─────────────────────────────────
  const handleLoadSampleReference = async () => {
    const t = toast.loading('Loading sample reference photos...');
    try {
      const files = await Promise.all(SAMPLE_REF_FILES.map(fetchSampleFile));
      setReferenceFiles(files);
      setIsReferenceUploaded(false);
      toast.success('Loaded 4 sample reference photos (101–104)', { id: t });
    } catch (err) {
      toast.error('Failed to load sample images', { id: t });
      console.error(err);
    }
  };

  // ─── Class photo handlers ──────────────────────────────────────────
  const handleClassPhotoChange = (e) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setClassPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setClassPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadClassPhoto = async () => {
    if (!classPhoto) {
      toast.error('Please select a class photo first');
      return;
    }
    setIsClassPhotoUploaded(false);
    setError('');
    const t = toast.loading('Uploading class photo...');
    try {
      const res = await uploadClassPhoto(classPhoto);
      setUploadedFilename(res.filename);
      setIsClassPhotoUploaded(true);
      toast.success('Class photo uploaded!', { id: t });
    } catch (err) {
      toast.error('Failed to upload class photo', { id: t });
      setError('Failed to upload class photo. Please try again.');
    }
  };

  // ─── Load sample class photo ───────────────────────────────────────
  const handleLoadSampleClass = async () => {
    // Pick a random one from the two available
    const pick = SAMPLE_CLASS_FILES[Math.floor(Math.random() * SAMPLE_CLASS_FILES.length)];
    const t = toast.loading('Loading sample class photo...');
    try {
      const file = await fetchSampleFile(pick);
      setClassPhoto(file);
      setIsClassPhotoUploaded(false);
      const reader = new FileReader();
      reader.onload = (ev) => setClassPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
      toast.success('Sample class photo loaded!', { id: t });
    } catch (err) {
      toast.error('Failed to load sample class photo', { id: t });
      console.error(err);
    }
  };

  // ─── Process attendance ────────────────────────────────────────────
  const handleProcessAttendance = async () => {
    if (!isClassPhotoUploaded || !uploadedFilename) {
      toast.error('Please upload a class photo first');
      return;
    }
    setIsProcessing(true);
    setError('');
    const t = toast.loading('Analyzing class photo...');

    try {
      const res = await processAttendance(uploadedFilename);
      setAttendanceData(res.records);
      setCsvFilename(res.csv_filename);
      toast.success(`Found ${res.records.length} students!`, { id: t });
    } catch (err) {
      toast.error('Failed to process attendance', { id: t });
      setError('Failed to process attendance. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // When processing completes, switch to results
  const handleProcessAndNavigate = async () => {
    setCurrentStep('processing');
    await handleProcessAttendance();
    // After processing, nav to results (or back to upload on failure)
    setCurrentStep(attendanceData.length > 0 ? 'results' : 'upload');
  };

  // Because attendanceData is set asynchronously and we need the new value:
  const handleProcessClick = async () => {
    if (!isClassPhotoUploaded || !uploadedFilename) {
      toast.error('Please upload a class photo first');
      return;
    }
    setIsProcessing(true);
    setCurrentStep('processing');
    setError('');
    const t = toast.loading('Analyzing class photo...');

    try {
      const res = await processAttendance(uploadedFilename);
      setAttendanceData(res.records);
      setCsvFilename(res.csv_filename);
      toast.success(`Found ${res.records.length} students!`, { id: t });
      setCurrentStep('results');
    } catch (err) {
      toast.error('Failed to process attendance', { id: t });
      setError('Failed to process attendance. Please check the backend is running.');
      console.error(err);
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen">
      <HotToaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(17,25,45,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#f1f5f9',
            fontSize: '0.85rem',
            borderRadius: '0.65rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          },
        }}
      />

      <Navbar
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        attendanceData={attendanceData}
      />

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
        {/* Error Banner */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              marginBottom: '1.5rem',
              padding: '0.875rem 1.25rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderLeft: '4px solid #ef4444',
              borderRadius: '0.65rem',
              color: '#fca5a5',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <main style={{ maxWidth: '80rem', margin: '0 auto' }}>

          {/* ── UPLOAD STEP ── */}
          {currentStep === 'upload' && (
            <div className="space-y-6 animate-fade-in">

              {/* Hero Header */}
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '9999px',
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  color: '#a78bfa',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}>
                  <Cpu size={11} />
                  AI-Powered Face Recognition
                </div>
                <h1 style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  fontWeight: 800,
                  color: '#f1f5f9',
                  lineHeight: 1.2,
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.025em',
                }}>
                  Attendance {' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}>
                    in Seconds
                  </span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '34rem', margin: '0 auto' }}>
                  Upload reference photos and a class photo — our AI identifies every student automatically.
                </p>
              </div>

              {/* Upload Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '1.25rem', alignItems: 'start' }}>
                <UploadCard
                  title="Reference Photos"
                  description="Upload one photo per student, named with their ID (e.g. 101.png). We'll use these to identify faces."
                  icon={Upload}
                  files={referenceFiles}
                  isUploaded={isReferenceUploaded}
                  isUploading={isUploadingReference}
                  onDrop={(e) => {
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length) setReferenceFiles(files);
                  }}
                  onUpload={handleUploadReference}
                  inputRef={referenceInputRef}
                  onChange={handleReferenceChange}
                  multiple={true}
                  onLoadSample={handleLoadSampleReference}
                  sampleLabel="Load Sample Reference Photos (101–104)"
                />

                <UploadCard
                  title="Class Photo"
                  description="Upload a group photo of your class. The AI will detect and match every face present."
                  icon={Camera}
                  files={classPhoto ? [classPhoto] : []}
                  isUploaded={isClassPhotoUploaded}
                  isUploading={false}
                  preview={classPhotoPreview}
                  onDrop={(e) => {
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setClassPhoto(file);
                      const r = new FileReader();
                      r.onload = (ev) => setClassPhotoPreview(ev.target.result);
                      r.readAsDataURL(file);
                    }
                  }}
                  onUpload={handleUploadClassPhoto}
                  inputRef={classPhotoInputRef}
                  onChange={handleClassPhotoChange}
                  onLoadSample={handleLoadSampleClass}
                  sampleLabel="Load Sample Class Photo"
                />
              </div>

              {/* Process Button */}
              {isClassPhotoUploaded && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }} className="animate-fade-in-up">
                  <div style={{ position: 'relative' }}>
                    {/* Glow */}
                    <div style={{
                      position: 'absolute',
                      inset: '-4px',
                      borderRadius: '0.9rem',
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      filter: 'blur(12px)',
                      opacity: 0.5,
                      animation: 'pulse 2s ease-in-out infinite',
                    }} />
                    <Button
                      variant="gradient"
                      onClick={handleProcessClick}
                      disabled={!isClassPhotoUploaded || isProcessing}
                      style={{
                        position: 'relative',
                        padding: '0.875rem 2.5rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        height: 'auto',
                        borderRadius: '0.85rem',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {isProcessing ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{
                            width: '1rem', height: '1rem', borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: 'white',
                            animation: 'spin 0.7s linear infinite',
                            display: 'inline-block',
                          }} />
                          Processing...
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Cpu size={16} />
                          Process Attendance
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROCESSING STEP ── */}
          {currentStep === 'processing' && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <ProcessingCard />
            </div>
          )}

          {/* ── RESULTS STEP ── */}
          {currentStep === 'results' && attendanceData.length > 0 && (
            <AttendanceResults
              attendanceData={attendanceData}
              csvFilename={csvFilename}
            />
          )}
        </main>

        {/* Footer */}
        <footer style={{
          marginTop: '4rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center',
          color: '#334155',
          fontSize: '0.8rem',
        }}>
          <p>AI Attendance System &copy; {new Date().getFullYear()} &nbsp;·&nbsp; Powered by DeepFace</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
