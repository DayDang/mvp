import { useState, useEffect } from "react";
import { SettingsSection } from "./BaseSettingsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Loader2, Mail, X, Check, Copy, ExternalLink, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export const TeamSection = ({ 
  workspaceId, 
  mode = 'local' 
}: { 
  workspaceId?: string | null, 
  mode?: 'global' | 'local' 
}) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [workspaceId, mode]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const endpoint = mode === 'global' ? '/users/personnel' : `/users/${workspaceId}/members`;
      const res = await api.get(endpoint);
      setData(mode === 'global' ? res.data.users || [] : res.data.members || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    // Global invite is not fully implemented in backend yet, we primarily use local for now
    if (mode === 'global') {
      toast.info("Global invitations should be created via workspace infrastructure for now.");
      return;
    }

    try {
      setIsInviting(true);
      const name = inviteEmail.split('@')[0];
      const res = await api.post(`/users/${workspaceId}/members`, { 
        email: inviteEmail, 
        name, 
        role: 'MANAGER' 
      });
      toast.success("Invitation created successfully");
      
      if (res.data.invitationLink) {
        setLastInviteLink(res.data.invitationLink);
      }
      
      setInviteEmail("");
      fetchData();
    } catch (error) {
      toast.error("Failed to invite member");
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = () => {
    if (lastInviteLink) {
      navigator.clipboard.writeText(lastInviteLink);
      toast.success("Link copied to clipboard");
    }
  };

  const handleRemove = async (id: string) => {
    const message = mode === 'global' 
      ? "DEACTIVATE globally? This will kill access to all business units for this user."
      : "Revoke access for this unit?";
      
    if (!confirm(message)) return;
    
    try {
      const endpoint = mode === 'global' ? `/users/${id}` : `/users/members/${id}`;
      await api.delete(endpoint);
      toast.success(mode === 'global' ? "Account deactivated" : "Access revoked");
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  return (
    <SettingsSection
      title={mode === 'global' ? "Personnel Registry" : "Access Governance"}
      description={mode === 'global' 
        ? "Global directory of personnel created by you or sharing your infrastructure"
        : "Manage the personnel authorized to operate within this business unit"}
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
          {mode === 'global' ? "Active Personnel" : "Authorized Personnel"}
        </span>
        {!showInviteForm && mode === 'local' && (
          <Button 
            size="sm" 
            onClick={() => {
              setShowInviteForm(true);
              setLastInviteLink(null);
            }}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-black font-black text-[9px] uppercase tracking-widest h-10 px-4 rounded-xl transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-2 stroke-[2.5px]" />
            New Authorization
          </Button>
        )}
      </div>

      {showInviteForm && mode === 'local' && (
        <div className="mb-8 space-y-4">
          <form onSubmit={handleInviteSubmit} className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row gap-4">
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
                onClick={() => {
                  setShowInviteForm(false);
                  setLastInviteLink(null);
                }}
                className="h-10 w-10 rounded-xl bg-white/5 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {lastInviteLink && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Invitation Link Generated</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase">Valid for 7 days</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-black/40 rounded-xl px-4 py-2 text-[11px] font-mono text-zinc-400 truncate border border-white/5 items-center flex">
                  {lastInviteLink}
                </div>
                <Button 
                  onClick={copyInviteLink}
                  size="sm" 
                  className="h-9 px-3 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                >
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Copy</span>
                </Button>
              </div>
              <p className="mt-2 text-[9px] text-zinc-500 font-medium">
                Provide this link to the personnel to complete their security onboarding.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-800 opacity-20" /></div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center rounded-[2.5rem] bg-zinc-950/20 border border-dashed border-white/5">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No personnel identified</p>
          </div>
        ) : (
          data.map((item, i) => {
            const user = mode === 'global' ? item : item.user;
            const id = mode === 'global' ? item.id : item.id;
            
            return (
              <div key={i} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-zinc-950/40 border border-white/5 hover:border-white/10 transition-all group/item">
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : user.is_active ? (
                        <span className="font-black text-[10px] text-zinc-600">{user.name?.[0] || 'U'}</span>
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-zinc-800" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black text-white tracking-tight">{user.name || 'Anonymous'}</p>
                      {!user.is_active && (
                        <Badge className="bg-amber-500/10 text-amber-500 text-[7px] font-black border-none px-1.5 py-0 rounded-full tracking-widest uppercase">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Mail className="w-2.5 h-2.5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {mode === 'local' && (
                    <Badge className={cn(
                      "text-[8px] font-black tracking-[0.1em] px-2 py-0.5 border-none rounded-md uppercase",
                      item.role === 'ADMIN' ? "bg-primary/10 text-primary" : "bg-zinc-800 text-zinc-500"
                    )}>
                      {item.role}
                    </Badge>
                  )}
                  {mode === 'global' && user.memberships && (
                    <div className="flex -space-x-2">
                       {user.memberships.slice(0, 3).map((m: any, idx: number) => (
                         <div key={idx} className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center" title={m.workspace?.name}>
                           <span className="text-[7px] font-bold text-zinc-500">{m.workspace?.name?.[0]}</span>
                         </div>
                       ))}
                       {user.memberships.length > 3 && (
                         <div className="w-6 h-6 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center">
                           <span className="text-[7px] font-bold text-zinc-700">+{user.memberships.length - 3}</span>
                         </div>
                       )}
                    </div>
                  )}
                  <button 
                    onClick={() => handleRemove(id)}
                    className="p-2.5 hover:bg-red-500/10 rounded-xl text-zinc-700 hover:text-red-500 transition-all opacity-0 group-hover/item:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SettingsSection>
  );
};
