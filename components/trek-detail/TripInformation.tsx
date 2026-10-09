import Image from "next/image";
import SectionTitle from "./SectionTitle";
import { TripInfoCard } from "./types";

export default function TripInformation({ info }: { info: TripInfoCard[] }) {
  return (
    <section>
      <SectionTitle title="Trip Information" />

      <div className="mt-5 space-y-6">
        {info.map((c, idx) => {
          const reverse = idx % 2 === 1;

          return (
            <div
              key={idx}
              className={`grid grid-cols-1 items-center gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-12 ${
                reverse ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="lg:col-span-7">
                <div className="text-sm font-semibold text-slate-900">
                  {c.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{c.text}</p>
              </div>

              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={`/treks/everest-base-camp/trip-info-${idx + 1}.png?v=2`}
                      alt={c.title}
                      fill
                      quality={95}
                      className="object-cover saturate-110 contrast-105"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
