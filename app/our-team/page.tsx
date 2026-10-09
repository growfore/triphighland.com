import type { Metadata } from "next";
import { getSiteConfig, getTeam } from "@/lib/site";
import PageHeader, { PageFooterContent } from "@/components/site/page-header";
import Photo from "@/components/site/photo";
import { UserIcon } from "@/components/site/icons";

export const revalidate = 300;
export async function generateMetadata(): Promise<Metadata> {
  const h = (await getSiteConfig()).content.pageHeaders?.ourTeam;
  return { title: h?.metaTitle || h?.title || "Our team", description: h?.metaDescription || undefined, alternates: { canonical: "/our-team" } };
}

export default async function TeamPage() {
  const [config, groups] = await Promise.all([getSiteConfig(), getTeam()]);
  const header = config.content.pageHeaders?.ourTeam;
  return (
    <main>
      <PageHeader
        fields={header}
        title="Our team"
      />
      <section className="wrap py-12 lg:py-20">
        {groups.map((g) => (
          <div key={g.department || "team"} className="mb-16 last:mb-0">
            {g.department && <h2 className="h-sub mb-10">{g.department}</h2>}
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {g.members.map((m) => (
                <article key={m.id}>
                  <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[4px] bg-stone text-ink-muted">
                    {m.image ? <Photo src={m.image} alt={m.name} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" /> : <UserIcon size={56} strokeWidth={1.2} />}
                  </div>
                  <h3 className="display mt-5 text-lg">{m.name}</h3>
                  {m.designation && <div className="meta mt-1.5 text-[12px] text-ink-muted">{m.designation}</div>}
                  {m.about && m.about !== m.designation && <p className="mt-3 font-light text-ink-soft">{m.about}</p>}
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
      <PageFooterContent fields={header} />
    </main>
  );
}
