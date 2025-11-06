"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const getImageUrl = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  return image ? image.imageUrl : "";
};

export function CityNightSlide() {
  const imageUrl = getImageUrl("story2-slide1");

  return (
    <div className="relative w-full h-full">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Bustling city street at night"
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/30 flex items-end justify-start text-white p-8">
        <h2 className="text-3xl font-bold drop-shadow-lg">City Lights</h2>
      </div>
    </div>
  );
}
