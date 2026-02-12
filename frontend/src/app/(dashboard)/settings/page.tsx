"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Building, 
  Users, 
  Zap, 
  ChevronRight,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Modular Components
import { ProfileSection } from "@/components/settings/ProfileSection";
import { WorkspaceSection } from "@/components/settings/WorkspaceSection";
import { TeamSection } from "@/components/settings/TeamSection";
import { ManagementHub } from "@/components/settings/ManagementHub";
import { PlatformSection } from "@/components/settings/PlatformSection";

const TABS = [
  { id: 'profile', name: 'User Profile', icon: User, description: 'Personal identity and account' },
  { id: 'workspace', name: 'Workspace Admin', icon: Building, description: 'Active unit configuration' },
  { id: 'team', name: 'Team Access', icon: Users, description: 'Permissions and collaborators' },
  { id: 'platforms', name: 'Integrations', icon: Zap, description: 'External messaging bridges' },
  { id: 'hub', name: 'Infrastructure', icon: Database, description: 'Global workspace management' },
];

const SETTINGS_TAB_KEY = 'identityhub_active_settings_tab';

export default function SettingsPage() {
  const { currentWorkspaceId } = useAuth();
  const [activeTab, setActiveTabState] = useState('profile');

  // Load tab from localStorage on mount
  React.useEffect(() => {
    const savedTab = localStorage.getItem(SETTINGS_TAB_KEY);
    if (savedTab && TABS.some(t => t.id === savedTab)) {
      setActiveTabState(savedTab);
    }
  }, []);

  const setActiveTab = (tabId: string) => {
    setActiveTabState(tabId);
    localStorage.setItem(SETTINGS_TAB_KEY, tabId);
  };

  return (
    <div className="flex h-full bg-[#09090b] overflow-hidden lg:flex-row flex-col">
      {/* Settings Navigation Sidebar */}
      <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col gap-6 shrink-0">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight mb-1">Operational Settings</h1>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Platform Management v1.0.4</p>
        </div>

        <nav className="flex flex-col gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group flex items-center gap-4 p-3.5 rounded-2xl transition-all text-left relative overflow-hidden",
                  isActive 
                    ? "bg-white/[0.04] border border-white/5 shadow-sm" 
                    : "hover:bg-white/[0.02] border border-transparent"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0",
                  isActive ? "bg-primary text-black" : "bg-zinc-900 text-zinc-600 group-hover:text-zinc-400"
                )}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={cn(
                    "font-bold text-xs transition-colors",
                    isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"
                  )}>
                    {tab.name}
                  </p>
                  <p className="text-[9px] text-zinc-600 font-medium truncate">{tab.description}</p>
                </div>
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 transition-all",
                  isActive ? "text-primary opacity-100" : "text-zinc-800 opacity-0 -translate-x-1"
                )} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="pb-20"
            >
              {activeTab === 'profile' && <ProfileSection />}
              {activeTab === 'workspace' && <WorkspaceSection workspaceId={currentWorkspaceId} />}
              {activeTab === 'team' && <TeamSection workspaceId={currentWorkspaceId} />}
              {activeTab === 'platforms' && <PlatformSection />}
              {activeTab === 'hub' && <ManagementHub />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
