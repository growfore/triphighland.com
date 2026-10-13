import Image from "next/image";
import { imageUrl, isApiMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  position?: string;
  /** Serve the upload byte-for-byte instead of re-encoding it (hero imagery). */
  original?: boolean;
};

// Fills its (positioned) parent. Missing media renders a stone panel rather
// than a broken image, since tenant content is often incomplete.
export default function Photo({ src, alt, sizes, className, priority, position, original }: Props) {
  const url = imageUrl(src);
  if (!url) {
    return <div aria-hidden="true" className={cn("absolute inset-0 bg-stone", className)} />;
  }
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={90}
      // Tenants may paste images from any host; only API media is optimised.
      unoptimized={original || !isApiMedia(url)}
      className={cn("object-cover", className)}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}
