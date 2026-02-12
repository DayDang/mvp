"use client";

import { ManagementHub } from "@/components/settings/ManagementHub";

export default function InfrastructurePage() {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <ManagementHub />
      </div>
    </div>
  );
}
