export default function TripOverview({ text }: { text: string }) {
  return (
    <section
      className="mt-4 space-y-3 text-sm leading-6 text-slate-600
    prose max-w-none
    prose-headings:text-foreground prose-headings:font-[700]
    prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
    prose-h2:text-3xl prose-h2:mt-6 prose-h2:mb-2 prose-h2:font-[700] prose-h2:border-l-2 prose-h2:border-l-blue-600
    prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-1
    prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:mb-4 prose-p:mt-0
    prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/70 hover:prose-a:underline
    prose-strong:text-foreground prose-strong:font-[700]
    prose-ul:my-2 prose-ol:my-2
    prose-li:mb-1
    prose-blockquote:border-l-4 prose-blockquote:border-primary/80 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-foreground/70
    prose-img:rounded-lg prose-img:my-6
    prose-code:bg-accent prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
    prose-pre:bg-accent prose-pre:text-foreground prose-pre:rounded-lg prose-pre:p-4"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}
