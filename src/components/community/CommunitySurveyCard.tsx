import React from 'react';
import { Clock, Users, Star, FileText } from 'lucide-react';
import { Image as IKImage } from '@imagekit/next';

interface CommunitySurvey {
  id: string;
  title: string;
  description: string;
  category: string;
  responseCount: number;
  createdAt: string;
  previewImage?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

interface CommunitySurveyCardProps {
  survey: CommunitySurvey;
  onTakeSurvey: (surveyId: string) => void;
}

export const CommunitySurveyCard: React.FC<CommunitySurveyCardProps> = ({
  survey,
  onTakeSurvey,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400 bg-green-400/20';
      case 'intermediate':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '🟢';
      case 'intermediate':
        return '🟡';
      case 'advanced':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div
      className="group w-full p-[5px] rounded-[12px] relative border transition-all duration-300 ease-in-out flex flex-col gap-[5px] h-full"
      style={{ 
        cursor: "pointer",
        backgroundColor: "#141414",
        borderColor: 'var(--surbee-border-accent)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surbee-border-accent)';
      }}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-start">
        <div className="flex gap-[5px] flex-1 min-w-0">
          <div className="text-sm flex flex-col justify-start gap-1">
            <p className="text-white font-medium text-sm leading-tight truncate" title={survey.title}>
              {survey.title}
            </p>
            <p className="text-gray-400 text-xs leading-tight line-clamp-2" title={survey.description}>
              {survey.description}
            </p>
          </div>
        </div>
        
        {/* Take Survey Button */}
        <div
          className="w-[80px] h-[32px] bg-white text-black opacity-0 group-hover:opacity-100 group-hover:border-white group-hover:pointer-events-auto duration-300 ease-in-out text-xs rounded-lg flex items-center justify-center font-medium cursor-pointer pointer-events-auto active:scale-95 transition"
          style={{ border: '1px solid var(--surbee-border-accent)' }}
          onClick={(e) => {
            e.stopPropagation();
            onTakeSurvey(survey.id);
          }}
        >
          Take
        </div>
      </div>

      {/* Category and Difficulty */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2 py-1 rounded-md bg-gray-700 text-gray-300">
          {survey.category}
        </span>
        <span className={`text-xs px-2 py-1 rounded-md ${getDifficultyColor(survey.difficulty)} flex items-center gap-1`}>
          <span>{getDifficultyIcon(survey.difficulty)}</span>
          {survey.difficulty}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{survey.responseCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{survey.estimatedTime}</span>
        </div>
      </div>

      {/* Preview Image */}
      <div className="w-full rounded-[8px] aspect-[210/119] mt-auto overflow-hidden">
        {survey.previewImage ? (
          <IKImage
            src={survey.previewImage}
            alt={survey.title}
            width={210}
            height={119}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};
