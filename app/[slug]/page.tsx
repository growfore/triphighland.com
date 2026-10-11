import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getBlog, getInfoPage } from "@/lib/site";
import { imageUrl } from "@/lib/media";
import PageHeader from "@/components/site/page-header";
import Article from "@/components/site/article";

export const revalidate = 300;

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
      <Article html={page.content ?? ""} enquiry={false} />
    </main>
  );
}
