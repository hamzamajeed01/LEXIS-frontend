import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Case, ChatThread, ChatMessage, Citation } from '@/types';

interface AppStore {
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
  clearChatMessages: () => void;
  
  // Citations
  selectedCitation: Citation | null;
  setSelectedCitation: (citation: Citation | null) => void;
  
  // Chat UI state
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  streamingContent: string;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (content: string) => void;
  clearStreamingContent: () => void;
  
  // Modal states
  createCaseModalOpen: boolean;
  setCreateCaseModalOpen: (open: boolean) => void;
  citationModalOpen: boolean;
  setCitationModalOpen: (open: boolean) => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Current selections
      currentCase: null,
      currentThread: null,
      setCurrentCase: (caseItem: Case | null) => {
        set({ 
          currentCase: caseItem,
          currentThread: null,
          chatMessages: [],
          streamingContent: '',
          selectedCitation: null
        });
      },
      setCurrentThread: (thread: ChatThread | null) => {
        set({ 
          currentThread: thread,
          chatMessages: [],
          streamingContent: '',
          selectedCitation: null
        });
      },
      
      // Loading states
      isLoading: false,
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      
      // Error handling
      error: null,
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Data
      cases: [],
      setCases: (cases: Case[]) => set({ cases }),
      addCase: (caseItem: Case) => set((state) => ({ 
        cases: [caseItem, ...state.cases] 
      })),
      updateCase: (caseId: string, updates: Partial<Case>) => set((state) => ({
        cases: state.cases.map(c => 
          c.id === caseId ? { ...c, ...updates } : c
        ),
        currentCase: state.currentCase?.id === caseId 
          ? { ...state.currentCase, ...updates }
          : state.currentCase
      })),
      removeCase: (caseId: string) => set((state) => ({
        cases: state.cases.filter(c => c.id !== caseId),
        currentCase: state.currentCase?.id === caseId ? null : state.currentCase,
        currentThread: state.currentCase?.id === caseId ? null : state.currentThread,
        chatMessages: state.currentCase?.id === caseId ? [] : state.chatMessages
      })),
      
      // Chat
      chatMessages: [],
      setChatMessages: (messages: ChatMessage[]) => set({ chatMessages: messages }),
      addChatMessage: (message: ChatMessage) => set((state) => ({
        chatMessages: [...state.chatMessages, message]
      })),
      clearChatMessages: () => set({ chatMessages: [] }),
      
      // Citations
      selectedCitation: null,
      setSelectedCitation: (citation: Citation | null) => set({ selectedCitation: citation }),
      
      // Chat UI state
      isTyping: false,
      setIsTyping: (typing: boolean) => set({ isTyping: typing }),
      streamingContent: '',
      setStreamingContent: (content: string) => set({ streamingContent: content }),
      appendStreamingContent: (content: string) => set((state) => ({
        streamingContent: state.streamingContent + content
      })),
      clearStreamingContent: () => set({ streamingContent: '' }),
      
      // Modal states
      createCaseModalOpen: false,
      setCreateCaseModalOpen: (open: boolean) => set({ createCaseModalOpen: open }),
      citationModalOpen: false,
      setCitationModalOpen: (open: boolean) => set({ citationModalOpen: open }),
      
      // Theme
      theme: 'system' as const,
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          }
          localStorage.setItem('theme', theme);
        }
      },
    }),
    {
      name: 'legal-rag-store',
    }
  )
);

// Selectors for better performance
export const useCurrentCase = () => useAppStore((state) => state.currentCase);
export const useCurrentThread = () => useAppStore((state) => state.currentThread);
export const useChatMessages = () => useAppStore((state) => state.chatMessages);
export const useSelectedCitation = () => useAppStore((state) => state.selectedCitation);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useIsTyping = () => useAppStore((state) => state.isTyping);
export const useStreamingContent = () => useAppStore((state) => state.streamingContent);

// Actions selectors
export const useAppActions = () => useAppStore((state) => ({
  setCurrentCase: state.setCurrentCase,
  setCurrentThread: state.setCurrentThread,
  addChatMessage: state.addChatMessage,
  setSelectedCitation: state.setSelectedCitation,
  setIsLoading: state.setIsLoading,
  setError: state.setError,
  clearError: state.clearError,
  toggleSidebar: state.toggleSidebar,
  setIsTyping: state.setIsTyping,
  appendStreamingContent: state.appendStreamingContent,
  clearStreamingContent: state.clearStreamingContent,
  setCreateCaseModalOpen: state.setCreateCaseModalOpen,
  setCitationModalOpen: state.setCitationModalOpen,
})); 