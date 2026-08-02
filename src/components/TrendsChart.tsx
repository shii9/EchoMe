import { useState } from 'react';
import { Card } from './ui/card';
import { AnalysisHistory } from '@/types/phishing';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface TrendsChartProps {
  history: AnalysisHistory[];
}

export const TrendsChart = ({ history }: TrendsChartProps) => {
  const [dataRange, setDataRange] = useState<'week' | 'month' | 'all'>('week');

  const getFilteredData = () => {
    let filtered = history;
    const now = Date.now();
    
    switch (dataRange) {
      case 'week':
        filtered = history.filter(item => now - item.timestamp <= 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filtered = history.filter(item => now - item.timestamp <= 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        filtered = history.slice(0, 50);
        break;
    }
    
    return filtered.slice(0, 30).reverse().map((item, index) => ({
      name: `#${index + 1}`,
      score: item.result.score,
      confidence: item.result.confidence,
      date: new Date(item.timestamp).toLocaleDateString()
    }));
  };

  const chartData = getFilteredData();

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
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Analysis Trends</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={dataRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataRange('week')}
              className={dataRange === 'week' ? 'shadow-lg shadow-primary/50 animate-glow' : ''}
            >
              Week
            </Button>
            <Button
              variant={dataRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataRange('month')}
              className={dataRange === 'month' ? 'shadow-lg shadow-primary/50 animate-glow' : ''}
            >
              Month
            </Button>
            <Button
              variant={dataRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataRange('all')}
              className={dataRange === 'all' ? 'shadow-lg shadow-primary/50 animate-glow' : ''}
            >
              All
            </Button>
          </div>
        </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
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
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Threat Score"
            />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              name="Confidence %"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No analysis history to display
        </div>
      )}
      </Card>
    </motion.div>
  );
};
