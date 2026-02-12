"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, User, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing invitation token");
      router.push("/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/accept-invitation", {
        token,
        name,
        password
      });
      
      // Store the token for automatic login
      if (res.data.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
        // Also set the first workspace as active if available
        if (res.data.user.memberships?.[0]) {
          localStorage.setItem('currentWorkspaceId', res.data.user.memberships[0].workspace_id);
        }
      }

      setIsSuccess(true);
      toast.success("Account setup successful!");
      
      // Redirect after a short delay to show success state
      setTimeout(() => {
        router.push("/inbox"); // Or wherever dashboard start is
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to complete setup");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen w-full bg-[#09090b] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        </div>
        
        <div className="w-full max-w-md p-8 relative z-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary animate-in zoom-in duration-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Access Granted</h1>
            <p className="text-zinc-400 font-medium">Your authorization profile is now active. Redirecting to workspace...</p>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] flex items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[128px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[128px]" />
      </div>

      <div className="w-full max-w-lg p-8 relative z-10">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase tracking-[0.1em]">Personnel Onboarding</h1>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em]">Finalize your security credentials to access the hub</p>
        </div>

        <div className="bg-zinc-950/50 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Full Identity Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                <Input 
                  autoFocus
                  placeholder="EX: JOHNATHAN DOE"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-700 h-14 rounded-2xl focus:border-primary/30 focus:ring-primary/10 transition-all font-bold tracking-tight"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Security Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-700 h-14 rounded-2xl focus:border-primary/30 focus:ring-primary/10 transition-all font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Confirm Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-700 h-14 rounded-2xl focus:border-primary/30 focus:ring-primary/10 transition-all font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-primary text-black hover:bg-primary/90 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/10 transition-all hover:scale-[1.01] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  INITIALIZING ACCESS...
                </div>
              ) : (
                "ACTIVATE AUTHORIZATION"
              )}
            </Button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          IdentityHub Access Governance System v1.0
        </p>
      </div>
    </div>
  );
}
