import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays, format, subMonths } from "date-fns";
import { Loader2, Download, FileText, BarChart2, PieChart, TrendingUp, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

// Sample data for reports
const monthlySalesData = [
  { month: "Jan", sales: 65000, profit: 19500 },
  { month: "Feb", sales: 58000, profit: 17400 },
  { month: "Mar", sales: 80000, profit: 24000 },
  { month: "Apr", sales: 72000, profit: 21600 },
  { month: "May", sales: 90000, profit: 27000 },
  { month: "Jun", sales: 85000, profit: 25500 },
  { month: "Jul", sales: 100000, profit: 30000 },
  { month: "Aug", sales: 95000, profit: 28500 },
  { month: "Sep", sales: 105000, profit: 31500 },
  { month: "Oct", sales: 98000, profit: 29400 },
  { month: "Nov", sales: 110000, profit: 33000 },
  { month: "Dec", sales: 120000, profit: 36000 },
];

const categorySalesData = [
  { name: "Sport", value: 35 },
  { name: "Cruiser", value: 25 },
  { name: "Touring", value: 20 },
  { name: "Off-road", value: 10 },
  { name: "Commuter", value: 10 },
];

const performanceData = [
  { name: "Jane Doe", sales: 28, revenue: 420500 },
  { name: "Robert Brown", sales: 22, revenue: 386250 },
  { name: "Michael Scott", sales: 17, revenue: 294800 },
  { name: "Sarah Adams", sales: 15, revenue: 262400 },
  { name: "James Wilson", sales: 11, revenue: 187650 },
];

const inventoryTurnoverData = [
  { month: "Jan", turnover: 2.1 },
  { month: "Feb", turnover: 1.9 },
  { month: "Mar", turnover: 2.3 },
  { month: "Apr", turnover: 2.2 },
  { month: "May", turnover: 2.6 },
  { month: "Jun", turnover: 2.4 },
  { month: "Jul", turnover: 2.8 },
  { month: "Aug", turnover: 2.5 },
  { month: "Sep", turnover: 2.9 },
  { month: "Oct", turnover: 2.7 },
  { month: "Nov", turnover: 3.0 },
  { month: "Dec", turnover: 3.2 },
];

// Colors for charts
const COLORS = ['#1a4b8c', '#3273dc', '#64b5f6', '#d32f2f', '#ef5350'];

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("sales");
  const [timeframe, setTimeframe] = useState("month");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
            <div key={index} className="flex items-center mt-1">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="mr-2">{entry.name}:</span>
              <span className="font-medium">
                {entry.name === 'turnover' ? 
                  entry.value.toFixed(1) : 
                  formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0 lg:pl-64">
        <TopNav title="Reports & Analytics" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle>Custom Report Generator</CardTitle>
                  <CardDescription>Generate detailed reports based on your criteria</CardDescription>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales Report</SelectItem>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="performance">Performance Report</SelectItem>
                      <SelectItem value="customers">Customer Report</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <DatePickerWithRange date={date} setDate={setDate} />
                  
                  <Button 
                    className="bg-[#1a4b8c]"
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue="sales" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Total Sales (YTD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">$978,500</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      12.8% from last year
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Total Profit (YTD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">$293,550</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      14.2% from last year
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Avg. Transaction Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">$12,580</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      3.5% from last year
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">Monthly Sales & Profit</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlySalesData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tickFormatter={(value) => `$${value/1000}k`}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) => `$${value/1000}k`}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="sales" name="Sales" fill="#1a4b8c" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="profit" name="Profit" fill="#d32f2f" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">Sales by Category</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categorySalesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {categorySalesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="inventory">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Current Inventory Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">$1,245,750</div>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                      4.2% from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Total Stock Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">134 units</div>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                      6.3% from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Low Stock Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">12 models</div>
                    <p className="text-sm text-red-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                      3 more than last month
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">Inventory Turnover Rate</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={inventoryTurnoverData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis 
                            domain={[0, 4]}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="turnover" 
                            stroke="#1a4b8c" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            name="Turnover Rate"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">Models Requiring Attention</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 font-medium">Model</th>
                            <th className="text-left py-3 font-medium">Category</th>
                            <th className="text-left py-3 font-medium">Stock</th>
                            <th className="text-left py-3 font-medium">Status</th>
                            <th className="text-left py-3 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3">Speedster 1000</td>
                            <td className="py-3">Sport</td>
                            <td className="py-3">5 units</td>
                            <td className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                Low Stock
                              </span>
                            </td>
                            <td className="py-3">
                              <Button size="sm" variant="outline">Order</Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Racing Pro 1200</td>
                            <td className="py-3">Sport</td>
                            <td className="py-3">2 units</td>
                            <td className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                Low Stock
                              </span>
                            </td>
                            <td className="py-3">
                              <Button size="sm" variant="outline">Order</Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Voyager Touring</td>
                            <td className="py-3">Touring</td>
                            <td className="py-3">0 units</td>
                            <td className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            </td>
                            <td className="py-3">
                              <Button size="sm" variant="outline">Order</Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3">Mountain Explorer 600</td>
                            <td className="py-3">Adventure</td>
                            <td className="py-3">3 units</td>
                            <td className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                Low Stock
                              </span>
                            </td>
                            <td className="py-3">
                              <Button size="sm" variant="outline">Order</Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-3">Classic Vintage</td>
                            <td className="py-3">Cruiser</td>
                            <td className="py-3">4 units</td>
                            <td className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                Low Stock
                              </span>
                            </td>
                            <td className="py-3">
                              <Button size="sm" variant="outline">Order</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Total Sales People</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">8</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      2 more than last year
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Avg. Sales per Person</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">11.6</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      8.4% from last year
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Avg. Revenue per Person</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">$192,325</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      5.3% from last year
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">Sales Performance by Team Member</CardTitle>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceData}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 70,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis 
                          type="number"
                          axisLine={false} 
                          tickLine={false}
                          domain={[0, 'dataMax + 5']}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="sales" 
                          name="Units Sold" 
                          fill="#1a4b8c" 
                          radius={[0, 4, 4, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Sales Revenue by Team Member</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 font-medium">Team Member</th>
                            <th className="text-left py-3 font-medium">Units Sold</th>
                            <th className="text-left py-3 font-medium">Revenue</th>
                            <th className="text-left py-3 font-medium">Avg. Deal Size</th>
                            <th className="text-left py-3 font-medium">% of Target</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performanceData.map((person, index) => (
                            <tr key={index} className={index < performanceData.length - 1 ? "border-b" : ""}>
                              <td className="py-3">{person.name}</td>
                              <td className="py-3">{person.sales}</td>
                              <td className="py-3">{formatCurrency(person.revenue)}</td>
                              <td className="py-3">{formatCurrency(person.revenue / person.sales)}</td>
                              <td className="py-3">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div className="bg-[#1a4b8c] h-2.5 rounded-full" style={{ width: `${Math.min(100, (person.sales / 30) * 100)}%` }}></div>
                                  </div>
                                  <span>{Math.min(100, Math.round((person.sales / 30) * 100))}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="customers">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Total Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">156</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      12.2% from last year
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">New Customers (YTD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">42</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      8.5% from last year
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Customer Retention Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-medium">83.5%</div>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      2.3% from last year
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">Customer Demographics</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Age Distribution</h3>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={[
                                  { name: "18-25", value: 10 },
                                  { name: "26-35", value: 25 },
                                  { name: "36-45", value: 35 },
                                  { name: "46-55", value: 20 },
                                  { name: "56+", value: 10 },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                {categorySalesData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Gender Distribution</h3>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={[
                                  { name: "Male", value: 75 },
                                  { name: "Female", value: 25 },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                <Cell fill="#1a4b8c" />
                                <Cell fill="#d32f2f" />
                              </Pie>
                              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Geographic Distribution</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Top Cities</h4>
                          <ol className="list-decimal pl-5 text-sm space-y-1">
                            <li>New York (18%)</li>
                            <li>Los Angeles (12%)</li>
                            <li>Chicago (9%)</li>
                            <li>Houston (7%)</li>
                            <li>Phoenix (5%)</li>
                          </ol>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Top States</h4>
                          <ol className="list-decimal pl-5 text-sm space-y-1">
                            <li>California (24%)</li>
                            <li>Texas (18%)</li>
                            <li>New York (15%)</li>
                            <li>Florida (10%)</li>
                            <li>Illinois (8%)</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">Customer Acquisition</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Acquisition Channels</h3>
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { channel: "Walk-in", count: 35 },
                                { channel: "Website", count: 25 },
                                { channel: "Referral", count: 15 },
                                { channel: "Social Media", count: 12 },
                                { channel: "Events", count: 8 },
                                { channel: "Other", count: 5 },
                              ]}
                              layout="vertical"
                              margin={{
                                top: 5,
                                right: 30,
                                left: 80,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                              <XAxis 
                                type="number"
                                axisLine={false} 
                                tickLine={false}
                              />
                              <YAxis 
                                dataKey="channel" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false}
                              />
                              <Tooltip />
                              <Bar 
                                dataKey="count" 
                                name="Customers" 
                                fill="#1a4b8c" 
                                radius={[0, 4, 4, 0]} 
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Repeat Purchase Rate</h3>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-500">First-time buyers</span>
                            <span className="text-sm font-medium">65%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-[#1a4b8c] h-2.5 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-500">Return customers</span>
                            <span className="text-sm font-medium">35%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-[#d32f2f] h-2.5 rounded-full" style={{ width: "35%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Reports that are automatically generated and sent to stakeholders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 font-medium">Report Name</th>
                        <th className="text-left py-3 font-medium">Frequency</th>
                        <th className="text-left py-3 font-medium">Recipients</th>
                        <th className="text-left py-3 font-medium">Next Run</th>
                        <th className="text-left py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3">Weekly Sales Summary</td>
                        <td className="py-3">Weekly (Monday)</td>
                        <td className="py-3">Sales Team, Management</td>
                        <td className="py-3">Nov 27, 2023</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Run Now</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3">Monthly Inventory Report</td>
                        <td className="py-3">Monthly (1st)</td>
                        <td className="py-3">Inventory Manager, Management</td>
                        <td className="py-3">Dec 1, 2023</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Run Now</Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3">Quarterly Financial Review</td>
                        <td className="py-3">Quarterly</td>
                        <td className="py-3">Executive Team</td>
                        <td className="py-3">Jan 1, 2024</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Run Now</Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3">Sales Performance Rankings</td>
                        <td className="py-3">Weekly (Friday)</td>
                        <td className="py-3">Sales Team</td>
                        <td className="py-3">Dec 1, 2023</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Run Now</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
