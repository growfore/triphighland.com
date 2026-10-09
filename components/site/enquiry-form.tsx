"use client";

import { useState } from "react";
import type { Labels } from "@/lib/labels";
import { WhatsAppIcon } from "./icons";

type Props = {
  trips: string[];
  defaultTrip?: string;
  whatsapp?: string;
  // "plan": journey + season + message (homepage); "trip": dates + group size.
  variant?: "plan" | "trip";
  submitClassName?: string;
  labels: Labels["trip"];
};

function seasons(): string[] {
  const year = new Date().getFullYear();
  return [year, year + 1].flatMap((y) => [`Spring ${y}`, `Summer ${y}`, `Autumn ${y}`, `Winter ${y}`]);
}

// Posts to the same-origin proxy (/api/email/send). TripEleven ignores any
// recipient in the body and delivers to the tenant's own address.
export default function EnquiryForm({ trips, defaultTrip, whatsapp, variant = "plan", submitClassName, labels }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const journey = data.journey || defaultTrip || "Help me choose";
    const rows: [string, string | undefined][] = [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Journey", journey],
      ["When", data.when],
      ["Start date", data.startDate],
      ["Travellers", data.travellers],
      ["Message", data.message],
    ];
    const filled = rows.filter(([, v]) => v);
    const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

    setState("sending");
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `New enquiry from ${data.name} — ${journey}`,
          text: filled.map(([k, v]) => `${k}: ${v}`).join("\n"),
          html: `<table>${filled
            .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escape(v!).replace(/\n/g, "<br/>")}</td></tr>`)
            .join("")}</table>`,
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="border-t border-paper/30 pt-8" role="status">
        <p className="text-xl font-semibold uppercase">Thank you.</p>
        <p className="mt-3 text-base font-light text-night-muted">
          Your enquiry is with our team. A guide will reply personally, usually within a day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 sm:gap-y-7">
      <label className="field-line">
        Name
        <input name="name" type="text" required autoComplete="name" />
      </label>
      <label className="field-line">
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>

      {variant === "plan" ? (
        <>
          <label className="field-line">
            Journey
            <select name="journey" defaultValue={defaultTrip ?? ""}>
              <option value="">Help me choose</option>
              {trips.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="field-line">
            When
            <select name="when" defaultValue="">
              <option value="">Not sure yet</option>
              {seasons().map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <>
          <label className="field-line">
            Start date
            <input name="startDate" type="date" style={{ colorScheme: "dark" }} />
          </label>
          <label className="field-line">
            Travellers
            <select name="travellers" defaultValue="2">
              <option>1</option>
              <option>2</option>
              <option>3–5</option>
              <option>6+</option>
            </select>
          </label>
        </>
      )}

      <label className="field-line sm:col-span-2">
        Phone / WhatsApp <span className="sr-only">(optional)</span>
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label className="field-line sm:col-span-2">
        Tell us a little more
        <textarea name="message" rows={3} className="resize-y" />
      </label>

      <div className="flex flex-wrap gap-3 sm:col-span-2 sm:mt-2">
        <button type="submit" disabled={state === "sending"} className={submitClassName ?? "btn-primary disabled:opacity-60"}>
          {state === "sending" ? "…" : labels.bookNow}
        </button>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
            <WhatsAppIcon size={18} />
            {labels.bookWhatsApp}
          </a>
        )}
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm text-[#F2A08F] sm:col-span-2">
          Something went wrong sending your enquiry. Please try again{whatsapp ? " or message us on WhatsApp" : ""}.
        </p>
      )}
    </form>
  );
}
