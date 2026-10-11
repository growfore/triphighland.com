import Link from "next/link";
import type { BlogSummary } from "@/lib/site";
import Photo from "./photo";

// Blog card sized to the trip-card grid: 4:3 cover, category, title, standfirst.
export default function BlogCard({ blog }: { blog: BlogSummary }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="ht-card flex min-w-0 flex-col">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Photo src={blog.coverImage} alt="" sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" />
      </div>
      {blog.category?.categoryName && <div className="meta mt-5 text-[12px]">{blog.category.categoryName.trim()}</div>}
      <h3 className="display mt-2 text-lg sm:text-xl">{blog.title}</h3>
      {blog.metaDescription && <p className="standfirst mt-3 line-clamp-3">{blog.metaDescription}</p>}
    </Link>
  );
}
