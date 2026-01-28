"use client";

import { useAuthStore } from "@/lib/store/auth.store";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GradientButton } from "@/components/ui/gradient-button";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Shield, User, Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfileSettings() {
  const user = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-purple-600 to-blue-600 opacity-20" />
        <div className="relative pt-16 px-6 pb-6 flex flex-col md:flex-row items-end md:items-end gap-6">
          <div className="relative">
             <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
               <AvatarImage src={user?.profilePictureUrl} />
               <AvatarFallback className="text-4xl">{user?.firstName?.[0]}</AvatarFallback>
             </Avatar>
             <button className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 shadow-lg transition-all hover:scale-105">
               <Camera size={16} />
             </button>
          </div>
          
          <div className="flex-1 mb-2 text-center md:text-left">
            <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-muted-foreground capitalize">{user?.userType}</p>
          </div>
          
          <div className="mb-2">
            <GradientButton onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "secondary" : "primary"}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </GradientButton>
          </div>
        </div>
      </GlassCard>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="general" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
             <User size={16} className="mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
             <Shield size={16} className="mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
             <Bell size={16} className="mr-2" /> Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <GlassCard>
            <h3 className="text-xl font-bold mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-4">First Name</label>
                <PlaceholdersAndVanishInput 
                   placeholders={[user?.firstName || "First Name"]} 
                   onChange={() => {}} 
                   onSubmit={(e) => e.preventDefault()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-4">Last Name</label>
                <PlaceholdersAndVanishInput 
                   placeholders={[user?.lastName || "Last Name"]} 
                   onChange={() => {}} 
                   onSubmit={(e) => e.preventDefault()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-4">Email</label>
                <PlaceholdersAndVanishInput 
                   placeholders={[user?.email || "Email"]} 
                   onChange={() => {}} 
                   onSubmit={(e) => e.preventDefault()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-4">Phone</label>
                <PlaceholdersAndVanishInput 
                   placeholders={["+1 (555) 000-0000"]} 
                   onChange={() => {}} 
                   onSubmit={(e) => e.preventDefault()}
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-8 flex justify-end">
                <GradientButton onClick={handleSave}>Save Changes</GradientButton>
              </div>
            )}
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <GlassCard>
            <h3 className="text-xl font-bold mb-6">Security Settings</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                 <div>
                   <h4 className="font-bold">Two-Factor Authentication</h4>
                   <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                 </div>
                 <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10">
                   <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                 </button>
               </div>
               
               <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                 <div>
                   <h4 className="font-bold">Change Password</h4>
                   <p className="text-sm text-muted-foreground">Update your password regularly.</p>
                 </div>
                 <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm">Update</button>
               </div>
            </div>
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
           <GlassCard>
              <h3 className="text-xl font-bold mb-6">Notification Preferences</h3>
              {/* Similar toggles */}
              <div className="text-center py-10 text-muted-foreground">
                 Notification settings coming soon.
              </div>
           </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
