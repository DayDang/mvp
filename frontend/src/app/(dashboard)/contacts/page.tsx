"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search,
  Plus,
  MessageSquare,
  Instagram,
  Send,
  MoreVertical,
  Calendar,
  Tag as TagIcon,
  Activity,
  ExternalLink,
  Heart,
  TrendingDown,
  MessageCircle,
  Brain,
  History,
  Pencil,
  ArrowRight
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { contactService, tagService, Contact, Tag } from "@/lib/services/contactService";

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
  const [page, setPage] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [showTagDrawer, setShowTagDrawer] = useState(false);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [orderBy, setOrderBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [selectedMessengerFilters, setSelectedMessengerFilters] = useState<string[]>([]);

  const [newContact, setNewContact] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    headline: string;
    provider: string;
    public_identifier: string;
    tags: string[];
  }>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    headline: "",
    provider: "WHATSAPP",
    public_identifier: "",
    tags: []
  });
  
  const workspaceId = typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceId') || '' : '';

  useEffect(() => {
    const fetchData = async () => {
      if (!workspaceId) return;
      setIsLoading(true);
      try {
        const [contactResult, tags] = await Promise.all([
          contactService.list(workspaceId, { 
            search: searchQuery, 
            page, 
            limit: 50,
            orderBy,
            sortOrder,
            tagIds: selectedTagFilters,
            providers: selectedMessengerFilters
          }),
          tagService.list(workspaceId)
        ]);
        setContacts(contactResult.contacts);
        setPagination({
          total: contactResult.pagination.total,
          totalPages: contactResult.pagination.totalPages
        });
        setTagList(tags);
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Hub Isolation: Sync Failed");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workspaceId, searchQuery, page, refreshTrigger, orderBy, sortOrder, selectedTagFilters, selectedMessengerFilters]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    try {
      await contactService.create(workspaceId, newContact as any);
      toast.success("Intelligence Record Created");
      setIsCreateDialogOpen(false);
      setNewContact({
        first_name: "", last_name: "", email: "", phone: "", headline: "", provider: "WHATSAPP", public_identifier: "", tags: []
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error("Initialization Failed");
    }
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    try {
      const updateData = {
        ...editingContact,
        tags: editingContact.tags?.map(t => t.id) || []
      };
      await contactService.update(editingContact.id, updateData as any);
      toast.success("Identity Updated");
      setIsEditDialogOpen(false);
      setEditingContact(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error("Update Failed");
    }
  };

  const toggleTagForEditingContact = (tag: Tag) => {
    if (!editingContact) return;
    const currentTags = editingContact.tags || [];
    const exists = currentTags.some(t => t.id === tag.id);
    
    if (exists) {
      setEditingContact({
        ...editingContact,
        tags: currentTags.filter(t => t.id !== tag.id)
      });
    } else {
      setEditingContact({
        ...editingContact,
        tags: [...currentTags, tag]
      });
    }
  };

  const toggleTagForNewContact = (tagId: string) => {
    setNewContact(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(id => id !== tagId) 
        : [...prev.tags, tagId]
    }));
  };

  const handleAddTag = async () => {
    if (newTagInput && workspaceId) {
      try {
        const tag = await tagService.create(workspaceId, { name: newTagInput });
        setTagList([...tagList, tag]);
        setNewTagInput("");
        toast.success(`Tag "${tag.name}" Manifested`);
      } catch (error) {
        toast.error("Tag Creation Failed");
      }
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await tagService.delete(id);
      setTagList(tagList.filter(t => t.id !== id));
      toast.success("Tag Erased");
    } catch (error) {
      toast.error("Erasure Failed");
    }
  };

  const handleSort = (field: string) => {
    if (orderBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

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
    if (selectedIds.length === contacts.length && contacts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c: Contact) => c.id));
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
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Relationship Hub</h1>
                <div className="text-[10px] text-zinc-500 mt-2 flex items-center gap-2 font-black uppercase tracking-[0.2em]">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Intelligence-driven Audience Management
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-white/5 bg-white/5 text-zinc-300 rounded-xl font-bold px-4 transition-all hover:bg-white/10"
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  className={cn("border-white/5 bg-white/5 text-zinc-300 rounded-xl font-bold px-6 transition-all", showTagDrawer && "bg-primary/10 text-primary border-primary/20")}
                  onClick={() => setShowTagDrawer(!showTagDrawer)}
                >
                  <TagIcon className="w-4 h-4 mr-2" />
                  Manage Tags
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-black rounded-xl font-bold px-6" 
                  onClick={() => setIsCreateDialogOpen(true)}
                >
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
                  {contacts.length} of {pagination.total} Identified Audiences
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {/* Messenger Filters */}
              {['WHATSAPP', 'TELEGRAM', 'INSTAGRAM'].map(provider => (
                <Badge
                  key={provider}
                  onClick={() => {
                    setSelectedMessengerFilters(prev => 
                      prev.includes(provider) ? prev.filter(p => p !== provider) : [...prev, provider]
                    );
                    setPage(1);
                  }}
                  className={cn(
                    "cursor-pointer px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border",
                    selectedMessengerFilters.includes(provider)
                      ? "bg-primary text-black border-primary"
                      : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/10"
                  )}
                >
                  {provider}
                </Badge>
              ))}
              <div className="w-px h-6 bg-white/10 mx-2" />
              {/* Tag Filters */}
              {tagList.map(tag => (
                <Badge
                  key={tag.id}
                  onClick={() => {
                    setSelectedTagFilters(prev => 
                      prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
                    );
                    setPage(1);
                  }}
                  className={cn(
                    "cursor-pointer px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border",
                    selectedTagFilters.includes(tag.id)
                      ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                      : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/10"
                  )}
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Table Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-8 pb-8">
              <div className="rounded-2xl border border-white/5 bg-zinc-900/30 overflow-hidden outline-none relative">
                {isLoading && (
                  <div className="absolute top-0 left-0 w-full h-1 z-10 overflow-hidden bg-white/5">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="h-full bg-primary"
                    />
                  </div>
                )}
                
                <Table>
                  <TableHeader className="bg-white/5 border-b border-white/5">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="w-12 pl-8">
                        <div 
                          onClick={toggleAll}
                          className={cn(
                            "w-4 h-4 rounded border border-white/20 cursor-pointer flex items-center justify-center transition-all",
                            selectedIds.length === contacts.length && contacts.length > 0 ? "bg-primary border-primary" : "hover:border-white/40"
                          )}
                        >
                          {selectedIds.length === contacts.length && contacts.length > 0 && <Plus className="w-3 h-3 text-black rotate-45 scale-75" />}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14 pl-2 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('first_name')}
                      >
                        Client Insight {orderBy === 'first_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('provider')}
                      >
                        Presence {orderBy === 'provider' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14 text-center">Sentiment</TableHead>
                      <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14">Intelligence Tags</TableHead>
                      <TableHead className="text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px] h-14 text-right pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={cn(isLoading && "opacity-50 transition-opacity duration-300")}>
                    {contacts.length > 0 ? contacts.map((contact) => {
                      const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.public_identifier || 'Unknown';
                      const lastActive = contact.updated_at ? new Date(contact.updated_at).toLocaleDateString() : 'Unknown';
                      
                      return (
                        <TableRow 
                          key={contact.id} 
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
                                <AvatarImage src={contact.profile_picture_url || ""} />
                                <AvatarFallback className="bg-zinc-800 text-zinc-400 font-black text-xs uppercase rounded-xl">{name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors tracking-tight">{name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{contact.email || "No Email"}</span>
                                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">{lastActive}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="p-2 w-fit rounded-lg bg-white/5 border border-white/5">
                              {contact.provider && PLATFORM_ICONS[contact.provider.toLowerCase() as keyof typeof PLATFORM_ICONS]}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <div className="p-2.5 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/20 transition-all group/sent">
                                {SENTIMENT_ICONS.neutral}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                              {contact.tags?.map(tag => (
                                <Badge key={tag.id} className="bg-white/5 text-zinc-400 border-white/10 text-[9px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest">
                                  {tag.name}
                                </Badge>
                              ))}
                              {(!contact.tags || contact.tags.length === 0) && (
                                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic">Untagged</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="pr-8 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-600 hover:bg-white/5 hover:text-white transition-colors">
                                  <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-950/90 border-white/5 text-zinc-300 rounded-2xl p-2 w-56 backdrop-blur-3xl shadow-2xl">
                                <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => {
                                  setEditingContact(contact);
                                  setIsEditDialogOpen(true);
                                }}>
                                  <Activity className="w-4 h-4" /> <span className="text-xs font-bold">Update Record</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => handleAction("View Intelligence", name)}>
                                  <Brain className="w-4 h-4 text-primary" /> <span className="text-xs font-bold">Client Intelligence</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => handleAction("Schedule Touchpoint", name)}>
                                  <Calendar className="w-4 h-4" /> <span className="text-xs font-bold">Schedule Touchpoint</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    }) : !isLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-zinc-600 text-sm italic font-medium uppercase tracking-widest">
                          No intelligence records found matching criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Footer */}
                <div className="bg-white/5 border-t border-white/5 px-8 py-4 flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Page {page} of {pagination.totalPages} — {pagination.total} Records Secure
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" size="sm" 
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="border-white/5 bg-white/5 text-zinc-300 rounded-lg font-bold px-4"
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="border-white/5 bg-white/5 text-zinc-300 rounded-lg font-bold px-4"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Tag Sidebar */}
        <AnimatePresence>
          {showTagDrawer && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="absolute right-0 top-0 h-full w-80 bg-zinc-950 border-l border-white/5 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold uppercase tracking-tighter">Tags</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowTagDrawer(false)}>
                  <Plus className="w-5 h-5 rotate-45" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-8">
                <div className="space-y-6">
                  <div className="relative group">
                    <Input 
                      placeholder="New identification tag..." 
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      className="bg-white/5 border-white/5 rounded-xl h-11 pr-10"
                    />
                    <Button 
                      size="icon" variant="ghost" 
                      onClick={handleAddTag}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-4">Active Segments</p>
                    {tagList.map((tag) => (
                      <div key={tag.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 group hover:bg-white/10 transition-colors">
                        <span className="text-sm font-bold text-zinc-300">{tag.name}</span>
                        <Button 
                          variant="ghost" size="sm" 
                          onClick={() => handleDeleteTag(tag.id)}
                          className="h-8 w-8 text-zinc-600 hover:text-red-500"
                        >
                          <Plus className="w-4 h-4 rotate-45" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
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
              <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-6 px-8">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedIds.length} Selected</span>
                <Button className="bg-primary text-black font-bold rounded-xl h-10 px-6">Apply Segment Protocol</Button>
                <Button variant="ghost" className="text-zinc-500 rounded-xl" onClick={() => setSelectedIds([])}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[32px] max-h-[95vh] overflow-y-auto w-full max-w-xl p-8 backdrop-blur-3xl shadow-2xl">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Add Contact</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 text-sm">
              Create a new contact in your relationship hub to start tracking interactions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateContact} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1">First Name</Label>
                <div className="relative group">
                  <Input 
                    required 
                    placeholder="John"
                    value={newContact.first_name} 
                    onChange={e => setNewContact({...newContact, first_name: e.target.value})} 
                    className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1">Last Name</Label>
                <Input 
                  placeholder="Doe"
                  value={newContact.last_name} 
                  onChange={e => setNewContact({...newContact, last_name: e.target.value})} 
                  className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="john@example.com"
                  value={newContact.email} 
                  onChange={e => setNewContact({...newContact, email: e.target.value})} 
                  className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1">Platform</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full bg-white/5 border-white/5 rounded-xl h-11 text-left justify-between px-4 font-bold hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-2">
                        {newContact.provider && PLATFORM_ICONS[newContact.provider.toLowerCase() as keyof typeof PLATFORM_ICONS]}
                        <span className="capitalize">{newContact.provider.toLowerCase()}</span>
                      </div>
                      <MoreVertical className="w-3.5 h-3.5 opacity-40 rotate-90" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-900 border-white/10 text-zinc-300 rounded-xl p-1.5 w-48 shadow-2xl backdrop-blur-xl">
                    <DropdownMenuItem className="rounded-lg gap-2 py-2" onClick={() => setNewContact({...newContact, provider: "WHATSAPP"})}>
                      <div className="p-1.5 bg-green-500/10 rounded-md">
                        <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <span className="font-bold text-xs">WhatsApp</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg gap-2 py-2" onClick={() => setNewContact({...newContact, provider: "INSTAGRAM"})}>
                      <div className="p-1.5 bg-pink-500/10 rounded-md">
                        <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      </div>
                      <span className="font-bold text-xs">Instagram</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg gap-2 py-2" onClick={() => setNewContact({...newContact, provider: "TELEGRAM"})}>
                      <div className="p-1.5 bg-blue-500/10 rounded-md">
                        <Send className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="font-bold text-xs">Telegram</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-400 ml-1">Headline / Description</Label>
              <Input 
                placeholder="Product Designer at Acme Corp"
                value={newContact.headline} 
                onChange={e => setNewContact({...newContact, headline: e.target.value})} 
                className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1">Phone Number</Label>
                <Input 
                  placeholder="+1 (555) 000-0000"
                  value={newContact.phone} 
                  onChange={e => setNewContact({...newContact, phone: e.target.value})} 
                  className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1">Public Handle / ID</Label>
                <Input 
                  placeholder="@username"
                  value={newContact.public_identifier} 
                  onChange={e => setNewContact({...newContact, public_identifier: e.target.value})} 
                  className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-zinc-400 ml-1">Assign Tags</Label>
              <div className="flex flex-wrap gap-2 p-4 bg-white/[0.03] border border-white/5 rounded-2xl min-h-[100px]">
                {tagList.map((tag) => {
                  const isActive = newContact.tags.includes(tag.id);
                  return (
                    <Badge 
                      key={tag.id}
                      onClick={() => toggleTagForNewContact(tag.id)}
                      className={cn(
                        "cursor-pointer px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border",
                        isActive 
                          ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                          : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/20"
                      )}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
                {tagList.length === 0 && (
                  <div className="text-[10px] text-zinc-600 font-bold uppercase w-full text-center py-4 italic">
                    No tags available. Manage tags in the sidebar first.
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-white/5 gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="h-11 rounded-xl px-6 font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-black font-bold rounded-xl h-11 px-8 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                 Create Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[32px] max-h-[95vh] overflow-y-auto w-full max-w-xl p-8 backdrop-blur-3xl shadow-2xl">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Pencil className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Edit Contact</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 text-sm">
              Update the contact details and adjust their intelligence tags.
            </DialogDescription>
          </DialogHeader>
          {editingContact && (
            <form onSubmit={handleUpdateContact} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1">First Name</Label>
                  <Input 
                    required 
                    value={editingContact.first_name || ""} 
                    onChange={e => setEditingContact({...editingContact, first_name: e.target.value})} 
                    className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1">Last Name</Label>
                  <Input 
                    value={editingContact.last_name || ""} 
                    onChange={e => setEditingContact({...editingContact, last_name: e.target.value})} 
                    className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1">Email Address</Label>
                <Input 
                  type="email" 
                  value={editingContact.email || ""} 
                  onChange={e => setEditingContact({...editingContact, email: e.target.value})} 
                  className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-zinc-400 ml-1">Headline / Description</Label>
                <Input 
                  value={editingContact.headline || ""} 
                  onChange={e => setEditingContact({...editingContact, headline: e.target.value})} 
                  className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1">Phone Number</Label>
                  <Input 
                    value={editingContact.phone || ""} 
                    onChange={e => setEditingContact({...editingContact, phone: e.target.value})} 
                    className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 ml-1">Public Handle / ID</Label>
                  <Input 
                    value={editingContact.public_identifier || ""} 
                    onChange={e => setEditingContact({...editingContact, public_identifier: e.target.value})} 
                    className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-medium" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-bold text-zinc-400 ml-1">Assign Tags</Label>
                <div className="flex flex-wrap gap-2 p-4 bg-white/[0.03] border border-white/5 rounded-2xl min-h-[100px]">
                  {tagList.map((tag) => {
                    const isActive = editingContact.tags?.some(t => t.id === tag.id);
                    return (
                      <Badge 
                        key={tag.id}
                        onClick={() => toggleTagForEditingContact(tag)}
                        className={cn(
                          "cursor-pointer px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border",
                          isActive 
                            ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                            : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/20"
                        )}
                      >
                        {tag.name}
                      </Badge>
                    );
                  })}
                  {tagList.length === 0 && (
                    <div className="text-[10px] text-zinc-600 font-bold uppercase w-full text-center py-4 italic">
                      No tags available. Manage tags in the sidebar first.
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="pt-6 border-t border-white/5 gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="h-11 rounded-xl px-6 font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-black font-bold rounded-xl h-11 px-8 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </LayoutGroup>
  );
}
