"use client";

export default function ScrollControls() {
  const scroll = (dir: "left" | "right") => {
    const el = document.getElementById("latest-trips-scroll");
    if (!el) return;

    el.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <>
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20
          bg-black/60 text-white px-3 py-2 rounded-full"
      >
        ←
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20
          bg-black/60 text-white px-3 py-2 rounded-full"
      >
        →
      </button>
    </>
  );
}
