"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GallerySliderProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  activityName: string;
}

export function GallerySlider({
  images,
  isOpen,
  onClose,
  activityName,
}: GallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isOpen]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 left-4 md:top-8 md:left-8 z-10 bg-transparent border-2 border-primary rounded-full p-2 md:p-3 hover:bg-blue-500/10 transition-colors text-white"
        aria-label="Close gallery"
      >
        <X size={24} />
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 text-white text-sm md:text-base font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      <div className="relative w-full h-full flex items-center justify-center max-w-5xl">
        <img
          src={images[currentIndex]}
          alt={`${activityName} Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain"
        />

        <button
          onClick={handlePrevious}
          disabled={images.length <= 1}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-transparent border-2 border-blue-500 rounded-full p-2 md:p-3 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} className="md:w-8 md:h-8" />
        </button>

        <button
          onClick={handleNext}
          disabled={images.length <= 1}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-transparent border-2 border-blue-500 rounded-full p-2 md:p-3 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
          aria-label="Next image"
        >
          <ChevronRight size={24} className="md:w-8 md:h-8" />
        </button>
      </div>

      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
}
