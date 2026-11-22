import { Heart } from "lucide-react";
import { Logo } from "./Logo";
import { ORG_NAME, ORG_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-8 sm:flex-row sm:px-6 sm:pb-8 lg:px-8">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="max-w-xs text-center text-xs leading-relaxed text-white/40 sm:max-w-none sm:text-left">
            Made with <Heart className="inline h-3 w-3 -translate-y-px fill-rose-400 text-rose-400" aria-label="love" /> by {ORG_NAME} for
            students who want to get into flow.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/40 sm:mr-56">
          <span>© {new Date().getFullYear()} Collabs Flow</span>
          <a href={ORG_URL} target="_blank" rel="noopener noreferrer" className="icon-btn h-9 w-9" aria-label={`${ORG_NAME} on Linktree`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M13.736 5.853l-3.005-3.005a2.222 2.222 0 0 0-3.141 0l-3.005 3.005a2.222 2.222 0 0 0 3.141 3.141l1.434-1.434v8.324h-4.32a2.222 2.222 0 1 0 0 4.444h11.92a2.222 2.222 0 1 0 0-4.444h-4.32V7.56l1.434 1.434a2.222 2.222 0 0 0 3.142-3.141z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
