import type { Metadata } from "next";
import Link from "next/link";
import { getBlogs, getSiteConfig } from "@/lib/site";
import PageHeader, { PageFooterContent } from "@/components/site/page-header";
import BlogCard from "@/components/site/blog-card";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const h = (await getSiteConfig()).content.pageHeaders?.blog;
  return { title: h?.metaTitle || "Journal", description: h?.metaDescription || undefined, alternates: { canonical: "/blog" } };
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [config, all] = await Promise.all([getSiteConfig(), getBlogs(100)]);
  const header = config.content.pageHeaders?.blog;
  const categories = [...new Map(all.filter((b) => b.category?.categoryHandle).map((b) => [b.category!.categoryHandle!, b.category!.categoryName!.trim()])).entries()];
  const blogs = category ? all.filter((b) => b.category?.categoryHandle === category) : all;

  return (
    <main>
      <PageHeader
        fields={header}
        title={config.content.sections?.blog?.title || "Journal"}
        standfirst={config.content.sections?.blog?.description}
      />
      <section className="wrap py-12 lg:py-20">
        {categories.length > 1 && (
          <div role="group" aria-label="Category" className="mb-12 flex flex-wrap gap-2">
            <Link href="/blog" className="chip" aria-pressed={!category}>All stories</Link>
            {categories.map(([handle, name]) => (
              <Link key={handle} href={`/blog?category=${handle}`} className="chip" aria-pressed={category === handle}>
                {name}
              </Link>
            ))}
          </div>
        )}
        {blogs.length === 0 ? (
          <p className="standfirst py-20 text-center">—</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {blogs.map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        )}
      </section>
      <PageFooterContent fields={header} />
    </main>
  );
}
