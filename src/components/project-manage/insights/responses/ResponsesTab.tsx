"use client";

import React from 'react';
import { ResponsesSummary } from './ResponsesSummary';
import { ResponseTable } from './ResponseTable';
import type { InsightsData } from '../types';

interface ResponsesTabProps {
  data: InsightsData;
  onExport?: () => void;
}

export function ResponsesTab({ data, onExport }: ResponsesTabProps) {
  const { stats, responses } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Strip */}
      <ResponsesSummary stats={stats} />

      {/* Response Table with integrated export */}
      <ResponseTable responses={responses} pageSize={15} onExport={onExport} />
    </div>
  );
}

export default ResponsesTab;
