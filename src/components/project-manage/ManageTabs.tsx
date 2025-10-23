import React from 'react';
import { TabType } from '@/app/project/[id]/manage/page';

interface ManageTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface Tab {
  id: TabType;
  label: string;
}

const tabs: Tab[] = [
  { id: 'preview', label: 'Preview' },
  { id: 'results', label: 'Results' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'share', label: 'Share' },
];

export const ManageTabs: React.FC<ManageTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="manage-tabs-container">
      <div className="manage-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`manage-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
