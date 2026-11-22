/**
 * Canonical site URL. Set NEXT_PUBLIC_SITE_URL to your custom domain; on Vercel the
 * production domain is picked up automatically.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Collabs Flow";
export const SITE_TITLE = "Collabs Flow — Free Pomodoro Timer with Lofi Music for Students";
export const SITE_DESCRIPTION =
  "Free online Pomodoro study timer with lofi music, rain & ambient sounds, a task board, streaks and focus stats. No sign-up, works offline — built for students.";
export const ORG_NAME = "AKHSS Collabs";
export const ORG_URL = "https://linktr.ee/akhsscollabs";

export const KEYWORDS = [
  "pomodoro timer",
  "study timer",
  "online pomodoro timer",
  "pomodoro timer with music",
  "lofi study music",
  "focus timer",
  "study with me",
  "study app for students",
  "productivity timer",
  "ambient sounds for studying",
  "rain sounds study",
  "brown noise focus",
  "free study timer",
  "task board for students",
  "focus music",
  "study planner",
  "pomodoro technique",
  "deep work timer",
];
