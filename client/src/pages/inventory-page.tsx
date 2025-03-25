import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Filter, DownloadCloud, Camera, Sliders, Info, Tag, UploadCloud, Clipboard, PlusCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Motorcycle } from "@shared/schema";

// Generate random SKU code
const generateSKU = (make: string, model: string, year: number) => {
  const makePrefix = make.slice(0, 3).toUpperCase();
  const modelPrefix = model.replace(/\s+/g, '').slice(0, 3).toUpperCase();
  const yearSuffix = year.toString().slice(2);
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${makePrefix}${modelPrefix}${yearSuffix}-${randomDigits}`;
};

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMotorcycle, setNewMotorcycle] = useState({
    model: "",
    make: "",
    year: new Date().getFullYear(),
    category: "",
    subcategory: "",
    color: "",
    price: 0,
    cost: 0,
    msrp: 0,
    vin: "",
    sku: "",
    engineType: "",
    engineCapacity: 0,
    transmission: "",
    fuelCapacity: 0,
    seatHeight: 0,
    weight: 0,
    power: 0,
    torque: 0,
    description: "",
    features: [],
    warranty: "",
    condition: "new",
    stock: 0,
    reorderPoint: 5,
    status: "in_stock"
  });
  const [currentTab, setCurrentTab] = useState("basic");
  const [featureInput, setFeatureInput] = useState("");
  
  // Get inventory data
  const { data: inventory, isLoading, isError } = useQuery<Motorcycle[]>({
    queryKey: ["/api/motorcycles"],
  });
  
  // Add new motorcycle mutation
  const createMotorcycleMutation = useMutation({
    mutationFn: async (motorcycle: any) => {
      const response = await apiRequest("POST", "/api/motorcycles", motorcycle);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/motorcycles"] });
      setAddDialogOpen(false);
      resetNewMotorcycleForm();
      toast({
        title: "Motorcycle added",
        description: `${newMotorcycle.make} ${newMotorcycle.model} has been added to inventory.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding motorcycle",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const resetNewMotorcycleForm = () => {
    setNewMotorcycle({
      model: "",
      make: "",
      year: new Date().getFullYear(),
      category: "",
      subcategory: "",
      color: "",
      price: 0,
      cost: 0,
      msrp: 0,
      vin: "",
      sku: "",
      engineType: "",
      engineCapacity: 0,
      transmission: "",
      fuelCapacity: 0,
      seatHeight: 0,
      weight: 0,
      power: 0,
      torque: 0,
      description: "",
      features: [],
      warranty: "",
      condition: "new",
      stock: 0,
      reorderPoint: 5,
      status: "in_stock"
    });
    setCurrentTab("basic");
  };
  
  const filteredInventory = inventory?.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Status badge display based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>;
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>;
      case "discontinued":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Discontinued</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Form input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert to appropriate type
    const processedValue = type === 'number' ? (value ? parseFloat(value) : 0) : value;
    
    // Generate SKU when model, make, or year changes
    if (name === "model" || name === "make" || name === "year") {
      const updatedValues = { ...newMotorcycle, [name]: processedValue };
      if (updatedValues.make && updatedValues.model && updatedValues.year) {
        updatedValues.sku = generateSKU(updatedValues.make, updatedValues.model, updatedValues.year as number);
      }
      setNewMotorcycle(updatedValues);
    } else {
      setNewMotorcycle(prev => ({ ...prev, [name]: processedValue }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewMotorcycle(prev => ({ ...prev, [name]: value }));
  };
  
  const addFeature = () => {
    if (featureInput.trim()) {
      setNewMotorcycle(prev => ({ 
        ...prev, 
        features: [...(prev.features as string[] || []), featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };
  
  const removeFeature = (index: number) => {
    setNewMotorcycle(prev => ({
      ...prev,
      features: (prev.features as string[]).filter((_, i) => i !== index)
    }));
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddItem = () => {
    // Validate form
    if (!newMotorcycle.model || !newMotorcycle.make || !newMotorcycle.vin || !newMotorcycle.category) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields (Model, Make, VIN, Category)",
        variant: "destructive",
      });
      return;
    }
    
    // Submit form
    createMotorcycleMutation.mutate(newMotorcycle);
  };
  
  const uniqueCategories = [...new Set((inventory || []).map(item => item.category))];
  
  // Form tabs for organizing the complex motorcycle entry form
  const renderAddMotorcycleForm = () => (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="model">Model*</Label>
          <Input 
            id="model" 
            name="model"
            placeholder="Explorer 750R" 
            value={newMotorcycle.model}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="make">Make*</Label>
            <Input 
              id="make" 
              name="make"
              placeholder="Voyager" 
              value={newMotorcycle.make} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year">Year*</Label>
            <Input 
              id="year" 
              name="year"
              placeholder="2023" 
              type="number" 
              value={newMotorcycle.year} 
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category*</Label>
            <Select 
              name="category" 
              value={newMotorcycle.category.toString()} 
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sport">Sport</SelectItem>
                <SelectItem value="Cruiser">Cruiser</SelectItem>
                <SelectItem value="Touring">Touring</SelectItem>
                <SelectItem value="Off-road">Off-road</SelectItem>
                <SelectItem value="Commuter">Commuter</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
                <SelectItem value="Scooter">Scooter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Input 
              id="subcategory" 
              name="subcategory"
              placeholder="Dual Sport" 
              value={newMotorcycle.subcategory || ""} 
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="color">Color*</Label>
            <Input 
              id="color" 
              name="color"
              placeholder="Red" 
              value={newMotorcycle.color} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="condition">Condition</Label>
            <Select 
              name="condition" 
              value={newMotorcycle.condition} 
              onValueChange={(value) => handleSelectChange("condition", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="refurbished">Refurbished</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="vin">VIN*</Label>
          <Input 
            id="vin" 
            name="vin"
            placeholder="VGR123456789" 
            value={newMotorcycle.vin} 
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sku">SKU (auto-generated)</Label>
          <Input 
            id="sku" 
            name="sku"
            placeholder="VOY750R23-0001" 
            value={newMotorcycle.sku} 
            onChange={handleInputChange}
            disabled
          />
        </div>
      </TabsContent>
      
      <TabsContent value="specs" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="engineType">Engine Type</Label>
            <Input 
              id="engineType" 
              name="engineType"
              placeholder="4-stroke, liquid-cooled, DOHC" 
              value={newMotorcycle.engineType || ""} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="engineCapacity">Engine Capacity (cc)</Label>
            <Input 
              id="engineCapacity" 
              name="engineCapacity"
              placeholder="750" 
              type="number" 
              value={newMotorcycle.engineCapacity || ""} 
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Input 
              id="transmission" 
              name="transmission"
              placeholder="6-speed manual" 
              value={newMotorcycle.transmission || ""} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fuelCapacity">Fuel Capacity (liters)</Label>
            <Input 
              id="fuelCapacity" 
              name="fuelCapacity"
              placeholder="15" 
              type="number" 
              value={newMotorcycle.fuelCapacity || ""} 
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="seatHeight">Seat Height (mm)</Label>
            <Input 
              id="seatHeight" 
              name="seatHeight"
              placeholder="840" 
              type="number" 
              value={newMotorcycle.seatHeight || ""} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input 
              id="weight" 
              name="weight"
              placeholder="210" 
              type="number" 
              value={newMotorcycle.weight || ""} 
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="power">Power (hp)</Label>
            <Input 
              id="power" 
              name="power"
              placeholder="85" 
              type="number" 
              value={newMotorcycle.power || ""} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="torque">Torque (Nm)</Label>
            <Input 
              id="torque" 
              name="torque"
              placeholder="68" 
              type="number" 
              value={newMotorcycle.torque || ""} 
              onChange={handleInputChange}
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="details" className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            name="description"
            placeholder="Provide detailed description of the motorcycle..." 
            className="h-[100px]"
            value={newMotorcycle.description || ""} 
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="features">Features</Label>
          <div className="flex gap-2">
            <Input 
              id="featureInput" 
              placeholder="Add a feature..." 
              value={featureInput} 
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addFeature}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {newMotorcycle.features && newMotorcycle.features.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {(newMotorcycle.features as string[]).map((feature, index) => (
                <Badge key={index} className="flex items-center gap-1 bg-slate-100 text-slate-800 hover:bg-slate-100">
                  {feature}
                  <button 
                    type="button" 
                    className="ml-1 text-slate-500 hover:text-slate-800"
                    onClick={() => removeFeature(index)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic mt-2">No features added yet</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="warranty">Warranty Information</Label>
          <Input 
            id="warranty" 
            name="warranty"
            placeholder="2 years limited warranty" 
            value={newMotorcycle.warranty || ""} 
            onChange={handleInputChange}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="inventory" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Price ($)*</Label>
            <Input 
              id="price" 
              name="price"
              placeholder="12990" 
              type="number" 
              value={newMotorcycle.price || ""} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cost">Cost ($)*</Label>
            <Input 
              id="cost" 
              name="cost"
              placeholder="10500" 
              type="number" 
              value={newMotorcycle.cost || ""} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="msrp">MSRP ($)</Label>
            <Input 
              id="msrp" 
              name="msrp"
              placeholder="13999" 
              type="number" 
              value={newMotorcycle.msrp || ""} 
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stock">Stock Quantity*</Label>
            <Input 
              id="stock" 
              name="stock"
              placeholder="10" 
              type="number" 
              value={newMotorcycle.stock || ""} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reorderPoint">Reorder Point</Label>
            <Input 
              id="reorderPoint" 
              name="reorderPoint"
              placeholder="5" 
              type="number" 
              value={newMotorcycle.reorderPoint || ""} 
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              name="status" 
              value={newMotorcycle.status} 
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Storage Location</Label>
          <Input 
            id="location" 
            name="location"
            placeholder="Warehouse A, Section B3" 
            value={newMotorcycle.location || ""} 
            onChange={handleInputChange}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
  
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
                      placeholder="Search by model, make, VIN, SKU..."
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
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Motorcycle</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {renderAddMotorcycleForm()}
                        
                        <div className="flex justify-between items-center mt-6">
                          <div className="flex items-center text-sm text-gray-500">
                            <Info className="h-4 w-4 mr-1" />
                            Fields marked with * are required
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button className="bg-[#1a4b8c]" onClick={handleAddItem}>
                              {createMotorcycleMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="h-4 w-4 mr-2" />
                                  Add Motorcycle
                                </>
                              )}
                            </Button>
                          </div>
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
                      <SelectItem value="discontinued">Discontinued</SelectItem>
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
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-red-500 mb-4">Error loading inventory data</div>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/motorcycles"] })}>
                    Try Again
                  </Button>
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
                        <TableHead>SKU</TableHead>
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
                            <TableCell className="font-medium">{item.model}</TableCell>
                            <TableCell>{item.make}</TableCell>
                            <TableCell>{item.year}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.color}</TableCell>
                            <TableCell>${item.price.toLocaleString()}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>
                              <span className={
                                item.stock > (item.reorderPoint || 5) ? "text-green-600" : 
                                item.stock <= 0 ? "text-red-600 font-bold" : 
                                "text-yellow-600 font-bold"
                              }>
                                {item.stock}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(item.status || "unknown")}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Sliders className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Images
                                </Button>
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
