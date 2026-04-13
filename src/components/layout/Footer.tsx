import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-aoe-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p className="flex items-center justify-center gap-1">
          A passion project built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for the AoE2 community.
        </p>
        <p className="mt-2">
          No ads, no data selling — just tools that help you play better.
        </p>
        <p className="mt-3">
          <a
            href="https://ko-fi.com/popeeeeeeeye"
            target="_blank"
            rel="noopener noreferrer"
            className="text-aoe-accent hover:text-yellow-400 transition-colors"
          >
            Support this project on Ko-fi
          </a>
        </p>
      </div>
    </footer>
  );
}
