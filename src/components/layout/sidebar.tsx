"use client";

import React, { useState, useEffect } from "react";
import { 
  Inbox, 
  Users, 
  Settings, 
  BarChart3, 
  Zap, 
  MessageSquare, 
  Instagram, 
  Send,
  Plus,
  GitBranch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

// --- CONSTANTS ---
const NAVIGATION = [
  { name: "Inbox", icon: Inbox, href: "/inbox" },
  { name: "Contacts", icon: Users, href: "/contacts" },
  { name: "Broadcasts", icon: Zap, href: "/broadcasts" },
  { name: "Automations", icon: GitBranch, href: "/automations" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
];

const PLATFORMS = [
  { name: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
  { name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { name: "Telegram", icon: Send, color: "text-blue-500" },
];

const ORGANIZATIONS = [
  { name: "Luxury Fashion Group", role: "Sr. Agent", id: "org1" },
  { name: "Urban Streetwear", role: "Owner", id: "org2" },
  { name: "Minimalist Studio", role: "Manager", id: "org3" },
];

const ACCOUNTS = [
  { name: "Amin", email: "amin@luxuryfashion.com", id: "acc1" },
  { name: "Sarah", email: "sarah@urbanwear.com", id: "acc2" },
  { name: "Michael", email: "michael@minimalist.studio", id: "acc3" },
];

// --- SUB-COMPONENTS ---

/**
 * IdentityHub handles workspace switching and user account settings.
 * Wrapped in hasMounted to avoid Radix UI hydration ID mismatches.
 */
const IdentityHub = ({ activeOrg, setActiveOrg, activeAccount, setActiveAccount, onAction }: any) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  if (!hasMounted) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border-2 border-primary/20 animate-pulse" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border-2 border-primary/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-lg relative">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-90 group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-lg shadow-sm">{activeAccount.name[0]}</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="bg-zinc-950 border-white/10 w-72 rounded-2xl p-4 ml-4 backdrop-blur-2xl shadow-2xl z-[100]">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-black text-lg">{activeAccount.name[0]}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{activeAccount.name}</span>
            <span className="text-[10px] text-zinc-500">{activeAccount.email}</span>
          </div>
        </div>
        <div className="h-px bg-white/5 mb-4" />
        <div className="px-2 mb-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Switch Workspace</div>
        <div className="space-y-1">
          {ORGANIZATIONS.map((org) => (
            <DropdownMenuItem 
              key={org.id} 
              onClick={() => setActiveOrg(org)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl focus:bg-white/10 cursor-pointer transition-colors",
                activeOrg.id === org.id ? "bg-white/5 border border-white/10" : "opacity-60"
              )}
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{org.name}</span>
                <span className="text-[10px] text-zinc-500">{org.role}</span>
              </div>
              {activeOrg.id === org.id && <div className="w-2 h-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="h-px bg-white/5 my-4" />
        <DropdownMenuItem className="focus:bg-white/10 text-zinc-400 font-medium text-xs rounded-lg cursor-pointer flex items-center gap-2">
          <Plus className="w-3 h-3" /> Create Workspace
        </DropdownMenuItem>
        <div className="h-px bg-white/5 my-4" />
        <div className="px-2 mb-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Switch Account</div>
        <div className="space-y-1">
          {ACCOUNTS.map((account) => (
            <DropdownMenuItem 
              key={account.id} 
              onClick={() => {
                setActiveAccount(account);
                onAction(`Switched to ${account.name}'s account`);
              }}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl focus:bg-white/10 cursor-pointer transition-colors",
                activeAccount.id === account.id ? "bg-white/5 border border-white/10" : "opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-black text-sm">{account.name[0]}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{account.name}</span>
                  <span className="text-[10px] text-zinc-500">{account.email}</span>
                </div>
              </div>
              {activeAccount.id === account.id && <div className="w-2 h-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="h-px bg-white/5 my-4" />
        <DropdownMenuItem className="focus:bg-white/10 text-zinc-400 font-medium text-xs rounded-lg cursor-pointer flex items-center gap-2">
          <Plus className="w-3 h-3" /> Add Account
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-red-500/10 text-red-500 focus:text-red-400 font-bold text-xs rounded-lg cursor-pointer mt-2" onClick={() => onAction("Logout")}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * NavItem renders a single navigation link with tooltip.
 */
const NavItem = ({ name, icon: Icon, href, isActive }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "p-4 rounded-2xl transition-all duration-300 group relative",
            isActive 
              ? "bg-white/10 text-primary shadow-lg ring-1 ring-white/10" 
              : "text-zinc-500 hover:text-white hover:bg-white/5"
          )}
        >
          <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", isActive && "text-primary")} />
          {isActive && <motion.div layoutId="active-nav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-white text-black font-bold text-xs rounded-lg px-3 py-1.5 ml-2">
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * PlatformToggle renders a platform integration filter.
 */
const PlatformToggle = ({ name, icon: Icon, color, onClick }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={() => onClick(name)}
          className="p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 group relative"
        >
          <Icon className={cn("w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all", color)} />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-white text-black font-bold text-xs rounded-lg px-3 py-1.5 ml-2">
        <p>{name} Connected</p>
      </TooltipContent>
    </Tooltip>
  );
};

// --- MAIN COMPONENT ---

export function Sidebar() {
  const pathname = usePathname();
  const [activeOrg, setActiveOrg] = useState(ORGANIZATIONS[0]);
  const [activeAccount, setActiveAccount] = useState(ACCOUNTS[0]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  const handleAction = (name: string, description?: string) => {
    toast(`Feature: ${name}`, {
      description: description || `This is a mock interaction for the ${name} section.`,
    });
  };

  return (
    <div className="flex flex-col h-full w-20 items-center border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl shrink-0 z-50 overflow-y-auto no-scrollbar py-6">
      <div className="flex flex-col gap-8 items-center w-full grow min-h-max">
        {/* Identity Section */}
        <IdentityHub 
          activeOrg={activeOrg} 
          setActiveOrg={setActiveOrg}
          activeAccount={activeAccount}
          setActiveAccount={setActiveAccount}
          onAction={(name: string) => handleAction(name)}
        />

        <div className="w-10 h-px bg-white/5" />

        {/* Navigation Section */}
        <div className="flex flex-col gap-5 w-full items-center">
          <TooltipProvider delayDuration={0}>
            {hasMounted && NAVIGATION.map((item) => (
              <NavItem 
                key={item.name} 
                {...item} 
                isActive={pathname === item.href} 
              />
            ))}
          </TooltipProvider>
        </div>

        <div className="w-10 h-px bg-white/5" />

        {/* Platforms Section */}
        <div className="flex flex-col gap-5 w-full items-center">
          <TooltipProvider delayDuration={0}>
            {hasMounted && PLATFORMS.map((platform) => (
              <PlatformToggle 
                key={platform.name} 
                {...platform} 
                onClick={(name: string) => handleAction(`Platform: ${name}`, `Filtering view to ${name} messages...`)}
              />
            ))}
          </TooltipProvider>
        </div>
      </div>

      {/* Settings Section */}
      <div className="flex flex-col items-center">
        <TooltipProvider delayDuration={0}>
          {hasMounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href="/settings"
                  className={cn(
                    "p-4 rounded-2xl transition-colors group",
                    pathname === "/settings" 
                      ? "bg-white/10 text-primary ring-1 ring-white/10"
                      : "text-zinc-500 hover:bg-white/5"
                  )}
                >
                  <Settings className={cn(
                    "w-6 h-6 transition-transform duration-500",
                    pathname === "/settings" ? "rotate-45 text-primary" : "group-hover:rotate-45"
                  )} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white text-black font-bold text-xs rounded-lg px-3 py-1.5 ml-2">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
