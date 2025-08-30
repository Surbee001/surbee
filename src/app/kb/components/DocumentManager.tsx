'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  category: string;
  summary: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    author?: string;
    pages?: number;
    duration?: number;
    dimensions?: { width: number; height: number };
  };
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  selectedDocument: Document | null;
  searchQuery: string;
  selectedCategory: string | null;
  filteredDocuments: Document[];
}

type DocumentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; updates: Partial<Document> } }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SELECT_DOCUMENT'; payload: Document | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'FILTER_DOCUMENTS' };

const initialState: DocumentState = {
  documents: [],
  isLoading: false,
  error: null,
  selectedDocument: null,
  searchQuery: '',
  selectedCategory: null,
  filteredDocuments: [],
};

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'SET_DOCUMENTS':
      const documents = action.payload;
      return { 
        ...state, 
        documents,
        filteredDocuments: filterDocuments(documents, state.searchQuery, state.selectedCategory),
        isLoading: false 
      };
      
    case 'ADD_DOCUMENT':
      const newDocuments = [...state.documents, action.payload];
      return { 
        ...state, 
        documents: newDocuments,
        filteredDocuments: filterDocuments(newDocuments, state.searchQuery, state.selectedCategory)
      };
      
    case 'UPDATE_DOCUMENT':
      const updatedDocuments = state.documents.map(doc =>
        doc.id === action.payload.id 
          ? { ...doc, ...action.payload.updates, updatedAt: new Date() }
          : doc
      );
      return { 
        ...state, 
        documents: updatedDocuments,
        filteredDocuments: filterDocuments(updatedDocuments, state.searchQuery, state.selectedCategory)
      };
      
    case 'DELETE_DOCUMENT':
      const remainingDocuments = state.documents.filter(doc => doc.id !== action.payload);
      return { 
        ...state, 
        documents: remainingDocuments,
        filteredDocuments: filterDocuments(remainingDocuments, state.searchQuery, state.selectedCategory),
        selectedDocument: state.selectedDocument?.id === action.payload ? null : state.selectedDocument
      };
      
    case 'SELECT_DOCUMENT':
      return { ...state, selectedDocument: action.payload };
      
    case 'SET_SEARCH_QUERY':
      const searchQuery = action.payload;
      return { 
        ...state, 
        searchQuery,
        filteredDocuments: filterDocuments(state.documents, searchQuery, state.selectedCategory)
      };
      
    case 'SET_SELECTED_CATEGORY':
      const selectedCategory = action.payload;
      return { 
        ...state, 
        selectedCategory,
        filteredDocuments: filterDocuments(state.documents, state.searchQuery, selectedCategory)
      };
      
    case 'FILTER_DOCUMENTS':
      return {
        ...state,
        filteredDocuments: filterDocuments(state.documents, state.searchQuery, state.selectedCategory)
      };
      
    default:
      return state;
  }
}

function filterDocuments(documents: Document[], searchQuery: string, category: string | null): Document[] {
  return documents.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = !category || doc.category === category;
    
    return matchesSearch && matchesCategory;
  });
}

interface DocumentContextType {
  state: DocumentState;
  actions: {
    loadDocuments: () => Promise<void>;
    addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
    deleteDocument: (id: string) => Promise<void>;
    selectDocument: (document: Document | null) => void;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (category: string | null) => void;
    getCategoryStats: () => Record<string, number>;
  };
}

const DocumentContext = createContext<DocumentContextType | null>(null);

export function DocumentManager({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  const actions = {
    loadDocuments: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await fetch('/api/kb/documents');
        if (response.ok) {
          const documents = await response.json();
          dispatch({ type: 'SET_DOCUMENTS', payload: documents });
        } else {
          throw new Error('Failed to load documents');
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      }
    },

    addDocument: async (documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await fetch('/api/kb/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(documentData),
        });
        
        if (response.ok) {
          const newDocument = await response.json();
          dispatch({ type: 'ADD_DOCUMENT', payload: newDocument });
        } else {
          throw new Error('Failed to add document');
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      }
    },

    updateDocument: async (id: string, updates: Partial<Document>) => {
      try {
        const response = await fetch(`/api/kb/documents/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        
        if (response.ok) {
          dispatch({ type: 'UPDATE_DOCUMENT', payload: { id, updates } });
        } else {
          throw new Error('Failed to update document');
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      }
    },

    deleteDocument: async (id: string) => {
      try {
        const response = await fetch(`/api/kb/documents/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          dispatch({ type: 'DELETE_DOCUMENT', payload: id });
        } else {
          throw new Error('Failed to delete document');
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      }
    },

    selectDocument: (document: Document | null) => {
      dispatch({ type: 'SELECT_DOCUMENT', payload: document });
    },

    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },

    setSelectedCategory: (category: string | null) => {
      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
    },

    getCategoryStats: () => {
      const stats: Record<string, number> = {};
      state.documents.forEach(doc => {
        stats[doc.category] = (stats[doc.category] || 0) + 1;
      });
      return stats;
    },
  };

  // Load documents on mount
  useEffect(() => {
    actions.loadDocuments();
  }, []);

  return (
    <DocumentContext.Provider value={{ state, actions }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentManager');
  }
  return context;
}