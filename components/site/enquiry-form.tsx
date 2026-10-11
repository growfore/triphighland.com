"use client";

import { useState } from "react";
import type { Labels } from "@/lib/labels";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// shadcn Select styled as the form's underlined dark field. Radix renders a
// hidden native <select name> alongside, so FormData still picks the value up.
function FieldSelect({ name, defaultValue, options }: { name: string; defaultValue: string; options: string[] }) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger className="h-auto w-full rounded-none border-0 border-b border-paper/50 bg-transparent px-0 py-2 text-base text-paper shadow-none focus-visible:border-highland focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent [&_svg:not([class*='text-'])]:text-paper">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="max-h-72 rounded-[4px] border-white/15 bg-night text-paper"
      >
        {options.map((o) => (
          <SelectItem key={o} value={o} className="py-2 text-[15px] focus:bg-white/10 focus:text-paper [&_svg:not([class*='text-'])]:text-highland">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const HELP_ME_CHOOSE = "Help me choose";
const NOT_SURE = "Not sure yet";

// Posts to the same-origin proxy (/api/email/send). TripEleven ignores any
// recipient in the body and delivers to the tenant's own address.
export default function EnquiryForm({ trips, defaultTrip, whatsapp, variant = "plan", submitClassName, labels }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const journey = data.journey || defaultTrip || HELP_ME_CHOOSE;
    const rows: [string, string | undefined][] = [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Journey", journey],
      ["When", data.when === NOT_SURE ? undefined : data.when],
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
            <FieldSelect
              name="journey"
              defaultValue={defaultTrip ?? HELP_ME_CHOOSE}
              options={[HELP_ME_CHOOSE, ...trips.filter((t) => t !== HELP_ME_CHOOSE)]}
            />
          </label>
          <label className="field-line">
            When
            <FieldSelect name="when" defaultValue={NOT_SURE} options={[NOT_SURE, ...seasons()]} />
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
            <FieldSelect name="travellers" defaultValue="2" options={["1", "2", "3–5", "6+"]} />
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
