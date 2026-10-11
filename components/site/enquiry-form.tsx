"use client";

import { useRef, useState } from "react";
import type { Labels } from "@/lib/labels";
import { formatPrice } from "@/lib/media";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MinusIcon, PlusIcon } from "lucide-react";
import { WhatsAppIcon } from "./icons";
import { SpamTrap, useSpamCheck } from "./spam-trap";

export type AddonOption = { name: string; price?: number | null };

type Props = {
  trips: string[];
  defaultTrip?: string;
  defaultMessage?: string;
  // Add-ons of the fixed/preselected trip, and which of them start ticked.
  addons?: AddonOption[];
  defaultAddons?: string[];
  // Journey title → slug. With it, picking a journey loads that trip's add-ons.
  tripSlugs?: Record<string, string>;
  currency?: string;
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
function FieldSelect({
  name,
  defaultValue,
  options,
  onValueChange,
}: {
  name: string;
  defaultValue: string;
  options: string[];
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select name={name} defaultValue={defaultValue} onValueChange={onValueChange}>
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

// The tenant's add-on catalogue, fetched once per page through the /api proxy.
let extrasCatalogue: Promise<{ id: number; name: string; price?: number | null }[]> | null = null;
function loadExtras() {
  extrasCatalogue ??= fetch("/api/extras?page=1&limit=100")
    .then((r) => (r.ok ? r.json() : null))
    .then((b) => (b?.data?.extras ?? []).map((e: { id: number; name: string; price?: number | null }) => ({ id: Number(e.id), name: e.name, price: e.price })))
    .catch(() => {
      extrasCatalogue = null;
      return [];
    });
  return extrasCatalogue;
}

async function loadTripAddons(slug: string): Promise<AddonOption[]> {
  const [trip, extras] = await Promise.all([
    fetch(`/api/activity/slug/${encodeURIComponent(slug)}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    loadExtras(),
  ]);
  let ids: unknown = trip?.data?.extraIds ?? [];
  if (typeof ids === "string") {
    try {
      ids = JSON.parse(ids);
    } catch {
      ids = [];
    }
  }
  return (Array.isArray(ids) ? ids : []).map(Number).flatMap((id) => extras.filter((e) => e.id === id));
}

const MAX_TRAVELLERS = 99;

// Exact group size: type a number or step it with −/+.
function TravellersField() {
  const [count, setCount] = useState("2");
  const n = Number(count) || 0;
  const set = (v: number) => setCount(String(Math.min(MAX_TRAVELLERS, Math.max(1, v))));
  const step = "flex size-9 flex-none items-center justify-center border border-paper/30 text-paper transition-colors hover:enabled:border-paper disabled:opacity-30";
  return (
    <div className="flex items-center gap-2 border-b border-paper/50 py-1 focus-within:border-highland">
      <button type="button" aria-label="Fewer travellers" disabled={n <= 1} onClick={() => set(n - 1)} className={step}>
        <MinusIcon size={16} strokeWidth={1.8} />
      </button>
      <input
        name="travellers"
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_TRAVELLERS}
        required
        value={count}
        onChange={(e) => setCount(e.target.value.replace(/\D/g, "").slice(0, 2))}
        onBlur={() => set(n || 1)}
        aria-label="Number of travellers"
        className="w-full min-w-0 !border-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button type="button" aria-label="More travellers" disabled={n >= MAX_TRAVELLERS} onClick={() => set(n + 1)} className={step}>
        <PlusIcon size={16} strokeWidth={1.8} />
      </button>
    </div>
  );
}

function AddonPicker({ options, defaultChecked, currency }: { options: AddonOption[]; defaultChecked?: string[]; currency: string }) {
  return (
    <fieldset className="field-line sm:col-span-2">
      <legend className="mb-3">Add-ons</legend>
      <div className="flex flex-col gap-3">
        {options.map((o) => (
          <label key={o.name} className="flex cursor-pointer items-center gap-3 text-base text-paper">
            <Checkbox
              name="addons"
              value={o.name}
              defaultChecked={defaultChecked?.includes(o.name)}
              className="size-5 rounded-none border-paper/50 bg-transparent data-[state=checked]:border-highland data-[state=checked]:bg-highland data-[state=checked]:text-night dark:bg-transparent"
            />
            <span className="flex-1">{o.name}</span>
            {o.price != null && <span className="meta text-[13px] text-night-muted">+ {formatPrice(o.price, currency)}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// The API explains why a send failed (e.g. the site's contact email in
// TripEleven is invalid); fall back to nothing when it doesn't.
export async function sendErrorMessage(res: Response): Promise<string | undefined> {
  const body = (await res.json().catch(() => null)) as { message?: unknown } | null;
  return typeof body?.message === "string" && body.message.trim() ? body.message : undefined;
}

// Posts to the same-origin proxy (/api/email/send). TripEleven ignores any
// recipient in the body and delivers to the tenant's own address.
export default function EnquiryForm({
  trips,
  defaultTrip,
  defaultMessage,
  addons,
  defaultAddons,
  tripSlugs,
  currency = "$",
  whatsapp,
  variant = "plan",
  submitClassName,
  labels,
}: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const looksAutomated = useSpamCheck();
  const [addonOptions, setAddonOptions] = useState<AddonOption[]>(addons ?? []);
  const latestJourney = useRef(defaultTrip);

  // Swap the add-on list when the visitor picks another journey.
  function onJourneyChange(title: string) {
    latestJourney.current = title;
    setAddonOptions([]);
    const slug = tripSlugs?.[title];
    if (!slug) return;
    loadTripAddons(slug).then((list) => {
      if (latestJourney.current === title) setAddonOptions(list);
    });
  }

  // The form's current answers as labelled rows, shared by email and WhatsApp.
  function collect(form: HTMLFormElement) {
    const fd = new FormData(form);
    const data = Object.fromEntries(fd) as Record<string, string>;
    const journey = data.journey || defaultTrip || HELP_ME_CHOOSE;
    const chosenAddons = fd.getAll("addons").map(String).filter(Boolean);
    const rows: [string, string | undefined][] = [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Journey", journey],
      ["When", data.when === NOT_SURE ? undefined : data.when],
      ["Start date", data.startDate],
      ["Travellers", data.travellers],
      ["Add-ons", chosenAddons.join(", ")],
      ["Message", data.message],
    ];
    return { data, journey, filled: rows.filter((row): row is [string, string] => Boolean(row[1]?.trim())) };
  }

  // Point the WhatsApp link at a chat pre-filled with whatever is typed so
  // far; the browser then follows the updated href.
  function onWhatsApp(e: React.MouseEvent<HTMLAnchorElement>) {
    const form = e.currentTarget.closest("form");
    const number = whatsapp?.match(/wa\.me\/(\d+)/)?.[1];
    if (!form || !number) return;
    const { journey, filled } = collect(form);
    const intro = journey === HELP_ME_CHOOSE ? "Hi! I'd like help choosing a trip." : `Hi! I'd like to enquire about ${journey}.`;
    const details = filled.filter(([k]) => k !== "Journey" && k !== "Message").map(([k, v]) => `${k}: ${v}`);
    const message = filled.find(([k]) => k === "Message")?.[1];
    const text = [intro, details.join("\n"), message].filter(Boolean).join("\n\n");
    e.currentTarget.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Bots get the normal thank-you so they don't retry; nothing is sent.
    if (looksAutomated(e.currentTarget)) {
      setState("done");
      return;
    }
    const { data, journey, filled } = collect(e.currentTarget);
    const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

    setState("sending");
    setErrorMessage(undefined);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `New enquiry from ${data.name} — ${journey}`,
          // Lets the team answer straight from their inbox.
          replyTo: data.email,
          text: filled.map(([k, v]) => `${k}: ${v}`).join("\n"),
          html: `<table>${filled
            .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escape(v).replace(/\n/g, "<br/>")}</td></tr>`)
            .join("")}</table>`,
        }),
      });
      if (!res.ok) setErrorMessage(await sendErrorMessage(res));
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
    <form onSubmit={onSubmit} className="relative grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 sm:gap-y-7">
      <SpamTrap />
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
              onValueChange={onJourneyChange}
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
          <div className="field-line">
            <span>Travellers</span>
            <TravellersField />
          </div>
        </>
      )}

      {addonOptions.length > 0 && (
        // Keyed by the list so a new journey's add-ons start unticked.
        <AddonPicker
          key={addonOptions.map((o) => o.name).join("|")}
          options={addonOptions}
          defaultChecked={defaultAddons}
          currency={currency}
        />
      )}

      <label className="field-line sm:col-span-2">
        Phone / WhatsApp <span className="sr-only">(optional)</span>
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label className="field-line sm:col-span-2">
        Tell us a little more
        <textarea name="message" rows={3} defaultValue={defaultMessage} className="resize-y" />
      </label>

      <div className="flex flex-wrap gap-3 sm:col-span-2 sm:mt-2">
        <button type="submit" disabled={state === "sending"} className={submitClassName ?? "btn-primary disabled:opacity-60"}>
          {state === "sending" ? "…" : labels.bookNow}
        </button>
        {whatsapp && (
          <a href={whatsapp} onClick={onWhatsApp} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
            <WhatsAppIcon size={18} />
            {labels.bookWhatsApp}
          </a>
        )}
      </div>
      {state === "error" && (
        <p role="alert" className="text-sm text-[#F2A08F] sm:col-span-2">
          {errorMessage ?? "Something went wrong sending your enquiry. Please try again."}
          {whatsapp ? " You can also message us on WhatsApp." : ""}
        </p>
      )}
    </form>
  );
}
