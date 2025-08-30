'use client';

import SurveyChat from '@/components/survey-builder/survey-chat';
import SurveyPreview from '@/components/survey-builder/survey-preview';
import SpinnerAnimation from '@/components/survey-builder/spinner-animation';
import { useEffect, useState } from 'react';
import type { Survey } from '@/components/survey-builder/types';
import { cn } from '@/lib/utils';
import { useBuilder } from '@/components/survey-builder/builder-context';

function MockInitializer() {
  const { updateSurvey, survey } = useBuilder();
  useEffect(() => {
    if (!survey) {
      const initialSurvey: Survey = {
        id: 'initial-survey',
        title: '',
        pages: [],
        theme: {
          bgColor: '#191A1A',
          fontColor: '#FFFFFF',
          fontFamily: 'DM Sans',
          accentColor: '#FF6B00',
        },
      };
      updateSurvey(initialSurvey);
    }
  }, []);
  return null;
}

export default function SurveyBuilderClient() {
  const { survey, isGenerating, currentPageIndex, goToPage } = useBuilder();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [spinnerStates, setSpinnerStates] = useState<string[]>([]);

  const handleFirstMessage = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

  const showAnimation = hasStarted && isGenerating;
  const showSurvey = hasStarted && !isGenerating && survey?.pages?.length;
  const rightBgColor = '#191A1A';

  return (
    <>
      <MockInitializer />
      <div className={cn('flex flex-col h-full w-full font-sans bg-[#191A1A]')}>
        {/* DM Sans for body */}
        <div className="flex flex-1 overflow-hidden">
          {isChatOpen && (
            <div className="w-[500px] border-r border-zinc-700">
              <SurveyChat onFirstMessageSent={handleFirstMessage} />
            </div>
          )}
          <div
            className="flex-1 h-full transition-colors duration-300"
            style={{ backgroundColor: rightBgColor }}
          >
            {showAnimation && <SpinnerAnimation states={spinnerStates} />}
            {showSurvey && <SurveyPreview survey={survey} />}
          </div>
        </div>
      </div>
    </>
  );
}
