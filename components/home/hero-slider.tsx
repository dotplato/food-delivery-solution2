"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

const slides = [
  {
    image: "/images/1recreated.jpg",
    title: "Juicy Burgers",
  },
  {
    image: "/images/2recreated.jpg",
    title: "New Specials",
  },
  {
    image: "/images/christmasbanner.jpg",
    title: "Complete Your Meal",
  },
  {
    image: "/images/3 banner.png",
    title: "Delicious Food",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      nextSlide();
    }

    if (distance < -minSwipeDistance) {
      setCurrent((c) => (c - 1 + slides.length) % slides.length);
    }
  };

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((p) => (p + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    const i = setInterval(nextSlide, 8000);
    return () => clearInterval(i);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gray-100 z-10 pt-14 sm:pt-16">
      <div
        className="relative w-full"
        style={{ aspectRatio: "1024 / 326" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {" "}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              current === index ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover "
              sizes="100vw"
            />
          </div>
        ))}
        {/* Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrent((c) => (c - 1 + slides.length) % slides.length)
          }
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full"
        >
          <ChevronRight />
        </Button>
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                current === i ? "w-6 bg-white" : "w-2 bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
