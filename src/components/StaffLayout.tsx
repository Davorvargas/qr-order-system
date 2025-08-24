"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import SideTable from "./SideTable";
import GlobalNotificationService from "./GlobalNotificationService";

export default function StaffLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | undefined;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Global Notification Service - Runs silently in background */}
      <GlobalNotificationService />
      
      {/* Use the unified SideTable component */}
      <SideTable userEmail={userEmail}>
        {children}
      </SideTable>
    </div>
  );
}