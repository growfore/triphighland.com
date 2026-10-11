"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Clamps a long review to `lines` and offers "Read more" only when the text
// actually overflows, so short quotes stay clean.
export default function TestimonialQuote({ text, lines, className }: { text: string; lines: number; className?: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (!expanded) setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, text]);

  return (
    <div>
      <blockquote
        ref={ref}
        className={`m-0 ${className ?? ""}`}
        style={expanded ? undefined : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden" }}
      >
        “{text}”
      </blockquote>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 text-[14px] font-medium underline underline-offset-4 opacity-80 hover:opacity-100"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
