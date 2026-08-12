"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OrganizerEventsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/organizer/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
