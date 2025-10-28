import React from 'react';
import { Upload, Image, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';

const UploadCard = ({
  title,
  description,
  icon: Icon,
  files,
  isUploaded,
  isUploading,
  preview,
  onDrop,
  onUpload,
  inputRef,
  onChange,
  multiple = false,
  accept = "image/*"
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDrop) {
      onDrop(e);
    }
  };

  return (
    <Card className="h-full card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-blue-100 p-2">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${files?.length || preview ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-300 hover:bg-blue-50/30"}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={onChange}
            className="hidden"
          />

          {preview ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-h-48 flex items-center justify-center mb-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 rounded-md object-contain drop-shadow-sm"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Click to change image</p>
            </div>
          ) : files?.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-blue-100 p-3 mb-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-blue-600 font-medium">{files.length} file(s) selected</p>
              <p className="text-sm text-gray-500 mt-1">Click to change selection</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-gray-100 p-3 mb-2">
                {multiple ? <Upload className="h-6 w-6 text-gray-400" /> : <Image className="h-6 w-6 text-gray-400" />}
              </div>
              <p className="text-gray-600 font-medium">Drag & drop {multiple ? 'files' : 'file'} here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
            </div>
          )}
        </div>

        {/* File List */}
        {files?.length > 0 && multiple && (
          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-md p-2 border border-gray-200">
            <ul className="text-xs text-gray-600 space-y-1">
              {files.map((file, index) => (
                <li key={index} className="truncate px-2 py-1 rounded hover:bg-gray-100">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-2">
        <Button
          onClick={onUpload}
          disabled={!files?.length || isUploading}
          variant="gradient"
          className="w-full"
        >
          {isUploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <span>Upload {multiple ? 'Photos' : 'Photo'}</span>
          )}
        </Button>
        
        {isUploaded && (
          <div className="absolute -bottom-2 left-0 right-0 mx-auto w-3/4 transform translate-y-1/2 bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full flex items-center justify-center gap-1 shadow-sm animate-fade-in-up">
            <CheckCircle className="h-3 w-3" />
            <span>Uploaded successfully</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default UploadCard;
