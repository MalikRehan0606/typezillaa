
"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TestHistoryEntry } from '@/types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-background border border-border rounded-lg shadow-xl text-foreground text-sm">
        <p className="label font-bold text-primary">{`${new Date(data.timestamp).toLocaleDateString()}`}</p>
        <p>{`WPM: ${data.wpm}`}</p>
        <p>{`Accuracy: ${data.accuracy}%`}</p>
        <p className="capitalize">{`Level: ${data.level}`}{data.wordCount ? ` (${data.wordCount} words)` : ''}</p>
      </div>
    );
  }
  return null;
};

interface ProfileChartProps {
    data: TestHistoryEntry[];
}

export default function ProfileChart({ data }: ProfileChartProps) {
    const chartData = data
      .map(entry => ({
          ...entry,
          name: new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }))
      .sort((a, b) => a.timestamp - b.timestamp); // Ensure data is sorted by date for the chart

    const hasData = chartData && chartData.length > 1;

    return (
        <Card className="shadow-xl overflow-hidden border-2 border-primary/20 bg-card w-full">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-headline text-center">Performance History</CardTitle>
                <CardDescription className="text-center text-muted-foreground">Your WPM and accuracy over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                          data={chartData}
                          margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                          }}
                      >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                          <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            yAxisId="left" 
                            stroke="hsl(var(--primary))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: 'hsl(var(--primary))' }}
                          />
                           <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            domain={[0, 100]}
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                             label={{ value: 'Accuracy (%)', angle: 90, position: 'insideRight', fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} name="WPM" />
                          <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Accuracy" />
                      </LineChart>
                  </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Complete at least two tests to see your progress chart.</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
    )
}
