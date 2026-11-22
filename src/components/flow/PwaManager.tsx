"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/** Registers the service worker and tells the user when they go offline / come back. */
export function PwaManager() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    }
    const offline = () =>
      toast("You're offline", { description: "The timer, tasks and soundscapes still work. Music returns when you're back online." });
    const online = () => toast.success("Back online");
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);
  return null;
}
