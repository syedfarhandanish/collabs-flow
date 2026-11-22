import {
  Award,
  BookOpen,
  Brain,
  CheckCheck,
  Clock,
  Crown,
  Flame,
  Moon,
  Rocket,
  Sparkles,
  Sunrise,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface Station {
  id: string;
  kind: "video" | "playlist";
  ytId: string;
  title: string;
  subtitle: string;
  mood: string;
  live?: boolean;
  custom?: boolean;
  /** Optional: with a YouTube API key, the channel's current live stream is used instead of ytId. */
  channelId?: string;
}

/** Curated focus stations. If one goes offline, the player skips to the next automatically. */
export const STATIONS: Station[] = [
  {
    id: "lofi-study",
    kind: "video",
    ytId: "jfKfPfyJRdk",
    title: "Lofi Study Radio",
    subtitle: "Beats to relax / study to",
    mood: "Chill",
    live: true,
    channelId: "UCSJ4gkVC6NrvII8umztf0Ow",
  },
  {
    id: "jazzy-beats",
    kind: "video",
    ytId: "5yx6BWlEVcY",
    title: "Jazzy Lofi Radio",
    subtitle: "Jazzy & lofi hip hop beats",
    mood: "Warm",
    live: true,
  },
  {
    id: "synthwave",
    kind: "video",
    ytId: "4xDzrJKXOOY",
    title: "Synthwave Radio",
    subtitle: "Retro beats to chill / code to",
    mood: "Energy",
    live: true,
  },
  {
    id: "sleepy-lofi",
    kind: "video",
    ytId: "rUxyKA_-grg",
    title: "Night Lofi Radio",
    subtitle: "Soft beats for late-night sessions",
    mood: "Calm",
    live: true,
  },
  {
    id: "jazz-lofi",
    kind: "video",
    ytId: "HuFYqnbVbzY",
    title: "Jazz Lofi Radio",
    subtitle: "Saxophone & mellow keys",
    mood: "Smooth",
    live: true,
  },
  {
    id: "1am-session",
    kind: "video",
    ytId: "lTRiuFIWV54",
    title: "1 A.M Study Session",
    subtitle: "A 1-hour lofi mix",
    mood: "Deep",
  },
  {
    id: "classical",
    kind: "video",
    ytId: "jgpJVI3tDbY",
    title: "Classical for Studying",
    subtitle: "Mozart, Vivaldi & friends",
    mood: "Classic",
  },
];

export const QUOTES: Array<{ text: string; author: string }> = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "Starve your distractions, feed your focus.", author: "Unknown" },
  { text: "A year from now you'll wish you had started today.", author: "Karen Lamb" },
  { text: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
];

export interface AchievementInput {
  totalSessions: number;
  totalFocusMin: number;
  tasksDone: number;
  longestStreak: number;
  earlyBird: boolean;
  nightOwl: boolean;
  bestDayMin: number;
  dailyGoalMin: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  progress: (s: AchievementInput) => [number, number];
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", title: "First Flow", description: "Finish your first focus session", icon: Sparkles, progress: (s) => [s.totalSessions, 1] },
  { id: "warm", title: "Warming Up", description: "Complete 5 focus sessions", icon: Zap, progress: (s) => [s.totalSessions, 5] },
  { id: "hour", title: "Hour of Power", description: "Focus for 60 minutes in total", icon: Clock, progress: (s) => [s.totalFocusMin, 60] },
  { id: "goal", title: "Goal Crusher", description: "Hit your daily focus goal", icon: Target, progress: (s) => [s.bestDayMin, s.dailyGoalMin] },
  { id: "streak3", title: "On Fire", description: "Keep a 3-day streak", icon: Flame, progress: (s) => [s.longestStreak, 3] },
  { id: "tasks5", title: "Getting Things Done", description: "Complete 5 tasks", icon: CheckCheck, progress: (s) => [s.tasksDone, 5] },
  { id: "deep", title: "Deep Diver", description: "Complete 25 focus sessions", icon: Brain, progress: (s) => [s.totalSessions, 25] },
  { id: "early", title: "Early Bird", description: "Finish a session before 8 AM", icon: Sunrise, progress: (s) => [s.earlyBird ? 1 : 0, 1] },
  { id: "owl", title: "Night Owl", description: "Finish a session after 10 PM", icon: Moon, progress: (s) => [s.nightOwl ? 1 : 0, 1] },
  { id: "streak7", title: "Unstoppable", description: "Keep a 7-day streak", icon: Rocket, progress: (s) => [s.longestStreak, 7] },
  { id: "ten", title: "Ten Hour Club", description: "Focus for 10 hours in total", icon: BookOpen, progress: (s) => [s.totalFocusMin, 600] },
  { id: "tasks25", title: "Task Slayer", description: "Complete 25 tasks", icon: Award, progress: (s) => [s.tasksDone, 25] },
  { id: "century", title: "Centurion", description: "Complete 100 focus sessions", icon: Trophy, progress: (s) => [s.totalSessions, 100] },
  { id: "streak30", title: "Legend", description: "Keep a 30-day streak", icon: Crown, progress: (s) => [s.longestStreak, 30] },
];

export const LEVEL_TITLES = [
  "Rookie",
  "Apprentice",
  "Scholar",
  "Focused Mind",
  "Deep Diver",
  "Flow Seeker",
  "Mastermind",
  "Sage",
  "Grandmaster",
  "Legend",
];

/** XP needed to *reach* a level: L1=0, L2=50, L3=150, L4=300 … */
export function xpForLevel(level: number) {
  return 25 * level * (level - 1);
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    into: xp - floor,
    span: next - floor,
    progress: (xp - floor) / (next - floor),
  };
}

const TAG_COLORS = [
  "bg-sky-400/15 text-sky-200 ring-sky-400/30",
  "bg-violet-400/15 text-violet-200 ring-violet-400/30",
  "bg-emerald-400/15 text-emerald-200 ring-emerald-400/30",
  "bg-amber-400/15 text-amber-200 ring-amber-400/30",
  "bg-rose-400/15 text-rose-200 ring-rose-400/30",
  "bg-teal-400/15 text-teal-200 ring-teal-400/30",
  "bg-fuchsia-400/15 text-fuchsia-200 ring-fuchsia-400/30",
  "bg-orange-400/15 text-orange-200 ring-orange-400/30",
];

export function tagColor(tag: string) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length];
}
