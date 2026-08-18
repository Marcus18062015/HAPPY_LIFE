"use client";

import { useState } from "react";
import Image from "next/image";

export default function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl brand-gradient text-white/80 sm:h-96">
        Aucune photo pour le moment
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-96">
        <Image
          src={photos[active]}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 700px, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((p, i) => (
            <button
              key={p}
              onClick={() => setActive(i)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                i === active ? "ring-brand-teal" : "ring-transparent opacity-80"
              }`}
            >
              <Image src={p} alt={`${alt} ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
