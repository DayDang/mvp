"use client";

import { TeamSection } from "@/components/settings/TeamSection";
import { useAuth } from "@/context/AuthContext";

export default function TeamPage() {
  const { currentWorkspaceId } = useAuth();
  
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <TeamSection mode="global" />
      </div>
    </div>
  );
}
