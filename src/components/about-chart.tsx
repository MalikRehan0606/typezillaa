
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border border-border rounded-lg shadow-xl text-foreground">
        <p className="label font-bold text-primary">{`${label} WPM`}</p>
        <p className="intro">{`Completed Tests: ${new Intl.NumberFormat().format(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

interface AboutChartProps {
    data: { name: string; users: number }[];
    error?: string | null;
}

export default function AboutChart({ data, error }: AboutChartProps) {
    const hasData = data && data.length > 0 && data.some(d => d.users > 0);

    return (
        <Card className="shadow-xl overflow-hidden border-2 border-primary/20 bg-card w-full">
            <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-headline text-center">WPM Distribution</CardTitle>
                <CardDescription className="text-center text-muted-foreground">WPM distribution from all players on the leaderboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96">
                {error ? (
                  <div className="flex items-center justify-center h-full text-destructive">
                    <p>{error}</p>
                  </div>
                ) : hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                          data={data}
                          margin={{
                              top: 5,
                              right: 20,
                              left: 30,
                              bottom: 5,
                          }}
                      >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                          <YAxis
                            allowDecimals={false}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Tests', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', dy: 40 }}
                          />
                          <Tooltip
                            cursor={{ fill: 'hsl(var(--secondary))' }}
                            content={<CustomTooltip />}
                          />
                          <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No global scores recorded yet. Complete a test to get started!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
    )
}
