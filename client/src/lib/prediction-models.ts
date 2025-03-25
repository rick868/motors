// Utility functions for prediction models

// Simple ARIMA model simulation for frontend use (actual ARIMA would be in backend)
export function simulateARIMA(historicalData: number[], periods: number, options: {
  p?: number, // Autoregressive order
  d?: number, // Differencing order
  q?: number  // Moving average order
} = {}): {
  predictions: number[], 
  lowerBounds: number[], 
  upperBounds: number[],
  confidenceInterval: number
} {
  const { p = 1, d = 1, q = 0 } = options;
  
  // This is a simplified simulation of ARIMA for frontend visualization
  // Real ARIMA should be implemented on the backend with proper statistics libraries
  
  // Calculate basic statistics from historical data
  const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
  const std = Math.sqrt(
    historicalData.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / historicalData.length
  );
  
  // Calculate first difference if d > 0
  let differenced = [...historicalData];
  for (let i = 0; i < d; i++) {
    differenced = differenced.slice(1).map((val, idx) => val - differenced[idx]);
  }
  
  // Generate predictions
  const predictions: number[] = [];
  const lowerBounds: number[] = [];
  const upperBounds: number[] = [];
  
  // Use last value as seed for forecast
  let lastValue = historicalData[historicalData.length - 1];
  let lastDiff = differenced[differenced.length - 1];
  
  // Confidence interval (95% level)
  const confidenceInterval = 1.96 * std;
  const errorMargin = std * 1.5; // Artificially increase for visual effect
  
  // Generate future values
  for (let i = 0; i < periods; i++) {
    // AR component: weighted average of previous values + random noise
    const arComponent = lastValue * 0.7 + mean * 0.3;
    
    // Add trend component based on differencing
    const trendComponent = d > 0 ? lastDiff * (1 - 0.1 * i / periods) : 0;
    
    // Add seasonal component (simple sine wave)
    const seasonalComponent = mean * 0.15 * Math.sin(Math.PI * i / 6);
    
    // Generate prediction with error term
    const prediction = arComponent + trendComponent + seasonalComponent;
    
    // Calculate confidence interval
    const lower = prediction - errorMargin * Math.sqrt(i + 1);
    const upper = prediction + errorMargin * Math.sqrt(i + 1);
    
    predictions.push(Number(prediction.toFixed(2)));
    lowerBounds.push(Number(lower.toFixed(2)));
    upperBounds.push(Number(upper.toFixed(2)));
    
    // Update for next iteration
    lastValue = prediction;
    if (d > 0) {
      lastDiff = prediction - lastValue;
    }
  }
  
  return {
    predictions,
    lowerBounds,
    upperBounds,
    confidenceInterval: Number(confidenceInterval.toFixed(2))
  };
}

// Prophet model simulation for frontend use (actual Prophet would be in backend)
export function simulateProphet(historicalData: Array<{date: string, value: number}>, periods: number): {
  predictions: Array<{date: string, value: number}>,
  lowerBounds: Array<{date: string, value: number}>,
  upperBounds: Array<{date: string, value: number}>,
  confidenceInterval: number
} {
  // Extract just the values
  const values = historicalData.map(d => d.value);
  
  // Calculate basic statistics
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / values.length
  );
  
  // Calculate trend using linear regression
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate dates for future predictions
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const predictions: Array<{date: string, value: number}> = [];
  const lowerBounds: Array<{date: string, value: number}> = [];
  const upperBounds: Array<{date: string, value: number}> = [];
  
  // Confidence interval (95% level)
  const confidenceInterval = 1.96 * std;
  const errorMargin = std * 1.5; // Artificially increase for visual effect
  
  for (let i = 0; i < periods; i++) {
    // Generate future date
    const futureDate = new Date(lastDate);
    futureDate.setMonth(lastDate.getMonth() + i + 1);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    // Calculate trend component
    const trendValue = intercept + slope * (n + i);
    
    // Add seasonal component (simple sine wave with yearly pattern)
    const monthIndex = futureDate.getMonth();
    const seasonalComponent = mean * 0.25 * Math.sin(Math.PI * monthIndex / 6);
    
    // Add holiday/event component (simplified)
    const holidayComponent = monthIndex === 11 ? mean * 0.2 : 0; // December spike
    
    // Final prediction with some randomness
    const prediction = trendValue + seasonalComponent + holidayComponent;
    const lower = prediction - errorMargin * Math.sqrt(i + 1);
    const upper = prediction + errorMargin * Math.sqrt(i + 1);
    
    predictions.push({
      date: dateStr,
      value: Number(prediction.toFixed(2))
    });
    
    lowerBounds.push({
      date: dateStr,
      value: Number(lower.toFixed(2))
    });
    
    upperBounds.push({
      date: dateStr,
      value: Number(upper.toFixed(2))
    });
  }
  
  return {
    predictions,
    lowerBounds,
    upperBounds,
    confidenceInterval: Number(confidenceInterval.toFixed(2))
  };
}

// Generate historical sales data for demo purposes
export function generateHistoricalSalesData(months = 24): Array<{date: string, value: number}> {
  const data: Array<{date: string, value: number}> = [];
  const today = new Date();
  
  // Start from months ago
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - months);
  
  // Base value
  const baseValue = 120;
  
  // Generate historical data
  for (let i = 0; i < months; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + i);
    
    // Add trend (increasing over time)
    const trendComponent = 2 * i;
    
    // Add seasonality (higher in summer and December)
    const monthIndex = currentDate.getMonth();
    const isSummer = monthIndex >= 5 && monthIndex <= 7; // June, July, August
    const isDecember = monthIndex === 11;
    const seasonalComponent = isSummer ? 25 : isDecember ? 40 : 0;
    
    // Add some randomness
    const randomness = Math.floor(Math.random() * 20) - 10;
    
    // Combine components
    const value = baseValue + trendComponent + seasonalComponent + randomness;
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      value: Math.max(0, value) // Ensure no negative values
    });
  }
  
  return data;
}

// Helper function to format data for charts
export function formatDataForPredictionChart(
  historical: Array<{date: string, value: number}>,
  predictions: Array<{date: string, value: number}>,
  lowerBounds: Array<{date: string, value: number}>,
  upperBounds: Array<{date: string, value: number}>
): Array<{
  date: string,
  actual?: number,
  predicted?: number,
  lowerBound?: number,
  upperBound?: number
}> {
  const result: Array<{
    date: string,
    actual?: number,
    predicted?: number,
    lowerBound?: number,
    upperBound?: number
  }> = [];
  
  // Add historical data
  historical.forEach(item => {
    result.push({
      date: item.date,
      actual: item.value
    });
  });
  
  // Add predictions
  predictions.forEach((item, index) => {
    result.push({
      date: item.date,
      predicted: item.value,
      lowerBound: lowerBounds[index].value,
      upperBound: upperBounds[index].value
    });
  });
  
  // Sort by date
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}