import { RegisteredComponent } from '@/contexts/ComponentRegistry';

export interface AnalysisContext {
  componentType: string;
  componentLabel: string;
  data: any;
  metadata?: Record<string, any>;
  summary: string;
}

/**
 * Serializes a detected component into a context object for AI analysis
 */
export function serializeComponentForAnalysis(component: RegisteredComponent): AnalysisContext {
  const { type, label, data, metadata } = component;

  let summary = '';

  switch (type) {
    case 'chart':
      summary = serializeChartComponent(label, data);
      break;
    case 'metric':
      summary = serializeMetricComponent(label, data);
      break;
    case 'response':
      summary = serializeResponseComponent(label, data);
      break;
    case 'table':
      summary = serializeTableComponent(label, data);
      break;
    case 'funnel':
      summary = serializeFunnelComponent(label, data);
      break;
    default:
      summary = `${label}: ${JSON.stringify(data, null, 2)}`;
  }

  return {
    componentType: type,
    componentLabel: label,
    data,
    metadata,
    summary,
  };
}

function serializeChartComponent(label: string, data: any): string {
  const { chartType, chartData, insights } = data;

  let summary = `Chart: ${label}\nType: ${chartType || 'Unknown'}\n\n`;

  if (chartData) {
    summary += 'Data:\n';
    if (Array.isArray(chartData)) {
      chartData.slice(0, 10).forEach((point: any) => {
        summary += `  ${JSON.stringify(point)}\n`;
      });
      if (chartData.length > 10) {
        summary += `  ... and ${chartData.length - 10} more data points\n`;
      }
    } else {
      summary += JSON.stringify(chartData, null, 2);
    }
  }

  if (insights) {
    summary += `\nInsights: ${insights}\n`;
  }

  return summary;
}

function serializeMetricComponent(label: string, data: any): string {
  const { value, change, comparison, description } = data;

  let summary = `Metric: ${label}\n`;
  summary += `Value: ${value}\n`;

  if (change !== undefined) {
    summary += `Change: ${change > 0 ? '+' : ''}${change}%\n`;
  }

  if (comparison) {
    summary += `Comparison: ${comparison}\n`;
  }

  if (description) {
    summary += `Description: ${description}\n`;
  }

  return summary;
}

function serializeResponseComponent(label: string, data: any): string {
  const { responseId, responses, metadata, quality, timing } = data;

  let summary = `Response: ${label}\n`;

  if (responseId) {
    summary += `ID: ${responseId}\n`;
  }

  if (responses) {
    summary += '\nAnswers:\n';
    Object.entries(responses).forEach(([question, answer]) => {
      summary += `  Q: ${question}\n`;
      summary += `  A: ${typeof answer === 'object' ? JSON.stringify(answer) : answer}\n\n`;
    });
  }

  if (quality) {
    summary += `Quality Score: ${quality.score || 'N/A'}\n`;
    if (quality.issues && quality.issues.length > 0) {
      summary += `Issues: ${quality.issues.join(', ')}\n`;
    }
  }

  if (timing) {
    summary += `Completion Time: ${timing.completionTime || 'N/A'}\n`;
  }

  if (metadata) {
    summary += `\nMetadata:\n${JSON.stringify(metadata, null, 2)}\n`;
  }

  return summary;
}

function serializeTableComponent(label: string, data: any): string {
  const { headers, rows, totalCount } = data;

  let summary = `Table: ${label}\n`;

  if (headers) {
    summary += `Columns: ${headers.join(', ')}\n`;
  }

  if (rows && Array.isArray(rows)) {
    summary += `\nData (showing first ${Math.min(5, rows.length)} of ${totalCount || rows.length} rows):\n`;
    rows.slice(0, 5).forEach((row: any, idx: number) => {
      summary += `Row ${idx + 1}: ${JSON.stringify(row)}\n`;
    });
  }

  return summary;
}

function serializeFunnelComponent(label: string, data: any): string {
  const { steps, conversionRate, dropoffPoints } = data;

  let summary = `Funnel: ${label}\n`;

  if (conversionRate !== undefined) {
    summary += `Overall Conversion: ${conversionRate}%\n`;
  }

  if (steps && Array.isArray(steps)) {
    summary += '\nSteps:\n';
    steps.forEach((step: any, idx: number) => {
      summary += `  ${idx + 1}. ${step.label || step.name}: ${step.count || step.value} (${step.percentage || 'N/A'}%)\n`;
    });
  }

  if (dropoffPoints && dropoffPoints.length > 0) {
    summary += `\nDrop-off Points: ${dropoffPoints.join(', ')}\n`;
  }

  return summary;
}

/**
 * Extracts relevant context for AI chat from the current page state
 */
export function extractPageContext(components: RegisteredComponent[]): string {
  let context = 'Current Page Context:\n\n';

  const componentsByType = components.reduce((acc, comp) => {
    if (!acc[comp.type]) {
      acc[comp.type] = [];
    }
    acc[comp.type].push(comp);
    return acc;
  }, {} as Record<string, RegisteredComponent[]>);

  Object.entries(componentsByType).forEach(([type, comps]) => {
    context += `${type.toUpperCase()}S (${comps.length}):\n`;
    comps.forEach((comp) => {
      context += `  - ${comp.label}\n`;
    });
    context += '\n';
  });

  return context;
}
