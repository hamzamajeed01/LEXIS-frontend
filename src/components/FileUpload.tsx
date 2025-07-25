'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { config, formatBytes } from '@/lib/config';
import LoadingSpinner from './LoadingSpinner';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  accept?: string;
}

export default function FileUpload({
  onUpload,
  isUploading,
  accept = '.pdf,.doc,.docx,.txt',
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const maxFiles = config.maxFilesPerUpload;
  const maxSize = config.maxFileSizeMB * 1024 * 1024; // Convert MB to bytes

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${config.maxFileSizeMB}MB (${formatBytes(maxSize)}).Its been removed from the list automatically`;
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = accept.split(',').map(type => type.trim().toLowerCase());
    
    if (!acceptedTypes.includes(extension)) {
      return `File "${file.name}" has an unsupported format. Accepted formats: ${accept}`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Process accepted files
    acceptedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Process rejected files
    rejectedFiles.forEach(({ file, errors: fileErrors }) => {
      const errorMessages = fileErrors.map((error: any) => {
        if (error.code === 'file-too-large') {
          return `File "${file.name}" is too large. Maximum size is ${config.maxFileSizeMB}MB (${formatBytes(maxSize)}).Its been removed from the list automatically`;
        }
        if (error.code === 'file-invalid-type') {
          return `File "${file.name}" has an unsupported format. Accepted formats: ${accept}`;
        }
        return `File "${file.name}": ${error.message}`;
      });
      newErrors.push(...errorMessages);
    });

    // Check total files limit
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      newErrors.push(`Cannot select more than ${maxFiles} files at once. You currently have ${selectedFiles.length} files selected.`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    if (newErrors.length > 0) {
      setErrors(newErrors);
    }
  }, [selectedFiles, maxFiles, maxSize, accept]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize,
    maxFiles,
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setErrors([]);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      setErrors([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Upload Area */}
      <div className="border-2 border-dashed border-legal-200 rounded-lg overflow-hidden">
        {/* Upload Action Bar - Always Visible */}
        <div className="bg-legal-50 px-4 py-3 border-b border-legal-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CloudArrowUpIcon className="h-5 w-5 text-legal-600" />
              <div>
                <h3 className="text-sm font-medium text-legal-900">
                  Upload Documents
                </h3>
                <p className="text-xs text-legal-600">
                  {selectedFiles.length > 0 
                    ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected`
                    : `PDF,DOCX, TXT files up to ${config.maxFileSizeMB}MB (max ${config.maxFilesPerUpload} files)`
                  }
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {selectedFiles.length > 0 && !isUploading && (
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 text-xs font-medium text-legal-600 hover:text-legal-800 bg-white border border-legal-200 rounded-md hover:bg-legal-50 transition-colors"
                >
                  Clear
                </button>
              )}
              
              <button
                onClick={selectedFiles.length > 0 ? handleUpload : undefined}
                disabled={isUploading || selectedFiles.length === 0}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center space-x-2",
                  selectedFiles.length > 0 && !isUploading
                    ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                    : "bg-legal-100 text-legal-400 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Uploading...</span>
                  </>
                ) : selectedFiles.length > 0 ? (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    <span>Select Files</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          {...getRootProps()}
          className={cn(
            "relative cursor-pointer transition-colors",
            selectedFiles.length > 0 ? "p-3" : "p-8",
            isDragActive 
              ? "bg-primary-50 border-primary-300" 
              : "bg-white hover:bg-legal-25",
            isUploading && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          
          {selectedFiles.length === 0 ? (
            // Empty state
            <div className="text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-legal-400" />
              <div className="mt-4">
                <p className="text-sm font-medium text-legal-900">
                  {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
                </p>
                <p className="text-xs text-legal-500 mt-1">
                  or click to browse your computer
                </p>
              </div>
            </div>
          ) : (
            // Compact file list when files are selected
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-legal-50 border border-legal-200 rounded-lg group"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <DocumentTextIcon className="h-4 w-4 text-legal-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-legal-900 truncate">{file.name}</p>
                      <p className="text-xs text-legal-500">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 hover:bg-legal-200 rounded text-legal-400 hover:text-legal-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              
              {/* Add more files area */}
              {selectedFiles.length < maxFiles && !isUploading && (
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-legal-200 rounded-lg text-center hover:border-legal-300 transition-colors">
                  <div>
                    <PlusIcon className="mx-auto h-6 w-6 text-legal-400" />
                    <p className="text-xs text-legal-500 mt-1">Add more</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="sm" />
            <div>
              <p className="text-sm font-medium text-blue-900">Processing documents...</p>
              <p className="text-xs text-blue-700">
                Uploading and extracting text from document(s). This may take a few moments.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 