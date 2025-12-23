"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubscribeForm } from "../subsribe/subscribe-form";

export function DownloadAppSection() {
  return (
    <div className="relative  rounded-3xl md:px-12 py-16 flex flex-wrap items-center justify-around  gap-10 shadow-xl min-h-[400px] bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-4 ">
      <div className="md:absolute md:top-[-100px]  max-md:mt-[-100px] left-[100px] ">
        <Image
          src="/images/iphone-mock.png"
          alt="App Preview"
          width={280}
          height={560}
          className="drop-shadow-2xl"
        />
      </div>

      {/* Right Section */}
      <div className="w-full md:pl-12 md:w-1/2 ml-auto text-center md:text-left z-10">
        <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
          Our Mobile App is Coming Soon
        </h2>
        <p className="mb-6 text-gray-200 text-base md:text-lg">
          Be the first to know when we launch! Enter your email below to
          subscribe for updates and early access.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto md:mx-0">
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}
