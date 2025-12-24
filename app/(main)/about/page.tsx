import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us | Bunhub Burger",
  description: "Learn about our story, values, and commitment to quality food",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Bunhub Burger</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Crafting delicious, memorable burger experiences since 2010
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              Bunhub Burger began with a simple mission: to create the perfect
              burger. Founded in 2010 by burger enthusiasts John and Sarah
              Miller, we started as a small food truck serving handcrafted
              burgers with fresh, locally-sourced ingredients.
            </p>
            <p className="text-muted-foreground mb-4">
              As word spread about our delicious creations, we quickly gained a
              loyal following. In 2015, we opened our first brick-and-mortar
              restaurant, and we've been growing ever since, but our commitment
              to quality has never wavered.
            </p>
            <p className="text-muted-foreground">
              Today, Bunhub Burger is known for creative recipes, premium
              ingredients, and an unwavering dedication to customer
              satisfaction. Every burger we serve is crafted with the same
              passion and attention to detail that defined our humble
              beginnings.
            </p>
          </div>

          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src="https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg"
              alt="Bunhub Burger restaurant interior"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The core principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality First</h3>
              <p className="text-muted-foreground">
                We never compromise on the quality of our ingredients. From
                locally sourced beef to fresh produce, we believe the best
                ingredients make the best burgers.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair Value</h3>
              <p className="text-muted-foreground">
                We believe great food shouldn't break the bank. Our menu is
                designed to provide excellent value for money without
                compromising on quality or portion size.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                While we respect classic burger traditions, we're not afraid to
                innovate and experiment with new flavors, ingredients, and
                techniques to create unique taste experiences.
              </p>
            </div>
          </div>
        </div>

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

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Taste the Difference?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Experience our passion for great burgers today
          </p>
          <Button
            asChild
            size="lg"
            className="bg-brand-600 hover:bg-brand-700 rounded-full px-8"
          >
            <Link href="/menu">Browse Our Menu</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
