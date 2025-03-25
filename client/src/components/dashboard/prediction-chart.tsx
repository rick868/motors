import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Area,
  AreaChart
} from "recharts";

type PredictionData = {
  date: string;
  actual?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
};

type PredictionChartProps = {
  data: PredictionData[];
  predictedSales: number;
  confidence: number;
  growth: number;
};

export default function PredictionChart({ 
  data, 
  predictedSales, 
  confidence, 
  growth 
}: PredictionChartProps) {
  const [model, setModel] = useState<'arima' | 'prophet'>('arima');
  
  const handleModelChange = (newModel: 'arima' | 'prophet') => {
    setModel(newModel);
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
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm mr-2">{entry.name}: </span>
              <span className="text-sm font-medium">
                {formatCurrency(entry.value as number)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg">Sales Prediction (Next 30 Days)</h2>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={model === 'arima' ? 'default' : 'outline'}
              onClick={() => handleModelChange('arima')}
              className={model === 'arima' ? 'bg-[#1a4b8c]' : ''}
            >
              ARIMA
            </Button>
            <Button
              size="sm"
              variant={model === 'prophet' ? 'default' : 'outline'}
              onClick={() => handleModelChange('prophet')}
              className={model === 'prophet' ? 'bg-[#1a4b8c]' : ''}
            >
              Prophet
            </Button>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef5350" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef5350" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => value === "Today" ? value : ""}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Confidence interval */}
              <Area 
                dataKey="upperBound" 
                stackId="1"
                stroke="none" 
                fill="url(#colorUpper)" 
                activeDot={false}
              />
              <Area 
                dataKey="lowerBound" 
                stackId="1" 
                stroke="none" 
                fill="transparent" 
                activeDot={false}
              />
              
              {/* Actual line */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#64b5f6" 
                strokeWidth={2} 
                dot={false} 
                name="Actual"
              />
              
              {/* Prediction line */}
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#ef5350" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false} 
                name="Predicted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">Predicted Sales</p>
            <p className="font-mono font-medium">{formatCurrency(predictedSales)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">Confidence</p>
            <p className="font-mono font-medium">{confidence}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">Growth</p>
            <p className={`font-mono font-medium ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {growth >= 0 ? '+' : ''}{growth}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
