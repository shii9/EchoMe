import { useState } from 'react';
import { Card } from './ui/card';
import { AnalysisHistory } from '@/types/phishing';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface ThreatPatternTimelineProps {
  history: AnalysisHistory[];
}

export const ThreatPatternTimeline = ({ history }: ThreatPatternTimelineProps) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  const getTimeRangeData = () => {
    const now = Date.now();
    let rangeMs: number;
    let groupBy: (timestamp: number) => string;

    switch (timeRange) {
      case 'day':
        rangeMs = 24 * 60 * 60 * 1000;
        groupBy = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        break;
      case 'week':
        rangeMs = 7 * 24 * 60 * 60 * 1000;
        groupBy = (timestamp) => new Date(timestamp).toLocaleDateString('en-US', { weekday: 'short' });
        break;
      case 'month':
        rangeMs = 30 * 24 * 60 * 60 * 1000;
        groupBy = (timestamp) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        break;
    }

    const filtered = history.filter(item => now - item.timestamp <= rangeMs);
    
    const grouped = filtered.reduce((acc, item) => {
      const key = groupBy(item.timestamp);
      if (!acc[key]) {
        acc[key] = { safe: 0, suspicious: 0, danger: 0, total: 0 };
      }
      
      const score = item.result.score;
      if (score < 30) acc[key].safe++;
      else if (score < 70) acc[key].suspicious++;
      else acc[key].danger++;
      acc[key].total++;
      
      return acc;
    }, {} as Record<string, { safe: number; suspicious: number; danger: number; total: number }>);

    // Sort the entries chronologically
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
      // For week view, sort by day of week
      if (timeRange === 'week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.indexOf(a) - days.indexOf(b);
      }
      // For other views, sort by time/date string
      return a.localeCompare(b);
    });

    return sortedEntries.map(([name, data]) => ({
      name,
      safe: data.safe,
      suspicious: data.suspicious,
      danger: data.danger,
      total: data.total
    }));
  };

  const chartData = getTimeRangeData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-4 sm:p-8 bg-gradient-card border-border/50 shadow-card backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Threat Pattern Timeline</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={timeRange === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('day')}
              className={timeRange === 'day' ? 'shadow-lg shadow-primary/50 animate-glow' : ''}
            >
              Day
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
              className={timeRange === 'week' ? 'shadow-lg shadow-primary/50 animate-glow' : ''}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
              className={timeRange === 'month' ? 'shadow-lg shadow-primary/50 animate-glow' : ''}
            >
              Month
            </Button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--danger))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--danger))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="safe" 
                stackId="1"
                stroke="hsl(var(--success))" 
                fillOpacity={1}
                fill="url(#colorSafe)"
                name="Safe"
              />
              <Area 
                type="monotone" 
                dataKey="suspicious" 
                stackId="1"
                stroke="hsl(var(--warning))" 
                fillOpacity={1}
                fill="url(#colorSuspicious)"
                name="Suspicious"
              />
              <Area 
                type="monotone" 
                dataKey="danger" 
                stackId="1"
                stroke="hsl(var(--danger))" 
                fillOpacity={1}
                fill="url(#colorDanger)"
                name="Danger"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <TrendingUp className="w-12 h-12 opacity-50" />
            <p>No analysis data for this time period</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
