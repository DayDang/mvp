import { motion } from "framer-motion";

export const SettingsSection = ({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="relative">
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
      <p className="text-sm text-zinc-500 font-medium max-w-xl leading-relaxed">{description}</p>
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full blur-sm" />
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </motion.div>
);

export const SettingsField = ({ 
  label, 
  children 
}: { 
  label: string; 
  children: React.ReactNode;
}) => (
  <div className="space-y-3 group">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">
      {label}
    </label>
    <div className="relative">
      {children}
    </div>
  </div>
);
