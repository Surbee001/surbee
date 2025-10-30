import React from 'react';
import { Clock, Users, FileText } from 'lucide-react';
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

  const getDifficultyIndicator = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '•';
      case 'intermediate':
        return '••';
      case 'advanced':
        return '•••';
      default:
        return '•';
    }
  };

  return (
    <div
      className="group relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-[12px] border p-[5px] transition-all duration-300 ease-in-out"
      style={{
        cursor: 'pointer',
        backgroundColor: '#141414',
        borderColor: 'var(--surbee-border-accent)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#f8f8f8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surbee-border-accent)';
      }}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p
            className="truncate text-sm font-medium text-white"
            title={survey.title}
          >
            {survey.title}
          </p>
          <p
            className="text-xs leading-tight text-gray-400 line-clamp-2"
            title={survey.description}
          >
            {survey.description}
          </p>
        </div>
        <button
          type="button"
          className="pointer-events-auto flex h-8 w-[80px] items-center justify-center rounded-lg border bg-white text-xs font-medium text-black opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:border-[#f8f8f8]"
          style={{ borderColor: 'var(--surbee-border-accent)' }}
          onClick={(event) => {
            event.stopPropagation();
            onTakeSurvey(survey.id);
          }}
        >
          Take
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-gray-700 px-2 py-1 text-xs text-gray-300">
          {survey.category}
        </span>
        <span
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs uppercase tracking-wide ${getDifficultyColor(
            survey.difficulty,
          )}`}
        >
          <span className="text-sm font-semibold leading-none">
            {getDifficultyIndicator(survey.difficulty)}
          </span>
          {survey.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{survey.responseCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{survey.estimatedTime}</span>
        </div>
      </div>

      <div className="mt-auto aspect-[210/119] w-full overflow-hidden rounded-[8px]">
        {survey.previewImage ? (
          <IKImage
            src={survey.previewImage}
            alt={survey.title}
            width={210}
            height={119}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <FileText className="h-8 w-8 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

