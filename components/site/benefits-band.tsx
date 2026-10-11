import { getSiteConfig } from "@/lib/site";
import Photo from "./photo";
import { ShieldCheckIcon, SlidersHorizontalIcon, TagIcon } from "lucide-react";

// Per-slot icons when a benefit has no uploaded icon (the TripEleven
// template's BenefitsBand does the same with its three default slots).
const SLOT_ICONS = [TagIcon, ShieldCheckIcon, SlidersHorizontalIcon];

// Site-wide benefits strip under page headers, from the dashboard's
// Homepage → Benefits (content.home.benefits). Renders nothing when empty.
export default async function BenefitsBand() {
  const items = ((await getSiteConfig()).content.home?.benefits?.items ?? []).filter((b) => b.title);
  if (!items.length) return null;
  const cols = items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <section aria-label="Benefits" className="border-t border-line bg-white">
      <ul className={`wrap grid grid-cols-1 gap-x-10 gap-y-10 py-12 sm:grid-cols-2 lg:py-16 ${cols}`}>
        {items.map((b, i) => {
          const Icon = SLOT_ICONS[i % SLOT_ICONS.length];
          return (
            <li key={`${b.title}-${i}`} className="flex flex-col items-start gap-5">
              <span className="relative flex size-16 flex-none items-center justify-center overflow-hidden rounded-full bg-highland-tint text-highland-deep">
                {b.icon ? <Photo src={b.icon} alt="" sizes="64px" className="!object-contain p-3.5" /> : <Icon size={28} strokeWidth={1.8} />}
              </span>
              <div>
                <h2 className="text-lg font-bold uppercase leading-tight sm:text-xl">{b.title}</h2>
                {b.copy && <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">{b.copy}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
