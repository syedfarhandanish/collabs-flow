import {
  BarChart3,
  Brain,
  CloudRain,
  Download,
  KanbanSquare,
  Lock,
  Maximize2,
  Music2,
  Play,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { FAQ } from "@/lib/faq";

const FEATURES = [
  { icon: Timer, title: "Pomodoro study timer", text: "Focus, short break and long break modes with presets, auto-start and a countdown in your browser tab." },
  { icon: Music2, title: "Lofi music from YouTube", text: "Curated lofi, jazz and synthwave study radio, or paste any YouTube link. Smooth fades between sessions." },
  { icon: CloudRain, title: "Rain & ambient sounds", text: "Mix rain, waves, wind, fireplace, brown and white noise to block out distractions." },
  { icon: KanbanSquare, title: "Study task board", text: "Plan homework by subject and priority, estimate pomodoros and track what you finish." },
  { icon: BarChart3, title: "Streaks & focus stats", text: "Daily goals, streaks, XP levels, a weekly chart and a consistency heatmap keep you motivated." },
  { icon: Maximize2, title: "Distraction-free zen mode", text: "One key turns the screen into a calm, full-screen timer so nothing pulls you away." },
  { icon: Download, title: "Install & use offline", text: "Add it to your home screen or desktop. The timer, tasks and soundscapes work without internet." },
  { icon: Lock, title: "Private, no sign-up", text: "No account and no tracking of your study data. Everything stays in your browser." },
];

const STEPS = [
  { icon: Target, title: "Pick a task", text: "Add what you need to study and choose it as your focus." },
  { icon: Play, title: "Press start", text: "Your music fades in and the 25-minute focus timer begins." },
  { icon: Sparkles, title: "Rest & repeat", text: "Take a short break when the chime rings, earn XP and grow your streak." },
];

/** Server-rendered, crawlable content describing the app. */
export function SeoContent() {
  return (
    <section aria-labelledby="about-heading" className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-2xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">About Collabs Flow</p>
        <h1 id="about-heading" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          The free Pomodoro timer with lofi music,{" "}
          <span className="font-display font-normal italic text-gradient">built for students</span>
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/65">
          Collabs Flow is an online study timer that combines the Pomodoro Technique with relaxing lofi music, rain and
          ambient sounds, a homework task board and motivating focus stats, all on one calm page. Whether you&apos;re
          revising for exams, writing an essay or doing deep work, it helps you start faster, stay focused longer and
          build a daily study habit.
        </p>

        <h2 className="mt-12 text-xl font-semibold text-white sm:text-2xl">Everything you need to study in flow</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-gradient text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">How to use the Pomodoro study timer</h2>
            <ol className="mt-6 space-y-4">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold text-white">
                      <Icon className="h-4 w-4 text-c2" aria-hidden /> {title}
                    </h3>
                    <p className="mt-1 text-sm text-white/55">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white sm:text-2xl">
              <Brain className="h-5 w-5 text-c1" aria-hidden /> Why the Pomodoro Technique works
            </h2>
            <div className="mt-6 space-y-3 text-sm leading-relaxed text-white/60">
              <p>
                Created by Francesco Cirillo in the late 1980s, the Pomodoro Technique breaks work into focused
                25-minute intervals separated by short breaks. A clear finish line makes starting easier, regular breaks
                prevent mental fatigue, and counting completed rounds gives you a real sense of progress.
              </p>
              <p>
                Pairing your sessions with instrumental lofi music or steady background noise like rain or brown noise
                can mask distracting sounds and signal to your brain that it&apos;s time to focus. Collabs Flow puts the
                timer, the music and your to-do list in one place, so you never have to switch tabs.
              </p>
            </div>
          </div>
        </div>

        <h2 className="mt-14 text-xl font-semibold text-white sm:text-2xl">Frequently asked questions</h2>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 open:bg-white/[0.05]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white [&::-webkit-details-marker]:hidden">
                <h3 className="text-base">{q}</h3>
                <span className="text-xl leading-none text-white/40 transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
