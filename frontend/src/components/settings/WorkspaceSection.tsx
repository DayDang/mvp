import { useState, useEffect } from "react";
import { SettingsSection, SettingsField } from "./BaseSettingsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export const WorkspaceSection = ({ workspaceId }: { workspaceId: string | null }) => {
  const [workspace, setWorkspace] = useState<any>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/workspaces/${workspaceId}`);
      const data = res.data.workspace || res.data;
      setWorkspace(data);
      setName(data.name);
    } catch (error) {
      console.error("Failed to fetch workspace", error);
      toast.error("Failed to load workspace data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.patch(`/workspaces/${workspaceId}`, { name });
      toast.success("Workspace settings updated");
      // Force reload to update sidebar/context
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      toast.error("Failed to update workspace");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" /></div>;
  if (!workspaceId) return <div className="p-12 text-center text-zinc-600 font-bold uppercase tracking-widest text-[10px] bg-zinc-950/20 rounded-[2.5rem] border border-dashed border-white/5">No active business unit selected.</div>;

  return (
    <SettingsSection
      title="Business Unit Configuration"
      description="Manage the operational parameters and identity of your active workspace"
    >
      <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 flex items-center gap-6 relative overflow-hidden group">
        <div className="w-16 h-16 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 shrink-0">
          <Building2 className="w-8 h-8 text-zinc-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black text-white tracking-tight leading-none mb-1.5">{workspace?.name}</h3>
          <div className="flex items-center gap-2">
             <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest opacity-60">System ID:</span>
             <code className="text-[9px] text-primary/70 font-mono bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 tracking-wider uppercase">{workspace?.id}</code>
          </div>
        </div>
      </div>

      <div className="space-y-8 mt-4">
        <SettingsField label="Workspace Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Workspace Name"
            className="bg-zinc-950 border-white/5 rounded-2xl h-14 text-white font-bold focus:ring-primary/20 transition-all"
          />
        </SettingsField>

        <SettingsField label="Creation Timestamp">
          <div className="h-14 bg-zinc-950/20 border border-white/5 rounded-2xl flex items-center px-4 text-zinc-600 font-bold text-sm">
            {workspace ? new Date(workspace.created_at).toLocaleString() : "N/A"}
          </div>
        </SettingsField>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-black hover:bg-primary/90 rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/5 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2 stroke-[3px]" />}
            Save Configuration
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
};
