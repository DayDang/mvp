"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, currentWorkspaceId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const isManagementPage = pathname === '/infrastructure' || pathname === '/personnel' || pathname === '/integrations';
  const showNoWorkspaceState = isAuthenticated && !currentWorkspaceId && !isManagementPage;

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render dashboard if not authenticated (redirect is happening)
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30 selection:text-white">
      <Sidebar />
      <main className="flex-1 h-full min-w-0 flex flex-col">
        {showNoWorkspaceState ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 border border-white/5 flex items-center justify-center mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2 uppercase tracking-widest">No Active Business Unit</h2>
            <p className="text-zinc-500 max-w-sm font-medium mb-8">
              Your account is verified, but you haven't been assigned to any business units yet. 
              Contact your administrator or initialize your first unit in Infrastructure.
            </p>
            <div className="flex gap-4">
               <button 
                 onClick={() => router.push('/infrastructure')}
                 className="px-8 h-12 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all"
               >
                 Initialize Infrastructure
               </button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
