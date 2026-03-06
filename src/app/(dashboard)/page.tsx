"use client";

import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { SessionProvider } from "next-auth/react";

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContainer />
    </SessionProvider>
  );
}
