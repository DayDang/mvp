"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  Network,
  Code,
  PanelLeft,
  Pencil
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
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
import { automationService, Automation } from "@/lib/services/automationService";

// --- MOCK DATA & TYPES ---

type NodeType = "trigger" | "action" | "condition" | "ai" | "integration" | "start";

// --- CUSTOM NODE COMPONENTS ---

const ScrollbarStyles = () => (
  <style jsx global>{`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}</style>
);

const CustomFlowNode = ({ data, selected }: { data: any, selected?: boolean }) => {
  const Icon = typeof data.icon === 'string' ? ICONS_MAP[data.icon] : data.icon;
  if (!Icon) return null; // Safety check
  const isTrigger = data.type === "trigger";

  return (
    <div className={cn(
      "p-4 rounded-2xl bg-zinc-900/80 border backdrop-blur-2xl w-56 transition-all",
      selected ? "border-primary ring-4 ring-primary/5 shadow-2xl scale-[1.02]" : "border-white/5 shadow-lg hover:border-white/10"
    )}>
      {data.type !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-4 !h-4 !bg-[#09090b] !border-2 !border-white/20 hover:!border-white/50 !-left-2"
        />
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-2.5 rounded-xl border",
          data.type === "start" ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" :
          isTrigger ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          data.type === "action" ? "bg-primary/10 text-primary border-primary/20" :
          data.type === "condition" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
          data.type === "integration" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
          "bg-purple-500/10 text-purple-500 border-purple-500/20"
        )}>
          <Icon className={cn("w-5 h-5", data.type === "start" && "animate-pulse")} />
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={cn(
            "rounded-lg text-[8px] font-black uppercase tracking-widest py-0 px-2 border-white/5",
            data.type === "start" ? "bg-green-500/10 text-green-500" : "bg-white/5 text-zinc-500"
          )}>
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
  return (
    <div className="space-y-6">
      <ConfigSection title="Trigger Settings">
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
      </ConfigSection>
    </div>
  );
};

const ConditionConfig = ({ node, onUpdate }: { node: any, onUpdate: (data: any) => void }) => {
  const isWait = node.data.label === "Wait Timer";

  if (isWait) {
    return (
      <ConfigSection title="Delay Settings">
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
      </ConfigSection>
    );
  }

  return (
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
};

const AIConfig = ({ node, onUpdate }: { node: any, onUpdate: (data: any) => void }) => {
  const isTriage = node.data.label === "AI Triage";
  const isIntent = node.data.label === "Analyze Intent";
  
  return (
    <ConfigSection title="AI Parameter Strategy">
      {isTriage ? (
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

const HTTPRequestConfig = ({ node, onUpdate }: { node: any, onUpdate: (data: any) => void }) => {
  return (
    <div className="space-y-6">
      <ConfigSection title="Request Definition">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Method</span>
              <select 
                className="w-full bg-zinc-950 border border-white/5 rounded-xl h-10 px-2 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none font-bold"
                value={node.data.method || "POST"}
                onChange={(e) => onUpdate({ method: e.target.value })}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="col-span-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Endpoint URL</span>
              <Input 
                placeholder="https://api.yourservice.com/v1/hook"
                value={node.data.url || ""}
                onChange={(e) => onUpdate({ url: e.target.value })}
                className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs"
              />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Headers (JSON)</span>
            <textarea 
              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-400 h-20 focus:outline-none focus:ring-1 focus:ring-primary/20 font-mono resize-none"
              placeholder='{ "Authorization": "Bearer {{api_key}}" }'
              value={node.data.headers || ""}
              onChange={(e) => onUpdate({ headers: e.target.value })}
            />
          </div>
        </div>
      </ConfigSection>

      {node.data.method !== "GET" && (
        <ConfigSection title="Body Builder">
          <div className="space-y-2">
            <textarea 
              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-200 h-32 focus:outline-none focus:ring-1 focus:ring-primary/20 font-mono resize-none"
              placeholder='{ "user_id": "{{user.id}}", "event": "flow_triggered" }'
              value={node.data.body || ""}
              onChange={(e) => onUpdate({ body: e.target.value })}
            />
            <p className="text-[9px] text-zinc-600 italic">Use double braces {"{{variable}}"} to inject flow context.</p>
          </div>
        </ConfigSection>
      )}

      <ConfigSection title="Response Mapping">
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Extraction Schema</span>
            <textarea 
              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-zinc-400 h-24 focus:outline-none focus:ring-1 focus:ring-primary/20 font-mono resize-none"
              placeholder='{ "new_variable": "response.data.id" }'
              value={node.data.mapping || ""}
              onChange={(e) => onUpdate({ mapping: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Code className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-zinc-400 leading-tight">Mapped variables will be available for all downstream nodes in this flow.</span>
          </div>
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
    id: "node-start", 
    type: "custom", 
    position: { x: -100, y: 200 },
    data: { 
      type: "start", 
      label: "START", 
      icon: "Play", 
      description: "Flow Activation Point" 
    },
  },
  { 
    id: "node-1", 
    type: "custom", 
    position: { x: 200, y: 200 },
    data: { 
      type: "trigger", 
      label: "New Incoming Message", 
      icon: "MessageSquare", 
      description: "Triggers on inbound WhatsApp/IG",
      docs: "Initiates the flow when a new message is received from a customer, allowing for immediate automated responses or intent analysis."
    },
  },
  { 
    id: "node-2", 
    type: "custom", 
    position: { x: 500, y: 200 },
    data: { 
      type: "ai", 
      label: "Analyze Intent", 
      icon: "Cpu", 
      description: "Detecting 'Purchase' or 'Pricing'",
      docs: "Utilizes AI to understand the user's intent from their message, categorizing it (e.g., purchase, support, inquiry) to route the conversation appropriately."
    },
  },
  { 
    id: "node-3", 
    type: "custom", 
    position: { x: 800, y: 200 },
    data: { 
      type: "action", 
      label: "Send VIP Greeting", 
      icon: "Send", 
      description: "Personalized premium response",
      docs: "Dispatches a pre-defined or dynamically generated message to the user, serving as a direct communication point within the flow."
    },
  }
];

const INITIAL_EDGES: FlowEdge[] = [
  { id: "e0", source: "node-start", target: "node-1", animated: true },
  { id: "e1", source: "node-1", target: "node-2", animated: true },
  { id: "e2", source: "node-2", target: "node-3", animated: true }
];

const NODE_PALETTE = [
  {
    category: "Triggers",
    items: [
      { title: "New Message", desc: "Starts flow on inbound message", icon: "MessageSquare", type: "trigger", docs: "Initiates the flow when a new message is received from a customer, allowing for immediate automated responses or intent analysis." },
      { title: "Scheduled Event", desc: "Starts flow at specific time", icon: "Clock", type: "trigger", docs: "Triggers the flow at a predefined time or interval, useful for sending scheduled promotions, reminders, or follow-ups." },
      { title: "Webhook Event", desc: "Starts flow from external system", icon: "Database", type: "trigger", docs: "Activates the flow upon receiving data from an external system via a webhook, enabling integration with CRM, e-commerce, or other platforms." },
    ],
  },
  {
    category: "AI & Logic",
    items: [
      { title: "Analyze Intent", desc: "Detects user's goal", icon: "Cpu", type: "ai", docs: "Utilizes AI to understand the user's intent from their message, categorizing it (e.g., purchase, support, inquiry) to route the conversation appropriately." },
      { title: "Generate Response", desc: "Crafts AI-powered message", icon: "Brain", type: "ai", docs: "Generates a dynamic, context-aware response using AI, tailored to the conversation's flow and user's needs, maintaining brand voice." },
      { title: "Conditional Branch", desc: "Routes based on criteria", icon: "GitBranch", type: "condition", docs: "Creates branching paths in the flow based on specific conditions (e.g., keyword match, variable value, time of day), allowing for personalized user journeys." },
      { title: "A/B Test Split", desc: "Splits traffic for testing", icon: "Layers", type: "condition", docs: "Divides incoming traffic into different branches to test variations of messages or flow paths, helping optimize performance and engagement." },
    ],
  },
  {
    category: "Actions",
    items: [
      { title: "Send Message", desc: "Sends a custom message", icon: "Send", type: "action", docs: "Dispatches a pre-defined or dynamically generated message to the user, serving as a direct communication point within the flow." },
      { title: "Add CRM Tag", desc: "Tags user in CRM", icon: "UserCheck", type: "action", docs: "Applies a specific tag to the user's profile in an integrated CRM system, useful for segmentation, lead scoring, or triggering external workflows." },
      { title: "HTTP Request", desc: "Calls external API", icon: "Zap", type: "integration", docs: "Executes an HTTP request to an external API, allowing the flow to fetch data, update records, or trigger actions in third-party services." },
      { title: "Handover to Agent", desc: "Transfers to human agent", icon: "Plus", type: "action", docs: "Seamlessly transfers the conversation to a human agent or a specific department, ensuring complex or sensitive queries are handled personally." },
    ],
  },
];

const ICONS_MAP: { [key: string]: React.ElementType } = {
  MessageSquare: MessageSquare,
  Database: Database,
  Clock: Clock,
  GitBranch: GitBranch,
  UserCheck: UserCheck,
  Cpu: Cpu,
  Brain: Brain,
  Layers: Layers,
  Send: Send,
  Plus: Plus,
  Zap: Zap,
  Play: Play,
};


import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function AutomationsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(INITIAL_EDGES);
  const [activeView, setActiveView] = useState<'library' | 'editor' | 'logs'>('library');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const openNamingDialog = (auto: Automation, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentAutomation(auto);
    setAutomationName(auto.name);
    setAutomationDescription(auto.description || "");
    setIsNamingDialogOpen(true);
  };

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [currentAutomation, setCurrentAutomation] = useState<Automation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Naming Dialog State
  const [isNamingDialogOpen, setIsNamingDialogOpen] = useState(false);
  const [automationName, setAutomationName] = useState("");
  const [automationDescription, setAutomationDescription] = useState("");

  // Load automations
  const loadAutomations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await automationService.list();
      setAutomations(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load automation library");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'library') {
      loadAutomations();
    }
  }, [activeView, loadAutomations]);

  const forgeNewFlow = async () => {
    try {
      const newAuto = await automationService.create({
        name: "Untitled Strategy",
        nodes: INITIAL_NODES,
        edges: INITIAL_EDGES,
        status: 'Inactive'
      });
      setAutomations(prev => [newAuto, ...prev]);
      setCurrentAutomation(newAuto);
      setNodes(INITIAL_NODES);
      setEdges(INITIAL_EDGES);
      setActiveView('editor');
      toast.success("New flow forged");
    } catch (error) {
      toast.error("Failed to forge new flow");
    }
  };

  const selectAutomation = (auto: Automation) => {
    setCurrentAutomation(auto);
    setAutomationName(auto.name);
    setNodes(auto.nodes as FlowNode[]);
    setEdges(auto.edges as FlowEdge[]);
    setActiveView('editor');
  };

  // Ensure viewport is set when instance is ready
  useEffect(() => {
    if (reactFlowInstance && currentAutomation?.viewport) {
      reactFlowInstance.setViewport(currentAutomation.viewport);
    }
  }, [reactFlowInstance, currentAutomation]);

  const handleStatusToggle = async (autoToUpdate?: Automation) => {
    const target = autoToUpdate || currentAutomation;
    if (!target) return;
    
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await automationService.update(target.id, { status: newStatus });
      if (currentAutomation?.id === updated.id) setCurrentAutomation(updated);
      setAutomations(prev => prev.map(a => a.id === updated.id ? updated : a));
      toast.success(`${updated.name} is now ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const updateMetadata = async () => {
    if (!currentAutomation) return;
    
    setIsSaving(true);
    try {
      const updated = await automationService.update(currentAutomation.id, {
        name: automationName,
        description: automationDescription,
      });
      if (currentAutomation.id === updated.id) {
        setCurrentAutomation(updated);
        setAutomationName(updated.name);
        setAutomationDescription(updated.description || "");
      }
      setAutomations(prev => prev.map(a => a.id === updated.id ? updated : a));
      toast.success("Identity Updated");
      setIsNamingDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update identity");
    } finally {
      setIsSaving(false);
    }
  };

  const saveFlow = async (customName?: string) => {
    if (!currentAutomation) return;
    
    // If it's the first time saving (Untitled) and no name provided, ask for it
    if ((currentAutomation.name === "Untitled Strategy" || !currentAutomation.name) && !customName) {
      setIsNamingDialogOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await automationService.update(currentAutomation.id, {
        name: automationName,
        description: automationDescription,
        nodes,
        edges,
        viewport: reactFlowInstance?.getViewport(),
      });
      setCurrentAutomation(updated);
      setAutomationName(updated.name);
      setAutomationDescription(updated.description || "");
      setAutomations(prev => prev.map(a => a.id === updated.id ? updated : a));
      toast.success("Strategy Synchronized");
      setIsNamingDialogOpen(false);
    } catch (error) {
      toast.error("Failed to sync design");
    } finally {
      setIsSaving(false);
    }
  };

  const removeAutomation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this flow? This action is permanent.")) return;
    
    try {
      await automationService.delete(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast.success("Strategy deleted");
    } catch (error) {
      toast.error("Failed to delete flow");
    }
  };
  
  // Flow Palette state (Slim Icon Bar)
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);

  const selectedNodeId = nodes.find(n => n.selected)?.id || null;
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Resizing state
  const [paletteWidth, setPaletteWidth] = useState(260);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const paletteWidthRef = useRef(260);
  const sidebarWidthRef = useRef(320);
  const resizeStartRef = useRef<{ x: number, width: number } | null>(null);
  const [isResizingPalette, setIsResizingPalette] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const startResizingPalette = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartRef.current = { x: e.clientX, width: paletteWidthRef.current };
    setIsResizingPalette(true);
  }, []);

  const startResizingSidebar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartRef.current = { x: e.clientX, width: sidebarWidthRef.current };
    setIsResizingSidebar(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizingPalette(false);
    setIsResizingSidebar(false);
    // Sync state once at the end
    setPaletteWidth(paletteWidthRef.current);
    setSidebarWidth(sidebarWidthRef.current);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (e.buttons === 0 || !resizeStartRef.current) {
      stopResizing();
      return;
    }

    if (isResizingPalette) {
      const delta = e.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(180, Math.min(600, resizeStartRef.current.width + delta));
      paletteWidthRef.current = newWidth;
      document.documentElement.style.setProperty('--palette-width', `${newWidth}px`);
    }
    if (isResizingSidebar) {
      const delta = resizeStartRef.current.x - e.clientX;
      const newWidth = Math.max(280, Math.min(800, resizeStartRef.current.width + delta));
      sidebarWidthRef.current = newWidth;
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    }
  }, [isResizingPalette, isResizingSidebar, stopResizing]);

  useEffect(() => {
    if (isResizingPalette || isResizingSidebar) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizingPalette, isResizingSidebar, resize, stopResizing]);

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

      if (typeof type === "undefined" || !type) return;

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
          description: data.desc || "Added from toolset",
          docs: data.docs || "No additional documentation available for this node."
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const FLOW_LOGS = [
    { id: "1", flow: "Global VIP", target: "A. Johnson", status: "Completed", result: "Order OK", time: "2m" },
    { id: "2", flow: "Global VIP", target: "M. Chen", status: "At Fork", result: "Wait Human", time: "5m" },
    { id: "3", flow: "Ghost Campaign", target: "S. Miller", status: "Active", result: "Intent Out", time: "12m" },
    { id: "4", flow: "Pulse Check", target: "E. Wilson", status: "Failed", result: "Rate Limit", time: "1h" },
  ];

  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    }
  };

  return (
    <div 
      className={cn(
        "flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans selection:bg-primary/30 relative",
        (isResizingPalette || isResizingSidebar) && "cursor-col-resize select-none"
      )}
      style={{
        // @ts-ignore
        '--palette-width': `${paletteWidth}px`,
        // @ts-ignore
        '--sidebar-width': `${sidebarWidth}px`
      }}
    >
      <ScrollbarStyles />
      {!isMounted ? null : (
        <>
          {/* Resizing Overlay - Prevents iframe/canvas event lag */}
      {(isResizingPalette || isResizingSidebar) && (
        <div className="absolute inset-0 z-[9999] bg-transparent" />
      )}

      {/* Toolkit Panel */}
      <motion.div 
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: (activeView === 'editor' && !isPaletteCollapsed) ? 'var(--palette-width)' : 0,
          opacity: (activeView === 'editor' && !isPaletteCollapsed) ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 350, restDelta: 0.01 }}
        className="h-full border-r border-white/5 bg-zinc-950/80 backdrop-blur-3xl flex flex-col z-30 overflow-hidden relative shrink-0"
      >
        <div style={{ width: 'var(--palette-width)' }} className="h-full flex flex-col pt-6 px-3">
          {/* Left Resize Handle */}
          <div 
            onMouseDown={startResizingPalette}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors z-40 group"
          >
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
               <div className="w-0.5 h-6 bg-primary/40 rounded-full" />
            </div>
          </div>

            <div className="mb-8 flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <GitBranch className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-100">Toolkit</h3>
              </div>
            </div>

            <div className={cn(
              "flex-1 w-full min-h-0 custom-scrollbar mt-2 overflow-y-auto"
            )}>
              <div className="space-y-10 flex flex-col p-2 pb-10" style={{ width: 'calc(var(--palette-width) - 24px)' }}>
                {NODE_PALETTE.map((cat) => (
                  <div key={cat.category} className="flex flex-col w-full pt-2 first:pt-0">
                    <div className="flex items-center gap-3 mb-5 px-3">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{cat.category}</span>
                      <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <div className="flex flex-col gap-1.5 w-full">
                      {cat.items.map((item) => {
                        const Icon = ICONS_MAP[item.icon];
                        return (
                          <div
                            key={item.title}
                            draggable
                            onDragStart={(e) => onDragStart(e, "custom", item)}
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all border border-transparent hover:bg-white/5 group/item",
                              isPaletteCollapsed ? "justify-center" : "justify-start"
                            )}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                              item.type === "trigger" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" :
                              item.type === "action" ? "bg-primary/10 text-primary border-primary/10" :
                              item.type === "condition" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                              "bg-purple-500/10 text-purple-500 border-purple-500/10"
                            )}>
                              {Icon && <Icon className="w-4 h-4" />}
                            </div>
                            {!isPaletteCollapsed && (
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-zinc-200 truncate">{item.title}</p>
                                  <p className="text-[9px] text-zinc-500 truncate leading-tight uppercase tracking-widest font-black opacity-60">{item.type}</p>
                                </div>
                                
                                <TooltipProvider>
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md cursor-help">
                                        <Info className="w-3.5 h-3.5 text-zinc-500 hover:text-primary transition-colors" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" sideOffset={15} className="bg-zinc-900 border-white/5 p-3 rounded-xl max-w-[200px] shadow-2xl z-[100]">
                                      <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">{item.docs}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </motion.div>

      <div className="flex-1 flex flex-col relative">
        {/* Compact Header */}
        <div className="h-16 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-3">
            {activeView === 'editor' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
                className={cn(
                  "h-8 w-8 rounded-lg hover:bg-white/5 transition-colors",
                  !isPaletteCollapsed ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-zinc-500"
                )}
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            )}
            
            {activeView === 'editor' ? (
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveView('library')}
                  className="h-8 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 group flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[11px] font-medium transition-transform group-hover:-translate-x-0.5">Library</span>
                </Button>
                
                <div className="h-4 w-[1px] bg-white/10 mx-1" />
                
                <div className="flex flex-col">
                  <input 
                    type="text"
                    value={automationName}
                    onChange={(e) => setAutomationName(e.target.value)}
                    onBlur={() => saveFlow(automationName)}
                    className="bg-transparent border-none text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 transition-all w-48"
                  />
                  <div className="flex items-center gap-1.5 opacity-50">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      currentAutomation?.status === 'Active' ? "bg-green-500" : "bg-zinc-400"
                    )} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{currentAutomation?.status || 'Inactive'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900/50 p-0.5 rounded-lg flex gap-0.5 border border-white/5">
                {(['library', 'logs'] as const).map(view => (
                  <button 
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      activeView === view ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {view === 'library' ? 'Strategies' : 'Logs'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeView === 'editor' ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "h-8 px-3 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all",
                        currentAutomation?.status === 'Active' 
                          ? "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20" 
                          : "bg-zinc-500/10 border-white/5 text-zinc-400 hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        currentAutomation?.status === 'Active' ? "bg-green-500" : "bg-zinc-400"
                      )} />
                      {currentAutomation?.status === 'Active' ? 'Active Mode' : 'Inactive Mode'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/5 rounded-xl p-1 shadow-2xl">
                    <DropdownMenuItem 
                      onClick={() => handleStatusToggle()} 
                      className="rounded-lg text-[11px] font-medium py-2 focus:bg-white/5 transition-colors cursor-pointer"
                    >
                      {currentAutomation?.status === 'Active' ? (
                        <><Zap className="w-3.5 h-3.5 mr-2 text-zinc-400" /> Disable Flow</>
                      ) : (
                        <><Play className="w-3.5 h-3.5 mr-2 text-green-500" /> Activate Flow</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem 
                      onClick={saveFlow} 
                      className="rounded-lg text-[11px] font-medium py-2 focus:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 mr-2 text-primary" /> Sync Structure
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setActiveView('library')} 
                      className="rounded-lg text-[11px] font-medium py-2 focus:bg-white/5 transition-colors cursor-pointer"
                    >
                      <BarChart3 className="w-3.5 h-3.5 mr-2 text-blue-500" /> Performance
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        if (currentAutomation) removeAutomation(currentAutomation.id, e as any);
                        setActiveView('library');
                      }} 
                      className="rounded-lg text-[11px] font-medium py-2 focus:bg-red-500/10 focus:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete this flow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  onClick={() => saveFlow()}
                  size="sm"
                  className="h-8 px-4 rounded-lg bg-primary text-black font-bold text-[11px]"
                  disabled={isSaving}
                >
                  {isSaving ? "Syncing..." : "Save Strategy"}
                </Button>
              </div>
            ) : activeView === 'library' && (
              <Button 
                onClick={forgeNewFlow}
                size="sm"
                className="h-8 px-4 rounded-lg bg-primary text-black font-bold text-[11px] flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Forge New Flow
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Content & Sidebar Wrapper */}
        <div className="flex-1 flex flex-row overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
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
                  colorMode="dark"
                  className="bg-[#09090b]"
                >
                  <Background 
                    color="#1a1a1e" 
                    gap={24} 
                    size={1} 
                    variant={BackgroundVariant.Lines}
                  />
                  <Controls className="!bg-zinc-900 !border-white/5 !shadow-2xl !rounded-lg !mb-6 !mr-6 overflow-hidden" />
                </ReactFlow>
              </motion.div>
            ) : activeView === 'library' ? (
              <motion.div
                key="library"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full p-8 overflow-auto"
              >
                <div className="max-w-7xl mx-auto space-y-8 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Active Strategies</h2>
                      <p className="text-xs text-zinc-500 mt-1">Manage your high-frequency automation circuits.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {automations.map((flow) => (
                      <div 
                        key={flow.id}
                        onClick={() => selectAutomation(flow)}
                        className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-primary/20 hover:bg-white/[0.02] transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button 
                            onClick={(e) => openNamingDialog(flow, e)}
                            className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => removeAutomation(flow.id, e)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <GitBranch className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{flow.name}</h4>
                            <span className="text-[10px] text-zinc-500 font-medium truncate italic block">{flow.description || 'No description'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.03]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusToggle(flow);
                            }}
                            className="group/badge"
                          >
                             <Badge variant="outline" className={cn(
                              "rounded-md text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border-none transition-all group-hover/badge:scale-105",
                              flow.status === "Active" ? "bg-green-500/10 text-green-500 group-hover/badge:bg-green-500/20" : "bg-zinc-800 text-zinc-500 group-hover/badge:bg-zinc-700"
                            )}>
                              {flow.status}
                            </Badge>
                          </button>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">
                              {new Date(flow.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {automations.length === 0 && !isLoading && (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                        <Cpu className="w-12 h-12 text-zinc-700 mb-4 animate-pulse" />
                        <h3 className="text-zinc-500 font-bold text-sm">No Automation Strategies Found</h3>
                        <p className="text-zinc-600 text-xs mt-1">Forge your first flow to begin automation.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full p-8 overflow-auto"
              >
                 <div className="max-w-7xl mx-auto space-y-6 pt-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold tracking-tight">System Performance Logs</h2>
                      <div className="flex gap-4">
                         <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">99.2%</span>
                            <span className="text-[9px] text-primary font-black uppercase tracking-tighter">Throughput</span>
                         </div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-3xl shadow-2xl">
                      <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                          <tr>
                            <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Strategy</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {FLOW_LOGS.map((log) => (
                            <tr 
                              key={log.id} 
                              onClick={() => {
                                setSelectedLogId(log.id);
                                setActiveView('editor');
                              }}
                              className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4">
                                <span className="text-[13px] font-bold text-white">{log.flow}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-medium text-zinc-400">{log.target}</span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={cn(
                                  "rounded-md text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border-none",
                                  log.status === "Completed" ? "bg-green-500/10 text-green-500" :
                                  log.status === "Failed" ? "bg-red-500/10 text-red-500" :
                                  "bg-primary/10 text-primary"
                                )}>
                                  {log.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-[11px] font-bold text-zinc-600">{log.time}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Config Sidebar (Right) */}
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: (selectedNode && activeView === 'editor') ? 'var(--sidebar-width)' : 0,
            opacity: (selectedNode && activeView === 'editor') ? 1 : 0
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 350, restDelta: 0.01 }}
          className="h-full border-l border-white/5 bg-zinc-950/80 backdrop-blur-3xl overflow-hidden flex flex-col z-30 shrink-0 relative"
        >
          <div style={{ width: 'var(--sidebar-width)' }} className="h-full flex flex-col">
            {/* Right Resize Handle */}
            <div 
              onMouseDown={startResizingSidebar}
              className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors z-40 group"
            >
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                 <div className="w-0.5 h-6 bg-primary/40 rounded-full" />
              </div>
            </div>
              <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Circuit Config</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setNodes(nds => nds.map(n => ({ ...n, selected: false })))}
                  className="h-8 w-8 rounded-lg hover:bg-white/5"
                >
                  <Plus className="w-4 h-4 rotate-45 text-zinc-500" />
                </Button>
              </div>

              <ScrollArea id="sidebar-scroll-area" className="flex-1 overflow-hidden">
                <div className="p-6 space-y-10" style={{ width: 'var(--sidebar-width)' }}>
                  <section className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Identity</label>
                    <div className="space-y-4">
                      <Input 
                        value={(selectedNode?.data?.label as string) || ""}
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, label: newLabel } } : n));
                        }}
                        className="bg-zinc-950 border-white/5 rounded-xl h-10 text-xs font-bold"
                      />
                      <textarea 
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-[11px] text-zinc-400 h-28 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none leading-relaxed"
                        placeholder="Strategic notes..."
                        value={(selectedNode?.data?.notes as string) || ""}
                        onChange={(e) => {
                          const newNotes = e.target.value;
                          setNodes((nds) => nds.map((n) => n.id === selectedNodeId ? { ...n, data: { ...n.data, notes: newNotes } } : n));
                        }}
                      />
                    </div>
                  </section>

                  {/* Documentation / Guidance */}
                  <section className="p-5 rounded-2xl bg-primary/[0.03] border border-primary/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Strategy Guide</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                      {(selectedNode?.data?.docs as string) || "This node executes internal automation logic. Hover over palette items for detailed capabilities."}
                    </p>
                  </section>

                  {/* Dynamic Configurations */}
                  {selectedNode?.data?.type === "trigger" && (
                    <TriggerConfig 
                      node={selectedNode}
                      onUpdate={(updates) => {
                        setNodes((nds) => nds.map((n) => 
                          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                        ));
                      }}
                    />
                  )}

                  {selectedNode?.data?.type === "condition" && (
                    <ConditionConfig 
                      node={selectedNode}
                      onUpdate={(updates) => {
                        setNodes((nds) => nds.map((n) => 
                          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                        ));
                      }}
                    />
                  )}

                  {selectedNode?.data?.type === "ai" && (
                    <AIConfig 
                      node={selectedNode}
                      onUpdate={(updates) => {
                        setNodes((nds) => nds.map((n) => 
                          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                        ));
                      }}
                    />
                  )}

                  {selectedNode?.data?.type === "integration" && (
                    <HTTPRequestConfig 
                      node={selectedNode}
                      onUpdate={(updates) => {
                        setNodes((nds) => nds.map((n) => 
                          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                        ));
                      }}
                    />
                  )}

                  {selectedNode?.data?.type === "action" && (
                    <ActionConfig 
                      node={selectedNode}
                      onUpdate={(updates) => {
                        setNodes((nds) => nds.map((n) => 
                          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
                        ));
                      }}
                    />
                  )}

                  <section className="pt-8 pb-10">
                    <Button 
                      onClick={deleteSelectedNode}
                      variant="ghost" 
                      className="w-full h-10 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-xl border border-red-500/10"
                    >
                      Remove Node
                    </Button>
                  </section>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={isNamingDialogOpen} onOpenChange={setIsNamingDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/5">
          <DialogHeader>
            <DialogTitle className="text-white">Give your strategy a name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Strategy Name</label>
              <Input 
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                placeholder="e.g. VIP Customer Welcome"
                className="bg-zinc-900 border-white/10 text-white rounded-xl h-12"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Strategic Intent (Purpose)</label>
              <textarea 
                value={automationDescription}
                onChange={(e) => setAutomationDescription(e.target.value)}
                placeholder="Describe what this circuit achieves..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 h-24 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none leading-relaxed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsNamingDialogOpen(false)}
              className="text-zinc-500 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => updateMetadata()}
              className="bg-primary text-black font-bold px-8 rounded-xl"
              disabled={!automationName || automationName === "Untitled Strategy"}
            >
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}
