"use client";

import { useState } from "react";
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
  Settings2
} from "lucide-react";
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

const mockPlatforms = [
  { platform: "WhatsApp", connected: true, lastSync: new Date(), color: "text-green-500" },
  { platform: "Instagram", connected: true, lastSync: new Date(), color: "text-pink-500" },
  { platform: "Telegram", connected: false, lastSync: null, color: "text-blue-500" },
];

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
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
      <p className="text-xs text-zinc-500 font-medium">{description}</p>
    </div>
    <div className="space-y-4">
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
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
      {label}
    </label>
    {children}
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
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      enabled ? "bg-primary" : "bg-zinc-800"
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
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
  const [platforms] = useState(mockPlatforms);

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
    <div className="h-full bg-[#09090b] flex flex-col">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Account Settings</h1>
          <p className="text-sm text-zinc-500 font-medium">Manage your profile, workspace, and preferences</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-white/5 p-6 shrink-0">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isDanger = section.id === "danger";
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      isActive 
                        ? "bg-white/10 text-white ring-1 ring-white/10" 
                        : isDanger
                        ? "text-red-500 hover:bg-red-500/5"
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-bold">{section.label}</span>
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
                      {platforms.map((platform) => (
                        <div key={platform.platform} className="flex items-center justify-between p-4 rounded-xl bg-zinc-950/30 border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", platform.color)}>
                              <Plug className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white mb-1">{platform.platform}</p>
                              {platform.connected ? (
                                <p className="text-xs text-zinc-500">
                                  Last synced: {platform.lastSync?.toLocaleTimeString()}
                                </p>
                              ) : (
                                <p className="text-xs text-red-500">Not connected</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={cn(
                              "rounded-lg px-3 py-1 text-[10px] font-bold",
                              platform.connected 
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {platform.connected ? "Connected" : "Disconnected"}
                            </Badge>
                            <Button
                              onClick={() => handleReconnect(platform.platform)}
                              variant="outline"
                              size="sm"
                              className="rounded-lg border-white/10 text-xs font-bold"
                            >
                              {platform.connected ? "Reconnect" : "Connect"}
                            </Button>
                          </div>
                        </div>
                      ))}
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
        </div>
      </div>
    </div>
  );
}
