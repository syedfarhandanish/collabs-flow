"use client";

import dynamic from "next/dynamic";
import { Splash } from "./Splash";

// The interactive app lives entirely in the browser (localStorage, audio, YouTube), so it renders client-side only.
export const AppLoader = dynamic(() => import("./FlowApp"), { ssr: false, loading: () => <Splash /> });
