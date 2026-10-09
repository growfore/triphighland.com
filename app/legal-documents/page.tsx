import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site";
import { imageUrl } from "@/lib/media";
import PageHeader, { PageFooterContent } from "@/components/site/page-header";
import Photo from "@/components/site/photo";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  const h = (await getSiteConfig()).content.pageHeaders?.documents;
  return { title: h?.metaTitle || h?.title || "Documents", description: h?.metaDescription || undefined, alternates: { canonical: "/legal-documents" } };
}

export default async function DocumentsPage() {
  const config = await getSiteConfig();
  const docs = config.documents.filter((d) => d.published && d.path);
  return (
    <main>
      <PageHeader fields={config.content.pageHeaders?.documents} title="Documents" />
      <section className="wrap py-12 lg:py-20">
        {docs.length === 0 ? (
          <p className="standfirst py-12 text-center">—</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((d) => (
              <a key={d.key} href={imageUrl(d.path)} target="_blank" rel="noopener noreferrer" className="ht-card">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] border border-line bg-white">
                  {/\.pdf$/i.test(d.path) ? (
                    <span className="meta absolute inset-0 flex items-center justify-center text-ink-muted">PDF</span>
                  ) : (
                    <Photo src={d.path} alt={d.title} sizes="(min-width: 1024px) 30vw, 100vw" className="!object-contain p-4" />
                  )}
                </div>
                <h2 className="display mt-4 text-base">{d.title}</h2>
              </a>
            ))}
          </div>
        )}
      </section>
      <PageFooterContent fields={config.content.pageHeaders?.documents} />
    </main>
  );
}
