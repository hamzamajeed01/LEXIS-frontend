'use client';

import { useState } from 'react';
import { Case } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { useAuthContext } from '@/components/AuthProvider';
import { 
  Folder, 
  Plus, 
  FileText,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  cases: Case[];
  currentCase: Case | null;
  onCaseSelect: (caseItem: Case) => void;
  onCreateCase: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  cases,
  currentCase,
  onCaseSelect,
  onCreateCase,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuthContext();

  // Ensure cases is always an array
  const safeCases = Array.isArray(cases) ? cases : [];

  const filteredCases = safeCases.filter(c => {
    if (!c || typeof c !== 'object') return false;
    
    const title = c.title || '';
    const description = c.description || '';
    const searchLower = searchTerm.toLowerCase();
    
    return title.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower);
  });

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-0",
          "bg-white border-r border-slate-200 shadow-lg lg:shadow-none",
          "transform transition-all duration-300 ease-in-out",
          "lg:translate-x-0 flex flex-col",
          isCollapsed ? "w-16" : "w-80",
          isOpen ? "translate-x-0 sidebar-mobile" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Collapse Toggle Button */}
        <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
          <button
            onClick={toggleCollapse}
            className="w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Sidebar Header */}
        <div className={cn(
          "px-4 sm:px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 transition-all duration-300",
          isCollapsed && "px-2"
        )}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Cases</h2>
                  <p className="text-sm text-slate-600">{safeCases.length} active case{safeCases.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={onCreateCase}
                  className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg animate-fade-in"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Case</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={onCreateCase}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg flex items-center justify-center text-white"
                title="New Case"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Cases List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {!isCollapsed ? (
            filteredCases.length === 0 ? (
              <div className="p-6 text-center">
                <Folder className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  {searchTerm ? 'No cases match your search' : 'No cases yet'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={onCreateCase}
                    className="mt-4 px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Create your first case
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredCases.map((caseItem, index) => (
                  <button
                    key={caseItem.id}
                    onClick={() => onCaseSelect(caseItem)}
                    className={cn(
                      "w-full p-4 text-left rounded-xl border transition-all duration-200 animate-fade-in",
                      "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-[1.02]",
                      currentCase?.id === caseItem.id
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-md ring-2 ring-blue-200"
                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Folder className={cn(
                            "h-4 w-4 flex-shrink-0 transition-colors",
                            currentCase?.id === caseItem.id ? "text-blue-600" : "text-slate-400"
                          )} />
                          <h3 className={cn(
                            "font-semibold text-sm truncate transition-colors",
                            currentCase?.id === caseItem.id ? "text-blue-900" : "text-slate-900"
                          )}>
                            {caseItem.title || 'Untitled Case'}
                          </h3>
                        </div>
                        
                        {caseItem.description && (
                          <p className={cn(
                            "text-xs mb-2 line-clamp-2 transition-colors",
                            currentCase?.id === caseItem.id ? "text-blue-700" : "text-slate-600"
                          )}>
                            {caseItem.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-xs">
                          <div className={cn(
                            "flex items-center space-x-1 transition-colors",
                            currentCase?.id === caseItem.id ? "text-blue-600" : "text-slate-500"
                          )}>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(caseItem.created_at)}</span>
                          </div>
                          
                          {currentCase?.id === caseItem.id && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span>Active</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            // Collapsed view - show only icons
            <div className="p-2 space-y-2">
              {filteredCases.slice(0, 10).map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => onCaseSelect(caseItem)}
                  className={cn(
                    "w-full p-2 rounded-lg transition-all duration-200",
                    "hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    currentCase?.id === caseItem.id
                      ? "bg-blue-100 text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                  title={caseItem.title}
                >
                  <Folder className="h-5 w-5 mx-auto" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className={cn(
          "mt-auto p-4 border-t border-slate-200 bg-slate-50",
          isCollapsed && "p-2"
        )}>
          {!isCollapsed ? (
            <button
              onClick={() => logout()}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 group"
            >
                             <LogOut className="h-5 w-5 group-hover:text-red-600 transition-colors" />
               <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={() => logout()}
              className="w-full p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                             title="Logout"
            >
              <LogOut className="h-5 w-5 mx-auto" />
            </button>
          )}
        </div>
      </div>
    </>
  );
} 