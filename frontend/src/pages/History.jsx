import { useState, useEffect } from "react";
import axios from "axios";
import { Download, RefreshCw, FileText } from "lucide-react";
import Loader from "../components/Loader";

const API_URL = "http://localhost:8000";

const History = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/attendance-records`);
      setRecords(response.data.records || []);
    } catch (err) {
      setError("Failed to fetch attendance records. Please try again.");
      console.error("Error fetching attendance records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const handleDownloadCSV = async (filename) => {
    try {
      const response = await axios.get(`${API_URL}/download-csv/${filename}`, {
        responseType: "blob",
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download CSV. Please try again.");
      console.error("Error downloading CSV:", err);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Attendance History</h1>
        <p className="text-gray-600 mt-2">View and download past attendance records</p>
      </header>

      {error && (
        <div className="w-full max-w-4xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <h2 className="text-xl font-semibold">Attendance Records</h2>
          <button
            onClick={fetchAttendanceRecords}
            className="flex items-center gap-2 bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader size={40} />
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.created)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(record.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDownloadCSV(record.filename)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
