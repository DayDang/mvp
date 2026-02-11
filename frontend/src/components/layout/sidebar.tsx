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
  LogOut
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
  { id: 'WHATSAPP', name: "WhatsApp", icon: MessageSquare, color: "text-green-500" },
  { id: 'INSTAGRAM', name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: 'MESSENGER', name: "Messenger", icon: Send, color: "text-blue-500" },
  { id: 'TELEGRAM', name: "Telegram", icon: Send, color: "text-sky-500" },
];

// Mock organizations for UI
const ORGANIZATIONS = [
  { name: "Luxury Fashion Group", role: "Sr. Agent", id: "org1" },
];

// --- SUB-COMPONENTS ---

/**
 * IdentityHub handles workspace switching and user account settings.
 * Wrapped in hasMounted to avoid Radix UI hydration ID mismatches.
 */
const IdentityHub = ({ activeOrg, setActiveOrg, accounts, isLoading, onAddAccount, onAction }: any) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  if (!hasMounted) {
    return (
      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border-2 border-primary/20 animate-pulse" />
    );
  }

  const firstAccount = accounts.length > 0 ? accounts[0] : { name: "Add" };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border-2 border-primary/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-lg relative">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-90 group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-lg shadow-sm">{firstAccount.name[0]}</span>
            </div>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center shadow-lg">
            <div className={cn("w-2 h-2 rounded-full", accounts.length > 0 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-600")} />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        side="right" 
        sideOffset={16}
        className="bg-zinc-950/90 border-white/5 w-80 rounded-[2rem] p-5 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] z-[100] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="space-y-3">
            <div className="px-1 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Workspace</div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-xl group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-xl">{activeOrg.name[0]}</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-zinc-100 tracking-tight truncate">{activeOrg.name}</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-none rounded-md px-1.5 py-0 text-[8px] font-black uppercase tracking-widest h-auto">
                    {activeOrg.role}
                  </Badge>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">ID: {activeOrg.id}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          {/* Accounts Section */}
          <div className="space-y-4">
            <div className="px-1 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex justify-between items-center">
              <span>Connected Assets</span>
              {isLoading && <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />}
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-1">
              {accounts.length === 0 && !isLoading && (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/5">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed"> No accounts synced.<br/>Initialize connection below.</p>
                </div>
              )}
              {accounts.map((account: any) => (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-zinc-800 transition-colors">
                      {account.type === 'WHATSAPP' && <MessageSquare className="w-5 h-5 text-green-500" />}
                      {account.type === 'INSTAGRAM' && <Instagram className="w-5 h-5 text-pink-500" />}
                      {account.type === 'MESSENGER' && <Send className="w-5 h-5 text-blue-500" />}
                      {account.type === 'TELEGRAM' && <Send className="w-5 h-5 text-sky-500" />}
                      {!['WHATSAPP', 'INSTAGRAM', 'MESSENGER', 'TELEGRAM'].includes(account.type) && <Users className="w-5 h-5 text-zinc-500" />}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-zinc-200 truncate pr-2 tracking-tight group-hover:text-white transition-colors">{account.name || account.type}</span>
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.1em]">{account.status}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0", 
                    account.status === 'OK' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"
                  )} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-primary text-black hover:bg-primary/90 transition-all font-black text-[10px] uppercase tracking-[0.15em] shadow-xl shadow-primary/10 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  Add New Connection
                </div>
                <ArrowRightLeft className="w-3 h-3 opacity-50" />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent 
                sideOffset={20} 
                className="bg-zinc-950/95 border-white/5 rounded-[2rem] p-3 w-64 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] z-[110] animate-in fade-in slide-in-from-left-4 duration-200"
              >
                <div className="px-4 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Select Service</div>
                <div className="space-y-1">
                  {PLATFORMS.map((platform) => (
                    <DropdownMenuItem 
                      key={platform.id} 
                      onClick={() => onAddAccount(platform.id)}
                      className="p-3.5 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-4 group transition-colors"
                    >
                      <div className={cn("w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group-focus:scale-110 transition-transform", platform.color)}>
                        <platform.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-zinc-200 group-focus:text-white">{platform.name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem 
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.15em] hover:text-white hover:bg-white/[0.08] cursor-pointer transition-all mt-2"
              onClick={() => onAction("Logout")}
            >
              <LogOut className="w-4 h-4" />
              Logout Session
            </DropdownMenuItem>
          </div>
        </div>
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
            "p-3.5 rounded-2xl transition-all duration-500 group relative flex items-center justify-center",
            isActive 
              ? "bg-white/[0.08] text-primary shadow-[0_8px_24px_rgba(var(--primary),0.1)] ring-1 ring-white/10" 
              : "text-zinc-600 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <Icon className={cn(
            "w-5 h-5 transition-all duration-500", 
            isActive ? "text-primary scale-110" : "group-hover:scale-110 group-hover:text-zinc-300"
          )} />
          {isActive && (
            <motion.div 
              layoutId="active-indicator"
              className="absolute -left-1 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_12px_rgba(var(--primary),0.8)]"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg px-3 py-1.5 border-none shadow-2xl">
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
};

/**
 * PlatformToggle renders a platform integration filter.
 */
const PlatformToggle = ({ name, icon: Icon, color, status, onClick }: any) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={() => onClick(name)}
          className="p-3.5 rounded-2xl transition-all duration-500 hover:bg-white/[0.04] group relative flex items-center justify-center border border-transparent hover:border-white/5"
        >
          <Icon className={cn("w-5 h-5 group-hover:scale-110 transition-all duration-500 opacity-60 group-hover:opacity-100", color)} />
          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full", 
              status === 'OK' ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]" : "bg-red-500"
            )} />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg px-3 py-1.5 border-none shadow-2xl">
        <p>{name} • <span className={status === 'OK' ? "text-green-600" : "text-red-600"}>{status}</span></p>
      </TooltipContent>
    </Tooltip>
  );
};

// --- MAIN COMPONENT ---

export function Sidebar() {
  const pathname = usePathname();
  const [activeOrg, setActiveOrg] = useState(ORGANIZATIONS[0]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    setHasMounted(true);
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
    // Open a blank window immediately to avoid pop-up blockers
    const newWindow = window.open('about:blank', '_blank');
    
    try {
      if (newWindow) {
        newWindow.document.write('Loading connection wizard...');
      }
      
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

  const handleAction = (name: string, description?: string) => {
    toast(`Feature: ${name}`, {
      description: description || `This is a mock interaction for the ${name} section.`,
    });
  };

  return (
    <div className="flex flex-col h-full w-20 items-center border-r border-white/5 bg-[#09090b] shrink-0 z-50 overflow-y-auto no-scrollbar py-8 relative">
      {/* Subtle Sidebar Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="flex flex-col gap-8 items-center w-full grow min-h-max relative z-10">
        {/* Identity Section */}
        <IdentityHub 
          activeOrg={activeOrg} 
          setActiveOrg={setActiveOrg}
          accounts={accounts}
          isLoading={isLoading}
          onAddAccount={handleAddAccount}
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

        {/* Platforms Section (Showing connected ones) */}
        <div className="flex flex-col gap-5 w-full items-center overflow-y-auto no-scrollbar py-2">
          <TooltipProvider delayDuration={0}>
            {hasMounted && accounts.map((account) => {
              const platform = PLATFORMS.find(p => p.id === account.type) || { icon: MessageSquare, color: "text-zinc-500" };
              return (
                <PlatformToggle 
                  key={account.id} 
                  name={account.name || account.type} 
                  icon={platform.icon} 
                  color={platform.color}
                  status={account.status}
                  onClick={() => handleAction(`Account: ${account.name}`, `Viewing details for ${account.type} account...`)}
                />
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-col items-center relative z-10 pt-4 border-t border-white/5 w-10">
        <TooltipProvider delayDuration={0}>
          {hasMounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href="/settings"
                  className={cn(
                    "p-3.5 rounded-2xl transition-all duration-500 group relative flex items-center justify-center",
                    pathname === "/settings" 
                      ? "bg-white/[0.08] text-primary shadow-[0_8px_24px_rgba(var(--primary),0.1)] ring-1 ring-white/10" 
                      : "text-zinc-600 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  <Settings className={cn(
                    "w-5 h-5 transition-all duration-700",
                    pathname === "/settings" ? "rotate-90 text-primary scale-110" : "group-hover:rotate-90 group-hover:text-zinc-300"
                  )} />
                  {pathname === "/settings" && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute -left-1 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_12px_rgba(var(--primary),0.8)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg px-3 py-1.5 border-none shadow-2xl">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
