import Image from "next/image";
import Link from "next/link";
import { MoreAdventure } from "./types";

export default function ExploreMore({ items }: { items: MoreAdventure[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 text-center">
        Explore More Adventures
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <Link
            key={a.id}
            href={`/treks/${a.id}`}
            className="group block"
          >
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={`/treks/everest-base-camp/explore-${i + 1}.png`}
                  alt={a.title}
                  fill
                  quality={95}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm">
                {a.days}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-sm font-semibold text-slate-900">
                {a.title}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                From ${a.fromPrice}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
