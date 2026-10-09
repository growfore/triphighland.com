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
        <div className="mt-5 flex border-b border-paper/50">
          <input
            id={id}
            name="email"
            type="email"
            required
            placeholder={labels.placeholder}
            className="min-w-0 flex-1 bg-transparent py-3 text-[15px] text-paper outline-none placeholder:text-soot-muted"
          />
          <button type="submit" disabled={state === "sending"} className="min-h-11 font-medium disabled:opacity-60">
            {state === "sending" ? "…" : labels.button}
          </button>
        </div>
      )}
      {state === "error" && <p className="mt-3 text-sm text-[#F2A08F]">{labels.error}</p>}
    </form>
  );
}
