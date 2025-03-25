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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Define form schemas
const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const socialSchema = z.object({
  facebookId: z.string().optional(),
  instagramId: z.string().optional(),
  twitterId: z.string().optional(),
  linkedinId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type SocialFormValues = z.infer<typeof socialSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      profileImage: user?.profileImage || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Social media form
  const socialForm = useForm<SocialFormValues>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      facebookId: user?.facebookId || "",
      instagramId: user?.instagramId || "",
      twitterId: user?.twitterId || "",
      linkedinId: user?.linkedinId || "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PUT", `/api/user/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update profile",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest("PUT", `/api/user/${user?.id}/password`, data);
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update password",
        variant: "destructive",
      });
    },
  });

  // Update social media mutation
  const updateSocialMutation = useMutation({
    mutationFn: async (data: SocialFormValues) => {
      const res = await apiRequest("PUT", `/api/user/${user?.id}/social`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Social media updated",
        description: "Your social media information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update social media information",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };

  const onSocialSubmit = (data: SocialFormValues) => {
    updateSocialMutation.mutate(data);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, this would upload the file to a server
    // For this example, we'll simulate an upload
    setIsImageUploading(true);
    
    setTimeout(() => {
      // Create a fake image URL
      const fakePlaceholderImage = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80';
      
      profileForm.setValue("profileImage", fakePlaceholderImage);
      setIsImageUploading(false);
      
      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated successfully.",
      });
    }, 1500);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || "U";
  };

  const isSocialAccountConnected = (accountId: string | undefined) => {
    return !!accountId && accountId.length > 0;
  };

  // Check if the user is loaded
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0 lg:pl-64">
        <TopNav title="Your Profile" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <Card className="overflow-hidden mb-6">
              <div className="h-32 bg-gradient-to-r from-[#1a4b8c] to-[#d32f2f] relative">
                <div className="absolute -bottom-16 left-8">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0">
                      <Label htmlFor="picture" className="bg-white rounded-full p-2 shadow-md cursor-pointer flex items-center justify-center">
                        {isImageUploading ? (
                          <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        <Input 
                          id="picture" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                          disabled={isImageUploading}
                        />
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-20 pb-8 px-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-xl">{user.firstName} {user.lastName}</h2>
                    <p className="text-gray-500">{user.role === "admin" ? "Administrator" : "Sales Manager"}</p>
                  </div>
                  <Badge variant="outline" className="text-[#1a4b8c] border-[#1a4b8c]">
                    {user.role === "admin" ? "Admin Account" : "Sales Account"}
                  </Badge>
                </div>
              </div>
            </Card>

            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="security">Security Settings</TabsTrigger>
                <TabsTrigger value="social">Social Media Accounts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            {...profileForm.register("firstName")} 
                            error={profileForm.formState.errors.firstName?.message}
                          />
                          {profileForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500">{profileForm.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            {...profileForm.register("lastName")} 
                            error={profileForm.formState.errors.lastName?.message}
                          />
                          {profileForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500">{profileForm.formState.errors.lastName.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          {...profileForm.register("email")} 
                          error={profileForm.formState.errors.email?.message}
                        />
                        {profileForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          placeholder="Enter your phone number for easy password recovery" 
                          {...profileForm.register("phone")}
                        />
                        <p className="text-xs text-gray-500">Your phone number can be used for password recovery and notifications.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Job Position</Label>
                        <Input 
                          id="role" 
                          value={user.role === "admin" ? "Administrator" : "Sales Manager"} 
                          disabled 
                          className="bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-[#1a4b8c]"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
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
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your password and security preferences.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          placeholder="••••••••" 
                          {...passwordForm.register("currentPassword")} 
                          error={passwordForm.formState.errors.currentPassword?.message}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          placeholder="••••••••" 
                          {...passwordForm.register("newPassword")} 
                          error={passwordForm.formState.errors.newPassword?.message}
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          placeholder="••••••••" 
                          {...passwordForm.register("confirmPassword")} 
                          error={passwordForm.formState.errors.confirmPassword?.message}
                        />
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-[#1a4b8c]"
                          disabled={updatePasswordMutation.isPending}
                        >
                          {updatePasswordMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </form>

                    <div className="mt-8 border-t pt-6">
                      <h3 className="font-semibold text-lg mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Protect your account with 2FA</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Set Up 2FA</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Accounts</CardTitle>
                    <CardDescription>Connect your social media accounts for easier social media management.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={socialForm.handleSubmit(onSocialSubmit)} className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="bg-blue-600 rounded p-1.5 mr-3">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Facebook</p>
                            <p className="text-xs text-gray-500">
                              {isSocialAccountConnected(user.facebookId) 
                                ? `Connected as ${user.facebookId}` 
                                : "Not Connected"}
                            </p>
                          </div>
                        </div>
                        {isSocialAccountConnected(user.facebookId) ? (
                          <Button 
                            type="button"
                            variant="outline" 
                            className="text-gray-600"
                            onClick={() => socialForm.setValue("facebookId", "")}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <div className="flex items-center">
                            <Input
                              className="mr-2 w-40"
                              placeholder="Facebook ID"
                              {...socialForm.register("facebookId")}
                            />
                            <Button 
                              type="button"
                              variant="outline"
                              className="text-blue-600"
                              onClick={() => {
                                if (!socialForm.getValues("facebookId")) {
                                  socialForm.setValue("facebookId", "fbuser123");
                                }
                              }}
                            >
                              Connect
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="bg-pink-600 rounded p-1.5 mr-3">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Instagram</p>
                            <p className="text-xs text-gray-500">
                              {isSocialAccountConnected(user.instagramId) 
                                ? `Connected as ${user.instagramId}` 
                                : "Not Connected"}
                            </p>
                          </div>
                        </div>
                        {isSocialAccountConnected(user.instagramId) ? (
                          <Button 
                            type="button"
                            variant="outline" 
                            className="text-gray-600"
                            onClick={() => socialForm.setValue("instagramId", "")}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <div className="flex items-center">
                            <Input
                              className="mr-2 w-40"
                              placeholder="Instagram ID"
                              {...socialForm.register("instagramId")}
                            />
                            <Button 
                              type="button"
                              variant="outline"
                              className="text-pink-600"
                              onClick={() => {
                                if (!socialForm.getValues("instagramId")) {
                                  socialForm.setValue("instagramId", "instauser");
                                }
                              }}
                            >
                              Connect
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="bg-blue-400 rounded p-1.5 mr-3">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Twitter</p>
                            <p className="text-xs text-gray-500">
                              {isSocialAccountConnected(user.twitterId) 
                                ? `Connected as ${user.twitterId}` 
                                : "Not Connected"}
                            </p>
                          </div>
                        </div>
                        {isSocialAccountConnected(user.twitterId) ? (
                          <Button 
                            type="button"
                            variant="outline" 
                            className="text-gray-600"
                            onClick={() => socialForm.setValue("twitterId", "")}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <div className="flex items-center">
                            <Input
                              className="mr-2 w-40"
                              placeholder="Twitter ID"
                              {...socialForm.register("twitterId")}
                            />
                            <Button 
                              type="button"
                              variant="outline"
                              className="text-blue-400"
                              onClick={() => {
                                if (!socialForm.getValues("twitterId")) {
                                  socialForm.setValue("twitterId", "twitteruser");
                                }
                              }}
                            >
                              Connect
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="bg-blue-800 rounded p-1.5 mr-3">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">LinkedIn</p>
                            <p className="text-xs text-gray-500">
                              {isSocialAccountConnected(user.linkedinId) 
                                ? `Connected as ${user.linkedinId}` 
                                : "Not Connected"}
                            </p>
                          </div>
                        </div>
                        {isSocialAccountConnected(user.linkedinId) ? (
                          <Button 
                            type="button"
                            variant="outline" 
                            className="text-gray-600"
                            onClick={() => socialForm.setValue("linkedinId", "")}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <div className="flex items-center">
                            <Input
                              className="mr-2 w-40"
                              placeholder="LinkedIn ID"
                              {...socialForm.register("linkedinId")}
                            />
                            <Button 
                              type="button"
                              variant="outline"
                              className="text-blue-800"
                              onClick={() => {
                                if (!socialForm.getValues("linkedinId")) {
                                  socialForm.setValue("linkedinId", "linkedinuser");
                                }
                              }}
                            >
                              Connect
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end mt-6">
                        <Button 
                          type="submit" 
                          className="bg-[#1a4b8c]"
                          disabled={updateSocialMutation.isPending}
                        >
                          {updateSocialMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Connections"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="w-full">
                      <h3 className="font-semibold mb-2">Social Media Benefits</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Quickly manage dealership social media presence</li>
                        <li>• Post inventory updates automatically to connected accounts</li>
                        <li>• Receive social media lead notifications in one place</li>
                        <li>• Track customer engagement across platforms</li>
                      </ul>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
