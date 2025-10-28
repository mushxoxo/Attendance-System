import { useState } from "react";
import { Upload, Camera, Users } from "lucide-react";
import Loader from "./Loader";

const UploadSection = ({ 
  onUploadReference, 
  onUploadClassPhoto, 
  onProcessAttendance, 
  isLoading, 
  classPhotoPreview,
  isProcessing,
  isReferenceUploaded,
  isClassPhotoUploaded
}) => {
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [classPhoto, setClassPhoto] = useState(null);

  const handleReferenceChange = (e) => {
    setReferenceFiles(Array.from(e.target.files));
  };

  const handleClassPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setClassPhoto(e.target.files[0]);
      onUploadClassPhoto(e.target.files[0]);
    }
  };

  const handleReferenceUpload = () => {
    if (referenceFiles.length > 0) {
      onUploadReference(referenceFiles);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Reference Photos Upload */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          Reference Photos
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          Upload reference photos of students. Each file should be named with the student ID (e.g., student123.jpg).
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-500">Select reference photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleReferenceChange}
              />
            </div>
          </label>
          
          <button
            onClick={handleReferenceUpload}
            disabled={referenceFiles.length === 0 || isLoading}
            className={`px-4 py-2 rounded-md ${
              referenceFiles.length === 0 || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } transition-colors`}
          >
            {isLoading ? <Loader size={20} color="#fff" /> : "Upload References"}
          </button>
        </div>
        
        {referenceFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {referenceFiles.length} file(s) selected
            </p>
            <ul className="mt-2 text-xs text-gray-500 max-h-20 overflow-y-auto">
              {referenceFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
        
        {isReferenceUploaded && (
          <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-md text-sm">
            Reference photos uploaded successfully!
          </div>
        )}
      </div>

      {/* Class Photo Upload */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Camera size={20} className="text-blue-600" />
          Class Photo
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          Upload a photo of the class to process attendance.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-500">Select class photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleClassPhotoChange}
              />
            </div>
          </label>
          
          <button
            onClick={onProcessAttendance}
            disabled={!isClassPhotoUploaded || isProcessing}
            className={`px-4 py-2 rounded-md ${
              !isClassPhotoUploaded || isProcessing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            } transition-colors`}
          >
            {isProcessing ? <Loader size={20} color="#fff" /> : "Process Attendance"}
          </button>
        </div>
        
        {classPhotoPreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="relative max-h-60 overflow-hidden rounded-md">
              <img
                src={classPhotoPreview}
                alt="Class Photo Preview"
                className="w-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
