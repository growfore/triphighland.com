"use client";

import { useRef } from "react";
import { XIcon } from "lucide-react";

// Airbnb-style "Show more": a clipped preview with a button that opens the
// full overview in a modal <dialog> (Esc and backdrop click close it).
export default function OverviewMore({ title, html, preview }: { title: string; html: string; preview: string }) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <p className="mt-6 line-clamp-4 max-w-[620px] text-base font-light leading-relaxed text-[#DCE5EE] sm:text-lg">{preview}</p>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="mt-3 self-start font-medium text-white underline underline-offset-4 hover:text-highland-tint"
      >
        Show more
      </button>

      <dialog
        ref={ref}
        aria-label={title}
        onClick={(e) => {
          if (e.target === ref.current) ref.current.close();
        }}
        className="m-auto max-h-[85vh] w-[min(720px,calc(100vw-32px))] overflow-hidden rounded-[8px] bg-paper p-0 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,.5)] backdrop:bg-black/50"
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-center gap-3 border-b border-line px-5 py-3">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="flex size-10 items-center justify-center rounded-full hover:bg-stone"
            >
              <XIcon strokeWidth={1.8} size={18} />
            </button>
          </div>
          <div className="overflow-y-auto px-6 pb-10 pt-6 sm:px-10">
            <h2 className="display text-[22px] sm:text-[26px]">{title}</h2>
            <div className="rich mt-6" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </dialog>
    </>
  );
}
