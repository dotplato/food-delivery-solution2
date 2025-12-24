"use client";

import { useEffect } from "react";

export default function MenuPage() {
  useEffect(() => {
    // Check if script already exists - if it does, skip loading
    if (document.getElementById("flipdish-script")) {
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
    
    document.head.appendChild(script);
  }, []);

  return (
    <div className="pt-16 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        <div id="flipdish-menu" data-offset="0" data-restaurant="br12881"></div>
      </div>
    </div>
  );
}
