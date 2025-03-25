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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { simulateARIMA, simulateProphet, generateHistoricalSalesData, formatDataForPredictionChart } from '@/lib/prediction-models';

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

type ModelComparisonProps = {
  className?: string;
};

type ModelStats = {
  modelName: string;
  confidenceInterval: number;
  meanPrediction: number;
  growth: number;
  meanError?: number;
  accuracy?: number;
  lastValue?: number;
};

export default function ModelComparison({ className }: ModelComparisonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [predictionPeriods, setPredictionPeriods] = useState('6');
  const [datasetSize, setDatasetSize] = useState('24');
  const [chartData, setChartData] = useState<any>(null);
  const [modelStats, setModelStats] = useState<{arima: ModelStats, prophet: ModelStats}>({
    arima: {
      modelName: 'ARIMA',
      confidenceInterval: 0,
      meanPrediction: 0,
      growth: 0
    },
    prophet: {
      modelName: 'Prophet',
      confidenceInterval: 0,
      meanPrediction: 0,
      growth: 0
    }
  });
  const [comparisonView, setComparisonView] = useState<'chart' | 'table'>('chart');
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  const [arimaParameters, setArimaParameters] = useState({ p: 1, d: 1, q: 0 });
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'growth' | 'confidence'>('accuracy');
  
  // Generate or fetch data
  useEffect(() => {
    generateComparison();
  }, []);

  const generateComparison = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        // Generate historical data
        const historicalSales = generateHistoricalSalesData(parseInt(datasetSize));
        const historicalValues = historicalSales.map(d => d.value);
        
        // Run ARIMA simulation
        const periods = parseInt(predictionPeriods);
        const arimaResult = simulateARIMA(
          historicalValues, 
          periods,
          arimaParameters
        );
        
        // Run Prophet simulation
        const prophetResult = simulateProphet(
          historicalSales, 
          periods
        );
        
        // Convert to chart format - ARIMA
        const lastDate = new Date(historicalSales[historicalSales.length - 1].date);
        
        // Format ARIMA predictions with dates
        const arimaPredictionsWithDates = arimaResult.predictions.map((value, index) => {
          const futureDate = new Date(lastDate);
          futureDate.setMonth(lastDate.getMonth() + index + 1);
          return {
            date: futureDate.toISOString().split('T')[0],
            value
          };
        });
        
        // Format ARIMA bounds with dates
        const arimaLowerBoundsWithDates = arimaResult.lowerBounds.map((value, index) => {
          const futureDate = new Date(lastDate);
          futureDate.setMonth(lastDate.getMonth() + index + 1);
          return {
            date: futureDate.toISOString().split('T')[0],
            value
          };
        });
        
        const arimaUpperBoundsWithDates = arimaResult.upperBounds.map((value, index) => {
          const futureDate = new Date(lastDate);
          futureDate.setMonth(lastDate.getMonth() + index + 1);
          return {
            date: futureDate.toISOString().split('T')[0],
            value
          };
        });
        
        // Format data for chart
        const arimaFormattedData = formatDataForPredictionChart(
          historicalSales,
          arimaPredictionsWithDates,
          arimaLowerBoundsWithDates,
          arimaUpperBoundsWithDates
        );
        
        // Format Prophet data 
        const prophetFormattedData = formatDataForPredictionChart(
          historicalSales,
          prophetResult.predictions,
          prophetResult.lowerBounds,
          prophetResult.upperBounds
        );
        
        // Combine all data
        type CombinedDataPoint = {
          date: string;
          actual?: number;
          arimaPredicted?: number;
          prophetPredicted?: number;
          arimaLowerBound?: number;
          arimaUpperBound?: number;
          prophetLowerBound?: number;
          prophetUpperBound?: number;
        };
        
        const combinedData: CombinedDataPoint[] = historicalSales.map(item => ({
          date: item.date,
          actual: item.value,
        }));
        
        // Add predictions
        for (let i = 0; i < periods; i++) {
          const arimaItem = arimaPredictionsWithDates[i];
          const prophetItem = prophetResult.predictions[i];
          const arimaLower = arimaLowerBoundsWithDates[i];
          const arimaUpper = arimaUpperBoundsWithDates[i];
          const prophetLower = prophetResult.lowerBounds[i];
          const prophetUpper = prophetResult.upperBounds[i];
          
          combinedData.push({
            date: arimaItem.date,
            arimaPredicted: arimaItem.value,
            prophetPredicted: prophetItem.value,
            arimaLowerBound: arimaLower.value,
            arimaUpperBound: arimaUpper.value,
            prophetLowerBound: prophetLower.value,
            prophetUpperBound: prophetUpper.value
          });
        }
        
        // Calculate statistics
        const arimaPredictions = arimaResult.predictions;
        const prophetPredictions = prophetResult.predictions.map(p => p.value);
        
        const arimaMean = arimaPredictions.reduce((a, b) => a + b, 0) / arimaPredictions.length;
        const prophetMean = prophetPredictions.reduce((a, b) => a + b, 0) / prophetPredictions.length;
        
        const lastHistorical = historicalValues[historicalValues.length - 1];
        const lastArimaPrediction = arimaPredictions[arimaPredictions.length - 1];
        const lastProphetPrediction = prophetPredictions[prophetPredictions.length - 1];
        
        const arimaGrowth = ((lastArimaPrediction - lastHistorical) / lastHistorical) * 100;
        const prophetGrowth = ((lastProphetPrediction - lastHistorical) / lastHistorical) * 100;
        
        // Calculate accuracy metrics (simplified for frontend demonstration)
        // In a real application, this would be calculated based on past predictions vs actual results
        const arimaAccuracy = 85 + (Math.random() * 5); // Simulated accuracy score
        const prophetAccuracy = 83 + (Math.random() * 5); // Simulated accuracy score
        
        // Set chart data
        setChartData({
          labels: combinedData.map(d => d.date),
          datasets: [
            {
              label: 'Historical Sales',
              data: combinedData.map(d => d.actual),
              borderColor: '#2c3e50',
              backgroundColor: '#2c3e50',
              pointRadius: 3,
              tension: 0.2
            },
            {
              label: 'ARIMA Prediction',
              data: combinedData.map(d => d.arimaPredicted),
              borderColor: '#1a4b8c',
              backgroundColor: '#1a4b8c',
              pointRadius: 3,
              borderDash: [5, 5],
              tension: 0.2
            },
            {
              label: 'Prophet Prediction',
              data: combinedData.map(d => d.prophetPredicted),
              borderColor: '#d32f2f',
              backgroundColor: '#d32f2f',
              pointRadius: 3,
              borderDash: [5, 5],
              tension: 0.2
            },
            {
              label: 'ARIMA Upper Bound',
              data: showConfidenceIntervals ? combinedData.map(d => d.arimaUpperBound) : [],
              borderColor: 'rgba(26, 75, 140, 0.3)',
              backgroundColor: 'rgba(26, 75, 140, 0.1)',
              pointRadius: 0,
              borderDash: [2, 2],
              tension: 0.2,
              fill: false
            },
            {
              label: 'ARIMA Lower Bound',
              data: showConfidenceIntervals ? combinedData.map(d => d.arimaLowerBound) : [],
              borderColor: 'rgba(26, 75, 140, 0.3)',
              backgroundColor: 'rgba(26, 75, 140, 0.1)',
              pointRadius: 0,
              borderDash: [2, 2],
              tension: 0.2,
              fill: '+1'
            },
            {
              label: 'Prophet Upper Bound',
              data: showConfidenceIntervals ? combinedData.map(d => d.prophetUpperBound) : [],
              borderColor: 'rgba(211, 47, 47, 0.3)',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              pointRadius: 0,
              borderDash: [2, 2],
              tension: 0.2,
              fill: false
            },
            {
              label: 'Prophet Lower Bound',
              data: showConfidenceIntervals ? combinedData.map(d => d.prophetLowerBound) : [],
              borderColor: 'rgba(211, 47, 47, 0.3)',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              pointRadius: 0,
              borderDash: [2, 2],
              tension: 0.2,
              fill: '+1'
            }
          ]
        });
        
        // Update stats
        setModelStats({
          arima: {
            modelName: 'ARIMA',
            confidenceInterval: arimaResult.confidenceInterval,
            meanPrediction: Math.round(arimaMean),
            growth: parseFloat(arimaGrowth.toFixed(1)),
            meanError: 12.4, // Simulated error rate
            accuracy: parseFloat(arimaAccuracy.toFixed(1)),
            lastValue: lastArimaPrediction
          },
          prophet: {
            modelName: 'Prophet',
            confidenceInterval: prophetResult.confidenceInterval,
            meanPrediction: Math.round(prophetMean),
            growth: parseFloat(prophetGrowth.toFixed(1)),
            meanError: 13.1, // Simulated error rate
            accuracy: parseFloat(prophetAccuracy.toFixed(1)),
            lastValue: lastProphetPrediction
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating predictions:', error);
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleRegenerateClick = () => {
    generateComparison();
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

  const winningModel = () => {
    if (selectedMetric === 'accuracy') {
      return modelStats.arima.accuracy! > modelStats.prophet.accuracy! ? 'ARIMA' : 'Prophet';
    } else if (selectedMetric === 'growth') {
      return modelStats.arima.growth > modelStats.prophet.growth ? 'ARIMA' : 'Prophet';
    } else {
      // Lower confidence interval is better (narrower prediction range)
      return modelStats.arima.confidenceInterval < modelStats.prophet.confidenceInterval ? 'ARIMA' : 'Prophet';
    }
  };

  const renderComparisonTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Metric</th>
              <th className="text-center py-3 px-4">ARIMA</th>
              <th className="text-center py-3 px-4">Prophet</th>
              <th className="text-left py-3 px-4">Winner</th>
            </tr>
          </thead>
          <tbody>
            <tr className={`border-b ${selectedMetric === 'accuracy' ? 'bg-blue-50' : ''}`}>
              <td className="py-3 px-4 font-medium">Prediction Accuracy</td>
              <td className="text-center py-3 px-4">{modelStats.arima.accuracy}%</td>
              <td className="text-center py-3 px-4">{modelStats.prophet.accuracy}%</td>
              <td className="py-3 px-4">
                {modelStats.arima.accuracy! > modelStats.prophet.accuracy! ? (
                  <span className="text-blue-600 font-medium flex items-center">
                    ARIMA
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center">
                    Prophet
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                )}
              </td>
            </tr>
            <tr className={`border-b ${selectedMetric === 'growth' ? 'bg-blue-50' : ''}`}>
              <td className="py-3 px-4 font-medium">Projected Growth</td>
              <td className="text-center py-3 px-4">
                <span className={modelStats.arima.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {modelStats.arima.growth >= 0 ? '+' : ''}{modelStats.arima.growth}%
                </span>
              </td>
              <td className="text-center py-3 px-4">
                <span className={modelStats.prophet.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {modelStats.prophet.growth >= 0 ? '+' : ''}{modelStats.prophet.growth}%
                </span>
              </td>
              <td className="py-3 px-4">
                {modelStats.arima.growth > modelStats.prophet.growth ? (
                  <span className="text-blue-600 font-medium flex items-center">
                    ARIMA
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center">
                    Prophet
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                )}
              </td>
            </tr>
            <tr className={`border-b ${selectedMetric === 'confidence' ? 'bg-blue-50' : ''}`}>
              <td className="py-3 px-4 font-medium">Confidence Interval</td>
              <td className="text-center py-3 px-4">±{modelStats.arima.confidenceInterval} units</td>
              <td className="text-center py-3 px-4">±{modelStats.prophet.confidenceInterval} units</td>
              <td className="py-3 px-4">
                {modelStats.arima.confidenceInterval < modelStats.prophet.confidenceInterval ? (
                  <span className="text-blue-600 font-medium flex items-center">
                    ARIMA
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center">
                    Prophet
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                )}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-medium">Mean Prediction</td>
              <td className="text-center py-3 px-4">{modelStats.arima.meanPrediction} units</td>
              <td className="text-center py-3 px-4">{modelStats.prophet.meanPrediction} units</td>
              <td className="py-3 px-4">-</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium">Final Forecast Value</td>
              <td className="text-center py-3 px-4">{modelStats.arima.lastValue} units</td>
              <td className="text-center py-3 px-4">{modelStats.prophet.lastValue} units</td>
              <td className="py-3 px-4">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interactive Model Comparison</CardTitle>
            <CardDescription>
              Compare ARIMA and Prophet predictions side-by-side
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={comparisonView === 'chart' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setComparisonView('chart')}
            >
              Chart View
            </Button>
            <Button 
              variant={comparisonView === 'table' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setComparisonView('table')}
            >
              Table View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="prediction-period">Forecast Horizon</Label>
            <Select 
              value={predictionPeriods} 
              onValueChange={(value) => {
                setPredictionPeriods(value);
                handleRegenerateClick();
              }}
            >
              <SelectTrigger id="prediction-period" className="mt-1">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="dataset-size">Historical Data Range</Label>
            <Select 
              value={datasetSize} 
              onValueChange={(value) => {
                setDatasetSize(value);
                handleRegenerateClick();
              }}
            >
              <SelectTrigger id="dataset-size" className="mt-1">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Months</SelectItem>
                <SelectItem value="24">24 Months</SelectItem>
                <SelectItem value="36">36 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Compare Models By</Label>
            <RadioGroup 
              defaultValue="accuracy" 
              value={selectedMetric}
              onValueChange={(value) => setSelectedMetric(value as 'accuracy' | 'growth' | 'confidence')}
              className="mt-1 flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="accuracy" id="accuracy" />
                <Label htmlFor="accuracy" className="cursor-pointer">Accuracy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="growth" id="growth" />
                <Label htmlFor="growth" className="cursor-pointer">Growth</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="confidence" id="confidence" />
                <Label htmlFor="confidence" className="cursor-pointer">Confidence</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Button 
            onClick={handleRegenerateClick} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="flex items-center"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Regenerate
          </Button>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-confidence" 
              checked={showConfidenceIntervals}
              onCheckedChange={setShowConfidenceIntervals}
            />
            <Label htmlFor="show-confidence">Show Confidence Intervals</Label>
          </div>
        </div>
        
        {!isLoading && !comparisonView ? (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Model Recommendation</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Based on {selectedMetric === 'accuracy' ? 'prediction accuracy' : selectedMetric === 'growth' ? 'projected growth' : 'confidence interval'}, <strong>{winningModel()}</strong> appears to be the better model for your current data and requirements.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {comparisonView === 'chart' ? (
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
        ) : (
          <div>
            {isLoading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              renderComparisonTable()
            )}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Model Comparison Insights</h3>
          <p className="text-sm mb-3">Here's how our prediction models compare on current data:</p>
          
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">ARIMA Model Strengths:</h4>
              <ul className="list-disc pl-5 mt-1">
                <li>Better for short-term forecasting with stable patterns</li>
                <li>More precise when data exhibits strong autoregressive properties</li>
                <li>Typically requires less computational resources</li>
                <li>Works well when the data doesn't have complex seasonality</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">Prophet Model Strengths:</h4>
              <ul className="list-disc pl-5 mt-1">
                <li>Better handles multiple seasonality patterns (weekly, monthly, yearly)</li>
                <li>Robust to outliers and missing data points</li>
                <li>Automatically detects changepoints in the time series</li>
                <li>Incorporates holiday effects and special events</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">When to Use Each Model:</h4>
              <ul className="list-disc pl-5 mt-1">
                <li><strong>ARIMA:</strong> When you need short-term forecasts (1-3 months) for consistent product lines</li>
                <li><strong>Prophet:</strong> For longer-term forecasts or seasonal products with holiday impacts</li>
                <li><strong>Both:</strong> For critical business decisions, use both models and compare for confidence</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}