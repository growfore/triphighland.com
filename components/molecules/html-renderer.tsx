export const HTMLRenderer = ({ html }: { html: string }) => {
  return (
    <div
      className="space-y-3 text-sm leading-6 
      prose max-w-none
      prose-headings:text-slate-900 prose-headings:font-semibold
      prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
      prose-h2:text-3xl prose-h2:mt-6 prose-h2:mb-2 prose-h2:font-semibold prose-h2:border-l-4 prose-h2:border-l-blue-500 prose-h2:pl-4
      prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-1
      prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4 prose-p:mt-0 prose-p:break-words
      prose-a:text-blue-600 prose-a:no-underline prose-a:break-words hover:prose-a:text-blue-700 hover:prose-a:underline
      prose-strong:text-slate-900 prose-strong:font-semibold
      prose-ul:my-2 prose-ul:text-slate-600 prose-ol:my-2 prose-ol:text-slate-600
      prose-li:mb-1 prose-li:text-slate-600 prose-li:break-words
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600
      prose-img:rounded-lg prose-img:my-6 prose-img:shadow-sm prose-img:max-w-full prose-img:h-auto
      prose-code:bg-blue-50 prose-code:text-blue-700 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
      prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
      "
      dangerouslySetInnerHTML={{ __html: html}}
    />
  );
};