"use client";

import { Children, useState, type ReactNode } from "react";

interface ShowMoreProps {
  // Items rendered in the grid or list; only the first `pageSize` show until the learner asks for more.
  children: ReactNode;
  pageSize?: number;
  className?: string;
  // Changing it (e.g. a new filter) starts again from the first page.
  resetKey?: string;
  // "ul" when the items are <li> elements.
  as?: "div" | "ul";
}

// Keeps long lists short on phones: a page of items and a "Show more" button for the rest.
export function ShowMore({ children, pageSize = 12, className, resetKey = "", as: Tag = "div" }: ShowMoreProps) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState({ key: resetKey, count: pageSize });
  const count = shown.key === resetKey ? shown.count : pageSize;
  const left = items.length - count;

  return (
    <>
      <Tag className={className}>{items.slice(0, count)}</Tag>
      {left > 0 && (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => setShown({ key: resetKey, count: count + pageSize })} className="btn-3d px-5 py-2.5 text-sm">
            Show more · {left} left
          </button>
        </div>
      )}
    </>
  );
}
