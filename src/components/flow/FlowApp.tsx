"use client";

import { useEffect } from "react";
import { SettingsProvider, useSettings } from "@/contexts/SettingsContext";
import { StatsProvider } from "@/contexts/StatsContext";
import { TasksProvider } from "@/contexts/TasksContext";
import { TimerProvider, useTimer } from "@/contexts/TimerContext";
import { MusicProvider, useMusic } from "@/contexts/MusicContext";
import { AmbientProvider } from "@/contexts/AmbientContext";
import { UIProvider, useUI } from "@/contexts/UIContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Background } from "./Background";
import { Header } from "./Header";
import { Greeting } from "./Greeting";
import { TimerCard } from "./TimerCard";
import { MusicPlayer } from "./MusicPlayer";
import { AmbientMixer } from "./AmbientMixer";
import { TaskBoard } from "./TaskBoard";
import { TodayPanel } from "./TodayPanel";
import { Insights } from "./Insights";
import { Achievements } from "./Achievements";
import { Scratchpad } from "./Scratchpad";
import { MiniTimer } from "./MiniTimer";
import { ZenMode } from "./ZenMode";
import { SettingsDialog } from "./SettingsDialog";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { Confetti } from "./Confetti";
import { PwaManager } from "./PwaManager";

function SceneSync() {
  const { settings } = useSettings();
  useEffect(() => {
    document.documentElement.dataset.scene = settings.scene;
  }, [settings.scene]);
  return null;
}

function Shortcuts() {
  const timer = useTimer();
  const music = useMusic();
  const ui = useUI();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector("[role='dialog']") && e.key !== "Escape") return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          timer.toggle();
          break;
        case "r":
        case "R":
          timer.reset();
          break;
        case "s":
        case "S":
          timer.skip();
          break;
        case "m":
        case "M":
          music.toggle();
          break;
        case "n":
        case "N":
          music.next();
          break;
        case "z":
        case "Z":
          ui.setZen(!ui.zen);
          break;
        case "1":
          timer.switchMode("focus");
          break;
        case "2":
          timer.switchMode("short");
          break;
        case "3":
          timer.switchMode("long");
          break;
        case "?":
          ui.setShortcutsOpen(true);
          break;
        case "Escape":
          if (ui.zen) ui.setZen(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [timer, music, ui]);
  return null;
}

function Layout() {
  return (
    <div className="relative min-h-[100svh]">
      <Background />
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <Greeting />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <TimerCard />
          </div>
          <div className="flex flex-col gap-5 lg:col-span-5">
            <MusicPlayer />
            <AmbientMixer />
          </div>
          <div className="lg:col-span-8">
            <TaskBoard />
          </div>
          <div className="lg:col-span-4">
            <TodayPanel />
          </div>
          <div className="lg:col-span-8">
            <Insights />
          </div>
          <div className="lg:col-span-4">
            <Scratchpad />
          </div>
          <div className="lg:col-span-12">
            <Achievements />
          </div>
        </div>
      </main>
      <MiniTimer />
      <ZenMode />
      <SettingsDialog />
      <ShortcutsDialog />
      <Confetti />
      <Shortcuts />
      <PwaManager />
    </div>
  );
}

export default function FlowApp() {
  return (
    <SettingsProvider>
      <SceneSync />
      <StatsProvider>
        <TasksProvider>
          <TimerProvider>
            <MusicProvider>
              <AmbientProvider>
                <UIProvider>
                  <TooltipProvider delayDuration={250}>
                    <Layout />
                  </TooltipProvider>
                </UIProvider>
              </AmbientProvider>
            </MusicProvider>
          </TimerProvider>
        </TasksProvider>
      </StatsProvider>
    </SettingsProvider>
  );
}
