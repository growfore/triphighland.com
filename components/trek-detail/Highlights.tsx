export default function Highlights({ items }: { items: string[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Highlights</h2>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((it, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mt-0.5 h-6 w-6 rounded-full bg-sky-50 text-center text-sky-700">
              ✓
            </div>
            <div className="text-sm text-slate-700">{it}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
