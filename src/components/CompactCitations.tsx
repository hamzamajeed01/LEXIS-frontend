'use client';

import { useState } from 'react';
import { Citation } from '@/types';
import { cn } from '@/lib/utils';
import { 
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface CompactCitationsProps {
  citations: Citation[];
  onCitationClick: (citation: Citation) => void;
  onViewRawText?: (citation: Citation) => void;
}

export default function CompactCitations({ 
  citations, 
  onCitationClick,
  onViewRawText 
}: CompactCitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyCitation = (citation: Citation, e: React.MouseEvent) => {
    e.stopPropagation();
    const documentName = citation.document_name || citation.documentTitle || 'Unknown Document';
    const pageNumber = citation.page_number || citation.page || 1;
    const content = citation.content || citation.relevantSourceText || '';
    
    navigator.clipboard.writeText(
      `"${content}" - ${documentName}, Page ${pageNumber}`
    );
  };

  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* Citations Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors rounded-t-lg"
      >
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <DocumentTextIcon className="h-5 w-5 " />
          <span className="font-medium">
            Raw Sources ({citations.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Citations List - Expandable */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white rounded-b-lg">
          <div className="max-h-64 overflow-y-auto">
            {citations.map((citation, index) => {
              const citationId = citation.id || citation.chunk_id || `citation-${index}`;
              const documentName = citation.document_name || citation.documentTitle || 'Document Not Found';
              const pageNumber = citation.page_number || citation.page || 1;
              const chunkNumber = citation.chunk_number || index + 1;
              const relevanceScore = citation.score ? Math.round(citation.score * 100) : 0;
              const content = citation.content || citation.relevantSourceText || '';
              const truncatedContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

              return (
                <div
                  key={citationId}
                  className="group border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="p-4">
                    {/* Citation Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* Citation Number */}
                        <div className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        
                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {documentName}
                            </h4>
                            {relevanceScore > 0 && (
                              <span className="flex-shrink-0 text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {relevanceScore}%
                              </span>
                            )}
                          </div>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                              Page {pageNumber}
                            </span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                              Chunk {chunkNumber}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleCopyCitation(citation, e)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Copy citation"
                        >
                          <ClipboardDocumentIcon className="h-3 w-3" />
                        </button>
                        
                        {onViewRawText && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewRawText(citation);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="View raw text"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <button
                      onClick={() => onCitationClick(citation)}
                      className="text-left w-full hover:text-gray-900 transition-colors"
                    >
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {truncatedContent}
                        {content.length > 100 && (
                          <span className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                            Read more
                          </span>
                        )}
                      </p>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 