import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Motorcycle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import MotorcycleImageUploader from "./motorcycle-image-uploader";

interface MotorcycleDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motorcycleId: number | null;
}

export default function MotorcycleDetailDialog({
  open,
  onOpenChange,
  motorcycleId
}: MotorcycleDetailDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [editedMotorcycle, setEditedMotorcycle] = useState<Partial<Motorcycle> | null>(null);

  // Fetch motorcycle details when the dialog is open and we have an ID
  const { data: motorcycle, isLoading } = useQuery<Motorcycle & { images?: any[] }>({
    queryKey: [`/api/motorcycles/${motorcycleId}`],
    enabled: open && !!motorcycleId,
    onSuccess: (data) => {
      setEditedMotorcycle(data);
    },
  });

  // Update motorcycle mutation
  const updateMotorcycleMutation = useMutation({
    mutationFn: async (updatedMotorcycle: Partial<Motorcycle>) => {
      if (!motorcycleId) throw new Error("No motorcycle ID provided");
      const response = await apiRequest("PUT", `/api/motorcycles/${motorcycleId}`, updatedMotorcycle);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/motorcycles"] });
      queryClient.invalidateQueries({ queryKey: [`/api/motorcycles/${motorcycleId}`] });
      toast({
        title: "Motorcycle updated",
        description: "The motorcycle details have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating motorcycle",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? (value ? parseFloat(value) : undefined) : value;
    
    setEditedMotorcycle(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedMotorcycle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (!editedMotorcycle) return;
    updateMotorcycleMutation.mutate(editedMotorcycle);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? "Loading..." : `Edit ${motorcycle?.make} ${motorcycle?.model}`}
          </DialogTitle>
          <DialogDescription>
            Update motorcycle details, specifications, and manage images.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !motorcycle ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load motorcycle details</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: [`/api/motorcycles/${motorcycleId}`] });
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <Tabs 
              defaultValue="details" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      name="make"
                      value={editedMotorcycle?.make || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      name="model"
                      value={editedMotorcycle?.model || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      value={editedMotorcycle?.year || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      name="category" 
                      value={editedMotorcycle?.category || ""} 
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
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      name="subcategory"
                      value={editedMotorcycle?.subcategory || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={editedMotorcycle?.color || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select 
                      name="condition" 
                      value={editedMotorcycle?.condition || "new"} 
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={editedMotorcycle?.price || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Cost ($)</Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      value={editedMotorcycle?.cost || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="msrp">MSRP ($)</Label>
                    <Input
                      id="msrp"
                      name="msrp"
                      type="number"
                      value={editedMotorcycle?.msrp || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="h-24"
                    value={editedMotorcycle?.description || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    name="vin"
                    value={editedMotorcycle?.vin || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={editedMotorcycle?.sku || ""}
                    onChange={handleInputChange}
                    readOnly
                  />
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="engineType">Engine Type</Label>
                    <Input
                      id="engineType"
                      name="engineType"
                      value={editedMotorcycle?.engineType || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="engineCapacity">Engine Capacity (cc)</Label>
                    <Input
                      id="engineCapacity"
                      name="engineCapacity"
                      type="number"
                      value={editedMotorcycle?.engineCapacity || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transmission">Transmission</Label>
                    <Input
                      id="transmission"
                      name="transmission"
                      value={editedMotorcycle?.transmission || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuelCapacity">Fuel Capacity (L)</Label>
                    <Input
                      id="fuelCapacity"
                      name="fuelCapacity"
                      type="number"
                      value={editedMotorcycle?.fuelCapacity || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seatHeight">Seat Height (mm)</Label>
                    <Input
                      id="seatHeight"
                      name="seatHeight"
                      type="number"
                      value={editedMotorcycle?.seatHeight || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={editedMotorcycle?.weight || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="power">Power (hp)</Label>
                    <Input
                      id="power"
                      name="power"
                      type="number"
                      value={editedMotorcycle?.power || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="torque">Torque (Nm)</Label>
                    <Input
                      id="torque"
                      name="torque"
                      type="number"
                      value={editedMotorcycle?.torque || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    name="warranty"
                    value={editedMotorcycle?.warranty || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="images">
                {motorcycleId && <MotorcycleImageUploader motorcycleId={motorcycleId} />}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateMotorcycleMutation.isPending}
                className="bg-[#1a4b8c]"
              >
                {updateMotorcycleMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}