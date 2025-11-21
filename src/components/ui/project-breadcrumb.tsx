"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface BreadcrumbSection {
  label: string;
  value: string;
  path?: string;
}

interface ProjectBreadcrumbProps {
  projectId: string;
  projectTitle?: string;
  currentSection: 'preview' | 'insights' | 'share' | 'analytics';
  onSectionChange?: (section: 'preview' | 'insights' | 'share' | 'analytics') => void;
  isDarkMode?: boolean;
}

export function ProjectBreadcrumb({
  projectId,
  currentSection,
  onSectionChange,
  isDarkMode = false,
}: ProjectBreadcrumbProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const sections: BreadcrumbSection[] = [
    { label: 'Preview', value: 'preview' },
    { label: 'Insights', value: 'insights' },
    { label: 'Share', value: 'share' },
  ];

  const currentSectionData = sections.find(s => s.value === currentSection || (currentSection === 'analytics' && s.value === 'insights'));
  const otherSections = sections.filter(s => s.value !== currentSectionData?.value);

  const handleSectionClick = (section: BreadcrumbSection) => {
    setShowDropdown(false);
    if (onSectionChange) {
      onSectionChange(section.value as any);
    }
  };

  return (
    <div
      className="breadcrumb-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'var(--font-inter), sans-serif',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Project Link */}
      <button
        onClick={() => router.push('/dashboard/projects')}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          margin: 0,
          padding: '4px 0',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '20px',
          fontWeight: '500',
          lineHeight: '1.5',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
        }}
      >
        Projects
      </button>

      {/* Separator */}
      <span
        style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '20px',
          lineHeight: '1.5',
          color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          margin: 0,
          padding: 0,
        }}
      >
        /
      </span>

      {/* Dropdown sections on the left (when dropdown is open) */}
      {showDropdown && otherSections.map((section) => (
        <React.Fragment key={section.value}>
          <button
            onClick={() => handleSectionClick(section)}
            className="breadcrumb-section-dimmed"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              margin: 0,
              padding: '4px 0',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '20px',
              fontWeight: '400',
              lineHeight: '1.5',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
            }}
          >
            {section.label}
          </button>
          <span
            style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '20px',
              lineHeight: '1.5',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              margin: 0,
              padding: 0,
            }}
          >
            /
          </span>
        </React.Fragment>
      ))}

      {/* Current section with dropdown */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="breadcrumb-section-current"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          margin: 0,
          padding: '4px 0',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '20px',
          fontWeight: '500',
          lineHeight: '1.5',
          color: 'var(--surbee-fg-primary)',
          transition: 'color 0.2s ease',
        }}
      >
        {currentSectionData?.label || 'Preview'}
        <ChevronDown
          size={20}
          style={{
            transition: 'transform 0.2s ease',
            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
    </div>
  );
}
