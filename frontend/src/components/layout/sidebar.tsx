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
  GitBranch,
  ArrowRightLeft,
  LogOut,
  ChevronDown,
  Building2,
  Plug
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

// --- CONSTANTS ---
const NAVIGATION = [
  { name: "Inbox", icon: Inbox, href: "/inbox" },
  { name: "Contacts", icon: Users, href: "/contacts" },
  { name: "Broadcasts", icon: Zap, href: "/broadcasts" },
  { name: "Automations", icon: GitBranch, href: "/automations" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
];

const PLATFORMS = [
  { id: 'WHATSAPP', name: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
  { id: 'INSTAGRAM', name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: 'MESSENGER', name: "Messenger", icon: Send, color: "text-blue-500" },
  { id: 'TELEGRAM', name: "Telegram", icon: Send, color: "text-sky-500" },
];

/**
 * IdentityHub provides a workspace switcher and high-level actions.
 */
const IdentityHub = ({ workspaces, currentWorkspaceId, onSwitch, onAction, user }: any) => {
  const activeWorkspace = workspaces.find((w: any) => w.id === currentWorkspaceId) || workspaces[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-primary/[0.08] hover:border-primary/20 active:scale-95 transition-all w-full group outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors">
            <span className="text-primary font-black text-sm">{activeWorkspace?.name?.[0] || 'W'}</span>
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-[11px] font-black text-white uppercase tracking-wider truncate group-hover:text-primary transition-colors">
              {activeWorkspace?.name || "Workspace"}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-64 bg-zinc-950 border-white/5 rounded-2xl shadow-2xl backdrop-blur-3xl p-2 z-[100]">
        <DropdownMenuLabel className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-3 py-2">
          Business Units
        </DropdownMenuLabel>
        
        <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-1 px-1">
          {workspaces.map((ws: any) => (
            <DropdownMenuItem 
              key={ws.id}
              onClick={() => onSwitch(ws.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                ws.id === currentWorkspaceId ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-zinc-400 hover:text-white"
              )}
            >
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black", 
                ws.id === currentWorkspaceId ? "bg-primary text-black" : "bg-zinc-800"
              )}>
                {ws.name?.[0]}
              </div>
              <span className="text-xs font-bold truncate">{ws.name}</span>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-white/5 my-2" />
        
        <div className="px-1 space-y-1">
          <DropdownMenuItem 
            onClick={() => onAction("Create Workspace")}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer text-zinc-400 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold">Initialize New Unit</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onAction("Add Connection")}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer text-zinc-400 hover:text-white transition-all"
          >
            <Plug className="w-4 h-4" />
            <span className="text-xs font-bold">Add Integration</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NavItem = ({ name, icon: Icon, href, isActive }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "p-3.5 rounded-2xl transition-all group relative flex items-center justify-center",
            isActive 
              ? "bg-white/[0.08] text-primary" 
              : "text-zinc-600 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <Icon className={cn("w-5 h-5 transition-all", isActive ? "scale-110" : "group-hover:scale-110")} />
          {isActive && (
            <div className="absolute -left-0.5 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg px-3 py-1.5 border-none shadow-2xl">
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const AccountHub = ({ user, logout, handleAction }: any) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group relative outline-none">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-lg flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-black text-sm">{user?.name?.[0] || 'U'}</span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" sideOffset={20} className="w-64 bg-zinc-950 border-white/5 rounded-2xl p-4 shadow-2xl z-[100]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-primary font-black text-sm">{user?.name?.[0]}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{user?.name}</span>
            <span className="text-[10px] text-zinc-500 truncate">{user?.email}</span>
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-white/5 mb-2" />
        
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer text-zinc-400 hover:text-white transition-all">
            <Settings className="w-4 h-4" />
            <span className="text-xs font-bold">Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={logout}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 cursor-pointer text-zinc-400 hover:text-red-400 transition-all mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, currentWorkspaceId, switchWorkspace, logout } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  console.log("Sidebar User:", user);
  const workspaces = user?.memberships?.map(m => ({
    id: m.workspace_id,
    name: m.workspace?.name || 'Unknown Workspace'
  })) || [];
  console.log("Mapped Workspaces:", workspaces);

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchAccounts();
    }
  }, [currentWorkspaceId]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_URL}/accounts`);
      const data = await res.json();
      setAccounts(data.accounts?.items || []);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    }
  };

  const handleAction = (name: string) => {
    const SETTINGS_TAB_KEY = 'identityhub_active_settings_tab';
    if (name === 'Create Workspace') {
      localStorage.setItem(SETTINGS_TAB_KEY, 'hub');
      window.location.href = '/settings';
    } else if (name === 'Add Connection') {
      localStorage.setItem(SETTINGS_TAB_KEY, 'platforms');
      window.location.href = '/settings';
    } else {
      toast.info(`Action: ${name}`);
    }
  };

  return (
    <div className="flex flex-col h-full w-20 items-center border-r border-white/5 bg-[#09090b] shrink-0 z-50 py-6 overflow-hidden">
      <div className="px-2 w-full mb-8">
        <IdentityHub 
          user={user}
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onSwitch={switchWorkspace}
          onAction={handleAction}
        />
      </div>

      <div className="flex flex-col gap-4 w-full items-center flex-1">
        <TooltipProvider delayDuration={0}>
          {NAVIGATION.map((item) => (
            <NavItem 
              key={item.name} 
              {...item} 
              isActive={pathname === item.href} 
            />
          ))}
        </TooltipProvider>

        <div className="w-8 h-px bg-white/5 my-2" />

        <div className="flex flex-col gap-4 w-full items-center">
          <TooltipProvider delayDuration={0}>
            {accounts.slice(0, 5).map((account) => {
              const platform = PLATFORMS.find(p => p.id === account.type) || { icon: MessageSquare, color: "text-zinc-500" };
              const Icon = platform.icon;
              return (
                <Tooltip key={account.id}>
                  <TooltipTrigger asChild>
                    <button className="p-3.5 rounded-2xl transition-all hover:bg-white/[0.04] group relative">
                      <Icon className={cn("w-5 h-5 opacity-60 group-hover:opacity-100 transition-all", platform.color)} />
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center">
                        <div className={cn("w-1.5 h-1.5 rounded-full", account.status === 'OK' ? "bg-green-500" : "bg-red-500")} />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg px-3 py-1.5">
                    <p>{account.name || account.type}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 w-full flex justify-center">
        <TooltipProvider delayDuration={0}>
          <AccountHub user={user} logout={logout} handleAction={handleAction} />
        </TooltipProvider>
      </div>
    </div>
  );
}
