import Link from "next/link";

export type TBlog = {
  title: string;
  slug: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  coverImage: string;
  updatedAt: string;
  createdAt: string;
  author: string;
  canonicalUrl?: string;
};

export function BlogCard({
  blog,
  blogRoute = false,
}: Readonly<{ blog: TBlog; blogRoute?: boolean }>) {
  const blogUrl =
    blog?.category?.slug.toLowerCase() === "general"
      ? `/travel-guide/${blog.slug}`
      : `/travel-guide/${blog.category?.slug.toLowerCase()}/${blog.slug}`;
  return (
    <Link
      href={blogRoute ? `/blog/${blog.slug}` : blog?.canonicalUrl ?? blogUrl}
      className="p-4 shadow-sm rounded-sm"
    >
      <div className="overflow-hidden rounded-sm">
        {blog.coverImage ? (
          <img src={blog?.coverImage} />
        ) : (
          <div className="w-full h-[280px] rounded-md bg-slate-50" />
        )}
      </div>
      <div>
        <div className="flex gap-1 justify-between py-2">
          {/* <Badge>{blog.category.name}</Badge> */}
          <span>
            {new Date(blog.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="font-bold text-lg">
          {blog?.title.length > 75
            ? blog.title?.substring(0, 75) + "..."
            : blog?.title}
        </p>
      </div>
    </Link>
  );
}
