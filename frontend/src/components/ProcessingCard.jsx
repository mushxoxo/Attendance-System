import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Loader } from 'lucide-react';

const ProcessingCard = () => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(66);
    }, 500);
    
    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
            <div className="relative bg-blue-50 rounded-full p-4">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Processing Attendance</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Analyzing faces and matching with reference photos. This may take a moment...
            </p>
          </div>
          
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Detecting faces</span>
              <span>Matching</span>
              <span>Generating report</span>
            </div>
          </div>
          
          <div className="text-sm text-blue-600 font-medium animate-pulse">
            Please wait...
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingCard;
