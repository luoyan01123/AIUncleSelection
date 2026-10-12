import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="mb-3 leading-7 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-gold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-gold">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-gold/80 pl-3 text-gold/95 [&_p]:mb-0">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-gold/50 underline-offset-4"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className="block overflow-x-auto rounded-xl bg-black/40 px-3 py-2 font-mono text-[13px] leading-6 text-paper">
        {children}
      </code>
    ) : (
      <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.92em] text-gold">
        {children}
      </code>
    ),
  pre: ({ children }) => <pre className="my-3 whitespace-pre-wrap">{children}</pre>,
};

export function MarkdownView({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {text}
    </ReactMarkdown>
  );
}
