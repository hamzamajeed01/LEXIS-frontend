'use client';

import { useAppStore } from '@/store/useAppStore';
import { cn, formatDate } from '@/lib/utils';
import { 
  XMarkIcon,
  DocumentTextIcon,
  StarIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

export default function CitationModal() {
  const { selectedCitation, setSelectedCitation, citationModalOpen, setCitationModalOpen } = useAppStore();

  const handleClose = () => {
    setSelectedCitation(null);
    setCitationModalOpen(false);
  };

  if (!selectedCitation) return null;

  const documentName = selectedCitation.document_name || selectedCitation.documentTitle || 'Document Not Found';
  const pageNumber = selectedCitation.page_number || selectedCitation.page || 1;
  const relevanceScore = selectedCitation.score || 0;
  const content = selectedCitation.full_content || selectedCitation.content || selectedCitation.relevantSourceText || '';

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(
      `"${content}" - ${documentName}, Page ${pageNumber} (Relevance: ${(relevanceScore * 100).toFixed(1)}%)`
    );
  };

  return (
    <>
      {citationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legal-50 to-legal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-legal-500 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-legal-900">Source Citation</h2>
                    <p className="text-sm text-legal-600">Document reference and content</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-legal-200 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-5 w-5 text-legal-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Key Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Document Name */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Document</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-900 truncate" title={documentName}>
                    {documentName}
                  </p>
                </div>

                {/* Page Number */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Page</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {pageNumber}
                  </p>
                </div>

                {/* Relevance Score */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <StarIcon className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Relevance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-bold text-amber-900">
                      {(relevanceScore * 100).toFixed(1)}%
                    </p>
                    <div className="flex-1 bg-amber-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${relevanceScore * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Source Text</h3>
                  <button
                    onClick={handleCopyCitation}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-legal-100 hover:bg-legal-200 text-legal-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    <span>Copy Citation</span>
                  </button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {content || 'No content available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Citation information extracted from document analysis
                </p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-legal-600 hover:bg-legal-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 