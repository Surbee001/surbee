'use client';

import React from 'react';
import { FileText } from 'lucide-react';

export function SurveyBuilderContent() {
  return (
    <div className="flex items-center justify-center h-full bg-[#2a2a2a]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#3a3a3a] rounded-full mx-auto flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <h1 className="text-2xl font-medium text-white">Survey Builder</h1>
        <p className="text-gray-400">This section is under development</p>
        <p className="text-sm text-gray-500">
          Your existing survey builder features will be integrated here
        </p>
      </div>
    </div>
  );
}
