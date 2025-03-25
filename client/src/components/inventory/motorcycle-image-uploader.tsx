import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, X, Upload, Image as ImageIcon, CheckCircle } from "lucide-react";
import { MotorcycleImage } from "@shared/schema";

interface MotorcycleImageUploaderProps {
  motorcycleId: number;
}

export default function MotorcycleImageUploader({ motorcycleId }: MotorcycleImageUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);

  // Query to fetch existing images
  const { data: images, isLoading } = useQuery<MotorcycleImage[]>({
    queryKey: [`/api/motorcycles/${motorcycleId}/images`],
    enabled: !!motorcycleId,
  });

  // Mutation to upload a new image
  const uploadImageMutation = useMutation({
    mutationFn: async (imageData: { imageUrl: string; alt?: string; isPrimary: boolean }) => {
      const response = await apiRequest(
        "POST", 
        `/api/motorcycles/${motorcycleId}/images`, 
        imageData
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/motorcycles/${motorcycleId}/images`] });
      queryClient.invalidateQueries({ queryKey: ["/api/motorcycles"] });
      setImageUrl("");
      setAlt("");
      toast({
        title: "Image uploaded",
        description: "The image has been successfully added to the motorcycle.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete an image
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await apiRequest("DELETE", `/api/motorcycles/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/motorcycles/${motorcycleId}/images`] });
      queryClient.invalidateQueries({ queryKey: ["/api/motorcycles"] });
      toast({
        title: "Image deleted",
        description: "The image has been removed from the motorcycle.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to set an image as primary
  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: number) => {
      // First, set all images to non-primary
      const currentImages = images || [];
      for (const img of currentImages) {
        if (img.isPrimary) {
          await apiRequest("PUT", `/api/motorcycles/images/${img.id}`, { isPrimary: false });
        }
      }
      // Then set the selected image as primary
      await apiRequest("PUT", `/api/motorcycles/images/${imageId}`, { isPrimary: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/motorcycles/${motorcycleId}/images`] });
      queryClient.invalidateQueries({ queryKey: ["/api/motorcycles"] });
      toast({
        title: "Primary image updated",
        description: "The primary image has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating primary image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUrlUpload = async () => {
    if (!imageUrl) {
      toast({
        title: "Image URL required",
        description: "Please enter a valid image URL.",
        variant: "destructive",
      });
      return;
    }

    // Check if this would be the first image (make it primary)
    const isPrimary = !images || images.length === 0 || !images.some(img => img.isPrimary);
    
    uploadImageMutation.mutate({ 
      imageUrl, 
      alt: alt || undefined,
      isPrimary 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    
    // In a real implementation, you would upload the file to a storage service
    // For this demo, we'll just simulate the upload process
    setUploading(true);
    
    try {
      // Simulate a file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This is where you'd normally get the URL back from your storage service
      // For demo purposes, we'll create a fake URL
      const fakeImageUrl = `https://example.com/motorcycle-images/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      // Check if this would be the first image (make it primary)
      const isPrimary = !images || images.length === 0 || !images.some(img => img.isPrimary);
      
      // Upload the image reference to the database
      uploadImageMutation.mutate({
        imageUrl: fakeImageUrl,
        alt: file.name,
        isPrimary
      });
      
      toast({
        title: "File upload simulated",
        description: "In a production environment, this would upload to a storage service.",
      });
    } catch (error) {
      toast({
        title: "Error uploading file",
        description: "An error occurred while uploading the file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Clear the file input
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Upload an Image</h3>
          <p className="text-sm text-muted-foreground">
            Add images for this motorcycle. The first image will be set as the primary image.
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <div className="flex gap-2">
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={uploadImageMutation.isPending}
            />
            <Button
              type="button"
              onClick={handleUrlUpload}
              disabled={uploadImageMutation.isPending || !imageUrl}
            >
              {uploadImageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Add
            </Button>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="alt">Alt Text (Optional)</Label>
          <Input
            id="alt"
            placeholder="Describe the image for accessibility"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            disabled={uploadImageMutation.isPending}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fileUpload">Or upload a file</Label>
          <div className="flex items-center gap-2">
            <Input
              id="fileUpload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Note: This is a demo, files will not be actually uploaded to a server.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Existing Images</h3>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-muted/20">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-sm text-muted-foreground">No images have been added yet</p>
          </div>
        ) : (
          <ScrollArea className="h-72 rounded-md border">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden relative group">
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    {image.isPrimary && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Primary
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteImageMutation.mutate(image.id)}
                      disabled={deleteImageMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative pt-[56.25%]">
                    <img
                      src={image.imageUrl}
                      alt={image.alt || `Motorcycle image ${image.id}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs truncate">
                        {image.alt || `Image ${image.id}`}
                      </p>
                      {!image.isPrimary && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => setPrimaryMutation.mutate(image.id)}
                          disabled={setPrimaryMutation.isPending}
                        >
                          {setPrimaryMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          <span className="text-xs">Set primary</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}