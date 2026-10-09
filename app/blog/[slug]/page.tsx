import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlog } from "@/lib/site";
import { imageUrl, readingTime } from "@/lib/media";
import PageHeader from "@/components/site/page-header";
import Article from "@/components/site/article";

export const revalidate = 300;

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
  const blog = await getBlog((await params).slug);
  if (!blog) notFound();
  const author = blog.writer?.name || blog.author?.name;
  const date = blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined;

  return (
    <main>
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
          <Link href="/blog" className="font-medium underline-offset-[6px] hover:underline">
            ← All stories
          </Link>
        }
      />
    </main>
  );
}
