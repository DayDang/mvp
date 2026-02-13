"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Plus,
  Layout,
  Search,
  MoreVertical,
  ChevronRight,
  Info,
  Check,
  MessageSquare,
  Instagram,
  Send,
  Eye,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const PlatformIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type?.toUpperCase()) {
    case 'WHATSAPP': return <MessageSquare className={cn("text-green-500", className)} />;
    case 'INSTAGRAM': return <Instagram className={cn("text-pink-500", className)} />;
    case 'TELEGRAM': return <Send className={cn("text-blue-500", className)} />;
    default: return <Layout className={cn("text-zinc-500", className)} />;
  }
};

export default function PulseTemplatesPage() {
  const { currentWorkspaceId } = useAuth();
  const [templates, setTemplates] = useState<PulseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Partial<PulseTemplate> | null>(null);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchTemplates(true);
    }
  }, [currentWorkspaceId]);

  const fetchTemplates = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const offset = reset ? 0 : templates.length;
      const data = await pulseTemplateService.getTemplates(currentWorkspaceId!, limit, offset);
      
      if (reset) {
        setTemplates(data.items);
      } else {
        setTemplates(prev => [...prev, ...data.items]);
      }
      setTotal(data.total);
    } catch (error) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate?.title || !selectedTemplate?.content) {
      toast.error("Title and Content are required");
      return;
    }

    try {
      if (selectedTemplate.id) {
        await pulseTemplateService.updateTemplate(currentWorkspaceId!, selectedTemplate.id, selectedTemplate);
        toast.success("Template updated");
      } else {
        await pulseTemplateService.createTemplate(currentWorkspaceId!, selectedTemplate);
        toast.success("Template created");
      }
      fetchTemplates(true);
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await pulseTemplateService.deleteTemplate(currentWorkspaceId!, id);
      toast.success("Template deleted");
      fetchTemplates(true);
    } catch (error) {
      toast.error("Failed to delete template");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full bg-zinc-950/20 backdrop-blur-sm relative overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Pulse Templates</h1>
              <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" />
                Strategic relationship blueprints for mass personalization
              </p>
            </div>
            <Button 
              onClick={() => {
                setSelectedTemplate({ platform: 'WHATSAPP', category: 'General' });
                setIsEditing(true);
              }}
              className="bg-primary hover:bg-primary/90 text-black rounded-xl font-bold px-6 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-8 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blueprints..."
              className="bg-white/5 border-white/5 h-12 rounded-xl pl-12 text-sm focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 min-h-0 px-8 pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Layout className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-zinc-400 font-bold">No blueprints found</h3>
              <p className="text-zinc-600 text-xs mt-1">Start by creating your first strategic pulse template.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <motion.div 
                    layoutId={template.id}
                    key={template.id}
                    className="group p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer relative"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditing(true);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover:bg-primary/10 transition-colors">
                          <PlatformIcon type={template.platform} className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-100 group-hover:text-primary transition-colors">{template.title}</h3>
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{template.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(template.id);
                          }}
                        >
                          {isDeleting === template.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-3 font-medium leading-relaxed italic mb-4">
                      "{template.content}"
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <CheckCircle2 className="w-3 h-3 text-primary/50" />
                         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Blueprint</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {templates.length < total && (
                <div className="flex justify-center pb-8 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => fetchTemplates(false)}
                    disabled={loadingMore}
                    className="h-12 px-8 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl font-bold transition-all gap-2"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Load More Blueprints
                        <span className="text-[10px] opacity-50 font-black ml-2 uppercase tracking-widest">
                          ({total - templates.length} remaining)
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
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
              className="w-full max-w-5xl bg-[#09090b] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[min(850px,90vh)]"
            >
              <div className="flex-1 flex flex-col min-w-0 min-h-0 border-r border-white/5 overflow-hidden bg-zinc-950/20">
                <div className="p-8 border-b border-white/5 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Layout className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {selectedTemplate?.id ? 'Refine Blueprint' : 'Draft Blueprint'}
                    </h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedTemplate(null);
                    }}
                    className="rounded-xl hover:bg-white/10"
                  >
                    <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-8 space-y-10">
                    <div className="space-y-6">
                      <section>
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-3">Template Identity</label>
                        <Input 
                          value={selectedTemplate?.title || ""}
                          onChange={(e) => setSelectedTemplate(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Blueprint Title (e.g., VIP Re-engagement)"
                          className="bg-white/5 border-white/5 h-12 rounded-xl text-sm focus-visible:ring-primary/20"
                        />
                      </section>

                      <section>
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Pulse Blueprint</label>
                        <div className="relative group">
                          <textarea 
                            value={selectedTemplate?.content || ""}
                            onChange={(e) => setSelectedTemplate(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Compose the high-touch message blueprint..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 h-64 text-sm focus:outline-none focus:border-primary/30 transition-all text-zinc-200 placeholder:text-zinc-700 resize-none font-medium leading-relaxed"
                          />
                          <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-primary/5 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2">
                                     <Sparkles className="w-3 h-3" />
                                     Personalization Enabled
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-950 border-white/10 text-[10px] font-bold text-zinc-400 p-2">
                                  Use tokens like &#123;first_name&#125; or &#123;last_interest&#125;
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </section>

                      <div className="pt-4">
                        <button 
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary transition-colors mb-6"
                        >
                          <div className={cn("p-1 rounded-sm border border-zinc-800 transition-transform", showAdvanced && "rotate-90")}>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                          Advanced Strategic Settings
                        </button>

                        <AnimatePresence>
                          {showAdvanced && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-8"
                            >
                              <div className="grid grid-cols-2 gap-6">
                                <section>
                                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Target Platform</label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {['WHATSAPP', 'INSTAGRAM', 'TELEGRAM'].map(p => (
                                      <button 
                                        key={p}
                                        onClick={() => setSelectedTemplate(prev => ({ ...prev, platform: p }))}
                                        className={cn(
                                          "p-3 rounded-xl border transition-all flex items-center justify-center gap-2",
                                          selectedTemplate?.platform === p
                                            ? "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                                            : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"
                                        )}
                                      >
                                        <PlatformIcon type={p} className="w-3.5 h-3.5" />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{p.slice(0, 4)}</span>
                                      </button>
                                    ))}
                                  </div>
                                </section>
                                <section>
                                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Strategic Category</label>
                                  <Input 
                                    value={selectedTemplate?.category || ""}
                                    onChange={(e) => setSelectedTemplate(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="VIP Care, Retention..."
                                    className="bg-zinc-900/50 border-white/5 h-11 rounded-xl text-xs font-bold focus-visible:ring-primary/20"
                                  />
                                </section>
                              </div>

                              <section>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Reply Intent Format (AI Model)</label>
                                <Input 
                                  value={selectedTemplate?.reply_format || ""}
                                  onChange={(e) => setSelectedTemplate(prev => ({ ...prev, reply_format: e.target.value }))}
                                  placeholder="e.g., [Interest] | [Sentiment] | [Action Needed]"
                                  className="bg-zinc-900/50 border-white/5 h-12 rounded-xl text-sm focus-visible:ring-primary/20"
                                />
                                <p className="text-[9px] text-zinc-600 mt-2 font-medium italic">Standardized format for upstream AI processing engines.</p>
                              </section>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-8 border-t border-white/5 bg-zinc-950/50 flex-shrink-0">
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-black text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all"
                    onClick={handleSave}
                  >
                    Commit Strategic Blueprint <Check className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Right Side: Visual Preview */}
              <div className="w-80 bg-zinc-950/50 flex flex-col overflow-hidden shrink-0">
                <div className="p-8 border-b border-white/5 flex items-center gap-3">
                  <Eye className="w-4 h-4 text-zinc-500" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Pulse Preview</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                   <div className="absolute inset-0 bg-primary/2 rounded-full blur-[100px]" />
                   <div className="w-full aspect-[9/16] bg-zinc-900 border-[6px] border-zinc-800 rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative">
                      <div className="h-10 bg-zinc-800/80 flex items-center px-4 gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="bg-zinc-700 text-[8px] font-bold">PT</AvatarFallback>
                        </Avatar>
                        <span className="text-[8px] font-bold text-white">Relationship Agent</span>
                      </div>
                      
                      <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end">
                        <motion.div 
                          key={selectedTemplate?.content}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={cn(
                            "max-w-[85%] p-3 rounded-2xl text-[10px] leading-relaxed shadow-lg self-end",
                            selectedTemplate?.platform === 'WHATSAPP' ? "bg-[#0b5048] text-zinc-100 rounded-tr-none" :
                            selectedTemplate?.platform === 'INSTAGRAM' ? "bg-zinc-800 text-zinc-100 rounded-tr-none" :
                            "bg-[#2aabee] text-white rounded-tr-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap font-medium">
                            {selectedTemplate?.content?.replace(/{first_name}/g, "Alex")?.replace(/{last_interest}/g, "Spring Collection") || "Draft blueprint content..."}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                            <span className="text-[8px]">Pulse Ready</span>
                            <CheckCircle2 className="w-2 h-2" />
                          </div>
                        </motion.div>
                      </div>

                      <div className="h-12 bg-zinc-800/80 p-2">
                        <div className="w-full h-full bg-zinc-700/50 rounded-full" />
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
