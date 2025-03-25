import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Filter, Calendar, BarChart2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

// Sample sales data - In a real app this would come from the API
const sampleSales = [
  { id: 1, model: "Explorer 750R", customer: "John Smith", salesperson: "Jane Doe", date: "2023-11-20", price: 12990, paymentMethod: "Credit Card", status: "completed" },
  { id: 2, model: "Voyager Cruiser", customer: "Michael Johnson", salesperson: "Jane Doe", date: "2023-11-19", price: 15750, paymentMethod: "Financing", status: "completed" },
  { id: 3, model: "Speedster 1000", customer: "Sarah Williams", salesperson: "Robert Brown", date: "2023-11-18", price: 18490, paymentMethod: "Cash", status: "completed" },
  { id: 4, model: "Trail Blazer 450", customer: "David Miller", salesperson: "Jane Doe", date: "2023-11-17", price: 9995, paymentMethod: "Credit Card", status: "completed" },
  { id: 5, model: "City Commuter 300", customer: "Jennifer Davis", salesperson: "Robert Brown", date: "2023-11-16", price: 6500, paymentMethod: "Cash", status: "completed" },
  { id: 6, model: "Classic Vintage", customer: "Thomas Wilson", salesperson: "Robert Brown", date: "2023-11-15", price: 14250, paymentMethod: "Financing", status: "completed" },
  { id: 7, model: "Racing Pro 1200", customer: "Emily Anderson", salesperson: "Jane Doe", date: "2023-11-14", price: 21990, paymentMethod: "Financing", status: "pending" },
  { id: 8, model: "Urban Rider 250", customer: "Christopher Lee", salesperson: "Robert Brown", date: "2023-11-13", price: 5990, paymentMethod: "Credit Card", status: "completed" },
  { id: 9, model: "Mountain Explorer 600", customer: "Jessica Martinez", salesperson: "Jane Doe", date: "2023-11-12", price: 11750, paymentMethod: "Cash", status: "completed" },
  { id: 10, model: "Voyager Touring", customer: "Andrew Taylor", salesperson: "Robert Brown", date: "2023-11-11", price: 22750, paymentMethod: "Financing", status: "pending" },
];

// Analytics chart data
const salesByModelData = [
  { name: "Explorer 750R", value: 12 },
  { name: "Voyager Cruiser", value: 10 },
  { name: "Speedster 1000", value: 8 },
  { name: "Trail Blazer 450", value: 6 },
  { name: "Voyager Touring", value: 5 },
];

const salesByPaymentMethodData = [
  { name: "Credit Card", value: 35 },
  { name: "Financing", value: 45 },
  { name: "Cash", value: 20 },
];

const monthlySalesData = [
  { name: "Jan", value: 65000 },
  { name: "Feb", value: 58000 },
  { name: "Mar", value: 80000 },
  { name: "Apr", value: 72000 },
  { name: "May", value: 90000 },
  { name: "Jun", value: 85000 },
  { name: "Jul", value: 100000 },
  { name: "Aug", value: 95000 },
  { name: "Sep", value: 105000 },
  { name: "Oct", value: 98000 },
  { name: "Nov", value: 110000 },
  { name: "Dec", value: 120000 },
];

// Colors for charts
const COLORS = ['#1a4b8c', '#3273dc', '#64b5f6', '#d32f2f', '#ef5350'];

export default function SalesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [addSaleDialogOpen, setAddSaleDialogOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  // Get sales data
  const { data: sales, isLoading } = useQuery({
    queryKey: ["/api/sales"],
    queryFn: () => {
      // Simulating data for demo, would normally fetch from API
      return Promise.resolve(sampleSales);
    },
  });
  
  const filteredSales = sales?.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.salesperson.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddSale = () => {
    setAddSaleDialogOpen(false);
    // Add implementation here
  };
  
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
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-[#1a4b8c]">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0 lg:pl-64">
        <TopNav title="Sales Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Sales List</TabsTrigger>
              <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Sales Records</CardTitle>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search by model, customer, or salesperson..."
                          className="pl-10 w-full md:w-[300px]"
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                      
                      <Dialog open={addSaleDialogOpen} onOpenChange={setAddSaleDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-[#1a4b8c]">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Sale
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Record New Sale</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="motorcycle">Motorcycle</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="explorer-750r">Explorer 750R</SelectItem>
                                    <SelectItem value="voyager-cruiser">Voyager Cruiser</SelectItem>
                                    <SelectItem value="speedster-1000">Speedster 1000</SelectItem>
                                    <SelectItem value="trail-blazer-450">Trail Blazer 450</SelectItem>
                                    <SelectItem value="voyager-touring">Voyager Touring</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="price">Sale Price ($)</Label>
                                <Input id="price" placeholder="12990" type="number" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="customer">Customer</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select customer" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="john-smith">John Smith</SelectItem>
                                    <SelectItem value="michael-johnson">Michael Johnson</SelectItem>
                                    <SelectItem value="sarah-williams">Sarah Williams</SelectItem>
                                    <SelectItem value="add-new">+ Add New Customer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="date">Sale Date</Label>
                                <Input id="date" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="payment">Payment Method</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="credit-card">Credit Card</SelectItem>
                                    <SelectItem value="financing">Financing</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Input id="notes" placeholder="Additional notes about the sale" />
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" onClick={() => setAddSaleDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button className="bg-[#1a4b8c]" onClick={handleAddSale}>
                                Record Sale
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Filter:</span>
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="md:ml-auto">
                      <DatePickerWithRange date={date} setDate={setDate} />
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Salesperson</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredSales?.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-10">
                                No matching sales records found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredSales?.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>#{item.id}</TableCell>
                                <TableCell>{item.model}</TableCell>
                                <TableCell>{item.customer}</TableCell>
                                <TableCell>{item.salesperson}</TableCell>
                                <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>${item.price.toLocaleString()}</TableCell>
                                <TableCell>{item.paymentMethod}</TableCell>
                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">View</Button>
                                    <Button variant="outline" size="sm">Edit</Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Monthly Sales Revenue</CardTitle>
                      <Calendar className="h-5 w-5 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlySalesData}
                          margin={{
                            top: 5,
                            right: 5,
                            left: 20,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis 
                            tickFormatter={(value) => `$${value/1000}k`}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="value" 
                            fill="#1a4b8c" 
                            barSize={30}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Sales by Model</CardTitle>
                      <BarChart2 className="h-5 w-5 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesByModelData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {salesByModelData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => [`${value} units`, 'Sales']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Sales by Payment Method</CardTitle>
                      <BarChart2 className="h-5 w-5 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesByPaymentMethodData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {salesByPaymentMethodData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Sales Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Total Revenue This Month</h3>
                        <p className="text-3xl font-mono">$110,450</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          12.5% from last month
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Total Units Sold This Month</h3>
                        <p className="text-3xl font-mono">37</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          8.2% from last month
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Average Sale Value</h3>
                        <p className="text-3xl font-mono">$12,990</p>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          3.1% from last month
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
