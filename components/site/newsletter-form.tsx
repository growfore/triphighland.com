"use client";

import { useId, useState } from "react";
import type { Labels } from "@/lib/labels";

export default function NewsletterForm({ labels, heading }: { labels: Labels["newsletter"]; heading?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const id = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("sending");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[420px]">
      <label htmlFor={id} className={heading ? "block text-xl font-medium leading-tight tracking-[-0.01em]" : "sr-only"}>
        {heading || labels.placeholder}
      </label>
      {state === "done" ? (
        <p className="mt-5 text-night-muted">{labels.success}</p>
      ) : (
        <div className={`${heading ? "mt-5" : ""} flex rounded-full border border-paper/25 bg-white/[0.06] p-1 pl-3 transition-colors focus-within:border-highland`}>
          <input
            id={id}
            name="email"
            type="email"
            required
            placeholder={labels.placeholder}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[15px] text-paper outline-none placeholder:text-soot-muted"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="meta min-h-11 flex-none rounded-full bg-highland px-6 text-[13px] font-medium text-night transition-colors hover:bg-[#6fa5d4] disabled:opacity-60"
          >
            {state === "sending" ? "…" : labels.button}
          </button>
        </div>
      )}
      {state === "error" && <p className="mt-3 text-sm text-[#F2A08F]">{labels.error}</p>}
    </form>
  );
}
