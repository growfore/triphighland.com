import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type SectionTemplateProps = {
  badgeText?: ReactNode;
  title: ReactNode;
  text: ReactNode;
  buttonLink?: string;
  buttonText?: string;
  children: ReactNode;
  className?: string;
};
export default function SectionTemplate({
  badgeText,
  title,
  text,
  buttonLink,
  buttonText = "Explore More",
  children,
  className,
}: SectionTemplateProps) {
  return (
    <section className={cn("py-16 px-4", className)}>
      <div className="max-w-7xl flex flex-col md:flex-row  justify-between container mx-auto">
        <div>
          <div className="mb-12">
            <div className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
              {badgeText}
            </div>
            <h2 className="text-3xl uppercase font-bold text-foreground mb-6 leading-tight text-balance">
              {title}
            </h2>
            <div className="text-md tracking-wider text-muted-foreground mb-4 leading-relaxed max-w-3xl">
              {text}
            </div>
          </div>
        </div>

        {buttonText && buttonLink && (
          <div className="text-center">
            <Link
              href={buttonLink!}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              {buttonText}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
      <div className="mx-auto container space-y-4 flex flex-col gap-4">
        {children}
      </div>
    </section>
  );
}
