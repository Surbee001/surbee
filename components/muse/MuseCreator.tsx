'use client';
// LryaCreator: WYSIWYG SurveyJS Creator integration
import React, { useEffect, useState } from 'react';
import 'survey-creator-core/survey-creator-core.css';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import type { SurbeeLryaAgent } from '@/lib/muse/agent';

interface LryaCreatorProps {
  agent: SurbeeLryaAgent;
}

export function LryaCreator({ agent }: LryaCreatorProps) {
  // Initialize creator with options and seed schema
  const [creator] = useState(() => {
    const c = new SurveyCreator({
      showToolbox: true,
      showLogicTab: true,
      isAutoSave: true,
    });
    c.JSON = agent.getSurvey();
    return c;
  });

  // Sync manual edits back to the agent
  useEffect(() => {
    const onMod = () => agent.manualUpdate(creator.JSON);
    creator.onModified.add(onMod);
    return () => creator.onModified.remove(onMod);
  }, [creator, agent]);

  return <SurveyCreatorComponent creator={creator} />;
}
