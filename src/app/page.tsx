"use client";

import dynamic from "next/dynamic";
import { Splash } from "@/components/flow/Splash";

// Everything lives in the browser (localStorage, audio, YouTube), so render client-side only.
const FlowApp = dynamic(() => import("@/components/flow/FlowApp"), {
  ssr: false,
  loading: () => <Splash />,
});

export default function Home() {
  return <FlowApp />;
}
