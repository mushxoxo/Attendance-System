import { Download, FileSpreadsheet, User, Clock, CheckCircle, PieChart, BarChart, Users } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AttendanceTable = ({ attendanceData, csvFilename }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentCount: 0,
    averageConfidence: 0,
    highConfidenceCount: 0,
    mediumConfidenceCount: 0,
    lowConfidenceCount: 0
  });

  useEffect(() => {
    if (attendanceData && attendanceData.length > 0) {
      // Calculate statistics
      const totalConfidence = attendanceData.reduce((sum, record) => {
        // Extract numeric value from confidence string like "95.23%"
        const confidenceValue = parseFloat(record.Confidence.replace('%', ''));
        return sum + confidenceValue;
      }, 0);

      const highConfidence = attendanceData.filter(record => 
        parseFloat(record.Confidence.replace('%', '')) >= 90
      ).length;

      const mediumConfidence = attendanceData.filter(record => {
        const conf = parseFloat(record.Confidence.replace('%', ''));
        return conf >= 70 && conf < 90;
      }).length;

      const lowConfidence = attendanceData.filter(record => 
        parseFloat(record.Confidence.replace('%', '')) < 70
      ).length;

      setStats({
        totalStudents: attendanceData.length,
        presentCount: attendanceData.length,
        averageConfidence: (totalConfidence / attendanceData.length).toFixed(2),
        highConfidenceCount: highConfidence,
        mediumConfidenceCount: mediumConfidence,
        lowConfidenceCount: lowConfidence
      });
    }
  }, [attendanceData]);

  if (!attendanceData || attendanceData.length === 0) {
    return null;
  }

  const handleDownloadCSV = async () => {
    if (!csvFilename) return;
    
    setIsDownloading(true);
    const loadingToast = toast.loading('Downloading attendance CSV...');
    
    try {
      // Use direct URL for downloading the file
      const url = `http://localhost:8000/download-csv/${encodeURIComponent(csvFilename)}`;
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', csvFilename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('CSV download initiated', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to download CSV. Please try again.', { id: loadingToast });
      console.error('Error downloading CSV:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper function to determine confidence color
  const getConfidenceColor = (confidence) => {
    const value = parseFloat(confidence.replace('%', ''));
    if (value >= 90) return 'bg-green-600';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={20} />
          <h2 className="text-xl font-semibold">Attendance Results</h2>
        </div>
        {csvFilename && (
          <button
            onClick={handleDownloadCSV}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
          >
            <Download size={16} />
            <span>{isDownloading ? 'Downloading...' : 'Download CSV'}</span>
          </button>
        )}
      </div>

      {/* Statistics Dashboard */}
      <div className="p-4 bg-blue-50">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <PieChart size={18} />
          Attendance Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-500">Total Students</h4>
              <Users size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.totalStudents}</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-500">Present</h4>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.presentCount}</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-500">Avg. Confidence</h4>
              <BarChart size={16} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.averageConfidence}%</p>
          </div>
        </div>
        
        {/* Confidence Distribution */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100 mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Confidence Distribution</h4>
          <div className="flex items-center gap-1 h-6">
            <div 
              className="bg-green-600 h-full rounded-l-full" 
              style={{ width: `${(stats.highConfidenceCount / stats.totalStudents) * 100}%` }}
              title={`High confidence: ${stats.highConfidenceCount} students`}
            ></div>
            <div 
              className="bg-yellow-500 h-full" 
              style={{ width: `${(stats.mediumConfidenceCount / stats.totalStudents) * 100}%` }}
              title={`Medium confidence: ${stats.mediumConfidenceCount} students`}
            ></div>
            <div 
              className="bg-red-500 h-full rounded-r-full" 
              style={{ width: `${(stats.lowConfidenceCount / stats.totalStudents) * 100}%` }}
              title={`Low confidence: ${stats.lowConfidenceCount} students`}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>High (≥90%): {stats.highConfidenceCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Medium (70-89%): {stats.mediumConfidenceCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Low (&lt;70%): {stats.lowConfidenceCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <User size={14} />
                <span>Student ID</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle size={14} />
                <span>Status</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Clock size={14} />
                <span>Timestamp</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.map((record, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-blue-50 transition-colors"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.Student_ID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {record.Status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`${getConfidenceColor(record.Confidence)} h-2.5 rounded-full`}
                        style={{ width: record.Confidence }}
                      ></div>
                    </div>
                    <span>{record.Confidence}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.Timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
