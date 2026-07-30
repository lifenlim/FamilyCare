"use client";

import { useEffect } from "react";
import { logView } from "@/lib/actions/circle";

export function ViewLogger({ circleId }: { circleId: string }) {
  useEffect(() => {
    const key = `familycare:viewed:${circleId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    logView("viewed_care_list").catch(() => {});
  }, [circleId]);

  return null;
}
