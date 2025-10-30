"use client";

import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface AccuracyTrendData {
  date: string;
  overallAccuracy: number;
  attentionCheck: number;
  consistencyCheck: number;
  responseCount: number;
}

interface AccuracyTrendChartProps {
  data: AccuracyTrendData[];
}

export default function AccuracyTrendChart({ data }: AccuracyTrendChartProps) {
  const chartConfig = {
    overallAccuracy: {
      label: "Overall Accuracy",
      color: "#3B82F6",
    },
    attentionCheck: {
      label: "Attention Checks",
      color: "#8B5CF6",
    },
    consistencyCheck: {
      label: "Consistency",
      color: "#10B981",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          Accuracy Trends
        </CardTitle>
        <CardDescription>
          Data quality metrics over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              
              <ReferenceLine 
                y={80} 
                stroke="#10B981" 
                strokeDasharray="3 3" 
                strokeOpacity={0.3}
                label={{ value: "High Quality Threshold", position: "insideTopRight", style: { fontSize: 10, fill: "#10B981" } }}
              />
              <ReferenceLine 
                y={50} 
                stroke="#F59E0B" 
                strokeDasharray="3 3" 
                strokeOpacity={0.3}
                label={{ value: "Medium Quality Threshold", position: "insideTopRight", style: { fontSize: 10, fill: "#F59E0B" } }}
              />
              
              <ChartTooltip
                content={<ChartTooltipContent labelFormatter={(value) => value as string} />}
              />
              
              <Line 
                type="monotone" 
                dataKey="overallAccuracy" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#000' }}
              />
              <Line 
                type="monotone" 
                dataKey="attentionCheck" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#000' }}
              />
              <Line 
                type="monotone" 
                dataKey="consistencyCheck" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#000' }}
              />

              <ChartLegend
                verticalAlign="bottom"
                content={<ChartLegendContent />}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}