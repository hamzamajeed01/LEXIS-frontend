'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UploadProgressProps {
  isVisible: boolean;
  uploadProgress: number;
  processingFiles: string[];
  completedFiles: string[];
  failedFiles: string[];
  onClose: () => void;
}

export default function UploadProgress({
  isVisible,
  uploadProgress,
  processingFiles,
  completedFiles,
  failedFiles,
  onClose
}: UploadProgressProps) {
  if (!isVisible) return null;

  const totalFiles = processingFiles.length + completedFiles.length + failedFiles.length;
  const processedFiles = completedFiles.length + failedFiles.length;
  const processingProgress = totalFiles > 0 ? (processedFiles / totalFiles) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-legal-900">
              Processing Documents
            </h3>
            {processedFiles === totalFiles && (
              <button
                onClick={onClose}
                className="text-legal-400 hover:text-legal-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress < 100 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-legal-600">Uploading files...</span>
                <span className="text-sm text-legal-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-legal-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Processing Progress */}
          {uploadProgress >= 100 && totalFiles > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-legal-600">Processing documents...</span>
                <span className="text-sm text-legal-500">
                  {processedFiles}/{totalFiles}
                </span>
              </div>
              <div className="w-full bg-legal-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Show upload complete message briefly */}
          {uploadProgress >= 100 && processedFiles === 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-legal-600">Upload complete, processing...</span>
                <span className="text-sm text-legal-500">100%</span>
              </div>
              <div className="w-full bg-legal-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* File Status List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Processing Files */}
            {processingFiles.map((filename) => (
              <div key={filename} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-legal-700 truncate">{filename}</span>
                <span className="text-xs text-yellow-600">Processing...</span>
              </div>
            ))}

            {/* Completed Files */}
            {completedFiles.map((filename) => (
              <div key={filename} className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-legal-700 truncate">{filename}</span>
                <span className="text-xs text-green-600">Completed</span>
              </div>
            ))}

            {/* Failed Files */}
            {failedFiles.map((filename) => (
              <div key={filename} className="flex items-center space-x-3 p-2 bg-red-50 rounded">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-legal-700 truncate">{filename}</span>
                <span className="text-xs text-red-600">Failed</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          {processedFiles === totalFiles && totalFiles > 0 && (
            <div className="mt-4 p-3 bg-legal-50 rounded">
              <div className="text-sm text-legal-700">
                <strong>Processing Complete:</strong>
              </div>
              <div className="text-xs text-legal-500 mt-1">
                {completedFiles.length} successful, {failedFiles.length} failed
              </div>
              {failedFiles.length > 0 && (
                <div className="text-xs text-red-600 mt-1">
                  Failed files can be re-uploaded later
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 