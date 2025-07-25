// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Case Types
export interface Case {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  qdrant_collection_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseRequest {
  title: string;
  description?: string;
  user_id?: string;
}

export interface CaseWithDetails extends Case {
  documents: Document[];
  processing_status: ProcessingStatus;
}

// Document Types
export interface Document {
  id: string;
  case_id: string;
  filename: string;
  file_size: number;
  file_extension: string;
  raw_text?: string;
  processing_status: 'pending' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  case_id: string;
  chunk_text: string;
  chunk_number: number;
  page_number?: number;
  token_count: number;
  qdrant_point_id?: string;
  created_at: string;
  document_name?: string;
}

export interface ProcessingStatus {
  total_documents: number;
  status_counts: {
    pending: number;
    completed: number;
    failed: number;
  };
  documents: Document[];
}

// Update the UploadResponse interface to match backend
export interface UploadResponse {
  success: boolean;
  message?: string;
  successful_documents: any[];
  failed_documents: any[];
  total_chunks?: number;
  total_tokens?: number;
  successful_count: number;
  failed_count: number;
}

// Chat Types
export interface ChatThread {
  id: string;
  case_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface Citation {
  chunk_id: string;
  content: string;
  full_content: string;
  page_number?: number;
  chunk_number: number;
  document_id: string;
  document_name: string;
  case_id: string;
  score?: number;
  // Additional fields for expanded citation view
  id: string;
  documentId: string;
  documentTitle: string;
  relevantSourceText: string;
  page: number;
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  chunk_number: number;
  page_number?: number;
  document_id: string;
  document_name: string;
  case_id: string;
  search_type: 'semantic' | 'keyword';
  metadata: Record<string, any>;
}

export interface ChatRequest {
  thread_id: string;
  query: string;
  case_id: string;
  document_ids?: string[];
}

export interface ChatResponse {
  success: boolean;
  content: string;
  citations: Citation[];
  search_results_count: number;
  message_id?: string;
}

export interface StreamingChatChunk {
  type: 'status' | 'content' | 'complete' | 'error' | 'done';
  message?: string;
  content?: string;
  citations?: Citation[];
  search_results_count?: number;
  message_id?: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  currentCase: Case | null;
  currentThread: ChatThread | null;
  isLoading: boolean;
  error: string | null;
}

export interface UploadState {
  files: File[];
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  uploadSuccess: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  streamingContent: string;
  citations: Citation[];
  selectedCitation: Citation | null;
}

// Form Types
export interface CreateCaseForm {
  title: string;
  description: string;
}

export interface ChatForm {
  query: string;
}

// Hook Types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseUploadResult {
  uploadFiles: (files: File[], caseId: string) => Promise<void>;
  uploadState: UploadState;
  resetUpload: () => void;
}

export interface UseChatResult {
  messages: ChatMessage[];
  sendMessage: (query: string) => Promise<void>;
  isLoading: boolean;
  streamingContent: string;
  citations: Citation[];
  selectedCitation: Citation | null;
  setSelectedCitation: (citation: Citation | null) => void;
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  cases: Case[];
  currentCase: Case | null;
  onCaseSelect: (caseItem: Case) => void;
  onCreateCase: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface DocumentListProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  onDocumentDelete: (documentId: string) => void;
  isLoading: boolean;
}

export interface ChatInterfaceProps {
  thread: ChatThread | null;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export interface FileUploadProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
}

export interface CitationModalProps {
  citation: Citation | null;
  isOpen: boolean;
  onClose: () => void;
}

// Environment Types
export interface EnvironmentConfig {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Store Types (for Zustand)
export interface AppStore {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Current selections
  currentCase: Case | null;
  currentThread: ChatThread | null;
  setCurrentCase: (caseItem: Case | null) => void;
  setCurrentThread: (thread: ChatThread | null) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Data
  cases: Case[];
  setCases: (cases: Case[]) => void;
  addCase: (caseItem: Case) => void;
  updateCase: (caseId: string, updates: Partial<Case>) => void;
  removeCase: (caseId: string) => void;
  
  // Chat
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  
  // Citations
  selectedCitation: Citation | null;
  setSelectedCitation: (citation: Citation | null) => void;
} 