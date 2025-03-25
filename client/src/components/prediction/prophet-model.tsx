import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw } from 'lucide-react';
import { simulateProphet, generateHistoricalSalesData, formatDataForPredictionChart } from '@/lib/prediction-models';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ProphetModelProps = {
  className?: string;
};

export default function ProphetModel({ className }: ProphetModelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [predictionPeriods, setPredictionPeriods] = useState('6');
  const [chartData, setChartData] = useState<any>(null);
  const [stats, setStats] = useState({
    confidenceInterval: 0,
    meanPrediction: 0,
    growth: 0
  });

  // Generate or fetch data
  useEffect(() => {
    generatePredictions();
  }, []);

  const generatePredictions = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        // Generate historical data
        const historicalSales = generateHistoricalSalesData(24);
        
        // Run Prophet simulation
        const periods = parseInt(predictionPeriods);
        const { predictions, lowerBounds, upperBounds, confidenceInterval } = simulateProphet(
          historicalSales, 
          periods
        );
        
        // Format data for chart
        const formattedData = formatDataForPredictionChart(
          historicalSales,
          predictions,
          lowerBounds,
          upperBounds
        );
        
        // Calculate statistics
        const predictionValues = predictions.map(p => p.value);
        const meanPrediction = predictionValues.reduce((a, b) => a + b, 0) / predictionValues.length;
        
        const lastHistorical = historicalSales[historicalSales.length - 1].value;
        const lastPrediction = predictions[predictions.length - 1].value;
        const growth = ((lastPrediction - lastHistorical) / lastHistorical) * 100;
        
        // Set chart data
        setChartData({
          labels: formattedData.map(d => d.date),
          datasets: [
            {
              label: 'Historical Sales',
              data: formattedData.map(d => d.actual),
              borderColor: '#1a4b8c',
              backgroundColor: '#1a4b8c',
              pointRadius: 3,
              tension: 0.2
            },
            {
              label: 'Prophet Forecast',
              data: formattedData.map(d => d.predicted),
              borderColor: '#d32f2f',
              backgroundColor: '#d32f2f',
              pointRadius: 3,
              borderDash: [5, 5],
              tension: 0.2
            },
            {
              label: 'Upper Bound',
              data: formattedData.map(d => d.upperBound),
              borderColor: 'rgba(211, 47, 47, 0.3)',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              pointRadius: 0,
              borderDash: [2, 2],
              tension: 0.2,
              fill: '+1'
            },
            {
              label: 'Lower Bound',
              data: formattedData.map(d => d.lowerBound),
              borderColor: 'rgba(211, 47, 47, 0.3)',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              pointRadius: 0,
              borderDash: [2, 2],
              tension: 0.2,
              fill: false
            }
          ]
        });
        
        // Update stats
        setStats({
          confidenceInterval,
          meanPrediction: Math.round(meanPrediction),
          growth: parseFloat(growth.toFixed(1))
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating Prophet predictions:', error);
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleRegenerateClick = () => {
    generatePredictions();
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: 'Units Sold'
        },
        beginAtZero: true
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prophet Prediction Model</CardTitle>
            <CardDescription>
              Facebook's Prophet time series forecasting model
            </CardDescription>
          </div>
          <Button 
            onClick={handleRegenerateClick} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="prophet-prediction-period">Forecast Horizon</Label>
            <Select 
              value={predictionPeriods} 
              onValueChange={setPredictionPeriods}
            >
              <SelectTrigger id="prophet-prediction-period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Confidence Interval</Label>
            <div className="text-xl font-bold">{isLoading ? "-" : `±${stats.confidenceInterval} units`}</div>
            <div className="text-sm text-muted-foreground">95% confidence level</div>
          </div>
          
          <div className="space-y-2">
            <Label>Expected Growth</Label>
            <div className={`text-xl font-bold ${stats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isLoading ? "-" : `${stats.growth >= 0 ? '+' : ''}${stats.growth}%`}
            </div>
            <div className="text-sm text-muted-foreground">Over forecast period</div>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground">No prediction data available</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 bg-muted p-3 rounded-md">
          <h4 className="font-medium mb-2">Model Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="font-semibold">Trend:</span> Enabled
            </div>
            <div>
              <span className="font-semibold">Seasonality:</span> Annual
            </div>
            <div>
              <span className="font-semibold">Holidays:</span> Included
            </div>
            <div>
              <span className="font-semibold">Changepoints:</span> Auto
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}