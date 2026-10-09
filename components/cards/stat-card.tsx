export function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="py-5">
      <div> {icon}</div>
      {label}
      <div className="mt-1 font-semibold text-slate-900 text-sm">{value}</div>
    </div>
  );
}
