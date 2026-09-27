import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const CITE_PREFIX = "#cite-";

/**
 * Normalise an answer before Markdown parsing:
 *  - \( \) and \[ \] math delimiters -> $ / $$, which is all remark-math reads;
 *  - [n] citation markers -> links to "#cite-n", rendered below as buttons.
 *    Only markers that point at a real citation are touched, so ordinary
 *    bracketed text stays as written.
 */
const prepare = (text, citationCount) =>
  text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => `\n$$\n${math.trim()}\n$$\n`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => `$${math.trim()}$`)
    .replace(/\[(\d{1,2})\](?!\()/g, (marker, n) =>
      Number(n) >= 1 && Number(n) <= citationCount ? `[${n}](${CITE_PREFIX}${n})` : marker
    );

/** Renders an agent answer: Markdown, tables, LaTeX formulae and [n] citations. */
const AnswerMarkdown = ({ text, citations = [], onCite }) => {
  const components = {
    p: ({ node, ...props }) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
    ul: ({ node, ...props }) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
    ol: ({ node, ...props }) => <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-semibold text-ink" {...props} />,
    // Answers sit inside a chat bubble, so every heading level is toned down.
    h1: ({ node, children }) => <h3 className="mb-1 mt-3 font-display text-base font-bold">{children}</h3>,
    h2: ({ node, children }) => <h3 className="mb-1 mt-3 font-display text-base font-bold">{children}</h3>,
    h3: ({ node, children }) => <h4 className="mb-1 mt-3 text-sm font-semibold">{children}</h4>,
    code: ({ node, ...props }) => (
      <code className="bg-cream px-1 py-0.5 font-mono text-[0.85em]" {...props} />
    ),
    table: ({ node, ...props }) => (
      <div className="my-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs" {...props} />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th className="border border-line bg-cream px-2 py-1.5 text-left font-semibold" {...props} />
    ),
    td: ({ node, ...props }) => <td className="border border-line px-2 py-1.5 align-top" {...props} />,
    a: ({ node, href, children, ...props }) => {
      if (href?.startsWith(CITE_PREFIX)) {
        const index = Number(href.slice(CITE_PREFIX.length)) - 1;
        const citation = citations[index];
        return (
          <button
            type="button"
            onClick={() => onCite?.(index)}
            title={citation?.page ? `Page ${citation.page}: ${citation.quote}` : citation?.quote}
            className="mx-0.5 inline-flex -translate-y-0.5 items-center border border-navy/30 bg-white px-1 text-[10px] font-semibold leading-4 text-navy hover:bg-navy hover:text-white"
          >
            {children}
          </button>
        );
      }
      return (
        <a href={href} target="_blank" rel="noreferrer" className="text-navy underline" {...props}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className="text-sm leading-relaxed text-ink [&_.katex-display]:my-3 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
        components={components}
      >
        {prepare(text, citations.length)}
      </ReactMarkdown>
    </div>
  );
};

export default AnswerMarkdown;
