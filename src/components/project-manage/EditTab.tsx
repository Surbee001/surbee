import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Sparkles } from 'lucide-react';

interface EditTabProps {
  projectId: string;
}

export const EditTab: React.FC<EditTabProps> = ({ projectId }) => {
  const router = useRouter();

  const handleEditClick = () => {
    router.push(`/project/${projectId}`);
  };

  return (
    <div className="edit-tab">
      <div className="edit-tab-content">
        <div className="edit-tab-icon">
          <MessageSquare className="h-12 w-12" />
        </div>
        <h2 className="edit-tab-title">Edit Your Survey with AI</h2>
        <p className="edit-tab-description">
          Use our AI-powered chat interface to modify your survey content, add new questions,
          change layouts, and customize the design through natural conversation.
        </p>
        <button onClick={handleEditClick} className="edit-tab-button">
          <Sparkles className="h-4 w-4" />
          <span>Open AI Builder</span>
        </button>
      </div>
    </div>
  );
};
