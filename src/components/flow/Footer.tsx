import { Github, Heart } from "lucide-react";
import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 pb-24 pt-8 sm:flex-row sm:pb-8 sm:pr-64 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="flex items-center gap-1 text-xs text-white/40">
            Made with <Heart className="h-3 w-3 fill-rose-400 text-rose-400" /> for students who want to get into flow.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Collabs Flow</span>
          <a
            href="https://github.com/syedfarhandanish/collabs-flow"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn h-9 w-9"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
