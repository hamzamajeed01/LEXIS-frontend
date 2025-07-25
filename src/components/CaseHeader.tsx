'use client';

import { Case, Document } from '@/types';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { 
  FolderIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface CaseHeaderProps {
  currentCase: Case;
  documents: Document[];
  activeTab: 'documents' | 'chat';
  onTabChange: (tab: 'documents' | 'chat') => void;
}

export default function CaseHeader({ 
  currentCase, 
  documents, 
  activeTab, 
  onTabChange 
}: CaseHeaderProps) {
  // Safety check for currentCase
  if (!currentCase) {
    return null;
  }

  // Ensure documents is always an array
  const safeDocuments = Array.isArray(documents) ? documents : [];
  
  const completedDocs = safeDocuments.filter(d => d?.processing_status === 'completed').length;
  const pendingDocs = safeDocuments.filter(d => d?.processing_status === 'pending').length;
  const failedDocs = safeDocuments.filter(d => d?.processing_status === 'failed').length;
  
  const totalSize = safeDocuments.reduce((sum, doc) => sum + (doc?.file_size || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white border-b border-legal-200">
      {/* Case Info */}
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FolderIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-legal-900">
                  {currentCase.title}
                </h1>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full border',
                  getStatusColor(currentCase.status)
                )}>
                  {currentCase.status}
                </span>
              </div>
              {currentCase.description && (
                <p className="text-legal-600 mt-1 max-w-2xl">
                  {currentCase.description}
                </p>
              )}
              <div className="flex items-center space-x-6 mt-3 text-sm text-legal-500">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Created {formatDate(currentCase?.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>Updated {formatDate(currentCase?.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Case Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-legal-900">
                {safeDocuments.length}
              </div>
              <div className="text-xs text-legal-500">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedDocs}
              </div>
              <div className="text-xs text-legal-500">Processed</div>
            </div>
            {pendingDocs > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingDocs}
                </div>
                <div className="text-xs text-legal-500">Pending</div>
              </div>
            )}
            {failedDocs > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {failedDocs}
                </div>
                <div className="text-xs text-legal-500">Failed</div>
              </div>
            )}
            {totalSize > 0 && (
              <div className="text-center">
                <div className="text-lg font-semibold text-legal-700">
                  {formatFileSize(totalSize)}
                </div>
                <div className="text-xs text-legal-500">Total Size</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => onTabChange('documents')}
            className={cn(
              'flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'documents'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-legal-500 hover:text-legal-700 hover:border-legal-300'
            )}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>Documents</span>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              activeTab === 'documents'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-legal-100 text-legal-500'
            )}>
              {safeDocuments.length}
            </span>
          </button>
          
          <button
            onClick={() => onTabChange('chat')}
            className={cn(
              'flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'chat'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-legal-500 hover:text-legal-700 hover:border-legal-300'
            )}
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span>Chat</span>
          </button>
        </nav>
      </div>
    </div>
  );
} 