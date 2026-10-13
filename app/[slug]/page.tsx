import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getBlog, getInfoPage } from "@/lib/site";
import { imageUrl } from "@/lib/media";
import PageHeader from "@/components/site/page-header";
import Article from "@/components/site/article";
import PlanTripCard from "@/components/site/plan-trip-card";

export const revalidate = 300;

// Render each slug on first request, then serve it from cache (ISR).
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

// Info pages (about-us, terms-and-conditions, gear-rental, ...) live at the
// root, as TripEleven's footer links them. Old root-level blog URLs redirect.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getInfoPage((await params).slug);
  if (!page) return {};
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { images: page.coverImage ? [{ url: imageUrl(page.coverImage) }] : undefined },
  };
}

export default async function InfoPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = await getInfoPage(slug);
  if (!page) {
    if (await getBlog(slug)) permanentRedirect(`/blog/${slug}`);
    notFound();
  }
  return (
    <main>
      <PageHeader title={page.title} standfirst={page.metaDescription || undefined} image={page.coverImage || undefined} />
      {/* Contents then the planning card in the sidebar; legal pages included. */}
      <Article html={page.content ?? ""} enquiry={false} toc cta={<PlanTripCard image={page.coverImage} compact />} />
    </main>
  );
}
