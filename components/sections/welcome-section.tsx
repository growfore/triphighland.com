import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

export default function WelcomeSection() {
  return (
    <section className="md:min-h-[70vh] py-12 px-2 md:px-8 bg-secondary flex justify-center items-center">
      <div className=" flex flex-col md:flex-row gap-8 justify-center items-center">
        <Image
          src="/gobinda-subedi-trekking-guide.jpeg"
          alt="Gobinda Subedi"
          width={1280}
          height={720}
          className="size-100 rounded-3xl object-cover object-bottom"
        />
        <div className="max-w-xl p-4">
          <h2 className="font-bold  text-xl uppercase mb-6 leading-tight text-balance">
            Meet your Expert
          </h2>
          <p className="mb-4 leading-loose max-w-3xl tracking-wider">
            Gobinda doesn’t just lead treks; he shares the mountains he’s called
            home his entire life. With a deep respect for the terrain and a
            commitment to safety that never cuts corners, Gobinda ensures every
            traveler feels as secure as they are inspired.
          </p>
          <Link href="/about-us">
            <Button>Know more</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
