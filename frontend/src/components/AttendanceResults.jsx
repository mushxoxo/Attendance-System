import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, User, CheckCircle, BarChart, Users, ArrowDown, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

const AttendanceResults = ({ attendanceData, csvFilename }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Filter students based on search query
  const filteredStudents = attendanceData?.filter(record => 
    record.Student_ID.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Display only the first 5 students unless showAllStudents is true
  const displayedStudents = showAllStudents 
    ? filteredStudents 
    : filteredStudents?.slice(0, 5);

  if (!attendanceData || attendanceData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            <CardTitle className="text-xl font-bold">Attendance Results</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadCSV}
            disabled={isDownloading}
            className="bg-white text-blue-600 hover:bg-blue-50 border-none"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download CSV'}</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-blue-100">
            Found {stats.totalStudents} students in the class photo
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{stats.presentCount}</div>
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-indigo-600">{stats.averageConfidence}%</div>
              <div className="rounded-full bg-indigo-100 p-2">
                <BarChart className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confidence Distribution</CardTitle>
          <CardDescription>Recognition confidence levels across detected students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 h-6 mb-2">
            <div 
              className="bg-green-500 h-full rounded-l-full transition-all duration-500" 
              style={{ width: `${(stats.highConfidenceCount / stats.totalStudents) * 100}%` }}
              title={`High confidence: ${stats.highConfidenceCount} students`}
            ></div>
            <div 
              className="bg-amber-500 h-full transition-all duration-500" 
              style={{ width: `${(stats.mediumConfidenceCount / stats.totalStudents) * 100}%` }}
              title={`Medium confidence: ${stats.mediumConfidenceCount} students`}
            ></div>
            <div 
              className="bg-red-500 h-full rounded-r-full transition-all duration-500" 
              style={{ width: `${(stats.lowConfidenceCount / stats.totalStudents) * 100}%` }}
              title={`Low confidence: ${stats.lowConfidenceCount} students`}
            ></div>
          </div>
          <div className="flex flex-wrap justify-between text-xs text-gray-500 mt-1">
            <div className="flex items-center gap-1 mr-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>High (≥90%): {stats.highConfidenceCount}</span>
            </div>
            <div className="flex items-center gap-1 mr-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Medium (70-89%): {stats.mediumConfidenceCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Low (&lt;70%): {stats.lowConfidenceCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Present Students</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-200 pl-9 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedStudents.length > 0 ? (
            displayedStudents.map((record, index) => (
              <div 
                key={index} 
                className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{record.Student_ID}</h4>
                    <p className="text-xs text-gray-500">{record.Timestamp}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {record.Status}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getConfidenceColor(record.Confidence)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: record.Confidence }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{record.Confidence}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No students found matching your search
            </div>
          )}
          
          {/* Show more/less button */}
          {filteredStudents.length > 5 && (
            <Button 
              variant="outline"
              onClick={() => setShowAllStudents(!showAllStudents)}
              className="w-full mt-2"
            >
              <ArrowDown className={`mr-2 h-4 w-4 transition-transform duration-300 ${showAllStudents ? 'rotate-180' : ''}`} />
              <span>{showAllStudents ? 'Show Less' : `Show All (${filteredStudents.length})`}</span>
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Button 
            variant="gradient"
            onClick={handleDownloadCSV}
            disabled={isDownloading}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            <span>{isDownloading ? 'Downloading...' : 'Download Attendance CSV'}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AttendanceResults;
