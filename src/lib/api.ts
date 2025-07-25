import { 
  Case, 
  Document, 
  ChatThread, 
  ChatMessage, 
  CreateCaseRequest, 
  ChatRequest, 
  ChatResponse,
  Citation,
  ProcessingStatus,
  UploadResponse,
  ApiResponse,
  StreamingChatChunk
} from '@/types';

// Type for the secure API request function from AuthProvider
type SecureApiRequest = (url: string, options?: RequestInit) => Promise<Response>;

class ApiService {
  private secureApiRequest: SecureApiRequest | null = null;

  // ✅ SECURE: Set the AuthProvider's apiRequest method
  setAuthApiRequest(apiRequest: SecureApiRequest) {
    this.secureApiRequest = apiRequest;
  }

  // ✅ SECURE: All API calls now go through AuthProvider with automatic token refresh
  private async request(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.secureApiRequest) {
      throw new Error('API service not initialized. Please ensure AuthProvider is loaded.');
    }
    return this.secureApiRequest(url, options);
  }

  // Helper to handle JSON responses
  private async handleJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Case Management
  async getCases(): Promise<Case[]> {
    const response = await this.request('/api/cases');
    const data = await this.handleJsonResponse(response);
    return (data as any).cases || [];
  }

  async getCase(caseId: string): Promise<{
    case: Case;
    documents: Document[];
    processing_status: any;
  }> {
    const response = await this.request(`/api/cases/${caseId}`);
    return this.handleJsonResponse(response);
  }

  async createCase(data: CreateCaseRequest): Promise<Case> {
    const response = await this.request('/api/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await this.handleJsonResponse(response) as any;
    return result.case;
  }

  async updateCase(caseId: string, data: Partial<Case>): Promise<Case> {
    const response = await this.request(`/api/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.handleJsonResponse(response);
  }

  async getCaseProcessingStatus(caseId: string): Promise<any> {
    const response = await this.request(`/api/cases/${caseId}/processing-status`);
    return this.handleJsonResponse(response);
  }

    // Document Management
  async uploadDocuments(caseId: string, files: File[], onProgress?: (progress: number) => void): Promise<UploadResponse> {
    if (!this.secureApiRequest) {
      throw new Error('API service not initialized. Please ensure AuthProvider is loaded.');
    }

    const formData = new FormData();
    formData.append('case_id', caseId);
    files.forEach(file => formData.append('files', file));

    // Simulate smooth progress since we can't track real upload progress with fetch + auth
    if (onProgress) {
      // Start progress simulation
      this.simulateUploadProgress(onProgress);
    }

    try {
      const response = await this.secureApiRequest('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (onProgress) onProgress(100);

      const result = await this.handleJsonResponse(response) as any;

      // Map the response format to UploadResponse
      return {
        success: result.success,
        message: result.message,
        successful_documents: result.results || [],
        failed_documents: result.failed || [],
        total_chunks: result.total_chunks,
        total_tokens: result.total_tokens,
        successful_count: result.successful_files || 0,
        failed_count: result.failed_files || 0
      };
    } catch (error) {
      if (onProgress) onProgress(0); // Reset on error
      throw error;
    }
  }

  // Simulate upload progress for better UX
  private simulateUploadProgress(onProgress: (progress: number) => void): void {
    const steps = [5, 15, 30, 45, 60, 75, 85, 95];
    const intervals: number[] = [200, 300, 400, 500, 600, 700, 800, 900];
    
    steps.forEach((progress, index) => {
      setTimeout(() => {
        onProgress(progress);
      }, intervals[index]);
    });
  }

  async getCaseDocuments(caseId: string): Promise<Document[]> {
    const response = await this.request(`/api/documents/${caseId}/documents`);
    return this.handleJsonResponse(response);
  }

  async getDocument(documentId: string): Promise<{
    document: Document;
    chunks: any[];
    chunk_count: number;
  }> {
    const response = await this.request(`/api/documents/${documentId}/view`);
    return this.handleJsonResponse(response);
  }

  async deleteDocument(documentId: string, caseId: string): Promise<{ message: string }> {
    const response = await this.request(`/api/documents/${documentId}?case_id=${caseId}`, {
      method: 'DELETE',
    });
    return this.handleJsonResponse(response);
  }

  async getDocumentProcessingStatus(caseId: string): Promise<{ status: ProcessingStatus }> {
    const response = await this.request(`/api/documents/${caseId}/processing-status`);
    return this.handleJsonResponse(response);
  }

  async getDocumentChunks(documentId: string): Promise<{ chunks: any[]; count: number }> {
    const response = await this.request(`/api/documents/${documentId}/chunks`);
    return this.handleJsonResponse(response);
  }

  // Chat API
  async chatWithCase(caseId: string, query: string, userId: string = 'default-user'): Promise<{
    response: string;
    citations: Citation[];
    search_results_count: number;
    message_id: string;
  }> {
    const response = await this.request('/api/chat/chat', {
      method: 'POST',
      body: JSON.stringify({
        case_id: caseId,
        query: query,
        user_id: userId
      }),
    });
    
    const result = await this.handleJsonResponse(response) as any;
    
    // Map Python backend citation format to frontend Citation interface
    const mappedCitations = (result.citations || []).map((citation: any) => ({
      chunk_id: citation.chunk_id || citation.id || '',
      content: citation.content || '',
      full_content: citation.content || '',
      page_number: citation.page_number || 1,
      chunk_number: citation.chunk_number || 0,
      document_id: citation.document_id || '',
      document_name: citation.document_name || citation.document_id || 'Unknown Document',
      case_id: caseId,
      score: citation.score || 0,
      id: citation.chunk_id || citation.id || '',
      documentId: citation.document_id || '',
      documentTitle: citation.document_name || citation.document_id || 'Unknown Document',
      relevantSourceText: citation.content || '',
      page: citation.page_number || 1,
    }));
    
    return {
      response: result.response,
      citations: mappedCitations,
      search_results_count: result.search_results_count,
      message_id: result.message_id
    };
  }

  async getChatHistory(caseId: string, limit: number = 50): Promise<{
    messages: ChatMessage[];
    count: number;
  }> {
    const response = await this.request(`/api/chat/history/${caseId}?limit=${limit}`);
    return this.handleJsonResponse(response);
  }

  async streamChatWithDocuments(
    request: ChatRequest,
    onChunk: (chunk: StreamingChatChunk) => void,
    onError: (error: string) => void,
    onComplete: () => void
  ): Promise<void> {
    if (!this.secureApiRequest) {
      throw new Error('API service not initialized');
    }

    try {
      const response = await this.secureApiRequest('/api/chat/chat', {
        method: 'POST',
        headers: {
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data.trim() === '') continue;
            
            try {
              const parsedData: StreamingChatChunk = JSON.parse(data);
              onChunk(parsedData);
              
              if (parsedData.type === 'done' || parsedData.type === 'error') {
                onComplete();
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  async getCitationDetails(chunkId: string): Promise<{ citation: Citation }> {
    const response = await this.request(`/api/chat/citations/${chunkId}`);
    return this.handleJsonResponse(response);
  }

  async searchDocuments(caseId: string, query: string, documentIds?: string[]): Promise<{
    results: any[];
    count: number;
  }> {
    const response = await this.request('/api/chat/search', {
      method: 'POST',
      body: JSON.stringify({
        case_id: caseId,
        query,
        document_ids: documentIds,
      }),
    });
    return this.handleJsonResponse(response);
  }

  // Utility methods
  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await this.request(`/api/documents/${documentId}/download`);
    return response.blob();
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.request('/api/health');
    return this.handleJsonResponse(response);
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export individual API methods for easier imports
export const {
  getCases,
  getCase,
  createCase,
  updateCase,
  getCaseProcessingStatus,
  uploadDocuments,
  getCaseDocuments,
  getDocument,
  deleteDocument,
  getDocumentProcessingStatus,
  getDocumentChunks,
  getChatHistory,
  streamChatWithDocuments,
  getCitationDetails,
  searchDocuments,
  downloadDocument,
  healthCheck,
} = apiService;

export default apiService; 