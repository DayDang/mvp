import { useState, useEffect } from "react";
import { SettingsSection } from "./BaseSettingsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, Building2, Trash2, ArrowRightLeft, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export const ManagementHub = () => {
  const { switchWorkspace, user: currentUser } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Configuration Overlay state
  const [editingWorkspace, setEditingWorkspace] = useState<any>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configName, setConfigName] = useState("");
  const [configMembers, setConfigMembers] = useState<any[]>([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/workspaces');
      // The API might return { workspaces: [...] } or just an array
      const data = res.data.workspaces || res.data;
      setWorkspaces(data || []);
    } catch (error) {
      console.error("Failed to fetch workspaces", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName) return;
    try {
      setIsCreating(true);
      await api.post('/workspaces', { name: newWsName });
      toast.success("New business unit initialized");
      setNewWsName("");
      setShowCreateForm(false);
      fetchWorkspaces();
    } catch (error) {
      toast.error("Failed to create workspace");
    } finally {
      setIsCreating(false);
    }
  };

  const startConfiguration = async (ws: any) => {
    setEditingWorkspace(ws);
    setConfigName(ws.name);
    setIsConfiguring(true);
    fetchWorkspaceMembers(ws.id);
  };

  const fetchWorkspaceMembers = async (workspaceId: string) => {
    try {
      const res = await api.get(`/users/${workspaceId}/members`);
      setConfigMembers(res.data.members || []);
    } catch (error) {
      console.error("Failed to fetch members", error);
    }
  };

  const handleUpdateName = async () => {
    if (!editingWorkspace || !configName || configName === editingWorkspace.name) return;
    try {
      setIsSavingConfig(true);
      await api.patch(`/workspaces/${editingWorkspace.id}`, { name: configName });
      toast.success("Identity updated");
      fetchWorkspaces();
      setEditingWorkspace({ ...editingWorkspace, name: configName });
    } catch (error) {
      toast.error("Failed to update identity");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace || !inviteEmail) return;
    try {
      setIsInviting(true);
      console.log("Inviting personnel:", { workspaceId: editingWorkspace.id, email: inviteEmail });
      const res = await api.post(`/users/${editingWorkspace.id}/members`, { 
        email: inviteEmail,
        role: 'MEMBER'
      });
      console.log("Invite response:", res.data);
      toast.success("Personnel authorized");
      setInviteEmail("");
      fetchWorkspaceMembers(editingWorkspace.id);
    } catch (error: any) {
      console.error("Failed to add personnel detail:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(error.response?.data?.error || "Failed to add personnel");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Revoke access for this user?")) return;
    try {
      console.log("Revoking access for memberId:", memberId);
      await api.delete(`/users/members/${memberId}`);
      toast.success("Access revoked");
      if (editingWorkspace) fetchWorkspaceMembers(editingWorkspace.id);
    } catch (error: any) {
      console.error("Failed to remove personnel detail:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast.error(error.response?.data?.error || "Failed to remove personnel");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this business unit? This action is reversible by an administrator.")) return;
    try {
      await api.delete(`/workspaces/${id}`);
      toast.success("Business unit deactivated");
      fetchWorkspaces();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  return (
    <SettingsSection
      title="Workspaces Infrastructure"
      description="Orchestrate and monitor all distinct business environments from a central hub"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Business Units</span>
        {!showCreateForm && (
          <Button 
            size="sm" 
            onClick={() => setShowCreateForm(true)}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-black font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Initialize Unit
          </Button>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateSubmit} className="mb-8 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest pl-1">New Unit Identity</p>
            <Input 
              autoFocus
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. Global Operations"
              className="bg-zinc-950 border-white/5 rounded-2xl h-12 text-white font-bold focus:ring-primary/20"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button 
              type="submit" 
              disabled={isCreating || !newWsName}
              className="bg-primary text-black hover:bg-primary/90 h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/5"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2 stroke-[3px]" />}
              Initialize
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setShowCreateForm(false)}
              className="h-12 w-12 rounded-2xl bg-white/5 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-800 opacity-20" /></div>
        ) : workspaces.length === 0 ? (
          <div className="p-16 text-center rounded-[2.5rem] bg-zinc-950/20 border border-dashed border-white/5">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No business units active</p>
          </div>
        ) : (
          workspaces.map((ws, i) => (
            <div key={i} className="p-4 rounded-[2rem] bg-zinc-950/40 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                  <Building2 className="w-6 h-6 text-zinc-700 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight leading-none mb-1.5">{ws.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      "border-none font-black text-[7px] px-1.5 py-0.5 tracking-[0.1em] uppercase rounded-md",
                      ws.is_active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {ws.is_active ? "In Service" : "Deactivated"}
                    </Badge>
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest opacity-60">Est. {new Date(ws.created_at).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <Button 
                  size="sm"
                  variant="ghost" 
                  onClick={() => startConfiguration(ws)}
                  className="bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest h-9 px-4 transition-all"
                >
                  Configure
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleDelete(ws.id)}
                  className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-zinc-700 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Configuration Overlay */}
      {isConfiguring && editingWorkspace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsConfiguring(false)} />
          
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Configure Business Unit</h2>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">ID: {editingWorkspace.id.slice(0, 8)}...</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsConfiguring(false)}
                className="h-12 w-12 rounded-2xl hover:bg-white/5 text-zinc-500"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
              {/* Identity Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Unit Identity</h3>
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-2 py-0.5 rounded-full">Primary Label</Badge>
                </div>
                <div className="flex gap-3">
                  <Input 
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="h-12 bg-zinc-900 border-white/5 rounded-2xl font-bold text-white focus:ring-primary/20 flex-1"
                    placeholder="Workspace Name"
                  />
                  <Button 
                    onClick={handleUpdateName}
                    disabled={isSavingConfig || configName === editingWorkspace.name}
                    className="h-12 px-6 bg-white text-black hover:bg-white/90 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                  >
                    {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
                  </Button>
                </div>
              </div>

              {/* Personnel Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Personnel Management</h3>
                  <span className="text-[9px] text-zinc-600 font-bold">{configMembers.length} Authorized Users</span>
                </div>

                <form onSubmit={handleAddMember} className="flex gap-3 mb-6">
                  <Input 
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-12 bg-zinc-900 border-white/5 rounded-2xl font-bold text-white focus:ring-primary/20 flex-1"
                    placeholder="Authorize by email..."
                  />
                  <Button 
                    type="submit"
                    disabled={isInviting || !inviteEmail}
                    className="h-12 px-6 bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-primary/5"
                  >
                    {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  </Button>
                </form>

                <div className="space-y-2">
                  {configMembers.map((member, idx) => {
                    const isMe = member.user?.id === currentUser?.id;
                    return (
                      <div key={idx} className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                        isMe ? "bg-primary/5 border-primary/20" : "bg-white/[0.03] border-white/5 hover:border-white/10"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-full border flex items-center justify-center relative",
                            isMe ? "bg-primary/20 border-primary/30" : "bg-zinc-800 border-white/10"
                          )}>
                            <span className={cn("text-[10px] font-black", isMe ? "text-primary" : "text-white")}>
                              {member.user?.name?.[0] || member.user?.email?.[0]?.toUpperCase()}
                            </span>
                            {isMe && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-zinc-950 flex items-center justify-center" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white leading-none">{member.user?.name || 'Authorized Personnel'}</span>
                              {isMe && (
                                <Badge className="bg-primary/10 text-primary border-none font-black text-[7px] px-1.5 py-0.2 uppercase tracking-widest rounded-md">You</Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-medium mt-1">{member.user?.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cn(
                            "border-none font-black text-[8px] px-2 py-0.5 rounded-md uppercase tracking-wider",
                            member.role === 'ADMIN' ? "bg-red-500/10 text-red-400" : 
                            member.role === 'OWNER' ? "bg-amber-500/10 text-amber-400" :
                            "bg-zinc-800 text-zinc-400"
                          )}>
                            {member.role}
                          </Badge>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isMe && member.role === 'ADMIN'} // Prevent removing self if admin for now
                            className={cn(
                              "h-8 w-8 rounded-xl transition-all",
                              isMe ? "opacity-20 cursor-not-allowed" : "hover:bg-red-500/10 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100"
                            )}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {configMembers.length === 0 && (
                    <div className="py-8 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">No personnel assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-center">
               <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">IdentityHub Secure Protocol v2.4.1</p>
            </div>
          </div>
        </div>
      )}
    </SettingsSection>
  );
};
