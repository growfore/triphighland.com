import { apiFetch } from "@/lib/api";
import { BlogCard, TBlog } from "../cards/blog-card";
import SectionTemplate from "../templates/section-template";

export default async function RecentBlogs() {
  const response = await apiFetch(`/blogs/published?page=1&limit=3`,
  );
  const blogs = await response.json();
  const recentBlogs = blogs?.blogs;

  return (
    <>
      <SectionTemplate
        badgeText={<p>Our Recent Blogs</p>}
        title={<p>Stories, Guides & Himalayan Insights</p>}
        buttonLink="/blogs"
        buttonText="See More"
        text={
          <p>
            Explore our latest articles covering trekking guides, travel tips,
            cultural insights, and stories from the Himalayas. Written by locals
            and experts to help you travel better and deeper.
          </p>
        }
      >
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {recentBlogs?.map((blog: TBlog) => {
            return <BlogCard key={blog.slug} blog={blog} />;
          })}
        </div>
      </SectionTemplate>
    </>
  );
}
