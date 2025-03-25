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
import { Loader2, Plus, Search, Filter, DownloadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data - In a real app this would come from the API
const sampleInventory = [
  { id: 1, model: "Explorer 750R", make: "Voyager", year: 2023, category: "Sport", color: "Red", price: 12990, cost: 10500, vin: "VGR123456789", stock: 24, status: "in_stock" },
  { id: 2, model: "Voyager Cruiser", make: "Voyager", year: 2023, category: "Cruiser", color: "Black", price: 15750, cost: 12600, vin: "VGR234567890", stock: 18, status: "in_stock" },
  { id: 3, model: "Speedster 1000", make: "Voyager", year: 2023, category: "Sport", color: "Blue", price: 18490, cost: 14800, vin: "VGR345678901", stock: 5, status: "low_stock" },
  { id: 4, model: "Trail Blazer 450", make: "Voyager", year: 2023, category: "Off-road", color: "Green", price: 9995, cost: 7900, vin: "VGR456789012", stock: 12, status: "in_stock" },
  { id: 5, model: "Voyager Touring", make: "Voyager", year: 2023, category: "Touring", color: "Silver", price: 22750, cost: 18200, vin: "VGR567890123", stock: 0, status: "out_of_stock" },
  { id: 6, model: "City Commuter 300", make: "Voyager", year: 2023, category: "Commuter", color: "White", price: 6500, cost: 5100, vin: "VGR678901234", stock: 15, status: "in_stock" },
  { id: 7, model: "Classic Vintage", make: "Voyager", year: 2023, category: "Cruiser", color: "Burgundy", price: 14250, cost: 11400, vin: "VGR789012345", stock: 8, status: "in_stock" },
  { id: 8, model: "Mountain Explorer 600", make: "Voyager", year: 2023, category: "Adventure", color: "Orange", price: 11750, cost: 9400, vin: "VGR890123456", stock: 3, status: "low_stock" },
  { id: 9, model: "Racing Pro 1200", make: "Voyager", year: 2023, category: "Sport", color: "Yellow", price: 21990, cost: 17600, vin: "VGR901234567", stock: 2, status: "low_stock" },
  { id: 10, model: "Urban Rider 250", make: "Voyager", year: 2023, category: "Commuter", color: "Gray", price: 5990, cost: 4800, vin: "VGR012345678", stock: 20, status: "in_stock" },
];

export default function InventoryPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Get inventory data
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/motorcycles"],
    queryFn: () => {
      // Simulating data for demo, would normally fetch from API
      return Promise.resolve(sampleInventory);
    },
  });
  
  const filteredInventory = inventory?.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vin.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>;
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddItem = () => {
    setAddDialogOpen(false);
    // Add implementation here
  };
  
  const uniqueCategories = [...new Set(inventory?.map(item => item.category) || [])];
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0 lg:pl-64">
        <TopNav title="Inventory Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Motorcycle Inventory</CardTitle>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by model, make, or VIN..."
                      className="pl-10 w-full md:w-[300px]"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#1a4b8c]">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Motorcycle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Motorcycle</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="model">Model</Label>
                          <Input id="model" placeholder="Explorer 750R" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="make">Make</Label>
                            <Input id="make" placeholder="Voyager" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="year">Year</Label>
                            <Input id="year" placeholder="2023" type="number" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sport">Sport</SelectItem>
                                <SelectItem value="cruiser">Cruiser</SelectItem>
                                <SelectItem value="touring">Touring</SelectItem>
                                <SelectItem value="off-road">Off-road</SelectItem>
                                <SelectItem value="commuter">Commuter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="color">Color</Label>
                            <Input id="color" placeholder="Red" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" placeholder="12990" type="number" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="cost">Cost ($)</Label>
                            <Input id="cost" placeholder="10500" type="number" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="vin">VIN</Label>
                            <Input id="vin" placeholder="VGR123456789" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" placeholder="10" type="number" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button className="bg-[#1a4b8c]" onClick={handleAddItem}>
                            Add Motorcycle
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
                
                <div className="grid grid-cols-2 md:flex gap-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {uniqueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" className="md:ml-auto">
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Export
                  </Button>
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
                        <TableHead>Model</TableHead>
                        <TableHead>Make</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-10">
                            No matching inventory items found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInventory?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.make}</TableCell>
                            <TableCell>{item.year}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.color}</TableCell>
                            <TableCell>${item.price.toLocaleString()}</TableCell>
                            <TableCell>{item.vin}</TableCell>
                            <TableCell>{item.stock}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="outline" size="sm" className="text-[#d32f2f]">Delete</Button>
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
        </main>
      </div>
    </div>
  );
}
