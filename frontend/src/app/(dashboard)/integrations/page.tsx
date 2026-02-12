"use client";

import { PlatformSection } from "@/components/settings/PlatformSection";

export default function IntegrationsPage() {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
      <div className="max-w-4xl mx-auto p-6 lg:p-10">
        <PlatformSection />
      </div>
    </div>
  );
}
