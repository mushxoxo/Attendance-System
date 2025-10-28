import { useState } from "react";
import axios from "axios";
import UploadSection from "../components/UploadSection";
import AttendanceTable from "../components/AttendanceTable";
import Loader from "../components/Loader";

const API_URL = "http://localhost:8000";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReferenceUploaded, setIsReferenceUploaded] = useState(false);
  const [isClassPhotoUploaded, setIsClassPhotoUploaded] = useState(false);
  const [classPhotoPreview, setClassPhotoPreview] = useState(null);
  const [uploadedClassPhoto, setUploadedClassPhoto] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [csvFilename, setCsvFilename] = useState("");
  const [error, setError] = useState("");

  const handleUploadReference = async (files) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post(`${API_URL}/upload-reference`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsReferenceUploaded(true);
      console.log("Reference photos uploaded:", response.data);
    } catch (err) {
      setError("Failed to upload reference photos. Please try again.");
      console.error("Error uploading reference photos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClassPhoto = async (file) => {
    if (!file) return;

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setClassPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/upload-class-photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadedClassPhoto(response.data.filename);
      setIsClassPhotoUploaded(true);
      console.log("Class photo uploaded:", response.data);
    } catch (err) {
      setError("Failed to upload class photo. Please try again.");
      console.error("Error uploading class photo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessAttendance = async () => {
    if (!uploadedClassPhoto) return;

    setIsProcessing(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/process-attendance`, {
        filename: uploadedClassPhoto,
      });

      setAttendanceData(response.data.records);
      setCsvFilename(response.data.csv_filename);
      console.log("Attendance processed:", response.data);
    } catch (err) {
      setError("Failed to process attendance. Please try again.");
      console.error("Error processing attendance:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!csvFilename) return;

    try {
      const response = await axios.get(`${API_URL}/download-csv/${csvFilename}`, {
        responseType: "blob",
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", csvFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download CSV. Please try again.");
      console.error("Error downloading CSV:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800">DeepFace Attendance System</h1>
        <p className="text-gray-600 mt-2">
          Upload reference photos and class images to process attendance using facial recognition
        </p>
      </header>

      {error && (
        <div className="w-full max-w-3xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <UploadSection
        onUploadReference={handleUploadReference}
        onUploadClassPhoto={handleUploadClassPhoto}
        onProcessAttendance={handleProcessAttendance}
        isLoading={isLoading}
        isProcessing={isProcessing}
        classPhotoPreview={classPhotoPreview}
        isReferenceUploaded={isReferenceUploaded}
        isClassPhotoUploaded={isClassPhotoUploaded}
      />

      {isProcessing ? (
        <div className="w-full max-w-3xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
          <Loader size={60} />
          <p className="mt-4 text-gray-600">Processing attendance... This may take a moment.</p>
        </div>
      ) : (
        <AttendanceTable
          attendanceData={attendanceData}
          csvFilename={csvFilename}
          onDownloadCSV={handleDownloadCSV}
        />
      )}
    </div>
  );
};

export default Home;
