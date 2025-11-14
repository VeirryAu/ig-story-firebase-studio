"use client";

import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <span 
        className="w-2 h-2 bg-white rounded-full"
        style={{
          animation: 'loading-dots 1.4s ease-in-out infinite',
          animationDelay: '0ms'
        }}
      ></span>
      <span 
        className="w-2 h-2 bg-white rounded-full"
        style={{
          animation: 'loading-dots 1.4s ease-in-out infinite',
          animationDelay: '200ms'
        }}
      ></span>
      <span 
        className="w-2 h-2 bg-white rounded-full"
        style={{
          animation: 'loading-dots 1.4s ease-in-out infinite',
          animationDelay: '400ms'
        }}
      ></span>
    </div>
  );
}
