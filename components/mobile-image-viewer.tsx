"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { Lightbox } from "./lightbox";
import { blurDataURL } from "@/lib/imageutil";

export default function MobileImageViewer({
  images,
  keywords,
}: {
  images: string[];
  keywords: string[];
}) {
  const [imageIndex, setImageIndex] = useState(0);
  return (
    <div className="relative overflow-hidden object-cover">
      {/*{images.map((image, index) => {*/}
      <Lightbox imageAlts={keywords} images={images}>
        <figure>
          <Image
            src={images[imageIndex]}
            alt={keywords[imageIndex] || " "}
            title={keywords[imageIndex]}
            height={420}
            width={768}
            fetchPriority="high"
            loading="eager"
            placeholder="blur"
            blurDataURL={blurDataURL}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
            className="w-full h-full object-cover object-center"
          />
        </figure>
      </Lightbox>
      <div className=" flex justify-between gap-4 -mt-16 px-4 opacity-90">
        <Button
          aria-label="Previous Image"
          variant={"ghost"}
          className="absolute top-42 left-4 size-12 p-2 border rounded-full border-white text-white"
          disabled={imageIndex == 0}
          onClick={() => setImageIndex(imageIndex - 1)}
        >
          <ChevronLeft className="size-6" />
        </Button>
        <Button
          aria-label="Next image"
          variant={"ghost"}
          className="absolute top-42 right-4  size-12 p-2 border rounded-full border-white text-white"
          disabled={imageIndex == images.length - 1}
          onClick={() => setImageIndex(imageIndex + 1)}
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>
      {/*})}*/}
    </div>
  );
}
