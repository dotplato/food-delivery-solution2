"use client";

import { useEffect, useState } from "react";

export default function MenuPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Profile/Menu page mounted");

    // Check if script already exists
    const existingScript = document.getElementById("flipdish-script");
    if (existingScript) {
      console.log("Flipdish script already exists");
      setScriptLoaded(true);
      return;
    }

    // Load Flipdish script
    const script = document.createElement("script");
    script.id = "flipdish-script";
    script.type = "text/javascript";
    script.charset = "UTF-8";
    script.src =
      "https://web-order.flipdish.co/client/productionwlbuild/latest/static/js/main.js";
    script.async = true;

    script.onload = () => {
      console.log("Flipdish script loaded successfully");
      setScriptLoaded(true);
    };

    script.onerror = (e) => {
      console.error("Failed to load Flipdish script", e);
      setError("Failed to load menu. Please refresh the page.");
    };

    document.body.appendChild(script);
    console.log("Flipdish script added to body");

    // Don't cleanup script on unmount - let it persist for navigation
  }, []);

  return (
    <div className="pt-16 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div id="flipdish-menu" data-offset="0" data-restaurant="br12881"></div>

        {!scriptLoaded && !error && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-lg">Loading menu...</p>
          </div>
        )}
      </div>
    </div>
  );
}
