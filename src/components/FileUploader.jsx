import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../utils/FormatSize";

const FileUploader = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0] || null;
    setSelectedFile(file);
    onFileSelect?.(file);
  }, [onFileSelect]);

  const handleRemove = (e) => {
    e.stopPropagation(); 
    setSelectedFile(null);
    onFileSelect?.(null); 
  };

  const maxFileSize = 20 * 1024 * 1024; // 20MB

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: maxFileSize
  });

  const file = selectedFile;

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
          {file ? (
            <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
              <img src="/images/pdf.png" alt="PDF" className="size-10" />
              
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 max-w-xs truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>


              <button 
                type="button"
                className="p-2 hover:bg-red-50 rounded-full transition-colors" 
                onClick={handleRemove}
              >
                <span className="text-red-500 text-xl font-bold">×</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                <img src="/icons/info.svg" alt="Upload" className="size-20" />
              </div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-lg text-gray-500">
                PDF (max {formatSize(maxFileSize)})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;