import { useState, useEffect } from "react";
import { SettingsSection } from "./BaseSettingsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Instagram, Send, Plug, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const PLATFORMS_CONFIG: Record<string, { name: string, icon: any, color: string }> = {
  WHATSAPP: { name: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
  INSTAGRAM: { name: "Instagram", icon: Instagram, color: "text-pink-500" },
  MESSENGER: { name: "Messenger", icon: Send, color: "text-blue-500" },
  TELEGRAM: { name: "Telegram", icon: Send, color: "text-sky-500" },
};

export const PlatformSection = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/accounts');
      setAccounts(res.data.accounts?.items || []);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (type: string) => {
    const newWindow = window.open('about:blank', '_blank');
    try {
      if (newWindow) newWindow.document.write('Loading authorization framework...');
      const res = await api.get(`/accounts/connect?type=${type}`);
      if (res.data.url && newWindow) {
        newWindow.location.assign(res.data.url);
        toast.info(`Authorized to bridge ${type}`);
      } else {
        if (newWindow) newWindow.close();
        throw new Error("Bridge failed");
      }
    } catch (error) {
      if (newWindow) newWindow.close();
      toast.error("Connection integrity compromised");
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Sever this bridge permanently?")) return;
    try {
      await api.delete(`/accounts/${id}`);
      toast.success("Bridge severed");
      fetchAccounts();
    } catch (error) {
      toast.error("Action denied");
    }
  };

  return (
    <SettingsSection
      title="Communication Bridges"
      description="Connect and maintain stable data flow between external messaging platforms"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="px-1 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Operational Channels</div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-800" /></div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-zinc-950/20 border border-dashed border-white/5">
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No active bridges</p>
            </div>
          ) : (
            accounts.map((account) => {
              const config = PLATFORMS_CONFIG[account.type] || { name: account.type, icon: Plug, color: "text-zinc-500" };
              const Icon = config.icon;
              return (
                <div key={account.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/30 border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5 tracking-tight">{account.name || config.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "px-1.5 py-0 text-[8px] font-black uppercase tracking-widest border-none",
                          account.status === 'OK' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                          {account.status === 'OK' ? "Active" : "Bridge Error"}
                        </Badge>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">{account.type}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDisconnect(account.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-zinc-600 hover:text-red-500 hover:bg-red-500/5 font-black text-[9px] uppercase tracking-widest"
                  >
                    Sever Bridge
                  </Button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-6 border-t border-white/5">
          <div className="px-1 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Available Infrastructure</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(PLATFORMS_CONFIG).map(([id, platform]) => (
              <button
                key={id}
                onClick={() => handleConnect(id)}
                className="p-5 rounded-3xl bg-zinc-950/30 border border-white/5 hover:border-primary/50 transition-all group flex flex-col items-center gap-4 active:scale-95"
              >
                <div className={cn("w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-all group-hover:bg-zinc-800", platform.color)}>
                  <platform.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{platform.name}</span>
                <Link2 className="w-3.5 h-3.5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all -mt-1" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};
