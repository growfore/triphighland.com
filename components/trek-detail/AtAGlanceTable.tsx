import SectionTitle from "./SectionTitle";
import { AtAGlanceRow } from "./types";

export default function AtAGlanceTable({ rows }: { rows: AtAGlanceRow[] }) {
  return (
    <section>
      <SectionTitle title="At a Glance" />

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
            <tr>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3 text-right">Max Altitude</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r) => (
              <tr key={r.day} className="text-slate-700">
                <td className="px-4 py-3">{r.day}</td>
                <td className="px-4 py-3">{r.destination}</td>
                <td className="px-4 py-3 text-right">{r.maxAltitude}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
