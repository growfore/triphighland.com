import Image from "next/image";
import { Lightbox } from "../lightbox";
import { Button } from "../ui/button";
import { LucideImages } from "lucide-react";
import MobileImageViewer from "../mobile-image-viewer";
import { blurDataURL } from "@/lib/imageutil";

export default function TrekHero({
  images,
  imageAlts,
}: {
  images: string[];
  imageAlts: string[];
}) {
  const mainImage = images[0];
  const otherImages = images.slice(1, 3);

  return (
    <div className="overflow-hidden">
      <div className="relative md:min-h-150">
        {images && images.length > 0 && (
          <>
            <div className="md:hidden">
              <MobileImageViewer images={images} keywords={imageAlts} />
            </div>
            <Lightbox images={images} imageAlts={imageAlts}>
              <div className="md:grid-cols-3 gap-5 container mx-auto max-h-150 overflow-hidden rounded-xl hidden md:grid">
                <div className="overflow-hidden col-span-2 rounded-xl object-center object-cover">
                  <Image
                    data-lightbox-index={0}
                    src={mainImage}
                    alt={imageAlts[0] || ""}
                    height={420}
                    width={768}
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                    className="w-full  h-full object-center rounded-xl object-cover overflow-hidden cursor-pointer"
                  />
                </div>
                <div className="col-span-1 hidden md:flex flex-col overflow-hidden max-h-150 rounded-xl">
                  {otherImages.map((imageUrl: string, index: number) => (
                    <div
                      key={imageUrl}
                      className="overflow-hidden object-center object-cover min-h-75 max-h-75 rounded-xl"
                    >
                      <Image
                        data-lightbox-index={index + 1}
                        alt={imageAlts[index + 1] || ""}
                        src={imageUrl}
                        height={420}
                        width={768}
                        placeholder="blur"
                        blurDataURL={blurDataURL}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        className="w-full h-full object-cover object-center rounded-xl cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute right-4 bottom-8 flex gap-2">
                  <Button aria-label="Click to open Lightbox for viewing images in fullscreen">
                    <LucideImages />
                    {images.length} Photos
                  </Button>
                </div>
              </div>
            </Lightbox>
          </>
        )}
      </div>
    </div>
  );
}
