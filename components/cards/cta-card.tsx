import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function CTACard() {
  return (
    <section className="relative w-full text-white overflow-hidden container mx-auto mt-4 md:mt-12 px-2">
      <div className="relative rounded-xl bg-primary p-4 sm:p-8 md:p-12 flex flex-col md:flex-row w-full gap-8 md:gap-12 items-start md:items-center justify-between overflow-hidden">
        {/* Left Content */}
        <div className="relative z-10 space-y-6 flex-1 max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Experience the Summit of Luxury
            </h2>
            <p className="text-base md:text-lg leading-relaxed">
              Connect with the mountains, the culture, and the spirit of
              adventure. Our experiences are meticulously designed to move you
              from the planning stage to the trail effortlessly. From navigating
              complex permits to providing world-class guides and logistics, we
              ensure your Himalayan journey is seamless, secure, and entirely
              unforgettable.
            </p>
          </div>

          <Link href={"/contact"}>
            <Button
              type="button"
              variant={"secondary"}
              className="h-12 text-black font-semibold px-8 shrink-0"
            >
              Consult Now
            </Button>
          </Link>
        </div>

        {/* Right Image Layer */}
        <div className="absolute inset-0 md:left-1/2">
          <Image
            src="/cta-image-1.jpeg"
            alt="Ghandruk Nepal"
            fill
            className="object-cover"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-l from-transparent via-primary/40 to-primary" />
        </div>
      </div>
    </section>
  );
}
