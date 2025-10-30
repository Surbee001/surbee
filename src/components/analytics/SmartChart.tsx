"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';

export type DataType = 'time-series' | 'categorical' | 'proportional' | 'comparison' | 'rating';
export type ChartType = 'area' | 'line' | 'bar' | 'pie' | 'donut' | 'table';

interface SmartChartProps {
  title: string;
  description?: string;
  data: any[];
  dataType: DataType;
  config: ChartConfig;
  dataKey?: string;
  xAxisKey?: string;
  className?: string;
}

// Professional color palette
const PROFESSIONAL_COLORS = [
  '#6b7280', // neutral-500
  '#9ca3af', // neutral-400
  '#d1d5db', // neutral-300
  '#e5e7eb', // neutral-200
  '#f3f4f6', // neutral-100
];

// Chart type options based on data type
const getChartOptions = (dataType: DataType): { value: ChartType; label: string }[] => {
  switch (dataType) {
    case 'time-series':
      return [
        { value: 'area', label: 'Area Chart' },
        { value: 'line', label: 'Line Chart' },
        { value: 'bar', label: 'Bar Chart' },
        { value: 'table', label: 'Table View' }
      ];
    case 'categorical':
    case 'comparison':
      return [
        { value: 'bar', label: 'Bar Chart' },
        { value: 'pie', label: 'Pie Chart' },
        { value: 'table', label: 'Table View' }
      ];
    case 'proportional':
      return [
        { value: 'donut', label: 'Donut Chart' },
        { value: 'pie', label: 'Pie Chart' },
        { value: 'bar', label: 'Bar Chart' },
        { value: 'table', label: 'Table View' }
      ];
    case 'rating':
      return [
        { value: 'bar', label: 'Bar Chart' },
        { value: 'line', label: 'Line Chart' },
        { value: 'table', label: 'Table View' }
      ];
    default:
      return [
        { value: 'bar', label: 'Bar Chart' },
        { value: 'table', label: 'Table View' }
      ];
  }
};

// Auto-select optimal chart type based on data type
const getOptimalChartType = (dataType: DataType): ChartType => {
  switch (dataType) {
    case 'time-series':
      return 'area';
    case 'proportional':
      return 'donut';
    case 'categorical':
    case 'comparison':
      return 'bar';
    case 'rating':
      return 'bar';
    default:
      return 'bar';
  }
};

const SmartChart: React.FC<SmartChartProps> = ({
  title,
  description,
  data,
  dataType,
  config,
  dataKey = 'value',
  xAxisKey = 'name',
  className = ''
}) => {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(getOptimalChartType(dataType));
  const chartOptions = getChartOptions(dataType);

  const renderChart = () => {
    const chartProps = {
      data,
      className: "h-[250px] w-full"
    };

    switch (selectedChartType) {
      case 'area':
        return (
          <ChartContainer config={config} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PROFESSIONAL_COLORS[0]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PROFESSIONAL_COLORS[0]} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={xAxisKey} stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={PROFESSIONAL_COLORS[0]} 
                  fill="url(#fillArea)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'line':
        return (
          <ChartContainer config={config} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={xAxisKey} stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={PROFESSIONAL_COLORS[0]} 
                  strokeWidth={2}
                  dot={{ fill: PROFESSIONAL_COLORS[0], strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'bar':
        return (
          <ChartContainer config={config} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey={xAxisKey} stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={dataKey} fill={PROFESSIONAL_COLORS[0]} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'pie':
      case 'donut':
        const innerRadius = selectedChartType === 'donut' ? 60 : 0;
        return (
          <ChartContainer config={config} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={innerRadius}
                  outerRadius={80}
                  dataKey={dataKey}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left p-3 text-[11px] font-medium text-neutral-500">{xAxisKey}</th>
                  <th className="text-right p-3 text-[11px] font-medium text-neutral-500">{dataKey}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="border-b border-neutral-100 dark:border-neutral-800">
                    <td className="p-3 text-[11px] text-theme-primary">{row[xAxisKey]}</td>
                    <td className="p-3 text-[11px] text-theme-primary text-right font-mono">
                      {typeof row[dataKey] === 'number' ? row[dataKey].toLocaleString() : row[dataKey]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card className={`theme-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[16px] font-medium text-theme-primary">{title}</CardTitle>
            {description && (
              <CardDescription className="text-theme-muted">{description}</CardDescription>
            )}
          </div>
          <Select value={selectedChartType} onValueChange={(value: ChartType) => setSelectedChartType(value)}>
            <SelectTrigger className="w-[140px] h-8 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-[13px]">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default SmartChart;