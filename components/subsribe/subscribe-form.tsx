"use client";

import { useState } from "react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Add your subscribe logic here
  };

  return (
    <form className="flex flex-wrap   w-auto " onSubmit={handleSubscribe}>
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 min-w-0 px-6 py-3 rounded-l-lg border border-gray-300 focus:outline-none text-gray-900"
        disabled={submitted}
      />
      <button
        type="submit"
        className="w-36 bg-brand-700 hover:bg-brand-600 text-white font-medium py-3 px-6 rounded-r-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={submitted}
      >
        {submitted ? "Subscribed!" : "Subscribe"}
      </button>
    </form>
  );
}
