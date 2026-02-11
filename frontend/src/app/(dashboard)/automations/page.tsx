"use client";

import { 
  Plus, 
  Search, 
  GitBranch, 
  Zap, 
  MessageSquare, 
  Play, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Database,
  UserCheck,
  Cpu,
  ArrowRight,
  BarChart3,
  Clock,
  Layers,
  Send,
  Brain,
  Info,
  MessageCircle,
  FileSpreadsheet,
  Globe,
  Server,
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge as FlowEdge,
  Node as FlowNode,
  Handle,
  Position,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// --- MOCK DATA & TYPES ---

type NodeType = "trigger" | "action" | "condition" | "ai" | "integration";

const ICONS_MAP: Record<string, any> = {
  MessageSquare,
  Database,
  Clock,
  GitBranch,
  UserCheck,
  Cpu,
  Brain,
  Layers,
  Send,
  Plus,
  Zap,
  MessageCircle,
  FileSpreadsheet,
  Globe,
  Server,
  Network
};

const NODE_PALETTE = [
  { category: "Triggers", items: [
    { type: "trigger" as const, title: "New Message", icon: "MessageSquare", desc: "Reply received", docs: "Triggers instantly when an inbound message is received via WhatsApp, Instagram, or Telegram. Best used for Quick Replies or initial engagement." },
    { type: "trigger" as const, title: "CRM Tag Added", icon: "Database", desc: "Manual tagging", docs: "Activates when a specific tag is manually or through another flow applied to a client. Use this to follow-up on manual segmentations." },
    { type: "trigger" as const, title: "Wait Timer", icon: "Clock", desc: "Schedule delay", docs: "Holds the execution for a set duration (minutes, hours, days). Crucial for multi-day outreach sequences." },
  ]},
  { category: "Logic", items: [
    { type: "condition" as const, title: "Platform Match", icon: "GitBranch", desc: "Check IG/WA/TG", docs: "Diverges the path based on the origin platform. Essential for platform-specific content like IG Story mentions." },
    { type: "condition" as const, title: "CRM Lookup", icon: "UserCheck", desc: "Segment check", docs: "Queries the database to check client tier, sentiment, or lifetime value. Use this to escalate VIPs to humans early." },
  ]},
  { category: "Intelligence", items: [
    { type: "ai" as const, title: "Analyze Intent", icon: "Cpu", desc: "GPT-4o detection", docs: "Uses GPT-4o to categorize message intent (Question, Complaint, Order). Foundation for intelligent routing." },
    { type: "ai" as const, title: "The Fork", icon: "Brain", desc: "AI vs Human offer", docs: "Strategic logic that decides if a lead is worth AI-automation or requires a High-Touch human specialist." },
    { type: "ai" as const, title: "Draft Response", icon: "Layers", desc: "Shadow copywriter", docs: "Generates a high-conversion shadow-response for human review. Perfect for maintaining brand voice at scale." },
  ]},
  { category: "Actions", items: [
    { type: "action" as const, title: "Send Message", icon: "Send", desc: "Dispatch content", docs: "Dispatches text, images, or media to the client. The core output of any automation flow." },
    { type: "action" as const, title: "Add CRM Tag", icon: "Plus", desc: "Automation mark", docs: "Automatically marks the client's file. Strategic for building long-term data regarding client behavior." },
    { type: "action" as const, title: "Handover", icon: "Zap", desc: "Transfer to human", docs: "Instantly transfers the conversation to the Active Inbox for a human specialist. Use for complex negotiations." },
  ]},
  { category: "MCP Tools (Methods)", items: [
    { type: "integration" as const, title: "slack_post_message", icon: "MessageCircle", desc: "Post to Slack channel", docs: "Calls the Slack MCP method to post a formatted message. Requires 'channel' and 'text' parameters." },
    { type: "integration" as const, title: "sheets_append_row", icon: "FileSpreadsheet", desc: "Add data to sheet", docs: "Calls the Google Sheets MCP method to append a new row. Requires 'sheetId' and 'values' array." },
    { type: "integration" as const, title: "http_post_webhook", icon: "Globe", desc: "Generic Webhook POST", docs: "Calls the Fetch MCP method to send an HTTP POST request. Perfect for connecting to legacy custom systems." },
    { type: "integration" as const, title: "db_insert_client", icon: "Server", desc: "Direct DB Write", docs: "Calls the Database MCP method to insert or update client records directly in your system of truth." },
    { type: "integration" as const, title: "hubspot_sync_contact", icon: "Network", desc: "CRM Contact Sync", docs: "Calls the HubSpot MCP method to synchronize customer data and update deal stages based on flow results." },
  ]}
];

// --- CUSTOM NODE COMPONENTS ---

const CustomFlowNode = ({ data, selected }: { data: any, selected?: boolean }) => {
  const Icon = typeof data.icon === 'string' ? ICONS_MAP[data.icon] : data.icon;
  if (!Icon) return null; // Safety check
  const isTrigger = data.type === "trigger";

  return (
    <div className={cn(
      "p-5 rounded-3xl bg-[#09090b] border backdrop-blur-2xl w-60 transition-shadow",
      selected ? "border-primary/50 ring-4 ring-primary/5 shadow-2xl" : "border-white/10 shadow-lg hover:border-white/20"
    )}>
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-4 !h-4 !bg-[#09090b] !border-2 !border-white/20 hover:!border-white/50 !-left-2"
        />
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-2.5 rounded-xl border",
          isTrigger ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          data.type === "action" ? "bg-primary/10 text-primary border-primary/20" :
          data.type === "condition" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
          data.type === "integration" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
          "bg-purple-500/10 text-purple-500 border-purple-500/20"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1">
          {data.type === "integration" && (
            <Badge variant="outline" className="rounded-lg text-[7px] font-black uppercase tracking-tighter py-0 px-1 bg-cyan-500/10 border-cyan-500/20 text-cyan-400 mr-1">
              MCP tool
            </Badge>
          )}
          <Badge variant="outline" className="rounded-lg text-[8px] font-black uppercase tracking-widest py-0 px-2 bg-white/5 border-white/5 text-zinc-500">
            {data.type}
          </Badge>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-zinc-100">{data.label}</h4>
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{data.description}</p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-[#09090b] !border-2 !border-primary/40 hover:!border-primary !-right-2"
      />
    </div>
  );
};

// --- CONFIG COMPONENTS ---

const ConfigSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="space-y-4">
    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">{title}</label>
    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
      {children}
    </div>
  </section>
);

const TriggerConfig = ({ node, onUpdate }: { node: any, onUpdate: (data: any) => void }) => {
  const isWait = node.data.label === "Wait Timer";
  
  return (
    <div className="space-y-6">
      <ConfigSection title="Trigger Settings">
        {isWait ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Duration</span>
              <Input 
                type="number"
                value={node.data.duration || 1}
                onChange={(e) => onUpdate({ duration: e.target.value })}
                className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Unit</span>
              <select 
                className="w-full bg-zinc-950 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
                value={node.data.unit || "min"}
                onChange={(e) => onUpdate({ unit: e.target.value })}
              >
                <option value="min">Minutes</option>
                <option value="hour">Hours</option>
                <option value="day">Days</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Platform Filter</span>
              <div className="flex gap-2">
                {["WhatsApp", "Instagram", "Telegram"].map(p => (
                  <button
                    key={p}
                    onClick={() => onUpdate({ platform: p })}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all",
                      node.data.platform === p ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Keyword Trigger (Optional)</span>
              <Input 
                placeholder="e.g. #VIP, order, help"
                value={node.data.keywords || ""}
                onChange={(e) => onUpdate({ keywords: e.target.value })}
                className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
              />
            </div>
          </div>
        )}
      </ConfigSection>
    </div>
  );
};

const ConditionConfig = ({ node, onUpdate }: { node: any, onUpdate: (data: any) => void }) => (
  <ConfigSection title="Logic Conditions">
    <div>
      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">CRM Property</span>
      <select 
        className="w-full bg-zinc-950 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none mb-4"
        value={node.data.field || "tier"}
        onChange={(e) => onUpdate({ field: e.target.value })}
      >
        <option value="tier">Client Tier</option>
        <option value="sentiment">Sentiment Score</option>
        <option value="lifetime_value">LTV (Lifetime Value)</option>
        <option value="last_purchase">Last Purchase Date</option>
      </select>
      
      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Operator</span>
      <select 
        className="w-full bg-zinc-950 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none mb-4"
        value={node.data.operator || "equals"}
        onChange={(e) => onUpdate({ operator: e.target.value })}
      >
        <option value="equals">Equals</option>
        <option value="greater_than">Greater Than</option>
        <option value="less_than">Less Than</option>
        <option value="contains">Contains</option>
      </select>

      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Match Value</span>
      <Input 
        value={node.data.value || ""}
        onChange={(e) => onUpdate({ value: e.target.value })}
        className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
      />
    </div>
  </ConfigSection>
);

const AIConfig = ({ node, onUpdate }: { node: any, onUpdate: (data: any) => void }) => {
  const isFork = node.data.label === "The Fork";
  const isIntent = node.data.label === "Analyze Intent";
  
  return (
    <ConfigSection title="AI Parameter Strategy">
      {isFork ? (
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Human Switch Threshold</span>
            <div className="flex items-center gap-4">
              <input 
                type="range"
                min="0"
                max="100"
                value={node.data.threshold || 70}
                onChange={(e) => onUpdate({ threshold: parseInt(e.target.value) })}
                className="flex-1 accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-bold text-primary w-8">{node.data.threshold || 70}%</span>
            </div>
            <p className="text-[9px] text-zinc-600 mt-2 italic">Messages below this AI confidence will be handed over to humans.</p>
          </div>
        </div>
      ) : isIntent ? (
        <div className="space-y-4">
           <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Model Selection</span>
            <div className="grid grid-cols-2 gap-2">
              {["GPT-4o", "Gemma 3"].map(m => (
                <button
                  key={m}
                  onClick={() => onUpdate({ model: m })}
                  className={cn(
                    "py-2 rounded-lg text-[10px] font-bold border transition-all",
                    node.data.model === m ? "bg-purple-500/20 border-purple-500/40 text-purple-500" : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Intent Categories</span>
            <textarea 
              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-400 h-20 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
              placeholder="Order, Inquiry, Support, Complaint..."
              value={node.data.categories || ""}
              onChange={(e) => onUpdate({ categories: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">AI Persona Template</span>
            <select 
              className="w-full bg-zinc-950 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
              value={node.data.persona || "professional"}
              onChange={(e) => onUpdate({ persona: e.target.value })}
            >
              <option value="professional">Elite Professional</option>
              <option value="friendly">Hype/Friendly</option>
              <option value="concise">Luxury/Concise</option>
            </select>
          </div>
        </div>
      )}
    </ConfigSection>
  );
};

const ActionConfig = ({ node, onUpdate }: { node: any, onUpdate: (data: any) => void }) => {
  const isMessage = node.data.label === "Send Message";
  const isTag = node.data.label === "Add CRM Tag";
  
  return (
    <ConfigSection title="Execution Action">
      {isMessage ? (
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Message Blueprint</span>
          <textarea 
            className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-200 h-32 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
            placeholder="Type your strategic response here... Use {{name}} for dynamic tags."
            value={node.data.message || ""}
            onChange={(e) => onUpdate({ message: e.target.value })}
          />
        </div>
      ) : isTag ? (
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">CRM Tag Name</span>
          <Input 
            placeholder="e.g. VIP_2024, Interested_In_Drop"
            value={node.data.tag || ""}
            onChange={(e) => onUpdate({ tag: e.target.value })}
            className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
          />
        </div>
      ) : (
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Handover Department</span>
          <select 
            className="w-full bg-zinc-950 border border-white/5 rounded-xl h-10 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
            value={node.data.department || "sales"}
            onChange={(e) => onUpdate({ department: e.target.value })}
          >
            <option value="sales">Luxury Sales Specialist</option>
            <option value="support">Concierge Support</option>
            <option value="escalation">Management Escalation</option>
          </select>
        </div>
      )}
    </ConfigSection>
  );
};

const MCPConfig = ({ node, onUpdate }: { node: any, onUpdate: (data: any) => void }) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast.success(`${node.data.label} Connection Verified`, {
        description: "MCP server returned handshake: 200 OK"
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <ConfigSection title="Integration Settings">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">MCP Endpoint</span>
            <Input 
              placeholder="e.g. http://localhost:3000/mcp"
              value={node.data.endpoint || ""}
              onChange={(e) => onUpdate({ endpoint: e.target.value })}
              className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Access Token / Secret</span>
            <Input 
              type="password"
              placeholder="••••••••••••••••"
              value={node.data.secret || ""}
              onChange={(e) => onUpdate({ secret: e.target.value })}
              className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
            />
          </div>
          <Button 
            onClick={handleTestConnection}
            disabled={isTesting}
            variant="outline"
            className="w-full h-10 rounded-xl border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all font-bold text-xs"
          >
            {isTesting ? "Handshaking..." : "Test MCP Context"}
          </Button>
        </div>
      </ConfigSection>

      <ConfigSection title="Tool Parameters">
        <div className="space-y-4">
          {node.data.label === "slack_post_message" ? (
            <>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Target Channel</span>
                <Input 
                  placeholder="#alerts, #general"
                  value={node.data.channel || ""}
                  onChange={(e) => onUpdate({ channel: e.target.value })}
                  className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Message Template</span>
                <textarea 
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-200 h-24 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                  placeholder="Hello team, {{user_name}} just triggered a flow..."
                  value={node.data.template || ""}
                  onChange={(e) => onUpdate({ template: e.target.value })}
                />
              </div>
            </>
          ) : node.data.label === "sheets_append_row" ? (
            <>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Spreadsheet ID</span>
                <Input 
                  placeholder="1BxiMVs0XRA5nFMdKvBdB..."
                  value={node.data.sheetId || ""}
                  onChange={(e) => onUpdate({ sheetId: e.target.value })}
                  className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Range / Tab Name</span>
                <Input 
                  placeholder="Sheet1!A:E"
                  value={node.data.range || ""}
                  onChange={(e) => onUpdate({ range: e.target.value })}
                  className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
                />
              </div>
            </>
          ) : (
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Config Payload (JSON)</span>
              <textarea 
                className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-400 h-32 focus:outline-none focus:ring-1 focus:ring-primary/20 font-mono resize-none"
                placeholder='{ "key": "value" }'
                value={node.data.payload || ""}
                onChange={(e) => onUpdate({ payload: e.target.value })}
              />
            </div>
          )}
        </div>
      </ConfigSection>
    </div>
  );
};

const nodeTypes = {
  custom: CustomFlowNode,
};

const INITIAL_NODES: FlowNode[] = [
  { 
    id: "node-1", 
    type: "custom", 
    position: { x: 50, y: 150 },
    data: { 
      type: "trigger", 
      label: "New Incoming Message", 
      icon: "MessageSquare", 
      description: "Triggers on inbound WhatsApp/IG" 
    },
  },
  { 
    id: "node-2", 
    type: "custom", 
    position: { x: 350, y: 150 },
    data: { 
      type: "ai", 
      label: "Analyze Intent", 
      icon: "Cpu", 
      description: "Detecting 'Purchase' or 'Pricing'" 
    },
  },
  { 
    id: "node-3", 
    type: "custom", 
    position: { x: 650, y: 150 },
    data: { 
      type: "integration", 
      label: "hubspot_sync_contact", 
      icon: "Network", 
      description: "Sync lead details to CRM context" 
    },
  },
  { 
    id: "node-4", 
    type: "custom", 
    position: { x: 950, y: 50 },
    data: { 
      type: "integration", 
      label: "slack_post_message", 
      icon: "MessageCircle", 
      description: "Alert #sales-high-priority" 
    },
  },
  { 
    id: "node-5", 
    type: "custom", 
    position: { x: 950, y: 250 },
    data: { 
      type: "integration", 
      label: "sheets_append_row", 
      icon: "FileSpreadsheet", 
      description: "Log for Weekly Performance ROI" 
    },
  },
  { 
    id: "node-6", 
    type: "custom", 
    position: { x: 1250, y: 150 },
    data: { 
      type: "action", 
      label: "Send VIP Greeting", 
      icon: "Send", 
      description: "Personalized premium response" 
    },
  }
];

const INITIAL_EDGES: FlowEdge[] = [
  { id: "e1", source: "node-1", target: "node-2", animated: true },
  { id: "e2", source: "node-2", target: "node-3", animated: true },
  { id: "e3", source: "node-3", target: "node-4", animated: true },
  { id: "e4", source: "node-3", target: "node-5", animated: true },
  { id: "e5", source: "node-4", target: "node-6", animated: true },
  { id: "e6", source: "node-5", target: "node-6", animated: true }
];

import { useState, useCallback, useRef, useEffect } from "react";

export default function AutomationsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [activeView, setActiveView] = useState<'editor' | 'logs' | 'library'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Flow Palette state
  const [paletteWidth, setPaletteWidth] = useState(320);
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  const selectedNodeId = nodes.find(n => n.selected)?.id || null;
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Resize handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 500) {
        setPaletteWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, item: any) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify({ nodeType, ...item }));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = "custom";
      const data = JSON.parse(event.dataTransfer.getData("application/reactflow"));

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: FlowNode = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: { 
          type: data.type,
          label: data.title,
          icon: data.icon,
          description: data.desc || "Added from palette"
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const SAVED_FLOWS = [
    { id: "flow-1", title: "VIP Outreach", stats: "89% success", status: "Live", icon: GitBranch },
    { id: "flow-2", title: "Silent Drop", stats: "124 runs", status: "Draft", icon: MessageSquare },
    { id: "flow-3", title: "Welcome Seq", stats: "98.2% CTR", status: "Live", icon: Zap },
  ];

  const FLOW_LOGS = [
    { id: "1", flow: "VIP Outreach", target: "Alex Johnson", status: "Completed", result: "Order Confirmed", time: "2m ago" },
    { id: "2", flow: "VIP Outreach", target: "Michael Chen", status: "At Fork", result: "Waiting for Human", time: "5m ago" },
    { id: "3", flow: "Silent Drop", target: "Sarah Miller", status: "Active", result: "Intent Detected", time: "12m ago" },
    { id: "4", flow: "Welcome Seq", target: "Emma Wilson", status: "Failed", result: "Rate Limit WA", time: "1h ago" },
  ];

  const saveFlow = () => {
    setIsSaving(true);
    setTimeout(() => {
      const flowData = {
        nodes,
        edges,
        metadata: {
          updatedAt: new Date().toISOString(),
          version: "1.0.0"
        }
      };
      localStorage.setItem('elite-flow-data', JSON.stringify(flowData));
      setIsSaving(false);
      toast.success("Flow Strategy Synced", {
        description: "Industrial graph structure has been serialized and saved."
      });
    }, 800);
  };

  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    }
  };

  return (
    <div className="flex h-full bg-zinc-950/20 backdrop-blur-sm relative overflow-hidden">
      {/* Workflow Palette (Left) */}
      <motion.div 
        ref={paletteRef}
        initial={false}
        animate={{ 
          width: isPaletteCollapsed ? 0 : paletteWidth,
          opacity: isPaletteCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-full overflow-hidden border-r border-white/5 bg-zinc-950/40 backdrop-blur-3xl flex flex-col z-10 relative"
        style={{ minWidth: isPaletteCollapsed ? 0 : paletteWidth }}
      >
        {!isPaletteCollapsed && (
          <>
            <div className="p-8 pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <GitBranch className="w-5 h-5 text-primary" />
                </div>
                Flow Palette
              </h2>
              <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <Input 
                  placeholder="Search components..." 
                  className="bg-white/5 border-white/5 pl-10 h-10 rounded-xl text-xs focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 px-4 py-4">
              <div className="space-y-8">
                {NODE_PALETTE.map((cat) => (
                  <div key={cat.category}>
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 px-4">{cat.category}</h3>
                    <div className="space-y-2 px-2">
                      {cat.items.map((item) => (
                        <div 
                          key={item.title}
                          draggable
                          onDragStart={(e) => onDragStart(e, "custom", item)}
                          className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group cursor-grab active:cursor-grabbing flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              item.type === "trigger" ? "bg-amber-500/10 text-amber-500" :
                              item.type === "action" ? "bg-primary/10 text-primary" :
                              item.type === "condition" ? "bg-blue-500/10 text-blue-500" :
                              item.type === "integration" ? "bg-cyan-500/10 text-cyan-400" :
                              "bg-purple-500/10 text-purple-500"
                            )}>
                              {(() => {
                                const Icon = ICONS_MAP[item.icon];
                                return Icon ? <Icon className="w-4 h-4" /> : null;
                              })()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-zinc-200">{item.title}</span>
                              <span className="text-[10px] text-zinc-500 font-medium">{item.desc}</span>
                            </div>
                          </div>
                          
                          <TooltipProvider>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <button 
                                  className="p-2 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-zinc-400 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="right" 
                                className="w-64 p-4 bg-zinc-900 border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
                              >
                                <div className="space-y-2">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Documentation</p>
                                  <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                                    {item.docs}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={cn(
                "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors group",
                isResizing && "bg-primary"
              )}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        )}
      </motion.div>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-zinc-900/90 backdrop-blur-xl border border-white/10 hover:border-primary/40 p-2 rounded-r-xl transition-all hover:bg-zinc-800/90 group shadow-lg"
        style={{ left: isPaletteCollapsed ? 0 : paletteWidth }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPaletteCollapsed ? (
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors" />
        )}
      </motion.button>

      {/* Canvas Area (Center) */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:32px_32px]" ref={reactFlowWrapper}>
        {/* Floating Canvas Header */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl">
            <div className="px-4 border-r border-white/5">
              <span className="text-xs font-bold text-white tracking-tight">VIP Outreach Flow</span>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Automated Segment Handling</p>
            </div>
            <div className="flex items-center gap-1 p-1">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10">
                <Play className="w-4 h-4 fill-primary" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-zinc-400 hover:bg-white/5">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mr-4">
              <button 
                onClick={() => {
                  setActiveView('library');
                  setSelectedLogId(null);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeView === 'library' ? "bg-primary text-black" : "text-zinc-500 hover:text-white"
                )}
              >
                Library
              </button>
              <button 
                onClick={() => {
                  setActiveView('editor');
                  setSelectedLogId(null);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeView === 'editor' && !selectedLogId ? "bg-primary text-black" : "text-zinc-500 hover:text-white"
                )}
              >
                Editor
              </button>
              <button 
                onClick={() => setActiveView('logs')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeView === 'logs' || selectedLogId ? "bg-primary text-black" : "text-zinc-500 hover:text-white"
                )}
              >
                Flow Logs
              </button>
            </div>
            {selectedLogId ? (
              <Button 
                onClick={() => {
                  setSelectedLogId(null);
                  setActiveView('logs');
                }}
                className="bg-white/10 text-white font-bold h-10 px-6 rounded-xl border border-white/10 hover:bg-white/20 transition-all"
              >
                Exit Replay
              </Button>
            ) : (
              <Button 
                onClick={saveFlow}
                disabled={isSaving}
                className="bg-primary text-black font-bold h-10 px-6 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isSaving ? "Syncing..." : "Save Flow"}
              </Button>
            )}
          </div>
        </div>

        {/* Nodes Canvas or Logs View */}
        <div className="w-full h-full relative">
          <AnimatePresence mode="wait">
            {activeView === 'editor' ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-transparent"
                  colorMode="dark"
                >
                  <Background color="#ffffff" gap={32} size={1} />
                  <Controls className="bg-zinc-900 border-white/10" />
                  <MiniMap 
                    style={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.05)" }}
                    nodeColor="#3b82f6"
                    maskColor="rgba(0,0,0,0.5)"
                  />
                </ReactFlow>
              </motion.div>
            ) : activeView === 'library' ? (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-20 pt-32"
              >
                {SAVED_FLOWS.map((flow) => (
                  <div 
                    key={flow.id}
                    onClick={() => setActiveView('editor')}
                    className="p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-primary/10 rounded-2xl">
                        <flow.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="outline" className={cn(
                        "rounded-lg text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none",
                        flow.status === "Live" ? "bg-green-500/10 text-green-500" : "bg-zinc-500/10 text-zinc-500"
                      )}>
                        {flow.status}
                      </Badge>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{flow.title}</h4>
                    <p className="text-xs text-zinc-500 mb-6 italic">{flow.stats}</p>
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Editor <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => toast.info("Initializing New Strategy...")}
                  className="p-8 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-primary transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-primary transition-colors">New Flow</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full flex flex-col p-20 pt-32"
              >
                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Flow Stage</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client Target</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Result Intelligence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FLOW_LOGS.map((log) => (
                        <tr 
                          key={log.id} 
                          onClick={() => {
                            setSelectedLogId(log.id);
                            setActiveView('editor');
                          }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                log.id === selectedLogId ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-zinc-700"
                              )} />
                              <span className="text-sm font-bold text-white">{log.flow}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">{log.time}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-zinc-300">{log.target}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={cn(
                              "rounded-lg text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border-none",
                              log.status === "Completed" ? "bg-green-500/10 text-green-500" :
                              log.status === "Failed" ? "bg-red-500/10 text-red-500" :
                              "bg-primary/10 text-primary"
                            )}>
                              {log.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex flex-col items-end">
                               <span className="text-xs font-bold text-zinc-200">{log.result}</span>
                               <span className="text-[10px] text-zinc-600 font-medium">Auto-resolved</span>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Node Content Editor (Right) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-96 h-full overflow-hidden border-l border-white/5 bg-zinc-950/40 backdrop-blur-3xl flex flex-col z-10"
          >
            <div className="p-8 pb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">Config</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
                }}
                className="rounded-xl hover:bg-white/10"
              >
                <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 p-8 pt-4">
              <div className="space-y-8">
                <section>
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-4">Node Behavior</label>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Identification</span>
                      <Input 
                        value={(selectedNode.data?.label as string) || ""}
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, label: newLabel } } : n));
                        }}
                        className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Internal Notes</span>
                      <textarea 
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-400 h-24 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                        placeholder="Explain purpose of this logic..."
                        value={selectedNode.data?.notes || ""}
                        onChange={(e) => {
                          const newNotes = e.target.value;
                          setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, notes: newNotes } } : n));
                        }}
                      />
                    </div>
                  </div>
                </section>

                {/* Dynamic Configuration Based on Node Type */}
                {selectedNode.data?.type === "trigger" && (
                  <TriggerConfig 
                    node={selectedNode}
                    onUpdate={(updates) => {
                      setNodes((nds) => nds.map((n) => 
                        n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                      ));
                    }}
                  />
                )}

                {selectedNode.data?.type === "condition" && (
                  <ConditionConfig 
                    node={selectedNode}
                    onUpdate={(updates) => {
                      setNodes((nds) => nds.map((n) => 
                        n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                      ));
                    }}
                  />
                )}

                {selectedNode.data?.type === "ai" && (
                  <AIConfig 
                    node={selectedNode}
                    onUpdate={(updates) => {
                      setNodes((nds) => nds.map((n) => 
                        n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                      ));
                    }}
                  />
                )}

                {selectedNode.data?.type === "integration" && (
                  <MCPConfig 
                    node={selectedNode}
                    onUpdate={(updates) => {
                      setNodes((nds) => nds.map((n) => 
                        n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                      ));
                    }}
                  />
                )}

                {selectedNode.data?.type === "action" && (
                  <ActionConfig 
                    node={selectedNode}
                    onUpdate={(updates) => {
                      setNodes((nds) => nds.map((n) => 
                        n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                      ));
                    }}
                  />
                )}

                <section className="pt-8 pb-12">
                  <Button 
                    onClick={deleteSelectedNode}
                    variant="ghost" 
                    className="w-full h-11 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold rounded-xl border border-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deactivate Node
                  </Button>
                </section>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
