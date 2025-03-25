import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Define form schemas
const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  inventoryAlerts: z.boolean().default(true),
  leadNotifications: z.boolean().default(true),
  salesReports: z.boolean().default(true),
  marketingUpdates: z.boolean().default(false),
});

const displaySchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("light"),
  dashboardLayout: z.enum(["default", "compact", "expanded"]).default("default"),
  language: z.enum(["en", "es", "fr"]).default("en"),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).default("MM/DD/YYYY"),
  timeFormat: z.enum(["12h", "24h"]).default("12h"),
});

const exportSchema = z.object({
  exportFormat: z.enum(["csv", "excel", "pdf"]).default("excel"),
  dataRange: z.enum(["all", "thisMonth", "lastMonth", "thisYear", "custom"]).default("thisMonth"),
  includeHeaders: z.boolean().default(true),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;
type DisplayFormValues = z.infer<typeof displaySchema>;
type ExportFormValues = z.infer<typeof exportSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  
  // Notification settings form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      inventoryAlerts: true,
      leadNotifications: true,
      salesReports: true,
      marketingUpdates: false,
    },
  });

  // Display settings form
  const displayForm = useForm<DisplayFormValues>({
    resolver: zodResolver(displaySchema),
    defaultValues: {
      theme: "light",
      dashboardLayout: "default",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
    },
  });

  // Export settings form
  const exportForm = useForm<ExportFormValues>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      exportFormat: "excel",
      dataRange: "thisMonth",
      includeHeaders: true,
    },
  });
  
  // Update notification settings mutation
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      const res = await apiRequest("PUT", `/api/user/${user?.id}/notifications`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your notification settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update notification settings",
        variant: "destructive",
      });
    },
  });

  // Update display settings mutation
  const updateDisplaySettingsMutation = useMutation({
    mutationFn: async (data: DisplayFormValues) => {
      const res = await apiRequest("PUT", `/api/user/${user?.id}/display`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your display settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update display settings",
        variant: "destructive",
      });
    },
  });

  // Update export settings mutation
  const updateExportSettingsMutation = useMutation({
    mutationFn: async (data: ExportFormValues) => {
      const res = await apiRequest("PUT", `/api/user/${user?.id}/export`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your export settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update export settings",
        variant: "destructive",
      });
    },
  });
  
  const onNotificationSubmit = (data: NotificationFormValues) => {
    updateNotificationSettingsMutation.mutate(data);
  };
  
  const onDisplaySubmit = (data: DisplayFormValues) => {
    updateDisplaySettingsMutation.mutate(data);
  };
  
  const onExportSubmit = (data: ExportFormValues) => {
    updateExportSettingsMutation.mutate(data);
  };
  
  const handleAccountDelete = () => {
    // In a real app, this would make an API call to delete the account
    toast({
      title: "Account deletion initiated",
      description: "Your account will be deleted within 24 hours.",
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0 lg:pl-64">
        <TopNav title="Settings" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="notifications" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage how you receive notifications and alerts.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={notificationForm.watch("emailNotifications")}
                            onCheckedChange={(checked) => notificationForm.setValue("emailNotifications", checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="smsNotifications">SMS Notifications</Label>
                            <p className="text-sm text-gray-500">Receive notifications via text message</p>
                          </div>
                          <Switch
                            id="smsNotifications"
                            checked={notificationForm.watch("smsNotifications")}
                            onCheckedChange={(checked) => notificationForm.setValue("smsNotifications", checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="font-medium text-lg mb-4">Notification Types</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="inventoryAlerts">Inventory Alerts</Label>
                              <p className="text-sm text-gray-500">Low stock and reorder notifications</p>
                            </div>
                            <Switch
                              id="inventoryAlerts"
                              checked={notificationForm.watch("inventoryAlerts")}
                              onCheckedChange={(checked) => notificationForm.setValue("inventoryAlerts", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="leadNotifications">Lead Notifications</Label>
                              <p className="text-sm text-gray-500">New customer inquiries and leads</p>
                            </div>
                            <Switch
                              id="leadNotifications"
                              checked={notificationForm.watch("leadNotifications")}
                              onCheckedChange={(checked) => notificationForm.setValue("leadNotifications", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="salesReports">Sales Reports</Label>
                              <p className="text-sm text-gray-500">Daily and weekly sales summaries</p>
                            </div>
                            <Switch
                              id="salesReports"
                              checked={notificationForm.watch("salesReports")}
                              onCheckedChange={(checked) => notificationForm.setValue("salesReports", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="marketingUpdates">Marketing Updates</Label>
                              <p className="text-sm text-gray-500">Promotional campaigns and marketing alerts</p>
                            </div>
                            <Switch
                              id="marketingUpdates"
                              checked={notificationForm.watch("marketingUpdates")}
                              onCheckedChange={(checked) => notificationForm.setValue("marketingUpdates", checked)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-[#1a4b8c]"
                          disabled={updateNotificationSettingsMutation.isPending}
                        >
                          {updateNotificationSettingsMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="display">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize how the application looks and feels.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={displayForm.handleSubmit(onDisplaySubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="theme">Theme</Label>
                          <Select
                            value={displayForm.watch("theme")}
                            onValueChange={(value: "light" | "dark" | "system") => displayForm.setValue("theme", value)}
                          >
                            <SelectTrigger id="theme">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="dashboardLayout">Dashboard Layout</Label>
                          <Select
                            value={displayForm.watch("dashboardLayout")}
                            onValueChange={(value: "default" | "compact" | "expanded") => displayForm.setValue("dashboardLayout", value)}
                          >
                            <SelectTrigger id="dashboardLayout">
                              <SelectValue placeholder="Select layout" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="compact">Compact</SelectItem>
                              <SelectItem value="expanded">Expanded</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="font-medium text-lg mb-4">Regional Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select
                              value={displayForm.watch("language")}
                              onValueChange={(value: "en" | "es" | "fr") => displayForm.setValue("language", value)}
                            >
                              <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="dateFormat">Date Format</Label>
                            <Select
                              value={displayForm.watch("dateFormat")}
                              onValueChange={(value: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD") => displayForm.setValue("dateFormat", value)}
                            >
                              <SelectTrigger id="dateFormat">
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="timeFormat">Time Format</Label>
                            <Select
                              value={displayForm.watch("timeFormat")}
                              onValueChange={(value: "12h" | "24h") => displayForm.setValue("timeFormat", value)}
                            >
                              <SelectTrigger id="timeFormat">
                                <SelectValue placeholder="Select time format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                                <SelectItem value="24h">24-hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-[#1a4b8c]"
                          disabled={updateDisplaySettingsMutation.isPending}
                        >
                          {updateDisplaySettingsMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="export">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Settings</CardTitle>
                    <CardDescription>Configure default settings for exporting data.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={exportForm.handleSubmit(onExportSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="exportFormat">Default Export Format</Label>
                          <Select
                            value={exportForm.watch("exportFormat")}
                            onValueChange={(value: "csv" | "excel" | "pdf") => exportForm.setValue("exportFormat", value)}
                          >
                            <SelectTrigger id="exportFormat">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="dataRange">Default Date Range</Label>
                          <Select
                            value={exportForm.watch("dataRange")}
                            onValueChange={(value: "all" | "thisMonth" | "lastMonth" | "thisYear" | "custom") => exportForm.setValue("dataRange", value)}
                          >
                            <SelectTrigger id="dataRange">
                              <SelectValue placeholder="Select date range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Time</SelectItem>
                              <SelectItem value="thisMonth">This Month</SelectItem>
                              <SelectItem value="lastMonth">Last Month</SelectItem>
                              <SelectItem value="thisYear">This Year</SelectItem>
                              <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="includeHeaders">Include Column Headers</Label>
                            <p className="text-sm text-gray-500">Include column headers in exported files</p>
                          </div>
                          <Switch
                            id="includeHeaders"
                            checked={exportForm.watch("includeHeaders")}
                            onCheckedChange={(checked) => exportForm.setValue("includeHeaders", checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="font-medium text-lg mb-4">Quick Export</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button variant="outline">
                            Export Sales Data
                          </Button>
                          <Button variant="outline">
                            Export Inventory Data
                          </Button>
                          <Button variant="outline">
                            Export Customer Data
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-[#1a4b8c]"
                          disabled={updateExportSettingsMutation.isPending}
                        >
                          {updateExportSettingsMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account and connected services.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium text-lg mb-4">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Username</Label>
                          <Input value={user?.username} disabled className="bg-gray-100" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Account Type</Label>
                          <Input value={user?.role === "admin" ? "Administrator" : "Sales Manager"} disabled className="bg-gray-100" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input value={user?.email} disabled className="bg-gray-100" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-lg mb-4">Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                          </div>
                          <Button variant="outline">Setup 2FA</Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Password</Label>
                            <p className="text-sm text-gray-500">Change your password</p>
                          </div>
                          <Button variant="outline">Change Password</Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-lg mb-4">Data & Privacy</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Download Your Data</Label>
                            <p className="text-sm text-gray-500">Get a copy of your personal data</p>
                          </div>
                          <Button variant="outline">Download</Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Privacy Policy</Label>
                            <p className="text-sm text-gray-500">Review our privacy policy</p>
                          </div>
                          <Button variant="outline">View</Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-lg text-red-600 mb-4">Danger Zone</h3>
                      
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Danger</AlertTitle>
                        <AlertDescription>
                          The following actions are irreversible. Please proceed with caution.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        {user?.role === "admin" ? (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label>Reset Application Data</Label>
                                <p className="text-sm text-gray-500">Reset all application data to default</p>
                              </div>
                              <Button variant="destructive">Reset Data</Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label>Purge User Data</Label>
                                <p className="text-sm text-gray-500">Delete all user data and personal information</p>
                              </div>
                              <Button variant="destructive">Purge Data</Button>
                            </div>
                          </>
                        ) : null}

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Delete Account</Label>
                            <p className="text-sm text-gray-500">Permanently delete your account and all associated data</p>
                          </div>
                          <Button 
                            variant="destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Delete Account Dialog */}
                {isDeleteDialogOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h3 className="font-semibold text-xl mb-4">Delete Account</h3>
                      <p className="mb-4">This action cannot be undone. All your data will be permanently deleted.</p>
                      
                      <div className="mb-4">
                        <Label htmlFor="confirmEmail" className="mb-2 block">Type your email to confirm</Label>
                        <Input 
                          id="confirmEmail" 
                          type="email" 
                          placeholder={user?.email}
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setConfirmEmail("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleAccountDelete}
                          disabled={confirmEmail !== user?.email}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
