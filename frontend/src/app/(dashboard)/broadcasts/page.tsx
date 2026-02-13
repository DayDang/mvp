"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Send, 
  Users, 
  MessageSquare, 
  Instagram, 
  History as HistoryIcon,
  Plus,
  ArrowRight,
  Sparkles,
  Eye,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  MoreVertical,
  ChevronRight,
  Trash2,
  Edit2,
  History,
  Layout,
  User,
  Info,
  Check,
  GitBranch,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { pulseTemplateService, PulseTemplate } from "@/lib/services/pulseTemplateService";
import { pulseService, Pulse } from "@/lib/services/pulseService";
import { contactService, tagService, Contact, Tag } from "@/lib/services/contactService";
import { automationService, Automation } from "@/lib/services/automationService";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// --- COMPONENTS ---

const PlatformIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'whatsapp': return <MessageSquare className={cn("text-green-500", className)} />;
    case 'instagram': return <Instagram className={cn("text-pink-500", className)} />;
    case 'telegram': return <Send className={cn("text-blue-500", className)} />;
    default: return null;
  }
};

export default function BroadcastsPage() {
  const { currentWorkspaceId } = useAuth();
  const [search, setSearch] = useState("");
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [isLoadingPulses, setIsLoadingPulses] = useState(true);
  const [isLoadingMorePulses, setIsLoadingMorePulses] = useState(false);
  const [totalPulses, setTotalPulses] = useState(0);
  const [pulseLimit] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeletingPulse, setIsDeletingPulse] = useState<string | null>(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyPulses, setHistoryPulses] = useState<Pulse[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(10);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isComposing, setIsComposing] = useState(false);
  const [isRepoOpen, setIsRepoOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPulse, setSelectedPulse] = useState<Pulse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PulseTemplate | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['whatsapp']);
  const [message, setMessage] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templates, setTemplates] = useState<PulseTemplate[]>([]);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
  const [pulseName, setPulseName] = useState("");
  const [pulseDescription, setPulseDescription] = useState("");
  const [totalContacts, setTotalContacts] = useState(0);
  const [isLoadingReachData, setIsLoadingReachData] = useState(true);
  
  // Renaming state
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renamingPulse, setRenamingPulse] = useState<Pulse | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renameDescription, setRenameDescription] = useState("");
  const [isUpdatingPulse, setIsUpdatingPulse] = useState(false);

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchTemplates();
      fetchPulses(1);
      fetchReachData();
    }
  }, [currentWorkspaceId]);

  const fetchReachData = async () => {
    try {
      setIsLoadingReachData(true);
      const [tagsData, contactsData, automationsData] = await Promise.all([
        tagService.list(currentWorkspaceId!),
        contactService.list(currentWorkspaceId!, { limit: 100 }),
        automationService.list()
      ]);
      setTags(tagsData);
      setContacts(contactsData.contacts);
      setTotalContacts(contactsData.pagination.total);
      setAutomations(automationsData.filter(a => a.status === 'Active'));
    } catch (error) {
      console.error("Failed to fetch reach data", error);
    } finally {
      setIsLoadingReachData(false);
    }
  };

  const fetchPulses = async (page = 1) => {
    try {
      setIsLoadingPulses(true);
      const offset = (page - 1) * pulseLimit;
      const data = await pulseService.getPulses(currentWorkspaceId!, pulseLimit, offset);
      
      setPulses(data.items);
      setTotalPulses(data.total);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch pulses", error);
    } finally {
      setIsLoadingPulses(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      setIsLoadingHistory(true);
      const offset = (page - 1) * historyLimit;
      const data = await pulseService.getPulses(currentWorkspaceId!, historyLimit, offset);
      
      setHistoryPulses(data.items);
      setHistoryTotal(data.total);
      setHistoryPage(page);
    } catch (error) {
      console.error("Failed to fetch mission history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const data = await pulseTemplateService.getTemplates(currentWorkspaceId!);
      setTemplates(data.items);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleSelectTemplate = (template: PulseTemplate) => {
    setSelectedTemplate(template);
    setMessage(template.content);
    setPulseName(template.title);
    setPulseDescription(template.description || "");
    setSelectedPlatforms(template.platforms || ['whatsapp']);
    setIsRepoOpen(false);
    toast.success("Blueprint Loaded", {
      description: `Tactical template "${template.title}" applied.`
    });
  };

  const aggregateMetrics = pulses.reduce((acc, p) => ({
    delivered: acc.delivered + (p.metrics?.delivered || 0),
    read: acc.read + (p.metrics?.read || 0),
    replied: acc.replied + (p.metrics?.replied || 0)
  }), { delivered: 0, read: 0, replied: 0 });

  const avgSentiment = aggregateMetrics.read > 0 
    ? Math.round((aggregateMetrics.replied / aggregateMetrics.read) * 100) 
    : 0;

  const handleToggleSegment = (id: string) => {
    setSelectedSegments((prev: string[]) => 
      prev.includes(id) ? prev.filter((s: string) => s !== id) : [...prev, id]
    );
  };

  const handleToggleClient = (id: string) => {
    setSelectedClients((prev: string[]) => 
      prev.includes(id) ? prev.filter((s: string) => s !== id) : [...prev, id]
    );
  };

  const reachedContacts = contacts.filter(c => 
    selectedClients.includes(c.id) || 
    c.tags.some(t => selectedSegments.includes(t.id))
  );

  const totalReach = selectedSegments.reduce((acc: number, id: string) => {
    const tag = tags.find(t => t.id === id);
    return acc + (tag?._count?.contacts || 0);
  }, 0) + selectedClients.filter(clientId => 
    !contacts.find(c => c.id === clientId)?.tags.some(t => selectedSegments.includes(t.id))
  ).length;

  const handleSend = async () => {
    try {
      if (!currentWorkspaceId) return;
      
      const payload: Partial<Pulse> = {
        title: pulseName || selectedTemplate?.title || "Custom Pulse",
        description: pulseDescription,
        message: message,
        platforms: selectedPlatforms.map(p => p.toUpperCase() as any),
        status: 'Sent',
        recipients: [...selectedSegments, ...selectedClients],
        metrics: { delivered: totalReach, read: 0, replied: 0 },
        template_id: selectedTemplate?.id,
        automation_id: selectedAutomationId || undefined
      };

      await pulseService.createPulse(currentWorkspaceId, payload);
      
      toast.success("Broadcast Pulse Initiated", {
        description: `Successfully sent to ${totalReach} targets.`,
      });
      
      setIsComposing(false);
      setMessage("");
      setSelectedSegments([]);
      setSelectedClients([]);
      setSelectedTemplate(null);
      setPulseName("");
      setPulseDescription("");
      setSelectedPlatforms(['whatsapp']);
      fetchPulses(1);
    } catch (error) {
      toast.error("Failed to initiate pulse mission");
    }
  };

  const handleUpdatePulse = async () => {
    if (!renamingPulse || !currentWorkspaceId) return;
    
    try {
      setIsUpdatingPulse(true);
      await pulseService.updatePulse(currentWorkspaceId, renamingPulse.id, {
        title: renameTitle,
        description: renameDescription
      });
      
      toast.success("Mission Updated", {
        description: "Tactical mission identity has been synchronized."
      });
      
      setIsRenameDialogOpen(false);
      fetchPulses(currentPage);
    } catch (error) {
      toast.error("Update Failed");
    } finally {
      setIsUpdatingPulse(false);
    }
  };

  const handleDeletePulse = async (id: string) => {
    try {
      setIsDeletingPulse(id);
      await pulseService.deletePulse(currentWorkspaceId!, id);
      toast.success("Pulse Deleted");
      fetchPulses(currentPage);
      if (selectedPulse?.id === id) setSelectedPulse(null);
    } catch (error) {
      toast.error("Failed to delete pulse");
    } finally {
      setIsDeletingPulse(null);
    }
  };

  return (
    <div className="flex h-full bg-zinc-950/20 backdrop-blur-sm relative overflow-hidden">
      {/* Main Dashboard */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Pulse Hub</h1>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary" />
                Strategic multi-platform personalization
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setIsComposing(true)}
                className="bg-primary hover:bg-primary/90 text-black rounded-xl font-bold h-10 px-6 shadow-xl transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Pulse
              </Button>
            </div>
          </div>
        </div>

        {/* Content Scroll Area */}
        <ScrollArea className="flex-1 min-h-0 px-8 pb-8">
          <div className="space-y-12">
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 backdrop-blur-md relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Audience</span>
                  <Users className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {totalContacts > 999 ? `${(totalContacts/1000).toFixed(1)}k` : totalContacts}
                  </span>
                  <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-tight">Indexed</span>
                </div>
              </div>

              <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 backdrop-blur-md relative group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Missions</span>
                  <Zap className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{totalPulses}</span>
                  <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-tight">Deployed</span>
                </div>
              </div>

              <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5 backdrop-blur-md relative group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sentiment</span>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-zinc-700 cursor-help hover:text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-900 border-white/10 text-[10px] font-bold text-zinc-300 w-48 p-3 rounded-xl shadow-2xl">
                          Percentage of positive engagement across active missions.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <BarChart3 className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{avgSentiment > 0 ? `${avgSentiment}%` : '--'}</span>
                  <span className="text-[9px] font-medium text-primary uppercase tracking-tight italic">Intent High</span>
                </div>
              </div>
            </div>

            {/* Active Pulses Section */}
            <section className="bg-white/5 border border-white/5 rounded-[32px] p-6 lg:p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    Active Pulse Missions
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1 ml-4">Tactical Engagement Pipeline</p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsHistoryOpen(true);
                    fetchHistory(1);
                  }}
                  className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest h-9 bg-white/5 hover:bg-white/10 rounded-xl px-4 transition-all"
                >
                  History Repository <ChevronRight className="w-3 h-3 ml-2" />
                </Button>
              </div>
              {isLoadingPulses ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest animate-pulse">Synchronizing Tactical Data...</span>
                </div>
              ) : pulses.length === 0 ? (
                <div className="py-20 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                  <Zap className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <h3 className="text-zinc-400 font-bold">No pulses detected</h3>
                  <p className="text-zinc-600 text-xs mt-1">Initiate your first mission to see the reach architecture in action.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {pulses.map((pulse) => (
                      <motion.div 
                        layoutId={pulse.id}
                        key={pulse.id}
                        onClick={() => setSelectedPulse(pulse)}
                        className="p-6 rounded-[32px] bg-zinc-900/40 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                          <div className="flex flex-col gap-1">
                            {pulse.platforms.map((p, idx) => (
                              <PlatformIcon key={p + idx} type={p.toLowerCase()} className="w-8 h-8" />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                              "rounded-lg text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border-white/5 bg-zinc-800",
                              pulse.status === "Sent" ? "text-green-500" : "text-zinc-500"
                            )}>
                              {pulse.status}
                            </Badge>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em]">Mission Active</span>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-white transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingPulse(pulse);
                                setRenameTitle(pulse.title);
                                setRenameDescription(pulse.description || "");
                                setIsRenameDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePulse(pulse.id);
                              }}
                            >
                              {isDeletingPulse === pulse.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors mb-1.5">{pulse.title}</h3>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed mb-6 font-medium italic">
                          "{pulse.message}"
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                           <div className="flex items-center gap-5">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Reach</span>
                              <span className="text-[11px] font-bold text-zinc-300">{pulse.metrics.delivered}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">Replies</span>
                              <span className="text-[11px] font-bold text-primary">{pulse.metrics.replied}</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                </div>
              )}
            </section>

          </div>
        </ScrollArea>
      </div>

      {/* Composer Modal Overlay */}
      <AnimatePresence>
        {isComposing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.98, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              className="w-full max-w-5xl h-[min(850px,92vh)] bg-[#0c0c0e]/95 border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left Side: Builder */}
              <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-white/5 overflow-hidden bg-zinc-950/20">
                <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-zinc-950/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight">Draft Pulse Mission</h2>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Tactical Outreach Deployment</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsComposing(false)}
                    className="rounded-xl hover:bg-white/10 h-10 w-10 transition-all"
                  >
                    <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-8 pb-20 space-y-10">
                    {/* Mission Identity */}
                    <section className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Mission Name</label>
                        <Input 
                          placeholder="e.g. Q1 Beta Outreach"
                          value={pulseName}
                          onChange={(e) => setPulseName(e.target.value)}
                          className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-bold text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Objective / Description (Optional)</label>
                        <Input 
                          placeholder="Briefly describe the mission goal..."
                          value={pulseDescription}
                          onChange={(e) => setPulseDescription(e.target.value)}
                          className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all text-xs text-zinc-400"
                        />
                      </div>
                    </section>

                    {/* Strategic Blueprint Selection */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Strategic Blueprint (Template)</label>
                      <button 
                        onClick={() => setIsRepoOpen(true)}
                        className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/20 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold text-zinc-200">
                              {selectedTemplate ? selectedTemplate.title : "Apply Strategic Blueprint"}
                            </span>
                            <p className="text-[10px] text-zinc-500 font-medium">Autofill with high-conversion blueprint</p>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                      </button>
                    </section>

                    {/* Audience Segment Selection */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Target Intelligence (Tags)</label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button 
                            key={tag.id}
                            onClick={() => handleToggleSegment(tag.id)}
                            className={cn(
                              "px-3 py-2 rounded-xl border transition-all flex items-center gap-2",
                              selectedSegments.includes(tag.id)
                                ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                                : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/10"
                            )}
                          >
                            <div className={cn("w-1.5 h-1.5 rounded-full", (tag.color || "bg-zinc-500").replace('text-', 'bg-'))} />
                            <span className="text-[10px] font-bold">{tag.name}</span>
                            <span className="text-[9px] font-black opacity-50">{tag._count?.contacts || 0}</span>
                          </button>
                        ))}
                        {tags.length === 0 && !isLoadingReachData && (
                          <span className="text-[10px] text-zinc-600 italic">No tags found in system.</span>
                        )}
                        {isLoadingReachData && <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />}
                      </div>
                    </section>

                    {/* Platform Selector */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Tactical Channels</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['whatsapp', 'instagram', 'telegram'] as const).map((p: string) => (
                          <button 
                            key={p}
                            onClick={() => {
                              setSelectedPlatforms(prev => 
                                prev.includes(p) 
                                  ? (prev.length > 1 ? prev.filter(x => x !== p) : prev) 
                                  : [...prev, p]
                              );
                            }}
                            className={cn(
                              "p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2",
                              selectedPlatforms.includes(p)
                                ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                            )}
                          >
                            <PlatformIcon type={p} className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                    
                    {/* Strategic Flow Selection */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Strategic Automation Flow</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/20 hover:bg-primary/5 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <GitBranch className="w-4 h-4 text-primary" />
                              </div>
                              <div className="text-left">
                                <span className="text-xs font-bold text-zinc-200">
                                  {selectedAutomationId 
                                    ? automations.find(a => a.id === selectedAutomationId)?.name 
                                    : "Select Strategic Flow"}
                                </span>
                                <p className="text-[10px] text-zinc-500 font-medium">Auto-trigger automation for this pulse</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-950 border-white/10 rounded-2xl p-2 w-[340px] backdrop-blur-xl z-[100]">
                          <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Available Strategies</div>
                          <DropdownMenuItem 
                            className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" 
                            onClick={() => setSelectedAutomationId(null)}
                          >
                            <div className="w-4 h-4 rounded-full border border-dashed border-zinc-700" />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-zinc-400">No Automation</span>
                              <span className="text-[10px] text-zinc-600">Standard tactical delivery</span>
                            </div>
                          </DropdownMenuItem>
                          {automations.map((automation) => (
                            <DropdownMenuItem 
                              key={automation.id}
                              className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" 
                              onClick={() => {
                                setSelectedAutomationId(automation.id);
                                toast.success("Strategic Flow Selected", { description: `${automation.name} will be triggered.` });
                              }}
                            >
                              <GitBranch className="w-4 h-4 text-amber-500" />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">{automation.name}</span>
                                <span className="text-[10px] text-zinc-500">Trigger on mission start</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                          {automations.length === 0 && (
                            <div className="p-4 text-center text-[10px] text-zinc-600 italic">No active automations found.</div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </section>

                    {/* Manual Client Selection */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Individual Outreach</label>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                          <Input 
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            placeholder="Find specific clients..."
                            className="bg-white/5 border-white/5 h-12 rounded-xl pl-12 text-xs focus-visible:ring-primary/20"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                          {contacts.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(clientSearch.toLowerCase())).map((contact) => (
                            <button
                              key={contact.id}
                              onClick={() => handleToggleClient(contact.id)}
                              className={cn(
                                "p-3 rounded-xl border transition-all flex items-center justify-between group",
                                selectedClients.includes(contact.id)
                                  ? "bg-primary/5 border-primary/20"
                                  : "bg-white/5 border-white/5 hover:border-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  {contact.profile_picture_url ? (
                                    <AvatarImage src={contact.profile_picture_url} />
                                  ) : null}
                                  <AvatarFallback className="bg-zinc-800 text-[10px] text-zinc-400 font-bold">
                                    {(contact.first_name?.[0] || '') + (contact.last_name?.[0] || '')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                  <div className="text-[10px] font-bold text-zinc-200">{contact.first_name} {contact.last_name}</div>
                                  <div className="text-[8px] font-medium text-zinc-500">{contact.public_identifier || contact.email || contact.phone}</div>
                                </div>
                              </div>
                              {selectedClients.includes(contact.id) && <Check className="w-3 h-3 text-primary" />}
                            </button>
                          ))}
                          {contacts.length === 0 && !isLoadingReachData && (
                            <div className="col-span-2 text-center py-4 text-[10px] text-zinc-600 italic">No contacts indexed yet.</div>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Message Input */}
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Strategic Message</label>
                      <div className="relative group">
                        <textarea
                          placeholder="Compose your high-touch update..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 h-48 text-sm focus:outline-none focus:border-primary/30 transition-all text-zinc-200 placeholder:text-zinc-700 resize-none font-medium leading-relaxed"
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="bg-white/5 text-[10px] font-black uppercase tracking-widest h-8 rounded-lg hover:bg-primary/20 hover:text-primary transition-all text-zinc-400 border border-white/5"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Token
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-zinc-950 border-white/10 rounded-xl p-2 min-w-[160px]">
                              <DropdownMenuItem
                                onClick={() => setMessage(prev => prev + " {first_name}")}
                                className="text-[10px] font-bold text-zinc-400 focus:text-white focus:bg-white/10 rounded-lg cursor-pointer py-2"
                              >
                                <Users className="w-3 h-3 mr-2" /> First Name
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setMessage(prev => prev + (selectedPlatforms.includes('whatsapp') ? " {last_name}" : " @handle"))}
                                className="text-[10px] font-bold text-zinc-400 focus:text-white focus:bg-white/10 rounded-lg cursor-pointer py-2"
                              >
                                {selectedPlatforms.includes('whatsapp') ? <Users className="w-3 h-3 mr-2" /> : <Instagram className="w-3 h-3 mr-2" />}
                                {selectedPlatforms.includes('whatsapp') ? "Last Name" : "Profile Handle"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setMessage(prev => prev + " {last_interest}")}
                                className="text-[10px] font-bold text-zinc-400 focus:text-white focus:bg-white/10 rounded-lg cursor-pointer py-2"
                              >
                                <Sparkles className="w-3 h-3 mr-2" /> Last Interest
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest h-8 rounded-lg hover:bg-primary hover:text-black transition-all"
                            onClick={() => {
                              const template = selectedPlatforms.includes('whatsapp')
                                ? "Hey {first_name}, just noticed you were browsing the {last_interest} collection..."
                                : "Check your DMs @handle – the {last_interest} drop is here.";
                              setMessage(template);
                            }}
                          >
                            <Sparkles className="w-3 h-3 mr-1" /> Ghost Mass
                          </Button>
                        </div>
                      </div>
                    </section>
                  </div>
                </ScrollArea>

                  <div className="px-8 py-6 border-t border-white/5 bg-zinc-950/50 flex-shrink-0">
                    <Button
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-black text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!message || selectedSegments.length === 0}
                      onClick={handleSend}
                    >
                      Initiate Pulse Mission <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Right Side: Elite Preview */}
                <div className="w-72 bg-zinc-950/30 flex flex-col overflow-hidden shrink-0">
                  <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 bg-zinc-950/50">
                    <Eye className="w-4 h-4 text-zinc-600" />
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Tactical Preview</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                     <div className="absolute inset-0 bg-primary/2 rounded-full blur-[80px]" />
                     <div className="w-full aspect-[9/18] bg-black border-[4px] border-zinc-800/50 rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative">
                        <div className="h-8 bg-zinc-900/80 flex items-center px-4 gap-2">
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest opacity-50">Secure Mode</span>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end">
                          <motion.div
                            key={message}
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={cn(
                              "max-w-[90%] p-3 rounded-xl text-[10px] leading-relaxed shadow-lg self-end",
                              selectedPlatforms.includes('whatsapp') ? "bg-[#0b5048] text-zinc-100 rounded-tr-none" :
                              selectedPlatforms.includes('instagram') ? "bg-zinc-800 text-zinc-100 rounded-tr-none" :
                              "bg-[#2aabee] text-white rounded-tr-none"
                            )}
                          >
                            <p className="whitespace-pre-wrap font-medium">
                              {message || "Draft message..."}
                            </p>
                          </motion.div>
                        </div>
                        <div className="h-10 bg-zinc-900/80 p-3">
                          <div className="w-full h-full bg-zinc-800/50 rounded-full" />
                        </div>
                     </div>

                     <div className="mt-8 flex flex-col items-center">
                       <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mb-4">Live Reach</span>
                        <div className="flex -space-x-1.5">
                          {[1,2,3].map((i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[7px] font-bold text-zinc-700">
                              {i}
                            </div>
                          ))}
                          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-[7px] font-bold text-primary">+{totalReach}</span>
                          </div>
                        </div>
                     </div>
                  </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse Details Overlay */}
      <AnimatePresence>
        {selectedPulse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.98, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 15 }}
              className="w-full max-w-xl bg-[#0c0c0e]/95 border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {selectedPulse.platforms.map((p, idx) => (
                      <div key={p + idx} className="p-2 bg-zinc-900 rounded-xl border border-white/10" style={{ zIndex: 5 - idx }}>
                        <PlatformIcon type={p.toLowerCase()} className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">{selectedPulse.title}</h2>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{selectedPulse.status} Mission</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPulse(null)}
                  className="rounded-xl hover:bg-white/10 h-10 w-10 transition-all"
                >
                  <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-8 space-y-8">
                  {/* Performance Metrics */}
                  <section>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Strategic Metrics</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Delivered</span>
                        <span className="text-xl font-bold text-white">{selectedPulse.metrics.delivered}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Read</span>
                        <span className="text-xl font-bold text-white">{selectedPulse.metrics.read}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Replied</span>
                        <span className="text-xl font-bold text-primary">{selectedPulse.metrics.replied}</span>
                      </div>
                    </div>
                  </section>

                  {/* Strategic Context */}
                  {(selectedPulse.template || selectedPulse.automation) && (
                    <section>
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Strategic Context</label>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPulse.template && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Blueprint</span>
                            <span className="text-xs font-bold text-zinc-200">{selectedPulse.template.title}</span>
                          </div>
                        )}
                        {selectedPulse.automation && (
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Strategic Flow</span>
                            <span className="text-xs font-bold text-zinc-200">{selectedPulse.automation.name}</span>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                      {/* Sent Content */}
                      <section>
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Pulse Content</label>
                        <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 relative">
                          <p className="text-sm text-zinc-300 leading-relaxed font-medium italic">
                            "{selectedPulse.message}"
                          </p>
                        </div>
                      </section>

                  {/* Target List */}
                  <section>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Active Recipients</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPulse.recipients.map((r: string) => (
                        <Badge key={r} variant="secondary" className="bg-white/5 text-zinc-400 hover:text-white transition-colors border-white/5 rounded-lg py-1 px-3">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Details Overlay */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-[#09090b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    {selectedTemplate.platforms.map((p, idx) => (
                      <PlatformIcon key={p + idx} type={p.toLowerCase()} className="w-5 h-5" />
                    ))}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{selectedTemplate.title}</h2>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Strategic Blueprint</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-xl hover:bg-white/10"
                >
                  <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                </Button>
              </div>

              <div className="p-8 space-y-8">
                <section>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Blueprint Preview</label>
                  <div className="p-6 rounded-2xl bg-zinc-900 border border-white/5 relative">
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                      {selectedTemplate.content}
                    </p>
                       <div className="mt-4 flex gap-2">
                        {selectedTemplate.platforms.map(p => (
                           <Badge key={p} className="bg-primary/10 text-primary border-primary/20 text-[8px] font-bold uppercase tracking-widest">
                             {p} Optimized
                           </Badge>
                        ))}
                       </div>
                  </div>
                </section>

                <div className="flex gap-4 pt-4">
                  <Button
                     onClick={() => {
                       setMessage(selectedTemplate.content);
                       setSelectedPlatforms(selectedTemplate.platforms || ['whatsapp']);
                       setSelectedTemplate(null);
                       setIsRepoOpen(false);
                       setIsComposing(true);
                     }}
                     className="flex-1 h-12 bg-primary text-black font-bold rounded-xl"
                  >
                    Use This Template
                  </Button>
                  <Button
                     variant="ghost"
                     onClick={() => setSelectedTemplate(null)}
                     className="h-12 text-zinc-500 hover:text-white border border-white/5 rounded-xl px-6"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Repository Modal */}
      <AnimatePresence>
        {isRepoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-6xl h-[85vh] bg-[#0c0c0e]/95 border border-white/10 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden flex flex-col"
            >
              {/* Repo Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                    <HistoryIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Pulse Blueprint Repository</h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Strategic Message Library</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      placeholder="Search blueprints..."
                      className="bg-white/5 border-white/5 h-11 rounded-xl pl-12 text-sm focus-visible:ring-primary/20"
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRepoOpen(false)}
                  className="rounded-xl hover:bg-white/10"
                >
                  <Plus className="w-6 h-6 rotate-45 text-zinc-500" />
                </Button>
              </div>

              <div className="flex-1 flex min-h-0">
                {/* Repo Sidebar */}
                <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-8 flex-shrink-0">
                  <section>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Categories</label>
                    <div className="space-y-1">
                      {["All", "VIP Care", "Acquisition", "Retention"].map((cat: string) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                            selectedCategory === cat
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "text-zinc-500 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </section>
                </aside>

                <ScrollArea className="flex-1">
                  <div className="p-8 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.filter(t => 
                        (selectedCategory === "All" || t.category === selectedCategory) &&
                        (t.title.toLowerCase().includes(repoSearch.toLowerCase()) || t.content.toLowerCase().includes(repoSearch.toLowerCase()))
                        ).map((template: PulseTemplate) => (
                        <motion.div 
                          layout
                          key={template.id} 
                          onClick={() => {
                            setSelectedTemplate(template);
                          }}
                          className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <div className="flex flex-col gap-1">
                              {template.platforms.map(p => (
                                <PlatformIcon key={p} type={p.toLowerCase()} className="w-8 h-8" />
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-start justify-between mb-4">
                            <Badge variant="outline" className="rounded-lg text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-white/5 bg-zinc-800 text-zinc-400">
                              {template.category}
                            </Badge>
                          </div>

                          <h4 className="text-base font-bold text-zinc-100 group-hover:text-primary transition-colors mb-3">{template.title}</h4>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-6 font-medium italic">
                            "{template.content}"
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Blueprint Ready</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mission History Repository Overlay */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.98, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 20 }}
              className="w-full max-w-6xl h-[92vh] bg-[#0c0c0e]/95 border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Mission History Repository</h2>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Tactical Audit Log • {historyTotal} Missions Verified</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsHistoryOpen(false)}
                  className="rounded-xl hover:bg-white/10 h-10 w-10 transition-all"
                >
                  <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-8">
                  {isLoadingHistory ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">Accessing Secure Logs...</span>
                    </div>
                  ) : historyPulses.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="text-zinc-600 text-sm italic">No missions found in the tactical history.</div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {historyPulses.map((pulse) => (
                          <div 
                            key={pulse.id}
                            onClick={() => {
                              setSelectedPulse(pulse);
                              setIsHistoryOpen(false);
                            }}
                            className="p-6 rounded-[32px] bg-zinc-950 border border-white/5 hover:border-white/10 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                  {pulse.platforms.map((p, idx) => (
                                    <div key={idx} className="p-2.5 bg-zinc-900 rounded-xl border border-white/5" style={{ zIndex: 10 - idx }}>
                                      <PlatformIcon type={p.toLowerCase()} className="w-4 h-4" />
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{pulse.title}</h3>
                                  <p className="text-[10px] text-zinc-500 font-medium">Mission Log: {new Date(pulse.created_at).toLocaleString()}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white/5 border-white/5 text-[9px] font-black uppercase px-2 py-1 text-green-500">
                                {pulse.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-8">
                              <div>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Delivered</span>
                                <span className="text-lg font-bold text-zinc-200">{pulse.metrics.delivered}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Read</span>
                                <span className="text-lg font-bold text-zinc-200">{pulse.metrics.read}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Replied</span>
                                <span className="text-lg font-bold text-primary">{pulse.metrics.replied}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {historyTotal > historyLimit && (
                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            Log Fragment <span className="text-zinc-400">{(historyPage-1) * historyLimit + 1}</span> to <span className="text-zinc-400">{Math.min(historyPage * historyLimit, historyTotal)}</span> of <span className="text-zinc-400">{historyTotal}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              disabled={historyPage === 1 || isLoadingHistory}
                              onClick={() => fetchHistory(historyPage - 1)}
                              className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30"
                            >
                              <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
                              <span className="text-[10px] font-black uppercase">Previous Fragment</span>
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={historyPage >= Math.ceil(historyTotal / historyLimit) || isLoadingHistory}
                              onClick={() => fetchHistory(historyPage + 1)}
                              className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30"
                            >
                              <span className="text-[10px] font-black uppercase">Next Fragment</span>
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Mission Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[32px] w-full max-w-lg p-8 backdrop-blur-3xl shadow-2xl">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Edit2 className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Rename Mission</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 text-sm">
              Update the tactical identity of this mission for better tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-400 ml-1">Mission Name</Label>
              <Input 
                placeholder="e.g. VIP Q1 Outreach"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-400 ml-1">Objective / Description (Optional)</Label>
              <Input 
                placeholder="Briefly describe the mission goal..."
                value={renameDescription}
                onChange={(e) => setRenameDescription(e.target.value)}
                className="bg-white/5 border-white/5 rounded-xl h-11 pl-4 focus:border-primary/50 transition-all text-sm text-zinc-300"
              />
            </div>
          </div>
          <DialogFooter className="pt-8 border-t border-white/5 mt-8 gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsRenameDialogOpen(false)}
              className="h-11 rounded-xl px-6 font-bold text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePulse}
              disabled={isUpdatingPulse || !renameTitle.trim()}
              className="bg-primary text-black font-bold rounded-xl h-11 px-8 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              {isUpdatingPulse ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Mission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
