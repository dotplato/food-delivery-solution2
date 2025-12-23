import { ArrowRight } from "lucide-react";

export function BlogSection() {
  const blogs = [
    {
      id: 1,
      title: "5 Must-Try Burgers This Summer",
      excerpt:
        "Discover our chef's top picks for the juiciest, most flavorful burgers you can't miss this season.",
      image:
        "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
      date: "June 10, 2024",
      link: "/blogs/5-must-try-burgers",
    },
    {
      id: 2,
      title: "How We Source Our Ingredients",
      excerpt:
        "A behind-the-scenes look at our commitment to fresh, local, and sustainable ingredients.",
      image:
        "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg",
      date: "May 28, 2024",
      link: "/blogs/sourcing-ingredients",
    },
    {
      id: 3,
      title: "The Secret to Our Signature Sauces",
      excerpt:
        "Learn what makes our sauces stand out and how you can try them at home.",
      image:
        "https://images.pexels.com/photos/3739659/pexels-photo-3739659.jpeg",
      date: "May 15, 2024",
      link: "/blogs/signature-sauces",
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Latest Blog Posts</h2>
        <a
          href="/blogs"
          className="text-red-600 font-semibold hover:underline text-sm"
        >
          VIEW ALL
        </a>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {blogs.map((blog) => (
          <a
            key={blog.id}
            href={blog.link}
            className="block rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition relative group h-72"
          >
            <img
              src={blog.image}
              alt={blog.title}
              className="object-cover w-full h-full absolute inset-0 z-0 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 z-20 p-5 flex flex-col gap-2">
              <h3 className="font-bold text-lg text-white mb-1 drop-shadow-lg">
                {blog.title}
              </h3>
              <span className="inline-flex items-center text-sm text-yellow-200 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
