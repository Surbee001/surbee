'use client';

import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from 'react';
import type { SurveyPage, Survey } from './types';

interface BuilderContextType {
  survey: Survey;
  updateSurvey: (survey: Survey) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  showAnimation: boolean;
  setShowAnimation: (value: boolean) => void;
  hasStarted: boolean;
  setHasStarted: (value: boolean) => void;
  showSurvey: boolean;
  setShowSurvey: (value: boolean) => void;
  currentPageIndex: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (index: number) => void;
  activePage: SurveyPage | undefined;
}

const initialSurvey: Survey = {
  id: 'initial-survey',
  title: '',
  pages: [],
  theme: {},
};

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [survey, setSurvey] = useState<Survey>(initialSurvey);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Update the whole survey state
  const updateSurvey = (newSurvey: Survey) => {
    setSurvey(newSurvey);
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

  // Navigation methods
  const nextPage = () => {
    if (currentPageIndex < survey.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const goToPage = (index: number) => {
    if (index >= 0 && index < survey.pages.length) {
      setCurrentPageIndex(index);
    }
  };

  // Get current active page
  const activePage = survey.pages?.[currentPageIndex];

  return (
    <BuilderContext.Provider
      value={{
        survey,
        updateSurvey,
        isGenerating,
        setIsGenerating,
        showAnimation,
        setShowAnimation,
        hasStarted,
        setHasStarted,
        showSurvey,
        setShowSurvey,
        currentPageIndex,
        nextPage,
        prevPage,
        goToPage,
        activePage,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}
