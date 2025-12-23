import { HeroSlider } from "@/components/home/hero-slider";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { DownloadAppSection } from "@/components/home/DownloadAppSection";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <HeroSlider />

      <div className="container mx-auto px-4">
        <section className="py-12 md:py-20">
          <div className="overflow-x-auto max-w-full">
            <CategoryCarousel />
          </div>
        </section>

        {/* How It Works – Images Only */}
        <section className="py-12 md:py-20 mb-28">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl overflow-hidden text-center">
              <Image
                src="/images/taste 1x1.png"
                alt="How it works step 1"
                width={2880}
                height={2880}
                className="w-full h-auto object-cover rounded-2xl"
                priority
              />
              <p className="mt-4 text-lg md:text-xl font-medium">
                Big burgers. Bold flavours. Zero compromises.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden text-center">
              <Image
                src="/images/gowing 1x1.png"
                alt="How it works step 2"
                width={2880}
                height={2880}
                className="w-full h-auto object-cover rounded-2xl"
              />
              <p className="mt-4 text-lg md:text-xl font-medium">
                Born in Chesterfield, built on pure flavour.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden text-center">
              {/* Third image – same layout, replace src when provided */}
              <Image
                src="/images/delivery 1x1.png"
                alt="How it works step 3"
                width={2880}
                height={2880}
                className="w-full h-auto object-cover rounded-2xl"
              />
              <p className="mt-4 text-lg md:text-xl font-medium">
                Fresh off the grill, fast to your door.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <DownloadAppSection />
        </section>
      </div>
    </div>
  );
}
