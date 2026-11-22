import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-accent-gradient btn-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 12c2.5-4 5.5-4 8 0s5.5 4 8 0" />
          <path d="M3 17c2.5-4 5.5-4 8 0s5.5 4 8 0" opacity="0.55" />
          <path d="M3 7c2.5-4 5.5-4 8 0s5.5 4 8 0" opacity="0.3" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight text-white max-[359px]:hidden">
        collabs<span className="text-gradient">flow</span>
      </span>
    </div>
  );
}
