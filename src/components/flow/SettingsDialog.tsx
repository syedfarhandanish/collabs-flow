"use client";

import { useState } from "react";
import { Bell, Brain, Music2, Palette, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_SETTINGS, SCENES, useSettings, type Settings } from "@/contexts/SettingsContext";
import { useStats } from "@/contexts/StatsContext";
import { useUI } from "@/contexts/UIContext";
import { playChime, type ChimeKind } from "@/lib/sounds";
import { cn } from "@/lib/utils";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/90">{label}</p>
        {hint && <p className="text-xs text-white/45">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Stepper({ value, onChange, min, max, step = 1, suffix }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
      <button className="h-8 w-8 rounded-lg text-white/60 hover:bg-white/10 hover:text-white" onClick={() => onChange(Math.max(min, value - step))}>
        −
      </button>
      <span className="w-16 text-center text-sm tabular text-white">
        {value}
        {suffix && <span className="text-white/40"> {suffix}</span>}
      </span>
      <button className="h-8 w-8 rounded-lg text-white/60 hover:bg-white/10 hover:text-white" onClick={() => onChange(Math.min(max, value + step))}>
        +
      </button>
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: Array<{ id: T; label: string }>; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn("rounded-lg px-3 py-1.5 text-xs transition", value === o.id ? "bg-white/[0.12] text-white" : "text-white/50 hover:text-white/80")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const PRESETS: Array<{ name: string; patch: Partial<Settings> }> = [
  { name: "Classic 25/5", patch: { focusMin: 25, shortMin: 5, longMin: 15, longEvery: 4 } },
  { name: "Deep 50/10", patch: { focusMin: 50, shortMin: 10, longMin: 30, longEvery: 3 } },
  { name: "Sprint 15/3", patch: { focusMin: 15, shortMin: 3, longMin: 10, longEvery: 4 } },
  { name: "Ultradian 90/20", patch: { focusMin: 90, shortMin: 20, longMin: 30, longEvery: 2 } },
];

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen } = useUI();
  const { settings, update } = useSettings();
  const { resetStats } = useStats();
  const [confirmReset, setConfirmReset] = useState(false);

  const askNotifications = async (on: boolean) => {
    if (!on) return update({ notifications: false });
    if (!("Notification" in window)) {
      toast.error("Notifications aren't supported in this browser");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") update({ notifications: true });
    else toast.error("Notifications were blocked", { description: "Allow them in your browser's site settings." });
  };

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl border-white/10 bg-[#101019]/95 p-0 backdrop-blur-xl">
        <div className="px-6 pt-6">
          <DialogTitle className="text-xl">Settings</DialogTitle>
          <DialogDescription>Tune Collabs Flow to the way you study.</DialogDescription>
        </div>
        <Tabs defaultValue="timer" className="px-6 pb-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-white/[0.05]">
            <TabsTrigger value="timer" className="gap-1.5 rounded-lg">
              <Brain className="h-3.5 w-3.5" /> Timer
            </TabsTrigger>
            <TabsTrigger value="sound" className="gap-1.5 rounded-lg">
              <Volume2 className="h-3.5 w-3.5" /> Sound
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-1.5 rounded-lg">
              <Palette className="h-3.5 w-3.5" /> General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="mt-4">
            <div className="mb-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const active = p.patch.focusMin === settings.focusMin && p.patch.shortMin === settings.shortMin;
                return (
                  <button
                    key={p.name}
                    onClick={() => update(p.patch)}
                    className={cn("chip transition hover:bg-white/10", active && "border-white/30 bg-white/[0.12] text-white")}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
            <div className="divide-y divide-white/[0.06]">
              <Row label="Focus length">
                <Stepper value={settings.focusMin} min={1} max={180} step={settings.focusMin >= 10 ? 5 : 1} suffix="min" onChange={(v) => update({ focusMin: v })} />
              </Row>
              <Row label="Short break">
                <Stepper value={settings.shortMin} min={1} max={60} suffix="min" onChange={(v) => update({ shortMin: v })} />
              </Row>
              <Row label="Long break">
                <Stepper value={settings.longMin} min={1} max={90} step={5} suffix="min" onChange={(v) => update({ longMin: v })} />
              </Row>
              <Row label="Long break every" hint="Number of focus sessions">
                <Stepper value={settings.longEvery} min={2} max={8} onChange={(v) => update({ longEvery: v })} />
              </Row>
              <Row label="Auto-start breaks">
                <Switch checked={settings.autoStartBreaks} onCheckedChange={(v) => update({ autoStartBreaks: v })} />
              </Row>
              <Row label="Auto-start focus" hint="Start the next session right after a break">
                <Switch checked={settings.autoStartFocus} onCheckedChange={(v) => update({ autoStartFocus: v })} />
              </Row>
              <Row label="Daily focus goal">
                <Stepper value={settings.dailyGoalMin} min={15} max={720} step={15} suffix="min" onChange={(v) => update({ dailyGoalMin: v })} />
              </Row>
            </div>
          </TabsContent>

          <TabsContent value="sound" className="mt-4">
            <div className="divide-y divide-white/[0.06]">
              <Row label="End-of-session sound">
                <Segmented<ChimeKind>
                  value={settings.chime}
                  onChange={(v) => {
                    update({ chime: v });
                    playChime(v, settings.chimeVolume);
                  }}
                  options={[
                    { id: "bell", label: "Bell" },
                    { id: "ding", label: "Ding" },
                    { id: "soft", label: "Soft" },
                    { id: "none", label: "Off" },
                  ]}
                />
              </Row>
              <Row label="Chime volume">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(settings.chimeVolume * 100)}
                  onChange={(e) => update({ chimeVolume: Number(e.target.value) / 100 })}
                  onMouseUp={() => playChime(settings.chime, settings.chimeVolume)}
                  className="range w-40"
                  style={{ ["--val" as string]: `${settings.chimeVolume * 100}%` }}
                />
              </Row>
              <Row label="Music during breaks" hint="What the YouTube player does when a break starts">
                <Segmented
                  value={settings.musicOnBreak}
                  onChange={(v) => update({ musicOnBreak: v })}
                  options={[
                    { id: "keep", label: "Keep" },
                    { id: "lower", label: "Softer" },
                    { id: "pause", label: "Pause" },
                  ]}
                />
              </Row>
              <Row label="Play music when focus starts" hint="Music fades in as you press start">
                <Switch checked={settings.autoPlayMusic} onCheckedChange={(v) => update({ autoPlayMusic: v })} />
              </Row>
            </div>
          </TabsContent>

          <TabsContent value="general" className="mt-4">
            <div className="divide-y divide-white/[0.06]">
              <Row label="Your name" hint="Used in your greeting">
                <input
                  value={settings.name}
                  onChange={(e) => update({ name: e.target.value.slice(0, 24) })}
                  placeholder="Alex"
                  className="field h-9 w-40"
                />
              </Row>
              <div className="py-3">
                <p className="mb-2 text-sm font-medium text-white/90">Scene</p>
                <div className="grid grid-cols-6 gap-2">
                  {SCENES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => update({ scene: s.id })}
                      title={s.name}
                      className={cn("aspect-square rounded-xl ring-offset-2 ring-offset-[#101019] transition hover:scale-105", settings.scene === s.id && "ring-2 ring-white")}
                      style={{ background: `linear-gradient(135deg, ${s.colors[0]}, ${s.colors[1]})` }}
                    />
                  ))}
                </div>
              </div>
              <Row label="Desktop notifications" hint="Get pinged when a session ends in another tab">
                <span className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-white/40" />
                  <Switch checked={settings.notifications} onCheckedChange={askNotifications} />
                </span>
              </Row>
              <Row label="Countdown in tab title">
                <Switch checked={settings.titleCountdown} onCheckedChange={(v) => update({ titleCountdown: v })} />
              </Row>
              <Row label="Reset everything" hint="Restore default settings and clear stats">
                {confirmReset ? (
                  <span className="flex gap-2">
                    <button onClick={() => setConfirmReset(false)} className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:bg-white/10">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        update(DEFAULT_SETTINGS);
                        resetStats();
                        setConfirmReset(false);
                        toast.success("Fresh start! Settings and stats were reset.");
                      }}
                      className="rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                    >
                      Yes, reset
                    </button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmReset(true)} className="rounded-lg border border-rose-400/30 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10">
                    Reset
                  </button>
                )}
              </Row>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/35">
              <Music2 className="h-3 w-3" /> Everything is saved privately in this browser.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
