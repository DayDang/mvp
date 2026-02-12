import { useState, useEffect } from "react";
import { SettingsSection } from "./BaseSettingsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Loader2, Mail, X, Check } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export const TeamSection = ({ workspaceId }: { workspaceId: string | null }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (workspaceId) fetchMembers();
  }, [workspaceId]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/users/${workspaceId}/members`);
      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    try {
      setIsInviting(true);
      const name = inviteEmail.split('@')[0];
      await api.post(`/users/${workspaceId}/members`, { email: inviteEmail, name, role: 'MANAGER' });
      toast.success("Invitation sent successfully");
      setInviteEmail("");
      setShowInviteForm(false);
      fetchMembers();
    } catch (error) {
      toast.error("Failed to invite member");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to revoke access?")) return;
    try {
      await api.delete(`/users/members/${memberId}`);
      toast.success("Access revoked");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <SettingsSection
      title="Access Governance"
      description="Manage the personnel authorized to operate within this business unit"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Authorized Personnel</span>
        {!showInviteForm && (
          <Button 
            size="sm" 
            onClick={() => setShowInviteForm(true)}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-black font-black text-[9px] uppercase tracking-widest h-10 px-4 rounded-xl transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-2 stroke-[2.5px]" />
            New Authorization
          </Button>
        )}
      </div>

      {showInviteForm && (
        <form onSubmit={handleInviteSubmit} className="mb-8 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest pl-1">Target Personnel Email</p>
            <Input 
              autoFocus
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="personnel@enterprise.com"
              className="bg-zinc-950 border-white/5 rounded-2xl h-12 text-white font-bold focus:ring-primary/20"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button 
              type="submit" 
              disabled={isInviting || !inviteEmail}
              className="bg-primary text-black hover:bg-primary/90 h-10 px-5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/5"
            >
              {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2 stroke-[3px]" />}
              Authorize
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setShowInviteForm(false)}
              className="h-10 w-10 rounded-xl bg-white/5 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-800 opacity-20" /></div>
        ) : members.length === 0 ? (
          <div className="p-16 text-center rounded-[2.5rem] bg-zinc-950/20 border border-dashed border-white/5">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No personnel authorized</p>
          </div>
        ) : (
          members.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-zinc-950/40 border border-white/5 hover:border-white/10 transition-all group/item">
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden">
                    {item.user.avatar_url ? (
                      <img src={item.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-[10px] text-zinc-600">{item.user.name?.[0] || 'U'}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-black text-white mb-0.5 tracking-tight">{item.user.name || 'Anonymous'}</p>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Mail className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{item.user.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={cn(
                  "text-[8px] font-black tracking-[0.1em] px-2 py-0.5 border-none rounded-md uppercase",
                  item.role === 'ADMIN' ? "bg-primary/10 text-primary" : "bg-zinc-800 text-zinc-500"
                )}>
                  {item.role}
                </Badge>
                <button 
                  onClick={() => handleRemove(item.id)}
                  className="p-2.5 hover:bg-red-500/10 rounded-xl text-zinc-700 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </SettingsSection>
  );
};
