# Legal RAG Chatbot Frontend

A modern, responsive React Next.js frontend for the Legal RAG (Retrieval-Augmented Generation) chatbot. This application provides an intuitive interface for legal document analysis, case management, and AI-powered chat interactions.

## Features

### 🏢 Case Management
- Create and manage legal cases
- Organize documents by case
- Track processing status and statistics
- Modern sidebar navigation with search

### 📄 Document Management
- Drag-and-drop file upload with validation
- Support for PDF, DOC, DOCX, and TXT files
- Real-time processing status tracking
- Document preview and download capabilities
- File size and type validation with error handling

### 💬 AI-Powered Chat
- Streaming chat responses for real-time interaction
- Multiple chat threads per case
- Accurate citation system with source documents
- Markdown support for rich text formatting
- Context-aware responses based on uploaded documents

### 🎨 Modern UI/UX
- Beautiful, professional design with legal theme
- Responsive design for mobile and desktop
- Dark/light theme support
- Smooth animations and transitions
- Accessible components with proper ARIA labels

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Headless UI
- **Icons**: Heroicons
- **Markdown**: React Markdown with syntax highlighting
- **File Upload**: React Dropzone for drag-and-drop
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:5000

### Installation

1. **Clone and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the frontend directory:
   ```env
   # Backend API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:5000
   
   # File Upload Settings
   NEXT_PUBLIC_MAX_FILES_PER_UPLOAD=40
   NEXT_PUBLIC_MAX_FILE_SIZE_MB=32
   
   # Development settings  
   NODE_ENV=development
   
   # Optional: Enable debug mode
   NEXT_PUBLIC_DEBUG=false
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Or export static files
npm run build && npm run export
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── globals.css        # Global styles and Tailwind
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable UI components
│   │   ├── ChatInterface.tsx  # Chat UI with streaming
│   │   ├── DocumentList.tsx   # Document management
│   │   ├── FileUpload.tsx     # Drag-and-drop upload
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── ...
│   ├── lib/                   # Utilities and API
│   │   ├── api.ts            # Backend API client
│   │   └── utils.ts          # Helper functions
│   ├── store/                 # State management
│   │   └── useAppStore.ts    # Zustand store
│   └── types/                 # TypeScript definitions
│       └── index.ts          # Shared types
├── public/                    # Static assets
├── tailwind.config.js        # Tailwind configuration
├── next.config.js            # Next.js configuration
└── package.json              # Dependencies and scripts
```

## API Integration

The frontend communicates with the Python backend through a comprehensive API service layer:

### API Client (`src/lib/api.ts`)
- Axios-based HTTP client with interceptors
- Automatic error handling and retry logic
- Authentication header management
- Request/response transformation
- Server-Sent Events (SSE) for streaming chat

### Key API Endpoints
- **Cases**: Create, list, update, and manage legal cases
- **Documents**: Upload, process, and retrieve documents
- **Chat**: Real-time chat with streaming responses
- **Citations**: Retrieve detailed citation information

### Streaming Chat Implementation
```typescript
// Streaming chat with real-time responses
await apiService.streamChatWithDocuments(
  { thread_id, query, case_id },
  onChunk,    // Handle streaming content
  onError,    // Handle errors
  onComplete  // Handle completion
);
```

## State Management

### Zustand Store (`src/store/useAppStore.ts`)
Centralized state management for:
- **UI State**: Sidebar, modals, loading states
- **Data**: Cases, documents, chat messages
- **Chat State**: Streaming content, citations, typing indicators
- **Current Selections**: Active case, chat thread

### Key Store Actions
```typescript
const {
  currentCase,
  setCurrentCase,
  addChatMessage,
  setSelectedCitation,
  toggleSidebar
} = useAppStore();
```

## Component Architecture

### Design System
- **Colors**: Legal-themed palette with primary, legal, and accent colors
- **Typography**: Inter font with responsive sizing
- **Spacing**: Consistent spacing scale using Tailwind
- **Components**: Reusable button, input, and card components

### Key Components

#### ChatInterface
- Real-time streaming chat responses
- Citation display with modal interaction
- Message history with user/assistant distinction
- Auto-scrolling and textarea auto-resize

#### DocumentList  
- Document status tracking (pending, completed, failed)
- File type icons and metadata display
- Upload progress and error handling
- Document actions (view, download, delete)

#### FileUpload
- Drag-and-drop with visual feedback
- File type and size validation
- Multiple file selection
- Upload progress tracking

## Styling and Theme

### Tailwind CSS Configuration
- Custom color palette for legal applications
- Extended spacing and animation utilities
- Custom component classes for consistency
- Responsive breakpoints for mobile-first design

### Custom CSS Classes
```css
.btn-primary     # Primary action buttons
.btn-secondary   # Secondary buttons  
.card           # Container cards
.input-field    # Form inputs
.chat-message   # Chat message styling
```

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent component structure and naming
- Custom hooks for reusable logic

### Component Patterns
```typescript
// Component with proper TypeScript typing
interface ComponentProps {
  data: DataType;
  onAction: (id: string) => void;
}

export default function Component({ data, onAction }: ComponentProps) {
  // Component implementation
}
```

### Error Handling
- Global error boundary for uncaught errors
- Toast notifications for user feedback
- API error interceptors with user-friendly messages
- Form validation with real-time feedback

## Performance Optimizations

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: API response caching and memoization
- **Lazy Loading**: Dynamic imports for large components

## Accessibility

- **ARIA Labels**: Proper accessibility attributes
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Compatible with screen readers
- **Color Contrast**: WCAG compliant color ratios
- **Focus Management**: Proper focus handling in modals

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/api/health
   
   # Verify environment variables
   echo $NEXT_PUBLIC_API_URL
   ```

2. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**
   ```bash
   # Run type checking
   npm run type-check
   
   # Check for missing dependencies
   npm list
   ```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## Contributing

1. Follow the established code style and patterns
2. Add TypeScript types for all new components
3. Include proper error handling and loading states
4. Test responsive design on multiple screen sizes
5. Ensure accessibility guidelines are followed

## License

This project is part of the Legal RAG Chatbot system. See the main project repository for license information. 