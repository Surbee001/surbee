// Core Surbee Types for Design DNA Engine

export interface AtomStyle {
  spacing: number; // 4-24px
  radius: number; // 0-24px
  shadow: 'none' | 'sm' | 'md' | 'lg';
  palette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  font: 'sans' | 'serif' | 'mono';
}

export interface DNAProfile {
  spacing: number;
  radius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  palette: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  font: 'sans' | 'serif' | 'mono';
}

export interface DNAMix {
  Academic: number;
  TypeformPro: number;
  Corporate: number;
  Minimalist: number;
  Playful: number;
}

export interface AIResponse {
  dnaMix: DNAMix;
  rationale: string;
  surveyAtoms: SurveyAtom[];
  thinkingProcess: string;
}

export interface SurveyDescription {
  title: string;
  description: string;
  targetAudience: string;
  surveyType: string;
}

export interface SurveyAtom {
  id: string;
  type: string; // 'text-input' | 'rating' | 'multiple-choice' | 'slider' | 'textarea'
  content: string;
  style: AtomStyle;
  position: number;
  options?: string[]; // Added for multiple-choice
  placeholder?: string; // Added for text inputs
  required?: boolean; // Added for validation
}

// Base DNA Profiles
export const BASE_DNA_PROFILES: Record<string, DNAProfile> = {
  Academic: {
    spacing: 8,
    radius: 2,
    shadow: 'none',
    palette: {
      primary: '#1a1a1a',
      secondary: '#6b7280',
      background: '#ffffff',
      text: '#212529',
    },
    font: 'serif',
  },
  TypeformPro: {
    spacing: 16,
    radius: 12,
    shadow: 'lg',
    palette: {
      primary: '#4f46e5',
      secondary: '#f9fafb',
      background: 'gradient-purple',
      text: '#111827',
    },
    font: 'sans',
  },
  Corporate: {
    spacing: 12,
    radius: 6,
    shadow: 'md',
    palette: {
      primary: '#2563eb',
      secondary: '#f8fafc',
      background: '#ffffff',
      text: '#1e293b',
    },
    font: 'sans',
  },
  Minimalist: {
    spacing: 6,
    radius: 0,
    shadow: 'none',
    palette: {
      primary: '#000000',
      secondary: '#f5f5f5',
      background: '#ffffff',
      text: '#000000',
    },
    font: 'sans',
  },
  Playful: {
    spacing: 20,
    radius: 16,
    shadow: 'lg',
    palette: {
      primary: '#ec4899',
      secondary: '#fdf2f8',
      background: '#ffffff',
      text: '#1f2937',
    },
    font: 'sans',
  },
};
