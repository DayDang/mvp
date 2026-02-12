import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { SettingsSection, SettingsField } from "./BaseSettingsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Check, Loader2, User as UserIcon, Plus } from "lucide-react";
import { toast } from "sonner";

export const ProfileSection = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({ name, avatar_url: avatarUrl });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error detail:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Profile Information"
      description="Update your personal information and profile picture to maintain a professional identity"
    >
      <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 relative overflow-hidden group">
        <div className="relative z-10 shrink-0">
          <div className="w-20 h-20 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl relative group/avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
            ) : (
              <UserIcon className="w-8 h-8 text-zinc-700" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
               <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl z-20"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <div className="relative z-10 flex-1">
          <p className="text-lg font-black text-white mb-2 tracking-tight">Identity Image</p>
          <p className="text-xs text-zinc-500 leading-relaxed font-bold uppercase tracking-widest opacity-60">Upload a professional avatar (Max 2MB)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <SettingsField label="Full Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="bg-zinc-950 border-white/5 rounded-xl h-12 text-white font-bold focus:ring-primary/20 transition-all text-sm"
          />
        </SettingsField>

        <SettingsField label="Email Address">
          <div className="h-14 bg-zinc-950/20 border border-white/5 rounded-2xl flex items-center px-4 text-zinc-600 font-bold text-sm">
            {user?.email}
          </div>
        </SettingsField>
      </div>

      <div className="mt-4 flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-black hover:bg-primary/90 rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-primary/5"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2 stroke-[3px]" />
          )}
          Update Identity
        </Button>
      </div>
    </SettingsSection>
  );
};
