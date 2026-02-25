"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";

export default function PermissionGuard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    
    if (error === "no_permission") {
      toast.error("Access Denied", {
        description: "You do not have the required permissions to view this resource.",
        duration: 5000,
        // Using a professional icon for the toast
        icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      });
      
      // Standard practice: Clean the URL so the toast doesn't repeat on refresh
      router.replace("/admin");
    }
  }, [searchParams, router]);

  return null;
}