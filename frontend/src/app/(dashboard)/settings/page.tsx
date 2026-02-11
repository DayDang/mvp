"use client";

import { 
  User, 
  Building2, 
  Bell, 
  Plug, 
  AlertTriangle,
  Camera,
  Check,
  X,
  LogOut,
  Trash2,
  Blocks,
  Wifi,
  WifiOff,
  ExternalLink,
  Settings2,
  MessageSquare,
  Instagram,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// --- MOCK DATA ---

const mockUser = {
  name: "Amin",
  email: "amin@luxuryfashion.com",
  role: "Sr. Agent",
  avatar: null,
};

const mockWorkspace = {
  name: "Luxury Fashion Group",
  id: "org1",
  createdAt: new Date("2024-01-15"),
};

const mockNotifications = {
  email: true,
  desktop: true,
  automationAlerts: false,
  weeklySummary: true,
};

const PLATFORMS_CONFIG: Record<string, { name: string, icon: any, color: string }> = {
  WHATSAPP: { name: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
  INSTAGRAM: { name: "Instagram", icon: Instagram, color: "text-pink-500" },
  MESSENGER: { name: "Messenger", icon: Send, color: "text-blue-500" },
  TELEGRAM: { name: "Telegram", icon: Send, color: "text-sky-500" },
};

const mockIntegrations = [
  { 
    id: "slack", 
    name: "Slack MCP", 
    icon: Blocks, 
    connected: true, 
    lastSync: "2m ago", 
    desc: "Exposes tools: slack_post_message, slack_list_channels", 
    color: "text-[#36C5F0]" 
  },
  { 
    id: "sheets", 
    name: "Google Sheets MCP", 
    icon: Blocks, 
    connected: false, 
    lastSync: null, 
    desc: "Exposes tools: sheets_append_row, sheets_get_values", 
    color: "text-[#0F9D58]" 
  },
  { 
    id: "fetch", 
    name: "Fetch MCP", 
    icon: Blocks, 
    connected: true, 
    lastSync: "1h ago", 
    desc: "Exposes tools: http_get, http_post_webhook", 
    color: "text-zinc-400" 
  },
  { 
    id: "db", 
    name: "Database MCP", 
    icon: Blocks, 
    connected: false, 
    lastSync: null, 
    desc: "Exposes tools: db_insert_client, db_execute_query", 
    color: "text-[#336791]" 
  },
  { 
    id: "hubspot", 
    name: "HubSpot MCP", 
    icon: Blocks, 
    connected: false, 
    lastSync: null, 
    desc: "Exposes tools: hubspot_sync_contact, hubspot_get_deal", 
    color: "text-[#FF7A59]" 
  },
];

// --- COMPONENTS ---

const SettingsSection = ({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="relative">
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
      <p className="text-sm text-zinc-500 font-medium max-w-xl leading-relaxed">{description}</p>
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary/20 rounded-full blur-sm" />
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const SettingsField = ({ 
  label, 
  children 
}: { 
  label: string; 
  children: React.ReactNode;
}) => (
  <div className="space-y-3 group">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">
      {label}
    </label>
    <div className="relative">
      {children}
    </div>
  </div>
);

const Toggle = ({ 
  enabled, 
  onChange 
}: { 
  enabled: boolean; 
  onChange: (value: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!enabled)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-inner",
      enabled ? "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.3)]" : "bg-zinc-800"
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-lg",
        enabled ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState(mockUser);
  const [workspace, setWorkspace] = useState(mockWorkspace);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/accounts`);
      const data = await res.json();
      setAccounts(data.accounts?.items || []);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
      toast.error("Failed to load connected accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (type: string) => {
    const newWindow = window.open('about:blank', '_blank');
    try {
      if (newWindow) newWindow.document.write('Loading connection wizard...');
      const res = await fetch(`${API_URL}/accounts/connect?type=${type}`);
      const data = await res.json();
      if (data.url && newWindow) {
        newWindow.location.assign(data.url);
        toast.success(`Opening ${type} connection wizard...`);
      } else {
        if (newWindow) newWindow.close();
        throw new Error("No link generated");
      }
    } catch (error) {
      if (newWindow) newWindow.close();
      toast.error("Failed to generate connection link");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      const res = await fetch(`${API_URL}/accounts/${accountId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Account disconnected successfully");
        fetchAccounts();
      } else {
        throw new Error("Failed to disconnect");
      }
    } catch (error) {
      toast.error("Failed to disconnect account");
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "workspace", label: "Workspace", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "platforms", label: "Platforms", icon: Plug },
    { id: "integrations", label: "Integrations (MCP)", icon: Blocks },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved`, {
      description: "Your changes have been saved successfully.",
    });
  };

  const handleLogout = () => {
    toast.info("Logout", {
      description: "This is a mock action for MVP.",
    });
  };

  const handleDeleteWorkspace = () => {
    toast.error("Delete Workspace", {
      description: "This is a mock action for MVP. Requires double confirmation.",
    });
  };

  const handleReconnect = (platform: string) => {
    toast.info(`Reconnect ${platform}`, {
      description: "This is a mock action for MVP.",
    });
  };

  return (
    <div className="flex h-full w-full bg-[#09090b] relative overflow-hidden">
      {/* Subtle Page Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="flex-shrink-0 px-12 py-10 border-b border-white/5 bg-zinc-950/20 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">System Settings</h1>
          </div>
          <p className="text-sm text-zinc-500 font-medium">Configure your workspace, security, and messaging infrastructure</p>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Side Nav */}
          <div className="w-80 border-r border-white/5 p-8 overflow-y-auto no-scrollbar bg-zinc-950/20">
            <div className="mb-8 pl-1">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Configuration</span>
            </div>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 group relative",
                      isActive 
                        ? "bg-white/[0.08] text-primary shadow-[0_8px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/10" 
                        : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-500",
                      isActive ? "scale-110 text-primary" : "group-hover:scale-110 group-hover:text-zinc-300"
                    )} />
                    <span className={cn(
                      "text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
                      isActive ? "text-zinc-100" : "text-zinc-600 group-hover:text-zinc-400"
                    )}>
                      {section.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-section"
                        className="absolute -left-1 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_12px_rgba(var(--primary),0.8)]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-2xl">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <SettingsSection
                    title="Profile Information"
                    description="Update your personal information and profile picture"
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-black text-2xl">{profile.name[0]}</span>
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 transition-transform">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">Profile Picture</p>
                        <p className="text-xs text-zinc-500">Click the camera icon to upload</p>
                      </div>
                    </div>

                    {/* Name */}
                    <SettingsField label="Full Name">
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="bg-zinc-950 border-white/5 rounded-xl text-white"
                      />
                    </SettingsField>

                    {/* Email */}
                    <SettingsField label="Email Address">
                      <Input
                        value={profile.email}
                        disabled
                        className="bg-zinc-950/50 border-white/5 rounded-xl text-zinc-500 cursor-not-allowed"
                      />
                      <p className="text-[10px] text-zinc-600 mt-1">Email cannot be changed for MVP</p>
                    </SettingsField>

                    {/* Role */}
                    <SettingsField label="Role / Title">
                      <Input
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        className="bg-zinc-950 border-white/5 rounded-xl text-white"
                      />
                    </SettingsField>

                    <Button 
                      onClick={() => handleSave("Profile")}
                      className="bg-primary text-black hover:bg-primary/90 rounded-xl font-bold"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </SettingsSection>
                </motion.div>
              )}

              {/* Workspace Section */}
              {activeSection === "workspace" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <SettingsSection
                    title="Workspace Settings"
                    description="Manage your workspace information and settings"
                  >
                    <SettingsField label="Workspace Name">
                      <Input
                        value={workspace.name}
                        onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                        className="bg-zinc-950 border-white/5 rounded-xl text-white"
                      />
                    </SettingsField>

                    <SettingsField label="Workspace ID">
                      <Input
                        value={workspace.id}
                        disabled
                        className="bg-zinc-950/50 border-white/5 rounded-xl text-zinc-500 cursor-not-allowed"
                      />
                    </SettingsField>

                    <SettingsField label="Created">
                      <Input
                        value={workspace.createdAt.toLocaleDateString()}
                        disabled
                        className="bg-zinc-950/50 border-white/5 rounded-xl text-zinc-500 cursor-not-allowed"
                      />
                    </SettingsField>

                    <Button 
                      onClick={() => handleSave("Workspace")}
                      className="bg-primary text-black hover:bg-primary/90 rounded-xl font-bold"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </SettingsSection>
                </motion.div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <SettingsSection
                    title="Notification Preferences"
                    description="Choose how you want to be notified"
                  >
                    <div className="space-y-4">
                      {[
                        { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                        { key: "desktop", label: "Desktop Notifications", desc: "Show browser notifications" },
                        { key: "automationAlerts", label: "Automation Alerts", desc: "Get notified when flows complete" },
                        { key: "weeklySummary", label: "Weekly Summary", desc: "Receive weekly performance reports" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/30 border border-white/5">
                          <div>
                            <p className="text-sm font-bold text-white mb-1">{item.label}</p>
                            <p className="text-xs text-zinc-500">{item.desc}</p>
                          </div>
                          <Toggle
                            enabled={notifications[item.key as keyof typeof notifications]}
                            onChange={(value) => {
                              setNotifications({ ...notifications, [item.key]: value });
                              handleSave("Notifications");
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </SettingsSection>
                </motion.div>
              )}

              {/* Platforms Section */}
              {activeSection === "platforms" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <SettingsSection
                    title="Platform Connections"
                    description="Manage your messaging platform integrations"
                  >
                    <div className="space-y-4">
                      {accounts.length === 0 && !isLoading && (
                        <div className="p-8 text-center rounded-xl bg-zinc-950/30 border border-dashed border-white/10">
                          <p className="text-sm text-zinc-500 mb-4">No platforms connected yet.</p>
                        </div>
                      )}

                      {accounts.map((account: any) => {
                        const config = PLATFORMS_CONFIG[account.type] || { name: account.type, icon: Plug, color: "text-zinc-500" };
                        const Icon = config.icon;
                        
                        return (
                          <div key={account.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/30 border border-white/5">
                            <div className="flex items-center gap-4">
                              <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", config.color)}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white mb-1">{account.name || config.name}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-tight">
                                  Provider: {config.name} • Status: {account.status}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={cn(
                                "rounded-lg px-3 py-1 text-[10px] font-bold",
                                account.status === 'OK' 
                                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                                  : "bg-red-500/10 text-red-500 border-red-500/20"
                              )}>
                                {account.status === 'OK' ? "Connected" : "Action Required"}
                              </Badge>
                              <Button
                                onClick={() => handleDeleteAccount(account.id)}
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-red-500/10 text-red-500 hover:bg-red-500/5 text-xs font-bold"
                              >
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Available Platforms</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(PLATFORMS_CONFIG).map(([id, config]) => (
                            <button
                              key={id}
                              onClick={() => handleAddAccount(id)}
                              className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all group"
                            >
                              <div className={cn("w-10 h-10 rounded-xl bg-black flex items-center justify-center group-hover:scale-110 transition-transform", config.color)}>
                                <config.icon className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-white">{config.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SettingsSection>
                </motion.div>
              )}

              {/* Integrations Section */}
              {activeSection === "integrations" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <SettingsSection
                    title="MCP Integrations"
                    description="Connect and manage Model Context Protocol servers for advanced flow capabilities"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockIntegrations.map((item) => (
                        <div key={item.id} className="p-6 rounded-[2rem] bg-zinc-950/30 border border-white/5 hover:border-cyan-500/20 transition-all group relative overflow-hidden">
                          <div className="flex items-start justify-between mb-4">
                            <div className={cn("p-4 rounded-2xl bg-white/5", item.color)}>
                              <Blocks className="w-6 h-6" />
                            </div>
                            <Badge className={cn(
                              "rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border-none",
                              item.connected ? "bg-cyan-500/10 text-cyan-400" : "bg-zinc-800 text-zinc-500"
                            )}>
                              {item.connected ? (
                                <span className="flex items-center gap-1.5">
                                  <Wifi className="w-2.5 h-2.5" /> Connected
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <WifiOff className="w-2.5 h-2.5" /> Disconnected
                                </span>
                              )}
                            </Badge>
                          </div>
                          
                          <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
                          <p className="text-xs text-zinc-500 mb-6 leading-relaxed">{item.desc}</p>
                          
                          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                            <Button 
                              size="sm"
                              variant={item.connected ? "outline" : "default"}
                              className={cn(
                                "flex-1 rounded-xl font-bold text-[10px] uppercase tracking-wider h-9",
                                !item.connected && "bg-cyan-500 text-black hover:bg-cyan-400"
                              )}
                              onClick={() => {
                                toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
                                  loading: `Initializing MCP handshake with ${item.name}...`,
                                  success: `${item.name} context synced successfully`,
                                  error: 'Handshake failed'
                                });
                              }}
                            >
                              {item.connected ? "Disconnect" : "Connect"}
                            </Button>
                            <Button 
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 rounded-xl hover:bg-white/10 text-zinc-500 hover:text-white"
                              onClick={() => handleSave(`MCP: ${item.name}`)}
                            >
                              <Settings2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {item.connected && (
                            <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest px-1">
                              <span>Last Event: {item.lastSync}</span>
                              <ExternalLink className="w-3 h-3 opacity-50" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-6 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
                        <Blocks className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1">Add Custom MCP Server</h4>
                        <p className="text-xs text-zinc-500 max-w-xs px-4">
                          Host your own MCP server to give the Flow Builder access to your proprietary systems.
                        </p>
                      </div>
                      <Button className="rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 px-6 font-bold text-xs h-10 mt-2">
                        Configure Endpoint
                      </Button>
                    </div>
                  </SettingsSection>
                </motion.div>
              )}

              {/* Danger Zone Section */}
              {activeSection === "danger" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <SettingsSection
                    title="Danger Zone"
                    description="Irreversible actions - proceed with caution"
                  >
                    <div className="space-y-4">
                      {/* Logout */}
                      <div className="p-6 rounded-xl bg-zinc-950/30 border border-white/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-white mb-1">Logout</h3>
                            <p className="text-xs text-zinc-500">Sign out of your account on this device</p>
                          </div>
                          <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="rounded-lg border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-bold"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </div>

                      {/* Delete Workspace */}
                      <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-red-500 mb-1">Delete Workspace</h3>
                            <p className="text-xs text-zinc-500 mb-2">
                              Permanently delete this workspace and all associated data
                            </p>
                            <p className="text-[10px] text-red-500/70 font-bold">
                              ⚠️ This action cannot be undone
                            </p>
                          </div>
                          <Button
                            onClick={handleDeleteWorkspace}
                            className="rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 font-bold"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SettingsSection>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
