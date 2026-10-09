export default function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-1">
      {/*<div className="h-5 w-0.75 rounded-full bg-primary -mt-4" />*/}
      <h2 className="text-lg font-semibold w-fit">{title}</h2>
    </div>
  );
}
