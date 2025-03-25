import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";

type SalesData = {
  month: string;
  sales: number;
};

type SalesChartProps = {
  data: SalesData[];
};

export default function SalesChart({ data }: SalesChartProps) {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  
  const handleTimeframeChange = (newTimeframe: 'month' | 'quarter' | 'year') => {
    setTimeframe(newTimeframe);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-[#1a4b8c]">
            {formatCurrency(payload[0].value as number)}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg">Monthly Sales Trend</h2>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={timeframe === 'month' ? 'default' : 'outline'}
              onClick={() => handleTimeframeChange('month')}
              className={timeframe === 'month' ? 'bg-[#1a4b8c]' : ''}
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={timeframe === 'quarter' ? 'default' : 'outline'}
              onClick={() => handleTimeframeChange('quarter')}
              className={timeframe === 'quarter' ? 'bg-[#1a4b8c]' : ''}
            >
              Quarter
            </Button>
            <Button
              size="sm"
              variant={timeframe === 'year' ? 'default' : 'outline'}
              onClick={() => handleTimeframeChange('year')}
              className={timeframe === 'year' ? 'bg-[#1a4b8c]' : ''}
            >
              Year
            </Button>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis 
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="sales" 
                fill="#1a4b8c" 
                barSize={30}
                radius={[4, 4, 0, 0]}
                // Switch to red for recent months
                fill={(entry, index) => index > 5 ? "#d32f2f" : "#1a4b8c"}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
