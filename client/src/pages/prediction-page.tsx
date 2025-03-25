import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ReferenceLine
} from "recharts";
import ArimaModel from "@/components/prediction/arima-model";
import ProphetModel from "@/components/prediction/prophet-model";
import ModelComparison from "@/components/prediction/model-comparison";

// Sample inventory prediction data
const inventoryPredictionData = [
  { date: "Today", actual: 134 },
  { date: "Dec 1", predicted: 120 },
  { date: "Dec 15", predicted: 105 },
  { date: "Jan 1", predicted: 89 },
  { date: "Jan 15", predicted: 73 },
  { date: "Feb 1", predicted: 58 },
];

// Sample seasonal analysis data
const seasonalData = [
  { month: "Jan", value: 65000, avg: 70000 },
  { month: "Feb", value: 58000, avg: 62000 },
  { month: "Mar", value: 80000, avg: 75000 },
  { month: "Apr", value: 72000, avg: 68000 },
  { month: "May", value: 90000, avg: 85000 },
  { month: "Jun", value: 85000, avg: 82000 },
  { month: "Jul", value: 100000, avg: 95000 },
  { month: "Aug", value: 95000, avg: 90000 },
  { month: "Sep", value: 105000, avg: 98000 },
  { month: "Oct", value: 98000, avg: 96000 },
  { month: "Nov", value: 110000, avg: 105000 },
  { month: "Dec", value: 120000, avg: 110000 },
];

export default function PredictionPage() {
  const { user } = useAuth();
  const [predictionModel, setPredictionModel] = useState<"arima" | "prophet">("arima");
  const [predictionType, setPredictionType] = useState<"sales" | "inventory">("sales");
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -90),
    to: addDays(new Date(), 90),
  });
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            entry.value && (
              <div key={index} className="flex items-center mt-1">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="mr-2">{entry.name}:</span>
                <span className="font-medium">
                  {predictionType === "sales" 
                    ? formatCurrency(entry.value) 
                    : `${entry.value} units`}
                </span>
              </div>
            )
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0 lg:pl-64">
        <TopNav title="Prediction Models" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="prediction" className="space-y-6">
            <TabsList>
              <TabsTrigger value="prediction">Sales Prediction</TabsTrigger>
              <TabsTrigger value="models">Prediction Models</TabsTrigger>
              <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal Analysis</TabsTrigger>
              <TabsTrigger value="inventory">Inventory Forecast</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prediction" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Forecasting Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm mb-4">
                      <p>Voyager's advanced sales forecasting engine uses multiple models to predict future sales with high accuracy. Use the 'Prediction Models' tab to explore detailed forecasts from our ARIMA and Prophet models.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">30-Day Forecast</h3>
                          <p className="text-2xl font-mono font-medium">$87,240</p>
                          <p className="text-green-500 text-sm flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            12.4% from current
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Model Confidence</h3>
                          <p className="text-2xl font-mono font-medium">85%</p>
                          <p className="text-gray-500 text-sm mt-1">
                            Historical accuracy
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Best Seller</h3>
                          <p className="text-xl font-medium">Explorer 750R</p>
                          <p className="text-blue-500 text-sm flex items-center mt-1">
                            28% of sales
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h3 className="font-medium mb-2">Why Use Prediction Models?</h3>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>Optimize inventory levels based on anticipated demand</li>
                        <li>Plan marketing campaigns around predicted peak buying periods</li>
                        <li>Allocate staff resources efficiently during high-volume periods</li>
                        <li>Set realistic sales targets based on statistical analysis</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="default" 
                        className="bg-[#1a4b8c]"
                        onClick={() => document.getElementById('models-tab')?.click()}
                      >
                        View Detailed Models
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px] mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={seasonalData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                          <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="value"
                            name="Monthly Sales"
                            stroke="#1a4b8c"
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="avg"
                            name="3-Year Average"
                            stroke="#d32f2f"
                            strokeDasharray="5 5"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="text-sm">
                      <p>The chart above shows sales trends for the current year compared to historical averages. 
                      Clear seasonal patterns are visible, with peaks in summer months and December, indicating 
                      ideal times for marketing campaigns and inventory adjustments.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="models" className="space-y-6" id="models-tab">
              <div className="grid grid-cols-1 gap-6">
                <ArimaModel />
                <ProphetModel />
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Use this powerful tool to directly compare different prediction models and determine which one performs best for your specific business needs.
                </p>
              </div>
              <div>
                <ModelComparison />
              </div>
            </TabsContent>
            
            <TabsContent value="seasonal">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Sales Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={seasonalData}
                        margin={{
                          top: 20,
                          right: 20,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value/1000}k`}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#1a4b8c" 
                          strokeWidth={2} 
                          dot={true} 
                          name="Current Year"
                        />
                        
                        <Line 
                          type="monotone" 
                          dataKey="avg" 
                          stroke="#64b5f6" 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          dot={true} 
                          name="5-Year Average"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Peak Season</h3>
                        <p className="text-2xl font-medium">Jul - Dec</p>
                        <p className="text-gray-500 text-sm mt-1">
                          42% higher than off-season
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Strongest Month</h3>
                        <p className="text-2xl font-medium">December</p>
                        <p className="text-green-500 text-sm flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          9.1% above average
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Weakest Month</h3>
                        <p className="text-2xl font-medium">February</p>
                        <p className="text-red-500 text-sm flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          48.3% below average
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Seasonal Insights:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Summer months (June-August) show consistent sales growth, with a peak in July.</li>
                      <li>The holiday season (November-December) demonstrates the strongest sales performance of the year.</li>
                      <li>Winter months (January-February) show the weakest performance, suggesting potential for seasonal promotions.</li>
                      <li>Spring (March-May) shows gradual recovery and presents opportunities for early-season marketing campaigns.</li>
                      <li>Year-over-year seasonal trends remain stable, allowing for reliable inventory planning.</li>
                    </ul>
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Recommended Actions:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Increase inventory levels by 15-20% before peak seasons (June and November).</li>
                        <li>Consider special promotions during February to boost traditionally slow sales periods.</li>
                        <li>Plan major model releases for May to capture the beginning of the summer sales surge.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Depletion Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={inventoryPredictionData}
                        margin={{
                          top: 20,
                          right: 20,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <YAxis 
                          label={{ value: 'Units in Stock', angle: -90, position: 'insideLeft' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <ReferenceLine y={50} stroke="#d32f2f" strokeDasharray="3 3" label="Reorder Point" />
                        <ReferenceLine x="Today" stroke="#666" strokeDasharray="3 3" />
                        
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#1a4b8c" 
                          strokeWidth={2} 
                          dot={true} 
                          name="Actual Inventory"
                        />
                        
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#d32f2f" 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          dot={true} 
                          name="Predicted Inventory"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Current Inventory</h3>
                        <p className="text-2xl font-mono font-medium">134 units</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Across all categories
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Restock Alert</h3>
                        <p className="text-2xl font-mono font-medium text-red-600">Jan 8, 2024</p>
                        <p className="text-gray-500 text-sm mt-1">
                          54 days from today
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Recommended Order</h3>
                        <p className="text-2xl font-mono font-medium">75 units</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Based on forecasted demand
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Inventory Insights:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Current depletion rate is approximately <strong>1.5 units per day</strong>.</li>
                      <li>Based on sales predictions, inventory will reach reorder point (50 units) by <strong>January 8th, 2024</strong>.</li>
                      <li>Considering 2-week lead time for delivery, orders should be placed by <strong>December 25th, 2023</strong>.</li>
                      <li>Expected sales during peak season may accelerate inventory depletion by 20-30%.</li>
                    </ul>
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Models Requiring Immediate Attention:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 mt-2">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Depletion</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Order</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">Speedster 1000</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">5 units</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">Dec 15, 2023</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">15 units</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">Mountain Explorer 600</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">3 units</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">Dec 10, 2023</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">12 units</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">Racing Pro 1200</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">2 units</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">Dec 5, 2023</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">8 units</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">Voyager Touring</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">0 units</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">Out of stock</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">20 units</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
