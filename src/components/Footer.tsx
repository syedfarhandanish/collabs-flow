import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-800 bg-opacity-30 backdrop-filter backdrop-blur-lg border-t border-gray-700 py-4 mt-8">
      <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Collabs Flow. All rights reserved.
        </p>
        <Link
          href="https://linktr.ee/akhsscollabs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors duration-200"
          aria-label="AKHSS Collabs Linktree"
        >
          <svg 
            role="img" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-5 h-5 fill-current"
          >
            <path d="M13.736 5.853l-3.005-3.005a2.222 2.222 0 0 0-3.141 0l-3.005 3.005a2.222 2.222 0 0 0 3.141 3.141l1.434-1.434v8.324h-4.32a2.222 2.222 0 1 0 0 4.444h11.92a2.222 2.222 0 1 0 0-4.444h-4.32V7.56l1.434 1.434a2.222 2.222 0 0 0 3.142-3.141z"/>
          </svg>
        </Link>
      </div>
    </footer>
  );
}