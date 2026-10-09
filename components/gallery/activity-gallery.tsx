"use client";

import Image from "next/image";
import { useState } from "react";
import { GallerySlider } from "./gallery-slider";
import { LucideImage } from "lucide-react";
import { Button } from "../ui/button";

export default function ActivityGallery({
  images,
  activityName
}: Readonly<{ images: string[], activityName: string }>) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  return (
    <>
      <div
        className="grid gap-4 grid-cols-3 relative"
        onClick={() => {
          setIsGalleryOpen(true);
        }}
      >
        {/* Left large image */}
        <div className="col-span-3 md:col-span-2 row-span-2">
          {images[0] && (
            <Image
              height={400}
              width={400}
              src={images[0]}
              alt={activityName + "Large Image"}
              className="w-full max-w-4xl h-full object-cover rounded-lg"
            />
          )}
        </div>

        {/* Right top image */}
        {images[1] && (
          <div className="hidden md:block">
            <Image
              height={200}
              width={200}
              src={images[1]}
              alt={activityName + "Small Top"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        {/* Right bottom image */}
        {images[2] && (
          <div className="hidden md:block">
            <Image
              height={200}
              width={200}
              src={images[2]}
              alt={activityName + "Small Bottom"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
        {images.length > 2 && (
          <Button className="absolute bottom-2 right-2" variant={"secondary"}>
            <LucideImage /> + {images.length - 2}
          </Button>
        )}
      </div>
      <GallerySlider
      activityName={activityName}
        images={images}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />
    </>
  );
}
