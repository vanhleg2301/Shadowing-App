import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Raw HTML in a note is not rendered (react-markdown's default), so a note can only ever show text.
const REMARK_PLUGINS = [remarkGfm];
const COMPONENTS: Components = {
  h1: ({ children }) => <h3 className="mt-4 text-xl font-extrabold text-ink first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-4 text-lg font-extrabold text-ink first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-3 font-bold text-ink first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="mt-2 leading-relaxed text-ink first:mt-0">{children}</p>,
  ul: ({ children, className }) => (
    <ul className={`mt-2 space-y-1 ${className?.includes("contains-task-list") ? "list-none pl-1" : "list-disc pl-5"}`}>{children}</ul>
  ),
  ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed text-ink [&>input]:mr-2 [&>input]:accent-brand">{children}</li>,
  blockquote: ({ children }) => <blockquote className="mt-2 border-l-4 border-brand/40 pl-3 italic text-muted">{children}</blockquote>,
  code: ({ children }) => <code className="rounded bg-cream px-1 py-0.5 text-[0.9em]">{children}</code>,
  hr: () => <hr className="my-4 border-line" />,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-brand underline">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-line bg-cream px-2 py-1 text-left font-bold">{children}</th>,
  td: ({ children }) => <td className="border border-line px-2 py-1">{children}</td>,
};

export function NoteMarkdown({ content }: { content: string }) {
  return (
    <div lang="en" className="break-words">
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
