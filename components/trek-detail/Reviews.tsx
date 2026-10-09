import { Star } from "lucide-react";
import { Review } from "./types";

export default function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-[3px] rounded-full bg-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            What Our Trekkers Say
          </h2>
        </div>

        <button className="text-sm font-semibold text-blue-600 hover:underline">
          View All Reviews
        </button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
              “{r.text}”
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {r.name[0]}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {r.name}
                </div>
                <div className="text-xs text-slate-500">{r.country}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
