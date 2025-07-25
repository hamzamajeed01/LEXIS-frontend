'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { X, Upload, FileText, Check } from 'lucide-react';
import FileUpload from './FileUpload';
import UploadProgress from './UploadProgress';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CreateCaseModalProps {
  onCreateCase: (data: { title: string; description: string }, files: File[]) => Promise<boolean>;
}

export default function CreateCaseModal({ onCreateCase }: CreateCaseModalProps) {
  const { createCaseModalOpen, setCreateCaseModalOpen } = useAppStore();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentStep, setCurrentStep] = useState<'details' | 'documents'>('details');
  
  // Document upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Processing state
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  const resetModal = () => {
    setTitle('');
    setDescription('');
    setCurrentStep('details');
    setSelectedFiles([]);
    setIsUploading(false);
    setShowUploadProgress(false);
    setUploadProgress(0);
    setProcessingFiles([]);
    setCompletedFiles([]);
    setFailedFiles([]);
  };

  const handleClose = () => {
    setCreateCaseModalOpen(false);
    resetModal();
  };

  const handleNext = () => {
    if (!title.trim()) {
      toast.error('Please enter a case title');
      return;
    }
    setCurrentStep('documents');
  };

  const handleBack = () => {
    setCurrentStep('details');
  };

  const handleFileUpload = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleCreateCase = async () => {
    if (!title.trim()) {
      toast.error('Please enter a case title');
      return;
    }

    setIsUploading(true);
    setShowUploadProgress(true);
    setUploadProgress(0);
    setProcessingFiles(selectedFiles.map(f => f.name));
    setCompletedFiles([]);
    setFailedFiles([]);

    try {
      const success = await onCreateCase({ title, description }, selectedFiles);
      
      if (success) {
        setUploadProgress(100);
        setProcessingFiles([]);
        setCompletedFiles(selectedFiles.map(f => f.name));
        
        setTimeout(() => {
          toast.success('Case created successfully!');
          handleClose();
        }, 1500);
      } else {
        setProcessingFiles([]);
        setFailedFiles(selectedFiles.map(f => f.name));
        toast.error('Failed to create case');
      }
    } catch (error) {
      setProcessingFiles([]);
      setFailedFiles(selectedFiles.map(f => f.name));
      toast.error('Error creating case');
    } finally {
      setIsUploading(false);
    }
  };

  if (!createCaseModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-legal-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-legal-900">Create New Case</h2>
                <p className="text-legal-600 mt-1">
                  {currentStep === 'details' 
                    ? 'Enter the basic information for your new case'
                    : 'Upload documents that will be processed and analyzed'
                  }
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="text-legal-400 hover:text-legal-600 p-2 rounded-lg hover:bg-legal-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Step indicator */}
            <div className="flex items-center space-x-4 mt-6">
              <div className={cn(
                "flex items-center space-x-2",
                currentStep === 'details' ? 'text-legal-700 font-medium' : 'text-legal-500'
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                  currentStep === 'details' ? 'bg-legal-600 text-white' : 'bg-legal-500 text-white'
                )}>
                  {currentStep === 'documents' ? <Check className="h-4 w-4" /> : '1'}
                </div>
                <span className="text-sm">Details</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-legal-500" />
              
              <div className={cn(
                "flex items-center space-x-2",
                currentStep === 'documents' ? 'text-legal-700 font-medium' : 'text-legal-300'
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                  currentStep === 'documents' ? 'bg-legal-600 text-white' : 'bg-legal-200 text-legal-600'
                )}>
                  2
                </div>
                <span className="text-sm">Documents</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {currentStep === 'details' ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-legal-700 mb-2">
                    Case Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive title for your case"
                    className="w-full px-3 py-2 border border-legal-300 rounded-lg focus:ring-2 focus:ring-legal-500 focus:border-legal-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-legal-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional details about this case (optional)"
                    rows={4}
                    className="w-full px-3 py-2 border border-legal-300 rounded-lg focus:ring-2 focus:ring-legal-500 focus:border-legal-500"
                  />
                </div>

                <div className="bg-legal-50 border border-legal-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-legal-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-legal-900">What's Next?</h4>
                      <p className="text-sm text-legal-600 mt-1">
                        After entering your case details, you'll be able to upload documents that will be automatically processed and made searchable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-legal-900 mb-2">Upload Documents</h3>
                  <p className="text-sm text-legal-600 mb-4">
                    Upload the documents for "<span className="font-medium">{title}</span>". These will be processed and made searchable.
                  </p>
                  
                  <FileUpload
                    onUpload={handleFileUpload}
                    isUploading={isUploading}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6 border border-legal-200 rounded-lg overflow-hidden">
                    <div className="bg-legal-50 px-4 py-3 border-b border-legal-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-legal-600" />
                          <h4 className="text-sm font-medium text-legal-700">
                            Selected Documents ({selectedFiles.length})
                          </h4>
                        </div>
                        {!isUploading && (
                          <button
                            onClick={() => setSelectedFiles([])}
                            className="text-xs text-legal-600 hover:text-legal-900"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-legal-200 max-h-48 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-legal-50">
                          <div className="flex items-center space-x-3 min-w-0">
                            <FileText className="h-4 w-4 text-legal-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-legal-900 truncate">{file.name}</p>
                              <p className="text-xs text-legal-500">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          {!isUploading && (
                            <button
                              onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                              className="ml-2 p-1 text-legal-400 hover:text-legal-600 rounded-full hover:bg-legal-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showUploadProgress && (
                  <UploadProgress
                    isVisible={true}
                    uploadProgress={uploadProgress}
                    processingFiles={processingFiles}
                    completedFiles={completedFiles}
                    failedFiles={failedFiles}
                    onClose={() => {}}
                  />
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-white border-t border-legal-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                {currentStep === 'documents' && (
                  <button
                    onClick={handleBack}
                    disabled={isUploading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-legal-700 bg-white border border-legal-300 rounded-lg hover:bg-legal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-legal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  disabled={isUploading}
                  className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>
                
                {currentStep === 'details' ? (
                  <button 
                    onClick={handleNext}
                    className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    onClick={handleCreateCase}
                    disabled={selectedFiles.length === 0 || isUploading}
                    className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-md hover:shadow-lg gap-2"
                  >
                    <span>Create Case</span>
                    {isUploading && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 