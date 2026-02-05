"use client";

import React, { useState, useMemo } from "react";
import { 
  Search,
  Plus,
  MessageSquare,
  Instagram,
  Send,
  MoreVertical,
  Calendar,
  Tag as TagIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  Gem,
  ExternalLink,
  DollarSign,
  Heart,
  AlertTriangle,
  History,
  MessageCircle,
  Brain,
  GitBranch,
  Zap as ZapIcon
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// --- TYPES ---
type ClientTier = 'Whale' | 'Gold' | 'Lead' | 'At Risk';
type Sentiment = 'positive' | 'negative' | 'neutral';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: ClientTier;
  sentiment: Sentiment;
  lifetimeValue: number;
  platforms: ('whatsapp' | 'instagram' | 'telegram')[];
  lastActive: string;
  avatar: string;
  tags: string[];
}

// --- MOCK DATA ---
const CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+44 7700 900077",
    tier: "Whale",
    sentiment: "positive",
    lifetimeValue: 12500,
    platforms: ["whatsapp", "telegram"],
    lastActive: "Just now",
    avatar: "",
    tags: ["Personal Shopping", "High Intent"]
  },
  {
    id: "2",
    name: "Sarah Miller",
    email: "sarah.m@designhub.co",
    phone: "+44 7700 900555",
    tier: "Lead",
    sentiment: "positive",
    lifetimeValue: 0,
    platforms: ["instagram"],
    lastActive: "2 hours ago",
    avatar: "",
    tags: ["Drop Inquiry"]
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "m.chen@techglobal.com",
    phone: "+1 555 0123",
    tier: "Gold",
    sentiment: "neutral",
    lifetimeValue: 4200,
    platforms: ["whatsapp", "instagram", "telegram"],
    lastActive: "Yesterday",
    avatar: "",
    tags: ["Tech Enthusiast"]
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma.w@lifestyle.io",
    phone: "+44 7700 900111",
    tier: "At Risk",
    sentiment: "negative",
    lifetimeValue: 850,
    platforms: ["whatsapp"],
    lastActive: "3 days ago",
    avatar: "",
    tags: ["Delayed Shipping"]
  },
  {
    id: "5",
    name: "James Bond",
    email: "007@mi6.gov.uk",
    phone: "Secret",
    tier: "Whale",
    sentiment: "positive",
    lifetimeValue: 250000,
    platforms: ["telegram"],
    lastActive: "Just now",
    avatar: "",
    tags: ["Ultra VIP"]
  },
];

const PLATFORM_ICONS = {
  whatsapp: <MessageSquare className="w-3.5 h-3.5 text-green-500" />,
  instagram: <Instagram className="w-3.5 h-3.5 text-pink-500" />,
  telegram: <Send className="w-3.5 h-3.5 text-blue-500" />,
};

const TIER_CONFIG = {
  Whale: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Gem },
  Gold: { color: "text-zinc-300", bg: "bg-white/10", border: "border-white/20", icon: Activity },
  Lead: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: TrendingUp },
  "At Risk": { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertTriangle },
};

const SENTIMENT_ICONS = {
  positive: <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />,
  negative: <TrendingDown className="w-3.5 h-3.5 text-red-500" />,
  neutral: <Activity className="w-3.5 h-3.5 text-zinc-500" />,
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<'All' | 'Whales' | 'Leads' | 'At Risk'>('All');
  const [showTagDrawer, setShowTagDrawer] = useState(false);
  const [tagList, setTagList] = useState(['VIP', 'Drop Inquiry', 'High Intent', 'Personal Shopping', 'Ultra VIP']);
  const [newTagInput, setNewTagInput] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredContacts = useMemo(() => {
    return CONTACTS.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            contact.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSegment = selectedSegment === 'All' || 
                             (selectedSegment === 'Whales' && contact.tier === 'Whale') ||
                             (selectedSegment === 'Leads' && contact.tier === 'Lead') ||
                             (selectedSegment === 'At Risk' && contact.tier === 'At Risk');
                             
      return matchesSearch && matchesSegment;
    });
  }, [searchQuery, selectedSegment]);

  const handleAction = (action: string, contactName: string) => {
    toast(`${action}: ${contactName}`, {
      description: `Performing ${action.toLowerCase()} on contact record.`,
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map(c => c.id));
    }
  };

  const handleAddTag = () => {
    if (newTagInput && !tagList.includes(newTagInput)) {
      setTagList([...tagList, newTagInput]);
      setNewTagInput("");
      toast.success(`Tag "${newTagInput}" created`, {
        description: "You can now apply this tag to your elite clients."
      });
    }
  };

  return (
    <LayoutGroup>
      <div className="flex h-full bg-zinc-950/20 backdrop-blur-sm relative overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Elite CRM Hub</h1>
            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Automated intelligence-driven relationship management
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className={cn("border-white/5 bg-white/5 text-zinc-300 rounded-xl font-bold px-6 transition-all", showTagDrawer && "bg-primary/10 text-primary border-primary/20")}
              onClick={() => setShowTagDrawer(!showTagDrawer)}
            >
              <TagIcon className="w-4 h-4 mr-2" />
              Manage Tags
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-black rounded-xl font-bold px-6" onClick={() => handleAction("Create Contact", "New")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <Input 
              placeholder="Search by name, handle, or customer tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/5 rounded-2xl h-14 text-base focus-visible:ring-primary/20 text-zinc-200 placeholder:text-zinc-600"
            />
          </div>
          <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5 h-14">
            {["All", "Whales", "Leads", "At Risk"].map((segment) => (
              <button
                key={segment}
                onClick={() => setSelectedSegment(segment as any)}
                className={cn(
                  "px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  selectedSegment === segment 
                    ? "bg-primary text-black" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                )}
              >
                {segment}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <motion.div layout className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 px-8 pb-8">
        <div className="rounded-2xl border border-white/5 bg-zinc-900/30 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/5">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-12 pl-8">
                  <div 
                    onClick={toggleAll}
                    className={cn(
                      "w-4 h-4 rounded border border-white/20 cursor-pointer flex items-center justify-center transition-all",
                      selectedIds.length === filteredContacts.length && selectedIds.length > 0 ? "bg-primary border-primary" : "hover:border-white/40"
                    )}
                  >
                    {selectedIds.length === filteredContacts.length && selectedIds.length > 0 && <Plus className="w-3 h-3 text-black rotate-45 scale-75" />}
                  </div>
                </TableHead>
                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14 pl-2">Client Insight</TableHead>
                <TableHead className="w-24"></TableHead>
                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14">Tier</TableHead>
                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14 text-center">Sentiment IQ</TableHead>
                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14">Lifestyle Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => {
                const tier = TIER_CONFIG[contact.tier as keyof typeof TIER_CONFIG];
                return (
                  <TableRow 
                    key={contact.id} 
                    data-state={activeMenuId === contact.id || selectedIds.includes(contact.id) ? "open" : "closed"}
                    className={cn(
                      "border-white/5 hover:bg-white/5 transition-all duration-300 group",
                      selectedIds.includes(contact.id) && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <TableCell className="py-5 pl-8">
                      <div 
                        onClick={() => toggleSelection(contact.id)}
                        className={cn(
                          "w-4 h-4 rounded border border-white/20 cursor-pointer flex items-center justify-center transition-all",
                          selectedIds.includes(contact.id) ? "bg-primary border-primary" : "group-hover:border-white/40"
                        )}
                      >
                        {selectedIds.includes(contact.id) && <Plus className="w-3 h-3 text-black rotate-45 scale-75" />}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 pl-2">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border border-white/10 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold text-sm uppercase">{contact.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-zinc-100 group-hover:text-primary transition-colors">{contact.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-medium">{contact.email}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                            <History className="w-3 h-3 text-zinc-600" />
                            <span className="text-[10px] text-zinc-500 font-medium">{contact.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-24">
                      <div className={cn(
                        "flex items-center gap-1.5 transition-opacity duration-300",
                        activeMenuId === contact.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}>
                        {contact.platforms.length > 1 ? (
                          <DropdownMenu onOpenChange={(open) => setActiveMenuId(open ? contact.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold transition-all">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-zinc-950 border-white/10 text-zinc-300 rounded-2xl p-2 w-48 backdrop-blur-xl">
                              <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Select Channel</div>
                              {contact.platforms.map((p) => (
                                <DropdownMenuItem key={p} className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => handleAction(`Chat via ${p}`, contact.name)}>
                                  {PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS]} 
                                  <span className="text-xs font-bold capitalize">{p}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold transition-all"
                            onClick={() => handleAction(`Chat via ${contact.platforms[0]}`, contact.name)}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu onOpenChange={(open) => setActiveMenuId(open ? contact.id : null)}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-500 hover:bg-white/10 hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-zinc-950 border-white/10 text-zinc-300 rounded-2xl p-2 w-56 backdrop-blur-xl md:z-50">
                            <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Management</div>
                            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => handleAction("View Profile", contact.name)}>
                              <ExternalLink className="w-4 h-4" /> <span className="text-xs font-bold">Client Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => handleAction("Calendar", contact.name)}>
                              <Calendar className="w-4 h-4" /> <span className="text-xs font-bold">Schedule Styling</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-xl text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 w-fit", tier.bg, tier.color, tier.border)}>
                        {contact.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <div className="p-2 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                          {SENTIMENT_ICONS[contact.sentiment as keyof typeof SENTIMENT_ICONS]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="pr-8">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {contact.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredContacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-600 text-sm">
                    No contacts found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      </motion.div>
      </div>

      {/* Tag Hub Drawer */}
      <AnimatePresence>
        {showTagDrawer && (
          <motion.aside
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 35, stiffness: 400 }}
            className="w-80 h-full bg-[#09090b] border-l border-white/5 z-20 flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Tag Hub</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowTagDrawer(false)} className="rounded-xl hover:bg-white/10">
                  <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="New tag label..." 
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="bg-white/5 border-white/5 rounded-xl h-11 text-xs"
                />
                <Button onClick={handleAddTag} size="icon" className="shrink-0 bg-primary text-black rounded-xl h-11 w-11">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-8">
              <div className="space-y-6">
                <section>
                  <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] block mb-4">Active Relationship Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {tagList.map(tag => (
                      <div key={tag} className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                        <TagIcon className="w-3 h-3 text-zinc-500 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white transition-colors">{tag}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3 mb-3">
                    <History className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold text-primary">Relationship Log</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                    Combine manual tags with Sentiment IQ to maintain high-touch personalization for elite clients.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>
      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-6 px-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedIds.length} Selected</span>
                <span className="text-xs font-bold text-white">Client Segment</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-primary text-black font-bold rounded-xl h-10 px-6 flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Assign to Flow
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-300 rounded-2xl p-2 w-56 backdrop-blur-xl mb-4">
                    <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Active Flows</div>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => {
                      toast.success(`Broadcasting to ${selectedIds.length} clients`, {
                        description: "Flow: VIP Outreach initiated."
                      });
                      setSelectedIds([]);
                    }}>
                      <ZapIcon className="w-4 h-4 text-amber-500" /> <span className="text-xs font-bold">VIP Outreach</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => {
                        toast.success(`Broadcasting to ${selectedIds.length} clients`, {
                        description: "Flow: Silent Drop Alert initiated."
                      });
                      setSelectedIds([]);
                    }}>
                      <Instagram className="w-4 h-4 text-pink-500" /> <span className="text-xs font-bold">Silent Drop Alert</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" className="text-zinc-500 hover:text-white rounded-xl h-10 px-4 border border-white/5" onClick={() => setSelectedIds([])}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
