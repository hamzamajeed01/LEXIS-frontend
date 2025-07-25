'use client';

import { Citation } from '@/types';
import { 
  XMarkIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface RawTextModalProps {
  citation: Citation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RawTextModal({ citation, isOpen, onClose }: RawTextModalProps) {
  if (!isOpen || !citation) return null;

  const documentName = citation.document_name || citation.documentTitle || 'Unknown Document';
  const pageNumber = citation.page_number || citation.page || 1;
  const chunkNumber = citation.chunk_number || 0;
  const content = citation.content || citation.relevantSourceText || '';

  const handleCopyText = () => {
    navigator.clipboard.writeText(content);
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(
      `"${content}" - ${documentName}, Page ${pageNumber}`
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Raw Text Content
              </h2>
              <p className="text-sm text-gray-500">
                {documentName} • Page {pageNumber} • Chunk {chunkNumber}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {content || 'No content available'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {content.length} characters
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCopyText}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              <span>Copy Text</span>
            </button>
            
            <button
              onClick={handleCopyCitation}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              <span>Copy Citation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 