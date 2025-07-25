'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/lib/api';
import { Case, Document, ChatThread } from '@/types';
import { useAuthContext } from '@/components/AuthProvider';
import toast from 'react-hot-toast';

// Components
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CaseHeader from '@/components/CaseHeader';
import DocumentList from '@/components/DocumentList';
import ChatInterface from '@/components/ChatInterface';
import CreateCaseModal from '@/components/CreateCaseModal';
import CitationModal from '@/components/CitationModal';
import FileUpload from '@/components/FileUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import UploadProgress from '@/components/UploadProgress';
import ProtectedRoute from '@/components/ProtectedRoute';
import { X, FileText, Upload, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { config } from '@/lib/config';

function DashboardContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const {
    currentCase,
    currentThread,
    sidebarOpen,
    isLoading,
    error,
    cases,
    setCases,
    setCurrentCase,
    setCurrentThread,
    setIsLoading,
    setError,
    clearError,
  } = useAppStore();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'documents' | 'chat'>('documents');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload progress state
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [completedFiles, setCompletedFiles] = useState<string[]>([]);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);

  // Text size state
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');

  // ✅ SECURE: Load cases only when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadCases();
    }
  }, [isAuthenticated, authLoading]);

  // Load case details when currentCase changes
  useEffect(() => {
    if (currentCase) {
      loadCaseDetails(currentCase.id);
    } else {
      setDocuments([]);
    }
  }, [currentCase]);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCases();
      const cases = (response as any)?.cases || response || [];
      setCases(cases as Case[]);
      
      // Auto-select first case if available
      if (cases.length > 0 && !currentCase) {
        setCurrentCase(cases[0] as Case);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cases';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCaseDetails = async (caseId: string) => {
    try {
      // Fetch case details and chat history in parallel
      const [caseData, history] = await Promise.all([
        apiService.getCase(caseId),
        apiService.getChatHistory(caseId)
      ]);

      setDocuments((caseData as any)?.documents || []);
      useAppStore.getState().setChatMessages((history as any)?.messages || []);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load case details';
      setError(message);
      toast.error(message);
    }
  };

  const handleCreateCase = async (data: { title: string; description: string }, files: File[]): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Create the case first
      const response = await apiService.createCase(data);
      const newCase = (response as any)?.case || response;
      useAppStore.getState().addCase(newCase as Case);
      setCurrentCase(newCase as Case);
      
      // If files are provided, upload them immediately
      if (files && files.length > 0) {
        await handleFileUploadProcess(newCase.id, files);
        toast.success(`Case created with ${files.length} documents!`);
      } else {
        toast.success('Case created successfully');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create case';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploadProcess = async (caseId: string, files: File[]) => {
    setIsUploading(true);
    setShowUploadProgress(true);
    setUploadProgress(1); // Start at 1% to show progress bar immediately
    setProcessingFiles(files.map(f => f.name));
    setCompletedFiles([]);
    setFailedFiles([]);

    const startTime = Date.now();
    const minDisplayTime = 1000; // Minimum 1 second display time

    try {
      const uploadResponse = await apiService.uploadDocuments(
        caseId, 
        files, 
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      // Ensure minimum display time for progress bar
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsedTime));
      }
      
      if (uploadResponse.success) {
        setProcessingFiles([]);
        setCompletedFiles(uploadResponse.successful_documents.map(doc => doc.filename || 'Unknown'));
        setFailedFiles(uploadResponse.failed_documents.map(doc => doc.filename || 'Unknown'));
        
        if (uploadResponse.successful_count > 0) {
          await loadCaseDetails(caseId);
        }
        
        if (uploadResponse.failed_count > 0) {
          toast.error(`${uploadResponse.failed_count} documents failed to process`);
        }
      } else {
        setProcessingFiles([]);
        setFailedFiles(files.map(f => f.name));
        toast.error(uploadResponse.message || 'Document upload failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload files';
      setError(message);
      toast.error(message);
      
      setProcessingFiles([]);
      setFailedFiles(files.map(f => f.name));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!currentCase) {
      toast.error('Please select a case first');
      return;
    }
    
    await handleFileUploadProcess(currentCase.id, files);
    setShowUploadModal(false);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!currentCase) return;

    try {
      await apiService.deleteDocument(documentId, currentCase.id);
      setDocuments(docs => docs.filter(d => d.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      toast.error(message);
    }
  };

  const handleDocumentView = async (document: Document) => {
    try {
      setIsLoading(true);
      const details = await apiService.getDocument(document.id);
      setSelectedDocument(document);
      
      // Show extracted text
      setDocumentContent(details.document.raw_text || 'No content available');
      
      toast('Showing extracted text content', {
        icon: '📄',
        duration: 3000
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load document';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Loading LEXIS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Header - Fixed */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Fixed width, scrollable content */}
        <Sidebar
          cases={cases}
          currentCase={currentCase}
          onCaseSelect={setCurrentCase}
          onCreateCase={() => useAppStore.getState().setCreateCaseModalOpen(true)}
          isOpen={sidebarOpen}
          onToggle={() => useAppStore.getState().toggleSidebar()}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentCase ? (
            <>
              {/* Case Header - Fixed */}
              <CaseHeader
                currentCase={currentCase}
                documents={documents}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Content Area - Scrollable */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'documents' ? (
                  <div className="h-full flex">
                    {/* Document List */}
                    <div className={`${selectedDocument ? 'lg:w-2/5 border-r border-slate-200' : 'w-full'} h-full flex flex-col bg-white transition-all duration-300`}>
                      <div className="p-4 lg:p-6 border-b border-slate-200 bg-slate-50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
                            <p className="text-sm text-slate-600">
                              {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                            </p>
                          </div>
                          <button
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto">
                        <DocumentList
                          documents={documents}
                          selectedDocument={selectedDocument}
                          onDocumentSelect={handleDocumentView}
                          onDocumentDelete={handleDeleteDocument}
                        />
                      </div>
                    </div>

                    {/* Document Preview - Only show when document is selected */}
                    {selectedDocument && (
                      <div className="lg:w-3/5 h-full bg-white animate-fade-in">
                        <div className="h-full flex flex-col">
                          <div className="p-4 lg:p-6 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 truncate">
                                  {selectedDocument.filename}
                                </h3>
                                <p className="text-sm text-slate-600">
                                  {selectedDocument.file_extension?.toUpperCase()} • {selectedDocument.file_size ? `${(selectedDocument.file_size / 1024).toFixed(1)} KB` : 'Unknown size'} • {new Date(selectedDocument.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => setSelectedDocument(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Close preview"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>

                            {/* Document Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setTextSize(textSize === 'sm' ? 'base' : textSize === 'base' ? 'lg' : 'sm')}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                title="Change text size"
                              >
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                Text Size
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex-1 overflow-auto p-4 lg:p-6">
                            <div className={cn(
                              "prose max-w-none text-slate-700 leading-relaxed",
                              textSize === 'sm' && "text-sm",
                              textSize === 'base' && "text-base",
                              textSize === 'lg' && "text-lg"
                            )}>
                              {documentContent ? (
                                <pre className="whitespace-pre-wrap font-sans">{documentContent}</pre>
                              ) : (
                                <div className="flex items-center justify-center h-32">
                                  <LoadingSpinner size="sm" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <ChatInterface caseId={currentCase.id} isLoading={isLoading} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                title="Welcome to LEXIS"
                description="Create a new case or select an existing one to get started with AI-powered legal document analysis"
                actionLabel="Create New Case"
                onAction={() => useAppStore.getState().setCreateCaseModalOpen(true)}
                icon={<FileText className="h-16 w-16 text-slate-400" />}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateCaseModal onCreateCase={handleCreateCase} />
      <CitationModal />
      
      {/* Upload Progress Modal */}
      <UploadProgress
        isVisible={showUploadProgress}
        uploadProgress={uploadProgress}
        processingFiles={processingFiles}
        completedFiles={completedFiles}
        failedFiles={failedFiles}
        onClose={() => setShowUploadProgress(false)}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Upload Documents</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1">
              <FileUpload
                onUpload={handleFileUpload}
                isUploading={isUploading}
                accept=".pdf,.docx,.txt"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
} 