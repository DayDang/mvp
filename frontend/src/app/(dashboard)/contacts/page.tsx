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

type Sentiment = 'positive' | 'negative' | 'neutral';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
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

const SENTIMENT_ICONS = {
  positive: <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />,
  negative: <TrendingDown className="w-3.5 h-3.5 text-red-500" />,
  neutral: <Activity className="w-3.5 h-3.5 text-zinc-500" />,
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
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
      
      return matchesSearch;
    });
  }, [searchQuery]);

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
        <motion.div 
          layout
          className="flex-1 flex flex-col h-full overflow-hidden"
        >
      {/* Header Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Relationship Hub</h1>
            <div className="text-[10px] text-zinc-500 mt-2 flex items-center gap-2 font-black uppercase tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Intelligence-driven Audience Management
            </div>
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
              className="pl-12 bg-white/5 border-white/5 rounded-2xl h-14 text-base focus-visible:ring-primary/20 text-zinc-200 placeholder:text-zinc-600 shadow-xl shadow-black/20"
            />
          </div>
          <div className="flex items-center gap-3 px-6 h-14 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
              {filteredContacts.length} Identified Audiences
            </span>
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
                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14">Presence</TableHead>
                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14 text-center">Sentiment</TableHead>
                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14">Intelligence Tags</TableHead>
                <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14 text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => {
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
                        <Avatar className="w-12 h-12 border border-white/10 ring-2 ring-transparent group-hover:ring-primary/30 transition-all rounded-xl overflow-hidden">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback className="bg-zinc-800 text-zinc-400 font-black text-xs uppercase rounded-xl">{contact.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors tracking-tight">{contact.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{contact.email}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{contact.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {contact.platforms.map((p) => (
                          <div key={p} className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                            {PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS]}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/20 transition-all group/sent">
                          {SENTIMENT_ICONS[contact.sentiment as keyof typeof SENTIMENT_ICONS]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {contact.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-white/[0.03] text-zinc-500 border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {contact.platforms.length > 1 ? (
                          <DropdownMenu onOpenChange={(open) => setActiveMenuId(open ? contact.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold transition-all shadow-lg shadow-primary/5">
                                <MessageCircle className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-950/90 border-white/5 text-zinc-300 rounded-2xl p-2 w-48 backdrop-blur-3xl shadow-2xl">
                              <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Direct Message</div>
                              {contact.platforms.map((p) => (
                                <DropdownMenuItem key={p} className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3 group/item" onClick={() => handleAction(`Chat via ${p}`, contact.name)}>
                                  <div className="p-1.5 rounded-lg bg-white/5 group-focus:bg-white/10 transition-colors">
                                    {PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS]} 
                                  </div>
                                  <span className="text-xs font-bold capitalize">{p}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold transition-all shadow-lg shadow-primary/5"
                            onClick={() => handleAction(`Chat via ${contact.platforms[0]}`, contact.name)}
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        )}
                        <DropdownMenu onOpenChange={(open) => setActiveMenuId(open ? contact.id : null)}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-600 hover:bg-white/5 hover:text-white transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-950/90 border-white/5 text-zinc-300 rounded-2xl p-2 w-56 backdrop-blur-3xl shadow-2xl">
                            <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Hub Management</div>
                            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => handleAction("View Profile", contact.name)}>
                              <ExternalLink className="w-4 h-4" /> <span className="text-xs font-bold">Client Intelligence</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => handleAction("Calendar", contact.name)}>
                              <Calendar className="w-4 h-4" /> <span className="text-xs font-bold">Schedule Touchpoint</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
      </motion.div>

      {/* Tag Hub Drawer */}
      <AnimatePresence>
        {showTagDrawer && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 35, stiffness: 400 }}
            className="h-full bg-[#09090b] border-l border-white/5 z-20 flex flex-col shadow-2xl overflow-hidden shrink-0"
          >
            <div className="w-80 h-full flex flex-col">
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
          </div>
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
