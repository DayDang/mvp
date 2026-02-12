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
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">Account Settings</h1>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] leading-none">Manage your personal identity and security preferences</p>
        </div>
        
        <ProfileSection />
      </div>
    </div>
  );
}
