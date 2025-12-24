import { Suspense } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ContactForm } from "./contact-form";
import Loader from "@/components/ui/loader";

export const metadata = {
  title: "Contact Us | Bunhub Burger",
  description: "Get in touch with our team for inquiries, feedback, or support",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 pt-28 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
          <div className="space-y-6">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="font-medium">Address</h3>
                <p className="text-muted-foreground">
10 Stephenson Place, Chesterfield, Chesterfield, S40 1XL
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="font-medium">Phone</h3>
                <p className="text-muted-foreground">01246461825</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">burger@bunhub.net</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
              <div className="ml-4">
                <h3 className="font-medium">Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 11:00 AM - 10:00 PM
                  <br />
                  Saturday - Sunday: 10:00 AM - 11:00 PM
                </p>
              </div>
            </div>
          </div>
          <div className="relative h-96 bg-muted rounded-lg overflow-hidden mt-8">
            {/* This would be a Google Map in a real application */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">
                Interactive Map Would Be Here
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <div className="bg-card border rounded-lg p-6">
            <Suspense fallback={<Loader />}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
      <Separator className="mb-16" />
    </div>
  );
}
