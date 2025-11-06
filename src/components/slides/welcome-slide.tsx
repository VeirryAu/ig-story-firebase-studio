"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const getImageUrl = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  return image ? image.imageUrl : "";
};

export function WelcomeSlide() {
  const imageUrl = getImageUrl("story1-slide1");

  return (
    <div className="relative w-full h-full">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="A beautiful mountain landscape"
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center p-8">
        <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Welcome to Stories</h2>
        <p className="text-lg drop-shadow-md">
          This is a custom React component slide.
        </p>
      </div>
    </div>
  );
}
