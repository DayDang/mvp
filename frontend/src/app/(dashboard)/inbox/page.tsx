"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Send, 
  Smile, 
  MessageSquare, 
  Instagram, 
  Play, 
  Pause,
  Check,
  CheckCheck,
  Mic,
  Trash2,
  FileText,
  AlertCircle,
  Clock,
  PanelRight,
  PanelLeft,
  GripVertical,
  Star,
  Image as ImageIcon,
  Music,
  FileDown,
  Sparkles,
  Bell,
  Zap as ZapIcon,
  Archive,
  ArrowRightLeft,
  Radio,
  Brain,
  Wand2,
  GitBranch
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// --- TYPES ---
type Platform = 'whatsapp' | 'instagram' | 'telegram' | 'WHATSAPP' | 'INSTAGRAM' | 'TELEGRAM';

interface Message {
  id: string;
  unipile_id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  kind: 'text' | 'audio' | 'image' | 'FILE' | 'VOICE';
  mediaUrl?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  starred?: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  attachments?: any;
}

interface Conversation {
  id: string;
  unipile_id: string;
  name: string;
  platform: Platform;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  online: boolean;
  avatar?: string;
}

// --- MOCK DATA ---
const SNIPPETS = [
  { id: "s1", title: "Greeting", text: "Hello! How can I help you today?" },
  { id: "s2", title: "Order Status", text: "I'm checking the status of your order now. One moment please." },
  { id: "s3", title: "Thank You", text: "Thank you for reaching out! Is there anything else you need?" },
  { id: "s4", title: "Pricing", text: "Our premium fashion collection starts at £199. Would you like a catalog?" },
];

// --- COMPONENTS ---

const AudioPlayer = ({ isOutgoing }: { isOutgoing: boolean }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playing) {
      interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 2));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div className={cn(
      "flex items-center gap-3 min-w-[200px] p-2 rounded-xl",
      isOutgoing ? "bg-primary/20" : "bg-white/5"
    )}>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 rounded-full bg-primary text-black hover:bg-primary/90"
        onClick={() => setPlaying(!playing)}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </Button>
      <div className="flex-1 space-y-1">
        <Slider 
          value={[progress]} 
          max={100} 
          step={1} 
          onValueChange={(v) => setProgress(v[0])}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-[8px] text-zinc-500 font-medium">
          <span>0:0{Math.floor(progress/25)}</span>
          <span>0:04</span>
        </div>
      </div>
    </div>
  );
};

const MediaModal = ({ url }: { url: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer relative group overflow-hidden rounded-xl border border-white/10">
          <img src={url} alt="Shared media" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-zinc-950/90 border-white/5 p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-white/5 absolute top-0 left-0 right-0 z-10 bg-zinc-950/50 backdrop-blur-md">
          <DialogTitle className="text-sm font-medium">Shared Image</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-8 pt-16 h-[70vh]">
          <img src={url} alt="Enlarged media" className="max-w-full max-h-full object-contain rounded-md" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- MAIN PAGE ---

export default function InboxPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    setHasMounted(true);
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/accounts`);
      const accountsData = await res.json();
      
      // For MVP, we'll just fetch all chats. In a real app we might filter by account.
      const chatsRes = await fetch(`${API_URL}/chats`);
      const chatsData = await chatsRes.json();
      
      const mappedChats: Conversation[] = chatsData.chats.map((chat: any) => ({
        id: chat.unipile_id,
        unipile_id: chat.unipile_id,
        name: chat.name || "Unknown",
        platform: chat.type?.toLowerCase() as Platform,
        lastMessage: chat.last_message || "",
        timestamp: new Date(chat.timestamp || Date.now()),
        unread: chat.unread_count || 0,
        online: false,
      }));

      setConversations(mappedChats);
      if (mappedChats.length > 0 && !activeChatId) {
        setActiveChatId(mappedChats[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    if (!chatId) return;
    try {
      const res = await fetch(`${API_URL}/chats/${chatId}/messages`);
      const data = await res.json();
      
      const mappedMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id,
        unipile_id: msg.unipile_id,
        sender: msg.is_from_me ? "You" : (conversations.find(c => c.id === chatId)?.name || "User"),
        content: msg.text || "",
        timestamp: new Date(msg.timestamp || msg.created_at),
        type: msg.is_from_me ? "outgoing" : "incoming",
        kind: msg.type === 'VOICE' ? 'audio' : (msg.type === 'FILE' ? 'text' : 'text'), // Simple mapping for MVP
        attachments: msg.attachments ? JSON.parse(msg.attachments) : null
      }));

      setMessages(prev => ({
        ...prev,
        [chatId]: mappedMessages
      }));
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch(`${API_URL}/chats/sync`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Sync all
      });
      toast.success("Sync completed");
      fetchConversations();
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };
  
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(400);
  const [isResizingRight, setIsResizingRight] = useState(false);
  
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(400);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [localFilter, setLocalFilter] = useState<'all' | 'media' | 'starred' | 'sentiment'>('all');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [newChatPlatform, setNewChatPlatform] = useState<'WhatsApp' | 'Instagram' | 'Telegram' | null>(null);
  const [isBotActive, setIsBotActive] = useState(true); // Mocking bot state
  const [showIntelligenceFork, setShowIntelligenceFork] = useState(true); // Active suggestion

  // Refs for tracking drag start
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const startResizingRight = (e: React.MouseEvent) => {
    setIsResizingRight(true);
    startXRef.current = e.clientX;
    startWidthRef.current = rightSidebarWidth;
    e.preventDefault();
  };

  const startResizingLeft = (e: React.MouseEvent) => {
    setIsResizingLeft(true);
    startXRef.current = e.clientX;
    startWidthRef.current = leftSidebarWidth;
    e.preventDefault();
  };

  const stopResizing = () => {
    setIsResizingRight(false);
    setIsResizingLeft(false);
  };

  const resize = (e: MouseEvent) => {
    const minChatWidth = 350;
    const minSidebarWidth = 300;
    const zenWidth = 80;
    const availableWidth = window.innerWidth - zenWidth;

    if (isResizingRight) {
      const delta = startXRef.current - e.clientX;
      let newWidth = startWidthRef.current + delta;
      
      const maxAllowedWidth = availableWidth - leftSidebarWidth - minChatWidth;
      newWidth = Math.max(minSidebarWidth, Math.min(newWidth, maxAllowedWidth));
      
      setRightSidebarWidth(newWidth);
    }
    if (isResizingLeft) {
      const delta = e.clientX - startXRef.current;
      let newWidth = startWidthRef.current + delta;
      
      const maxAllowedWidth = availableWidth - (showRightSidebar ? rightSidebarWidth : 0) - minChatWidth;
      newWidth = Math.max(minSidebarWidth, Math.min(newWidth, maxAllowedWidth));
      
      setLeftSidebarWidth(newWidth);
    }
  };

  useEffect(() => {
    if (isResizingRight || isResizingLeft) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizingRight, isResizingLeft]);

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 1200) {
        setShowRightSidebar(false);
      }
    };
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId, hasMounted]);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const activeChat = useMemo(() => 
    conversations.find(c => c.id === activeChatId) || conversations[0] || null,
    [conversations, activeChatId]
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPlatform = selectedPlatform === 'all' || c.platform === selectedPlatform;
      return matchSearch && matchPlatform;
    });
  }, [conversations, searchQuery, selectedPlatform]);

  const handleSendMessage = async (textOverride?: string) => {
    const content = textOverride || inputValue;
    if (!content.trim()) return;

    const tempId = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      id: tempId,
      unipile_id: "",
      sender: "You",
      content: content,
      timestamp: new Date(),
      type: "outgoing",
      kind: "text",
      status: 'sending'
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));

    setInputValue("");
    setShowEmojiPicker(false);

    try {
      const res = await fetch(`${API_URL}/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });

      if (!res.ok) throw new Error("Failed to send");

      const data = await res.json();
      
      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(m => 
          m.id === tempId ? { 
            ...m, 
            id: data.message.id, 
            unipile_id: data.message.unipile_id,
            status: 'sent' 
          } : m
        )
      }));

      setConversations(prev => prev.map(c => 
        c.id === activeChatId 
          ? { ...c, lastMessage: content, timestamp: new Date() } 
          : c
      ));

    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(m => 
          m.id === tempId ? { ...m, status: 'failed' } : m
        )
      }));
      toast.error("Failed to send message");
    }
  };

  const handleSendVoice = async () => {
    // In a real implementation, we would have a Blob from the recorder.
    // For this MVP demonstration, we simulate creating a small blob.
    const mockAudioBlob = new Blob(["mock audio data"], { type: 'audio/mpeg' });
    const file = new File([mockAudioBlob], "voice-message.mp3", { type: 'audio/mpeg' });

    const tempId = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      id: tempId,
      unipile_id: "",
      sender: "You",
      content: "🎤 Voice message",
      timestamp: new Date(),
      type: "outgoing",
      kind: "audio",
      status: 'sending'
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));

    setIsRecording(false);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('type', 'VOICE');

      const res = await fetch(`${API_URL}/chats/${activeChatId}/messages`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Failed to send voice");

      const data = await res.json();

      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(m => 
          m.id === tempId ? { 
            ...m, 
            id: data.message.id, 
            unipile_id: data.message.unipile_id,
            status: 'sent' 
          } : m
        )
      }));

      setConversations(prev => prev.map(c => 
        c.id === activeChatId 
          ? { ...c, lastMessage: "🎤 Voice message", timestamp: new Date() } 
          : c
      ));

    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(m => 
          m.id === tempId ? { ...m, status: 'failed' } : m
        )
      }));
      toast.error("Failed to send voice message");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const tempId = Math.random().toString(36).substr(2, 9);
    const newMessage: Message = {
      id: tempId,
      unipile_id: "",
      sender: "You",
      content: `📎 ${file.name}`,
      timestamp: new Date(),
      type: "outgoing",
      kind: "text", // Simplified for MVP
      status: 'sending'
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));

    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await fetch(`${API_URL}/chats/${activeChatId}/messages`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Failed to upload");

      const data = await res.json();

      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(m => 
          m.id === tempId ? { 
            ...m, 
            id: data.message.id, 
            unipile_id: data.message.unipile_id,
            status: 'sent' 
          } : m
        )
      }));

      setConversations(prev => prev.map(c => 
        c.id === activeChatId 
          ? { ...c, lastMessage: `📎 ${file.name}`, timestamp: new Date() } 
          : c
      ));

    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [activeChatId]: prev[activeChatId].map(m => 
          m.id === tempId ? { ...m, status: 'failed' } : m
        )
      }));
      toast.error("Failed to upload file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const genericAction = (name: string) => {
    toast(`Feature: ${name}`, {
      description: "This is a mock interaction for the MVP demo.",
    });
  };

  const handleAIDraft = () => {
    setInputValue("Alex, I've noticed you're highly engaged with our luxury tier offerings. I'd love to give you an exclusive preview of our next collection. Would you be interested?");
    toast("AI Draft Generated", {
      description: "Draft created based on Sentiment IQ and purchase history.",
    });
  };

  const filteredMessages = useMemo(() => {
    const chatMsgs = messages[activeChatId] || [];
    if (localFilter === 'all') return chatMsgs;
    if (localFilter === 'media') return chatMsgs.filter(m => m.kind === 'audio' || m.kind === 'image');
    if (localFilter === 'starred') return chatMsgs.filter(m => m.starred);
    if (localFilter === 'sentiment') return chatMsgs.filter(m => m.sentiment === 'negative' || m.sentiment === 'positive');
    return chatMsgs;
  }, [messages, activeChatId, localFilter]);

  return (
    <div 
      className="grid h-full w-full overflow-hidden bg-background relative"
      style={{ 
        gridTemplateColumns: `${leftSidebarWidth}px minmax(350px, 1fr) ${(showRightSidebar && activeChat) ? `${rightSidebarWidth}px` : '0px'}` 
      }}
    >
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="bg-zinc-950/90 border-white/10 backdrop-blur-2xl sm:max-w-[500px] rounded-3xl p-0 gap-0 overflow-hidden shadow-2xl">
          <header className="p-8 pb-4">
            <DialogTitle className="text-2xl font-bold text-white tracking-tight mb-2">New Conversation</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs mb-6 font-medium">
              Start a high-end conversation across your connected platforms.
            </DialogDescription>
            
            <div className="relative group mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
              <Input 
                placeholder="Search name, phone or @handle..." 
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className="pl-12 bg-white/5 border-white/5 rounded-2xl h-14 text-base focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Select Platform</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'WhatsApp', icon: MessageSquare, color: 'text-green-500', glow: 'ring-green-500/50 bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]' },
                  { name: 'Instagram', icon: Instagram, color: 'text-pink-500', glow: 'ring-pink-500/50 bg-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.3)]' },
                  { name: 'Telegram', icon: Send, color: 'text-blue-500', glow: 'ring-blue-500/50 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)]' }
                ].map((p) => (
                  <button 
                    key={p.name}
                    onClick={() => setNewChatPlatform(p.name as any)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border border-white/5 relative",
                      newChatPlatform === p.name 
                        ? cn("ring-2 scale-105 z-10", p.glow) 
                        : "bg-white/5 hover:bg-white/10 hover:scale-105"
                    )}
                  >
                    <p.icon className={cn("w-6 h-6 transition-transform", p.color, newChatPlatform === p.name && "scale-110")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", newChatPlatform === p.name ? "text-white" : "text-zinc-500")}>
                      {p.name}
                    </span>
                    {newChatPlatform === p.name && (
                      <motion.div 
                        layoutId="platform-glow"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-none">
            <div className="px-6 py-2">
              <span className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em]">Intelligent Suggestions</span>
            </div>
            {[
              { name: 'Sophia Chen', handle: '@sophia_style', platform: 'instagram', status: 'Recent Lead' },
              { name: 'Marcus Wright', handle: '+44 7700 9000', platform: 'whatsapp', status: 'High Interest' },
              { name: 'Elena Rossi', handle: '@elenarosse', platform: 'telegram', status: 'New Inquiry' }
            ].map((contact, i) => (
              <button 
                key={contact.name}
                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group px-8"
              >
                <Avatar className="w-10 h-10 border border-white/5">
                  <AvatarFallback className="bg-zinc-800 text-[10px] font-bold">{contact.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-100">{contact.name}</span>
                    <span className="text-[10px] text-zinc-600 font-medium">{contact.handle}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{contact.status}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
              </button>
            ))}
          </div>
          
          <footer className="p-6 bg-white/5 mt-2 border-t border-white/5">
            <button className="w-full h-12 bg-white text-black rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-colors">
              Start Global Search
            </button>
          </footer>
        </DialogContent>
      </Dialog>
      {/* Search & Thread List Column */}
      <section className="flex flex-col h-full border-r border-white/5 bg-[#09090b] overflow-hidden min-w-0 relative z-10">
        {/* Fixed Header */}
        <header className="flex-shrink-0 p-6 pb-2 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white tracking-tight">Messages</h1>
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn("rounded-xl hover:bg-white/10", isSyncing && "animate-spin")} 
                onClick={handleSync}
                disabled={isSyncing}
              >
                <ArrowRightLeft className="w-5 h-5 text-zinc-400" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-xl hover:bg-white/10" 
                onClick={() => setIsNewChatOpen(true)}
              >
                <Plus className="w-5 h-5 text-zinc-400" />
              </Button>
            </div>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
            <Input 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/5 rounded-xl h-11"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {(['all', 'whatsapp', 'instagram', 'telegram'] as const).map((p) => (
              <button 
                key={p} 
                onClick={() => setSelectedPlatform(p)}
                className={cn(
                  "rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 shrink-0",
                  selectedPlatform === p 
                    ? "bg-white text-zinc-950 shadow-md ring-1 ring-white" 
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </header>

        {/* Scrollable Conversation List */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {filteredConversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group text-left relative",
                    activeChatId === chat.id 
                      ? "bg-white/10 shadow-lg ring-1 ring-white/10" 
                      : "hover:bg-white/5"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12 border border-white/10">
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className="bg-zinc-800">{chat.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-zinc-950" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-zinc-100 truncate">{chat.name}</span>
                      <span className="text-[10px] text-zinc-500 font-medium tabular-nums">
                        {hasMounted ? format(chat.timestamp, "hh:mm a") : "--:--"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 truncate pr-2">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 && activeChatId !== chat.id && (
                    <Badge className="absolute right-4 bottom-4 bg-primary text-black font-bold h-5 min-w-5 rounded-full p-0 flex items-center justify-center">
                      {chat.unread}
                    </Badge>
                  )}
                </button>
              ))}
              {filteredConversations.length === 0 && (
                <div className="p-12 text-center text-zinc-600">No results found</div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Resize Handle Left */}
        <div 
          onMouseDown={startResizingLeft}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 transition-colors z-40 group"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3 text-zinc-500" />
          </div>
        </div>
      </section>

      {/* Chat Detail Column */}
      <section className={cn(
        "h-full overflow-hidden bg-[#0c0c0e] relative min-w-0 z-20 shadow-[0_0_50px_rgba(0,0,0,1)]",
        activeChat ? "grid grid-rows-[80px_1fr_auto]" : "flex flex-col items-center justify-center"
      )}>
        {!activeChat ? (
          <div className="flex flex-col items-center justify-center text-zinc-600 gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <MessageSquare className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-sm font-medium tracking-wide">Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="flex items-center justify-between px-8 border-b border-white/5 z-20 bg-zinc-950/40 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src={activeChat.avatar} />
                    <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    {activeChat.platform?.toLowerCase() === 'whatsapp' && <MessageSquare className="w-3 h-3 text-green-500 fill-current" />}
                    {activeChat.platform?.toLowerCase() === 'instagram' && <Instagram className="w-3 h-3 text-pink-500" />}
                    {activeChat.platform?.toLowerCase() === 'telegram' && <Send className="w-3 h-3 text-blue-500 fill-current" />}
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-zinc-100 leading-none mb-1">{activeChat.name}</h2>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1.5 uppercase font-black tracking-widest">
                    {activeChat.online ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Online</> : "Away"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <AnimatePresence>
                  {isBotActive && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 20 }}
                      className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Bot Active</span>
                      </div>
                      <div className="w-px h-4 bg-primary/20" />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setIsBotActive(false);
                          toast.success("Human Takeover Successful", {
                            description: "Automation paused. You are now in full control of this thread."
                          });
                        }}
                        className="h-6 px-2 text-[10px] font-black uppercase text-white hover:bg-primary hover:text-black transition-all"
                      >
                        Stop Automation
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("rounded-xl transition-all", showRightSidebar ? "text-primary bg-white/10" : "text-zinc-500")}
                    onClick={() => setShowRightSidebar(!showRightSidebar)}
                  >
                    <PanelRight className="w-5 h-5" />
                  </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("rounded-xl transition-all", localFilter !== 'all' ? "text-primary bg-white/10" : "text-zinc-500")}
                    >
                      <Filter className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 w-56 rounded-2xl p-2 mb-4 backdrop-blur-xl z-[100]">
                    <div className="px-3 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Filter History</div>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => setLocalFilter('all')}>
                      <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold">All Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => setLocalFilter('media')}>
                      <ImageIcon className="w-4 h-4" /> <span className="text-xs font-bold">Media & Files</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => setLocalFilter('starred')}>
                      <Star className="w-4 h-4 text-yellow-500" /> <span className="text-xs font-bold">Starred</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => setLocalFilter('sentiment')}>
                      <Brain className="w-4 h-4 text-purple-500" /> <span className="text-xs font-bold">Sentiment IQ</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/10 text-zinc-500">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 w-64 rounded-2xl p-2 mb-4 backdrop-blur-xl z-[100]">
                    <div className="px-3 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Relationship Tools</div>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => genericAction("Reminder")}>
                      <Bell className="w-4 h-4" /> <span className="text-xs font-bold">Set Reminder</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => genericAction("Broadcast")}>
                      <Radio className="w-4 h-4" /> <span className="text-xs font-bold">Add to Broadcast</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => genericAction("AI Summary")}>
                      <Sparkles className="w-4 h-4 text-primary" /> <span className="text-xs font-bold">AI Conversation Summary</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3 data-[state=open]:bg-white/10">
                        <GitBranch className="w-4 h-4 text-amber-500" /> <span className="text-xs font-bold">Assign to Flow</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-zinc-950 border-white/10 rounded-2xl p-2 min-w-[200px] backdrop-blur-xl">
                        <div className="px-3 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Active Flows</div>
                        <DropdownMenuItem 
                          className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" 
                          onClick={() => {
                            toast.success("Strategic Flow Initiated", {
                              description: `Assigned ${activeChat.name} to 'VIP Outreach' sequence.`
                            });
                          }}
                        >
                          <GitBranch className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold">VIP Outreach</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3"
                          onClick={() => {
                            toast.success("Strategic Flow Initiated", {
                              description: `Assigned ${activeChat.name} to 'Silent Drop Alert' sequence.`
                            });
                          }}
                        >
                          <Instagram className="w-4 h-4 text-pink-500" />
                          <span className="text-xs font-bold">Silent Drop Alert</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <div className="h-px bg-white/5 my-1" />
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => genericAction("Export")}>
                      <FileDown className="w-4 h-4" /> <span className="text-xs font-bold">Export Client Resume</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex items-center gap-3" onClick={() => genericAction("Transfer")}>
                      <ArrowRightLeft className="w-4 h-4" /> <span className="text-xs font-bold">Transfer to Specialist</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-white/10 text-red-400 cursor-pointer flex items-center gap-3" onClick={() => genericAction("Archive")}>
                      <Archive className="w-4 h-4" /> <span className="text-xs font-bold">Archive & Close</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

            {/* Resize Handle Right */}
            {showRightSidebar && (
              <div 
                onMouseDown={startResizingRight}
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 transition-colors z-40 group"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-3 h-3 text-zinc-500" />
                </div>
              </div>
            )}

            {/* Message Container */}
            <div className="relative min-h-0 overflow-hidden w-full h-full">
              <ScrollArea className="h-full w-full">
                <div className="max-w-3xl mx-auto space-y-8 p-8 w-full min-w-0 flex flex-col">
                  {localFilter !== 'all' && (
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 mb-4">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Active Filter: {localFilter}</span>
                      <button onClick={() => setLocalFilter('all')} className="text-[10px] font-bold text-primary hover:underline underline-offset-4">Clear Filter</button>
                    </div>
                  )}
                  {(messages[activeChatId] || []).map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex flex-col group", msg.type === "outgoing" ? "items-end" : "items-start")}
                    >
                      <div className={cn(
                        "relative px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[85%] break-words overflow-wrap-anywhere",
                        msg.type === "outgoing" 
                          ? "bg-primary text-black font-semibold shadow-lg shadow-primary/10" 
                          : "bg-white/5 border border-white/5 text-zinc-200"
                      )}>
                        {msg.kind === 'text' && msg.content}
                        {msg.kind === 'audio' && <AudioPlayer isOutgoing={msg.type === 'outgoing'} />}
                        {msg.kind === 'image' && <MediaModal url={msg.mediaUrl!} />}

                        {(msg.starred || msg.sentiment) && (
                          <div className="absolute -top-2 -right-2 flex gap-1">
                            {msg.starred && (
                              <div className="bg-yellow-500 rounded-full p-1 shadow-lg">
                                <Star className="w-2.5 h-2.5 text-black fill-current" />
                              </div>
                            )}
                            {msg.sentiment === 'positive' && (
                              <div className="bg-primary rounded-full p-1 shadow-lg">
                                <Sparkles className="w-2.5 h-2.5 text-black" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 px-1">
                        <span className="text-[9px] text-zinc-600 font-bold tracking-widest tabular-nums">
                          {hasMounted ? format(msg.timestamp, "hh:mm a") : "--:--"}
                        </span>
                        {msg.type === "outgoing" && (
                          <div className="flex items-center">
                            {msg.status === 'sending' && <Clock className="w-3 h-3 text-zinc-600 animate-pulse" />}
                            {msg.status === 'sent' && <Check className="w-3 h-3 text-zinc-600" />}
                            {msg.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-primary" />}
                            {msg.status === 'failed' && <AlertCircle className="w-3 h-3 text-red-500" />}
                            {!msg.status && <CheckCheck className="w-3.5 h-3.5 text-primary" />}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </ScrollArea>
            </div>

            {/* Floating Input Area */}
            <footer className="flex-shrink-0 px-8 pb-8 pt-4 bg-gradient-to-t from-zinc-950/80 to-transparent z-20 w-full overflow-hidden">
              <div className="max-w-3xl mx-auto relative w-full">
                <AnimatePresence>
                  {showIntelligenceFork && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="absolute bottom-full left-0 right-0 mb-6 bg-zinc-900/90 backdrop-blur-2xl border border-primary/20 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white mb-1">Intelligence Advice</h4>
                          <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                            {activeChat.name} is asking about order tracking. Our **Support Flow** can resolve this in <span className="text-primary font-bold">12 seconds</span>. Should I proceed or wait for a specialist?
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setShowIntelligenceFork(false);
                                toast.success("AI Workflow Activated", {
                                  description: "The support bot is now handling the order tracking request."
                                });
                              }}
                              className="bg-primary hover:bg-primary/90 text-black font-bold h-9 px-4 rounded-xl text-[10px] uppercase tracking-wider"
                            >
                              Activate Agentic AI
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setShowIntelligenceFork(false);
                                setIsBotActive(false);
                              }}
                              className="text-zinc-400 hover:text-white hover:bg-white/5 font-bold h-9 px-4 rounded-xl text-[10px] uppercase tracking-wider"
                            >
                              No, I'll Handle It
                            </Button>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setShowIntelligenceFork(false)}
                          className="h-8 w-8 rounded-lg hover:bg-white/5 -mt-1"
                        >
                          <Plus className="w-4 h-4 rotate-45 text-zinc-600" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-0 mb-4 z-50 shadow-2xl border border-white/10 rounded-2xl overflow-hidden"
                    >
                      <EmojiPicker onEmojiClick={(e: any) => setInputValue(prev => prev + e.emoji)} theme={undefined} width={320} height={400} />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="bg-white/5 border border-white/5 rounded-2xl p-2 flex items-end gap-2 focus-within:ring-1 focus-within:ring-primary/40 transition-all duration-500 relative overflow-hidden backdrop-blur-xl">
                  {/* Voice recording overlay same as before */}
                  <AnimatePresence>
                    {isRecording && (
                      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute inset-0 bg-zinc-900 z-10 flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-xs font-bold text-white tabular-nums">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span></div>
                          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Live Recording</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-red-500" onClick={() => setIsRecording(false)}><Trash2 className="w-4 h-4" /></Button>
                          <Button className="bg-primary text-black hover:bg-primary/90 h-9 px-4 rounded-xl font-bold text-xs" onClick={handleSendVoice}>Send Voice</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-xl h-11 w-11 shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <Plus className="w-5 h-5" />
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                  </Button>

                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="Type a message..." 
                    rows={1}
                    className="flex-1 bg-transparent border-none resize-none py-3.5 px-2 text-zinc-200 focus:outline-none min-h-[44px] max-h-32 text-sm leading-relaxed"
                  />

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className={cn("rounded-xl h-11 w-11", showEmojiPicker ? "text-primary bg-white/10" : "text-zinc-500")} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <Smile className="w-5 h-5" />
                    </Button>

                    {/* Quick Snippets Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white rounded-xl h-11 w-11">
                          <FileText className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 w-64 rounded-2xl p-2 mb-4 backdrop-blur-xl z-[100]">
                        <div className="px-3 py-2 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Quick Library</div>
                        {SNIPPETS.map((snippet) => (
                          <DropdownMenuItem 
                            key={snippet.id} 
                            className="p-3 rounded-xl focus:bg-white/10 cursor-pointer flex flex-col items-start gap-1"
                            onClick={() => handleSendMessage(snippet.text)}
                          >
                            <span className="text-xs font-bold text-white">{snippet.title}</span>
                            <span className="text-[10px] text-zinc-500 truncate w-full">{snippet.text}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="icon" className="text-zinc-500 rounded-xl h-11 w-11" onClick={() => setIsRecording(true)}>
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Button onClick={() => handleSendMessage()} className="bg-primary hover:bg-primary/90 text-black rounded-xl h-11 w-11 p-0 ml-1 shrink-0">
                      <Send className="w-5 h-5" />
                    </Button>
                    <Button 
                      onClick={handleAIDraft}
                      variant="ghost"
                      size="icon"
                      className="bg-zinc-800/50 hover:bg-primary/20 hover:text-primary text-zinc-400 rounded-xl h-11 w-11 ml-1 shrink-0 group transition-all"
                    >
                      <Wand2 className="w-5 h-5 group-hover:scale-110" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-[9px] text-center text-zinc-600 font-bold uppercase tracking-[0.2em] opacity-40">
                  End-to-End Encrypted Selection: {activeChat.platform?.toUpperCase()}
                </p>
              </div>
            </footer>
          </>
        )}
      </section>

      {/* Right Column: Intelligence & Profile */}
      <section className={cn(
        "flex flex-col h-full border-l border-white/5 bg-[#09090b] overflow-hidden min-w-0 z-10",
        (!showRightSidebar || !activeChat) && "hidden"
      )}>
        {activeChat && (
          <ScrollArea className="h-full">
            <div className="p-10 flex flex-col items-center">
              <Avatar className="w-36 h-36 mb-8 ring-1 ring-white/10 p-1.5 bg-zinc-900">
                <AvatarImage src={activeChat.avatar} className="rounded-full" />
                <AvatarFallback className="bg-zinc-800 text-3xl font-black">{activeChat.name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-black text-zinc-100 mb-1 tracking-tight">{activeChat.name}</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mb-10">Elite Client Profile</p>
              
              <div className="grid grid-cols-2 gap-3 w-full mb-12">
                <button className="flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest h-11 transition-all">CRM File</button>
                <button className="flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest h-11 transition-all">Metrics</button>
              </div>

              <div className="w-full space-y-12">
                <div>
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-4">Sentiment IQ</h3>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase text-zinc-400">
                      <span>Positive Intent</span>
                      <span className="text-primary text-sm">92%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-4">
                      <motion.div initial={{ width: 0 }} animate={{ width: "92%" }} className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium italic opacity-70">
                      "AI insight: Customer is highly engaged with luxury tier offerings. Recommended next: Exclusive Preview."
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.25em] mb-4">Meta Connectivity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group cursor-pointer hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3"><MessageSquare className="w-4 h-4 text-green-500" /><span className="text-xs font-bold text-zinc-300">WhatsApp</span></div>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group opacity-50">
                      <div className="flex items-center gap-3"><Instagram className="w-4 h-4 text-pink-500" /><span className="text-xs font-bold text-zinc-300">Instagram</span></div>
                      <span className="text-[9px] font-bold text-zinc-600">LINKED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </section>
    </div>
  );
}
