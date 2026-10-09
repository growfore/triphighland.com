import Link from "next/link";

export default function Breadcrumbs({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  return (
    <div className="text-sm text-slate-500">
      {items.map((it, idx) => (
        <span key={it.href}>
          {idx > 0 && <span className="mx-2 text-slate-300">/</span>}
          <Link
            href={it.href}
            className="hover:text-slate-700 hover:underline"
          >
            {it.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
