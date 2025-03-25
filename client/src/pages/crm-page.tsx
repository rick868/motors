import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Search, Filter, BarChart2, Clock, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Sample customers data
const sampleCustomers = [
  { id: 1, firstName: "John", lastName: "Smith", email: "john.smith@example.com", phone: "(555) 123-4567", address: "123 Main St", city: "New York", state: "NY", zipCode: "10001", dateOfBirth: "1985-06-15", createdAt: "2023-01-10", totalPurchases: 3, lastPurchase: "2023-10-15", lifetimeValue: 38750 },
  { id: 2, firstName: "Michael", lastName: "Johnson", email: "mjohnson@example.com", phone: "(555) 234-5678", address: "456 Elm St", city: "Los Angeles", state: "CA", zipCode: "90001", dateOfBirth: "1978-03-22", createdAt: "2023-02-05", totalPurchases: 2, lastPurchase: "2023-11-02", lifetimeValue: 31500 },
  { id: 3, firstName: "Sarah", lastName: "Williams", email: "swilliams@example.com", phone: "(555) 345-6789", address: "789 Oak Ave", city: "Chicago", state: "IL", zipCode: "60601", dateOfBirth: "1990-09-08", createdAt: "2023-03-12", totalPurchases: 1, lastPurchase: "2023-09-20", lifetimeValue: 18490 },
  { id: 4, firstName: "David", lastName: "Miller", email: "dmiller@example.com", phone: "(555) 456-7890", address: "321 Pine Rd", city: "Houston", state: "TX", zipCode: "77001", dateOfBirth: "1982-11-30", createdAt: "2023-02-28", totalPurchases: 1, lastPurchase: "2023-10-05", lifetimeValue: 9995 },
  { id: 5, firstName: "Jennifer", lastName: "Davis", email: "jdavis@example.com", phone: "(555) 567-8901", address: "654 Maple Dr", city: "Phoenix", state: "AZ", zipCode: "85001", dateOfBirth: "1993-07-12", createdAt: "2023-04-18", totalPurchases: 1, lastPurchase: "2023-08-12", lifetimeValue: 6500 },
  { id: 6, firstName: "Thomas", lastName: "Wilson", email: "twilson@example.com", phone: "(555) 678-9012", address: "987 Cedar Ln", city: "Philadelphia", state: "PA", zipCode: "19019", dateOfBirth: "1975-04-24", createdAt: "2023-05-02", totalPurchases: 1, lastPurchase: "2023-07-18", lifetimeValue: 14250 },
  { id: 7, firstName: "Emily", lastName: "Anderson", email: "eanderson@example.com", phone: "(555) 789-0123", address: "135 Birch St", city: "San Antonio", state: "TX", zipCode: "78201", dateOfBirth: "1988-01-17", createdAt: "2023-03-30", totalPurchases: 1, lastPurchase: "2023-05-22", lifetimeValue: 21990 },
  { id: 8, firstName: "Christopher", lastName: "Lee", email: "clee@example.com", phone: "(555) 890-1234", address: "246 Walnut Blvd", city: "San Diego", state: "CA", zipCode: "92101", dateOfBirth: "1980-12-03", createdAt: "2023-01-25", totalPurchases: 1, lastPurchase: "2023-06-30", lifetimeValue: 5990 },
  { id: 9, firstName: "Jessica", lastName: "Martinez", email: "jmartinez@example.com", phone: "(555) 901-2345", address: "579 Spruce Ct", city: "Dallas", state: "TX", zipCode: "75201", dateOfBirth: "1986-08-19", createdAt: "2023-04-05", totalPurchases: 1, lastPurchase: "2023-09-08", lifetimeValue: 11750 },
  { id: 10, firstName: "Andrew", lastName: "Taylor", email: "ataylor@example.com", phone: "(555) 012-3456", address: "864 Aspen Way", city: "San Jose", state: "CA", zipCode: "95101", dateOfBirth: "1992-05-27", createdAt: "2023-02-15", totalPurchases: 1, lastPurchase: "2023-10-25", lifetimeValue: 22750 },
];

// Sample follow-ups
const sampleFollowUps = [
  { id: 1, customerId: 3, date: "2023-11-30", type: "call", status: "scheduled", notes: "Follow up about maintenance package", assignedTo: "Jane Doe" },
  { id: 2, customerId: 7, date: "2023-11-28", type: "email", status: "scheduled", notes: "Send information about new models", assignedTo: "Robert Brown" },
  { id: 3, customerId: 10, date: "2023-11-25", type: "in_person", status: "scheduled", notes: "Demo of Voyager Touring", assignedTo: "Jane Doe" },
  { id: 4, customerId: 2, date: "2023-11-22", type: "call", status: "completed", notes: "Discussed financing options", assignedTo: "Robert Brown" },
  { id: 5, customerId: 5, date: "2023-11-20", type: "email", status: "completed", notes: "Sent winter storage guide", assignedTo: "Jane Doe" },
];

export default function CrmPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [addCustomerDialogOpen, setAddCustomerDialogOpen] = useState(false);
  const [addFollowUpDialogOpen, setAddFollowUpDialogOpen] = useState(false);
  
  // Get customers data
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => {
      // Simulating data for demo, would normally fetch from API
      return Promise.resolve(sampleCustomers);
    },
  });
  
  // Get follow-ups data
  const { data: followUps } = useQuery({
    queryKey: ["/api/follow-ups"],
    queryFn: () => {
      // Simulating data for demo, would normally fetch from API
      return Promise.resolve(sampleFollowUps);
    },
  });
  
  const filteredCustomers = customers?.filter(customer => {
    if (searchTerm === "") return true;
    
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
  });
  
  const customerDetail = customers?.find(c => c.id === selectedCustomer);
  
  const customerFollowUps = followUps?.filter(f => f.customerId === selectedCustomer);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const getFollowUpTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "in_person":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleSelectCustomer = (id: number) => {
    setSelectedCustomer(id);
  };
  
  const handleAddCustomer = () => {
    setAddCustomerDialogOpen(false);
    // Add implementation here
  };
  
  const handleAddFollowUp = () => {
    setAddFollowUpDialogOpen(false);
    // Add implementation here
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0 lg:pl-64">
        <TopNav title="Customer Relationship Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Customer List */}
            <div className="lg:w-1/2 xl:w-2/5">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Customers</CardTitle>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search customers..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                      
                      <Dialog open={addCustomerDialogOpen} onOpenChange={setAddCustomerDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-[#1a4b8c]">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Customer
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Add New Customer</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" />
                              </div>
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="address">Address</Label>
                              <Input id="address" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input id="zipCode" />
                              </div>
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="dateOfBirth">Date of Birth</Label>
                              <Input id="dateOfBirth" type="date" />
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea id="notes" placeholder="Additional information about the customer" />
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" onClick={() => setAddCustomerDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button className="bg-[#1a4b8c]" onClick={handleAddCustomer}>
                                Add Customer
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : filteredCustomers?.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No matching customers found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCustomers?.map((customer) => (
                        <div 
                          key={customer.id} 
                          className={`p-3 rounded-md cursor-pointer border transition-colors ${
                            selectedCustomer === customer.id 
                              ? 'border-[#1a4b8c] bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectCustomer(customer.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{customer.firstName} {customer.lastName}</p>
                              <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(customer.lifetimeValue)}</p>
                              <p className="text-xs text-gray-500">Lifetime Value</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t pt-6">
                  <p className="text-sm text-gray-500">
                    Showing {filteredCustomers?.length || 0} of {customers?.length || 0} customers
                  </p>
                </CardFooter>
              </Card>
            </div>
            
            {/* Customer Details */}
            <div className="lg:w-1/2 xl:w-3/5">
              {selectedCustomer ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="text-lg">
                            {customerDetail ? getInitials(customerDetail.firstName, customerDetail.lastName) : ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl">
                            {customerDetail?.firstName} {customerDetail?.lastName}
                          </CardTitle>
                          <p className="text-gray-500">Customer since {customerDetail ? formatDate(customerDetail.createdAt) : ""}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button className="bg-[#1a4b8c]" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          New Sale
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs defaultValue="overview">
                      <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="purchases">Purchases</TabsTrigger>
                        <TabsTrigger value="followups">Follow-ups</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                <span>{customerDetail?.email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                <span>{customerDetail?.phone}</span>
                              </div>
                              <div className="flex items-start">
                                <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                                <div>
                                  <p>{customerDetail?.address}</p>
                                  <p>{customerDetail?.city}, {customerDetail?.state} {customerDetail?.zipCode}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                <span>Born: {customerDetail ? formatDate(customerDetail.dateOfBirth) : ""}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Purchase Summary</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Total Purchases:</span>
                                <span className="font-medium">{customerDetail?.totalPurchases}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Last Purchase:</span>
                                <span className="font-medium">{customerDetail ? formatDate(customerDetail.lastPurchase) : ""}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Lifetime Value:</span>
                                <span className="font-medium">{customerDetail ? formatCurrency(customerDetail.lifetimeValue) : ""}</span>
                              </div>
                            </div>
                            
                            <div className="mt-6">
                              <h4 className="font-medium mb-2">Next Follow-up</h4>
                              {customerFollowUps && customerFollowUps.length > 0 ? (
                                <div className="bg-blue-50 p-3 rounded-md">
                                  <div className="flex items-center">
                                    <div className="bg-[#1a4b8c] text-white p-2 rounded-full mr-3">
                                      {getFollowUpTypeIcon(customerFollowUps[0].type)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{formatDate(customerFollowUps[0].date)}</p>
                                      <p className="text-sm text-gray-600">{customerFollowUps[0].notes}</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-3 bg-gray-50 rounded-md">
                                  <p className="text-gray-500">No upcoming follow-ups</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8">
                          <h3 className="text-lg font-medium mb-4">Customer Insights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="font-medium text-lg mb-1">Customer Loyalty</div>
                                  <div className="text-3xl font-medium text-[#1a4b8c]">
                                    {customerDetail && customerDetail.totalPurchases > 2 ? "High" : 
                                      customerDetail && customerDetail.totalPurchases > 0 ? "Medium" : "Low"}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-2">Based on purchase history</p>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="font-medium text-lg mb-1">Purchase Frequency</div>
                                  <div className="text-3xl font-medium text-[#d32f2f]">
                                    {customerDetail && 
                                     new Date(customerDetail.lastPurchase).getTime() > new Date().getTime() - 90 * 24 * 60 * 60 * 1000 
                                     ? "Recent" : "Inactive"}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-2">Last activity {customerDetail && 
                                    Math.floor((new Date().getTime() - new Date(customerDetail.lastPurchase).getTime()) / 
                                    (24 * 60 * 60 * 1000))} days ago</p>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="font-medium text-lg mb-1">Recommended Action</div>
                                  <div className="text-xl font-medium text-[#1a4b8c] mt-2">
                                    {customerDetail && customerDetail.totalPurchases > 1 ? 
                                      "Offer Premium Service" : "Invite to Test Drive"}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-2">Based on customer profile</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="purchases" className="mt-6">
                        <div className="flex justify-between mb-4">
                          <h3 className="text-lg font-medium">Purchase History</h3>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Purchase
                          </Button>
                        </div>
                        
                        {customerDetail && customerDetail.totalPurchases > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Salesperson</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>{formatDate(customerDetail.lastPurchase)}</TableCell>
                                <TableCell>Explorer 750R</TableCell>
                                <TableCell>${(customerDetail.lifetimeValue / customerDetail.totalPurchases).toLocaleString()}</TableCell>
                                <TableCell>Jane Doe</TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm">View Details</Button>
                                </TableCell>
                              </TableRow>
                              {customerDetail.totalPurchases > 1 && (
                                <TableRow>
                                  <TableCell>{formatDate(new Date(new Date(customerDetail.lastPurchase).setMonth(new Date(customerDetail.lastPurchase).getMonth() - 6)).toISOString())}</TableCell>
                                  <TableCell>Voyager Cruiser</TableCell>
                                  <TableCell>$15,750</TableCell>
                                  <TableCell>Robert Brown</TableCell>
                                  <TableCell>
                                    <Button variant="outline" size="sm">View Details</Button>
                                  </TableCell>
                                </TableRow>
                              )}
                              {customerDetail.totalPurchases > 2 && (
                                <TableRow>
                                  <TableCell>{formatDate(new Date(new Date(customerDetail.lastPurchase).setMonth(new Date(customerDetail.lastPurchase).getMonth() - 12)).toISOString())}</TableCell>
                                  <TableCell>City Commuter 300</TableCell>
                                  <TableCell>$6,500</TableCell>
                                  <TableCell>Jane Doe</TableCell>
                                  <TableCell>
                                    <Button variant="outline" size="sm">View Details</Button>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-10 bg-gray-50 rounded-md">
                            <p className="text-gray-500">No purchase history available.</p>
                            <Button className="mt-4">Record First Purchase</Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="followups" className="mt-6">
                        <div className="flex justify-between mb-4">
                          <h3 className="text-lg font-medium">Follow-up Schedule</h3>
                          <Dialog open={addFollowUpDialogOpen} onOpenChange={setAddFollowUpDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Follow-up
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Schedule Follow-up</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label>Follow-up Type</Label>
                                  <RadioGroup defaultValue="call">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="call" id="call" />
                                      <Label htmlFor="call" className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2" /> Call
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="email" id="email" />
                                      <Label htmlFor="email" className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2" /> Email
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="in_person" id="in_person" />
                                      <Label htmlFor="in_person" className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" /> In Person
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                                
                                <div className="grid gap-2">
                                  <Label htmlFor="followupDate">Date</Label>
                                  <Input id="followupDate" type="date" />
                                </div>
                                
                                <div className="grid gap-2">
                                  <Label htmlFor="assignedTo">Assigned To</Label>
                                  <Select defaultValue="jane">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select staff member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="jane">Jane Doe</SelectItem>
                                      <SelectItem value="robert">Robert Brown</SelectItem>
                                      <SelectItem value="self">Myself</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="grid gap-2">
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea id="notes" placeholder="Details about the follow-up" />
                                </div>
                                
                                <div className="flex justify-end gap-2 mt-4">
                                  <Button variant="outline" onClick={() => setAddFollowUpDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button className="bg-[#1a4b8c]" onClick={handleAddFollowUp}>
                                    Schedule
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        {customerFollowUps && customerFollowUps.length > 0 ? (
                          <div className="space-y-4">
                            {customerFollowUps.map(followUp => (
                              <div key={followUp.id} className="border rounded-md p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className={`p-2 rounded-full mr-3 ${
                                      followUp.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                      {getFollowUpTypeIcon(followUp.type)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{formatDate(followUp.date)}</p>
                                      <p className="text-sm text-gray-500">Assigned to: {followUp.assignedTo}</p>
                                    </div>
                                  </div>
                                  <Badge className={followUp.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                    {followUp.status === 'completed' ? 'Completed' : 'Scheduled'}
                                  </Badge>
                                </div>
                                <div className="mt-2 pl-9">
                                  <p className="text-sm">{followUp.notes}</p>
                                </div>
                                <div className="mt-4 pl-9 flex gap-2">
                                  {followUp.status !== 'completed' && (
                                    <Button size="sm" variant="outline">Mark Complete</Button>
                                  )}
                                  <Button size="sm" variant="outline">Edit</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 bg-gray-50 rounded-md">
                            <p className="text-gray-500">No follow-ups scheduled.</p>
                            <Button className="mt-4">Schedule First Follow-up</Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="notes" className="mt-6">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newNote">Add a Note</Label>
                            <Textarea id="newNote" placeholder="Type your note here..." className="min-h-[120px]" />
                            <Button className="mt-2 bg-[#1a4b8c]">Save Note</Button>
                          </div>
                          
                          <div className="border-t pt-6 mt-4">
                            <h3 className="text-lg font-medium mb-4">Previous Notes</h3>
                            
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-md">
                                <div className="flex justify-between mb-2">
                                  <p className="font-medium">Jane Doe</p>
                                  <p className="text-sm text-gray-500">Oct 15, 2023</p>
                                </div>
                                <p>Customer is interested in the new Explorer 750R model and may be ready for a test ride next month.</p>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-md">
                                <div className="flex justify-between mb-2">
                                  <p className="font-medium">Robert Brown</p>
                                  <p className="text-sm text-gray-500">Aug 22, 2023</p>
                                </div>
                                <p>Initial meeting with customer. Showed interest in sport models but concerned about price range.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-10">
                  <div className="text-center">
                    <BarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Details</h3>
                    <p className="text-gray-500 mb-4">Select a customer to view their details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
