import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { caveat } from "@/lib/font";

export default function Hero() {
  return (
    <section
      className={`relative h-screen bg-linear-to-b from-primary/30 to-primary/10
        flex flex-col justify-center items-center p-12 text-center uppercase
        gap-8 -mt-24 `}
    >
      <div
        className="absolute inset-0 op"
        style={{
          zIndex: -1,
          backgroundImage: "url(/hero-image.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="container mx-auto flex flex-col items-center justify-center space-y-4 mt-16">
        <h1
          className={cn(
            "font-bold text-4xl  text-white z-9 leading-16 max-w-xl ",
          )}
        >
          Gateway to Extraordinary Himalayan Journeys
        </h1>
        <p
          className={cn(
            "text-2xl md:text-3xl normal-case mb-10 font-medium text-shadow-orange-500 text-balance leading-relaxed text-white max-w-4xl",
            caveat.className,
          )}
        >
          Crafting rare, personalized mountain experiences that go beyond the
          trail curated with passion for those who seek the extraordinary
        </p>
        <div
          id="btn-group"
          className="flex gap-4 flex-wrap max-w-6xl justify-center md:justify-start items-center"
        >
          <Link href="/explore">
            <Button variant={"secondary"} className="uppercase">
              Explore Our Trips
            </Button>
          </Link>
          <Link href="/design-your-trip">
            <Button className="uppercase">Design your trip</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
