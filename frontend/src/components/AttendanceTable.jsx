import { Download } from "lucide-react";

const AttendanceTable = ({ attendanceData, csvFilename, onDownloadCSV }) => {
  if (!attendanceData || attendanceData.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h2 className="text-xl font-semibold">Attendance Results</h2>
        {csvFilename && (
          <button
            onClick={onDownloadCSV}
            className="flex items-center gap-2 bg-white text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.map((record, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.Student_ID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {record.Status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.Confidence}
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
