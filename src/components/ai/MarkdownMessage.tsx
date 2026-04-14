"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h3 className="text-lg font-bold text-white mt-4 mb-2">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="text-lg font-bold text-white mt-4 mb-2">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-base font-semibold text-white mt-3 mb-1.5">{children}</h4>
  ),
  h4: ({ children }) => (
    <h5 className="text-sm font-semibold text-gray-200 mt-2 mb-1">{children}</h5>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 space-y-1 pl-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 space-y-1 pl-4 list-decimal">{children}</ol>,
  li: ({ children }) => (
    <li className="text-gray-200 leading-relaxed flex gap-1.5">
      <span className="text-aoe-accent/60 select-none shrink-0">•</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="text-gray-300 italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-aoe-accent hover:text-yellow-400 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-aoe-accent/50 pl-3 my-2 text-gray-400 italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-aoe-dark/80 border border-aoe-border/50 rounded px-1.5 py-0.5 text-xs text-aoe-accent font-mono">
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-aoe-dark/80 border border-aoe-border/50 rounded-lg p-3 my-2 overflow-x-auto">
        <code className="text-xs text-gray-300 font-mono">{children}</code>
      </pre>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-aoe-border/60">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left text-xs font-semibold text-aoe-accent px-2 py-1.5 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-gray-300 px-2 py-1.5 border-b border-aoe-border/30">{children}</td>
  ),
  hr: () => <hr className="border-aoe-border/40 my-3" />,
};

export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="prose-aoe text-sm text-gray-200">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
