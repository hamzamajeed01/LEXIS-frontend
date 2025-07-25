'use client';

import { Document } from '@/types';
import { cn, formatDate, formatFileSize, getFileExtension } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';
import { 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  HardDrive
} from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  selectedDocument?: Document | null;
  onDocumentSelect: (document: Document) => void;
  onDocumentDelete: (documentId: string) => void;
  isLoading?: boolean;
}

export default function DocumentList({
  documents,
  selectedDocument,
  onDocumentSelect,
  onDocumentDelete,
  isLoading = false
}: DocumentListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-processing';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-pending';
    }
  };

  const getFileTypeIcon = (extension: string) => {
    const ext = extension.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-slate-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Documents Yet</h3>
        <p className="text-slate-600 max-w-sm">
          Upload legal documents to start analyzing and chatting with your case files using AI.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {documents.map((document) => (
          <div
            key={document.id}
            onClick={() => onDocumentSelect(document)}
            className="group bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              {/* File Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                  {getFileTypeIcon(document.file_extension)}
                </div>
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-900 transition-colors">
                      {document.filename}
                    </h3>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <HardDrive className="h-3 w-3" />
                        <span>{formatFileSize(document.file_size)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(document.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          {document.file_extension.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0 ml-4">
                    <div className={cn(
                      "inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium",
                      getStatusStyles(document.processing_status)
                    )}>
                      {getStatusIcon(document.processing_status)}
                      <span className="capitalize">{document.processing_status}</span>
                    </div>
                  </div>
                </div>

                {/* Processing Status Message */}
                {document.processing_status === 'failed' && document.error_message && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Processing Failed</p>
                        <p className="text-xs text-red-700 mt-1">{document.error_message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {document.processing_status === 'completed' && (
                  <div className="mt-3 text-xs text-slate-600">
                    <p>✅ Ready for AI analysis and chat</p>
                  </div>
                )}

                {document.processing_status === 'pending' && (
                  <div className="mt-3 text-xs text-slate-600">
                    <p>⏳ Processing document with AI...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hover Indicator */}
            <div className="mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-blue-600 font-medium">Click to view extracted text</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 