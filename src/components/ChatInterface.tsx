'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { apiService } from '@/lib/api';
import { ChatThread, ChatMessage, Citation } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CompactCitations from './CompactCitations';
import RawTextModal from './RawTextModal';
import { 
  PaperAirplaneIcon,
  UserIcon,
  CpuChipIcon,
  DocumentTextIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

interface ChatInterfaceProps {
  caseId: string;
  isLoading: boolean;
}

export default function ChatInterface({
  caseId,
  isLoading: parentLoading
}: ChatInterfaceProps) {
  const {
    chatMessages,
    setChatMessages,
    addChatMessage,
    isTyping,
    setIsTyping,
    streamingContent,
    setStreamingContent,
    appendStreamingContent,
    clearStreamingContent,
    selectedCitation,
    setSelectedCitation,
    setCitationModalOpen,
    currentCase
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitationForRawText, setSelectedCitationForRawText] = useState<Citation | null>(null);
  const [rawTextModalOpen, setRawTextModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || !caseId || !currentCase || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      thread_id: caseId, // Using caseId instead of thread_id
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    clearStreamingContent();

    try {
      const response = await apiService.chatWithCase(caseId, input.trim());
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: response.message_id,
        thread_id: caseId,
        role: 'assistant',
        content: response.response,
        citations: response.citations,
        created_at: new Date().toISOString(),
      };

      addChatMessage(assistantMessage);
      setIsTyping(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
      setIsLoading(false);
      clearStreamingContent();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewRawText = (citation: Citation) => {
    setSelectedCitationForRawText(citation);
    setRawTextModalOpen(true);
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={cn(
          'chat-message',
          isUser ? 'user' : 'assistant'
        )}
      >
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
            isUser 
              ? 'bg-primary-100 text-primary-600' 
              : 'bg-legal-100 text-legal-600'
          )}>
            {isUser ? (
              <UserIcon className="h-4 w-4" />
            ) : (
              <CpuChipIcon className="h-4 w-4" />
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-legal-900">
                {isUser ? 'You' : 'AI Assistant'}
              </span>
              <span className="text-xs text-legal-500">
                {formatDate(message.created_at)}
              </span>
            </div>

            <div className={cn(
              'prose-legal',
              'prose prose-slate',
              'prose-headings:font-semibold prose-headings:text-legal-900',
              'prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4',
              'prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-3',
              'prose-p:text-legal-700 prose-p:leading-relaxed',
              'prose-strong:text-legal-900 prose-strong:font-semibold',
              'prose-ul:list-disc prose-ul:pl-5',
              'prose-li:text-legal-700 prose-li:my-1',
              'prose-blockquote:border-l-4 prose-blockquote:border-legal-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-legal-600',
              'max-w-none'
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom heading components
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-legal-900 mb-4 mt-6 border-b border-legal-200 pb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-legal-800 mb-3 mt-5" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-medium text-legal-700 mb-2 mt-4" {...props} />,
                  
                  // Custom citation styling
                  strong: ({node, ...props}) => {
                    const text = props.children?.toString() || '';
                    const isCitation = text.includes('(Chunk') || text.includes('Page');
                    return (
                      <strong 
                        className={cn(
                          "font-semibold",
                          isCitation && "bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-sm font-medium hover:bg-blue-100 cursor-help"
                        )}
                        {...props}
                      />
                    );
                  },
                  
                  // Other custom components
                  blockquote: ({node, ...props}) => (
                    <blockquote className="pl-4 border-l-4 border-legal-300 italic text-legal-700 my-4 bg-legal-50 py-2 pr-2 rounded-r" {...props} />
                  ),
                  code: ({node, ...props}) => (
                    <code className="bg-legal-100 text-legal-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Citations - Compact Dropdown Display */}
            {message.citations && message.citations.length > 0 && (
              <CompactCitations
                citations={message.citations}
                onCitationClick={(citation) => {
                  setSelectedCitation(citation);
                  setCitationModalOpen(true);
                }}
                onViewRawText={handleViewRawText}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!caseId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <CpuChipIcon className="h-16 w-16 text-legal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-legal-900 mb-2">
            No case selected
          </h3>
          <p className="text-legal-500">
            Select a case to start asking questions about your documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {chatMessages.length === 0 && !isTyping ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <CpuChipIcon className="h-16 w-16 text-legal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-legal-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-legal-500 mb-4">
                Ask questions about your documents and I'll provide answers with accurate citations.
              </p>
              <div className="text-left space-y-2">
                <p className="text-sm text-legal-600 font-medium">Try asking:</p>
                <ul className="text-sm text-legal-500 space-y-1">
                  <li>"What are the key points in this case?"</li>
                  <li>"Summarize the medical reports"</li>
                  <li>"What damages are mentioned?"</li>
                  <li>"When did the incident occur?"</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map(renderMessage)}
            
            {/* Streaming message */}
            {isTyping && (
              <div className="chat-message assistant">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-legal-100 text-legal-600 flex items-center justify-center">
                    <CpuChipIcon className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-legal-900">AI Assistant</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-legal-500 italic">analyzing documents</span>
                        <div className="typing-indicator flex space-x-1">
                          <div className="w-1 h-1 bg-legal-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-legal-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-legal-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="prose-legal space-y-3">
                      {/* Search indicator */}
                      <div className="flex items-center space-x-2 text-sm text-legal-600 bg-legal-50 p-2 rounded-lg">
                        <DocumentTextIcon className="h-4 w-4 text-legal-500 animate-pulse" />
                        <span>Searching through relevant documents to provide accurate information...</span>
                      </div>

                      {/* Content area */}
                      {streamingContent ? (
                        <div className="relative">
                          <div className="mt-3">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {streamingContent}
                            </ReactMarkdown>
                          </div>
                          <span className="inline-block w-1 h-5 bg-legal-400 animate-pulse ml-1" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-4 shimmer rounded w-3/4"></div>
                          <div className="h-4 shimmer rounded w-1/2"></div>
                          <div className="h-4 shimmer rounded w-5/6"></div>
                          <div className="h-4 shimmer rounded w-2/3"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-legal-200 bg-white">
        <div className="flex flex-col space-y-2">
          {isTyping && (
            <div className="flex items-center justify-center space-x-2 text-xs text-legal-500 py-1 px-3 bg-legal-50 rounded-full">
              <div className="typing-indicator flex space-x-1">
                <div className="w-1 h-1 bg-legal-400 rounded-full"></div>
                <div className="w-1 h-1 bg-legal-400 rounded-full"></div>
                <div className="w-1 h-1 bg-legal-400 rounded-full"></div>
              </div>
              <span>AI is analyzing your documents to provide a comprehensive response</span>
            </div>
          )}
          <div className="flex space-x-4">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentCase ? `Ask questions about ${currentCase.title}...` : "Ask a question..."}
              disabled={isLoading || !currentCase}
              className="flex-1 resize-none rounded-lg border border-legal-300 px-4 py-3 text-sm placeholder-legal-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || !currentCase}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Raw Text Modal */}
      {selectedCitationForRawText && (
        <RawTextModal
          citation={selectedCitationForRawText}
          isOpen={rawTextModalOpen}
          onClose={() => {
            setRawTextModalOpen(false);
            setSelectedCitationForRawText(null);
          }}
        />
      )}
    </div>
  );
} 