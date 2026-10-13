import type { Metadata } from "next";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlog, getSiteConfig } from "@/lib/site";
import JsonLd from "@/components/site/json-ld";
import { absolute, absoluteMedia, breadcrumbLd, siteUrl } from "@/lib/seo";
import { imageUrl, readingTime } from "@/lib/media";
import PageHeader from "@/components/site/page-header";
import Article from "@/components/site/article";

export const revalidate = 300;

// Render each slug on first request, then serve it from cache (ISR).
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlog((await params).slug);
  if (!blog) return {};
  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || undefined,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: { type: "article", images: blog.coverImage ? [{ url: imageUrl(blog.coverImage) }] : undefined },
  };
}

export default async function BlogPost({ params }: Props) {
  const [blog, config] = await Promise.all([getBlog((await params).slug), getSiteConfig()]);
  if (!blog) notFound();
  const author = blog.writer?.name || blog.author?.name;
  const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined;

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title,
            description: blog.metaDescription || undefined,
            image: absoluteMedia(config, blog.coverImage),
            datePublished: blog.publishedAt || undefined,
            author: author ? { "@type": "Person", name: author } : undefined,
            publisher: { "@id": `${siteUrl(config)}/#organization` },
            mainEntityOfPage: absolute(config, `/blog/${blog.slug}`),
          },
          breadcrumbLd(config, [
            { name: "Home", path: "/" },
            { name: "Journal", path: "/blog" },
            { name: blog.title, path: `/blog/${blog.slug}` },
          ]),
        ]}
      />
      <PageHeader
        eyebrow={[blog.category?.categoryName?.trim(), `${readingTime(blog.content)} min read`].filter(Boolean).join(" · ")}
        title={blog.title}
        standfirst={blog.metaDescription || undefined}
        image={blog.coverImage}
      >
        {(author || date) && (
          <p className="mt-8 text-[14px] text-night-muted">{[author && `By ${author}`, date].filter(Boolean).join(" · ")}</p>
        )}
      </PageHeader>
      <Article
        html={blog.content}
        toc
        aside={
          <Link href="/blog" className="inline-flex items-center gap-2 font-medium underline-offset-[6px] hover:underline">
            <ArrowLeftIcon size={16} strokeWidth={1.8} /> All stories
          </Link>
        }
      />
    </main>
  );
}
