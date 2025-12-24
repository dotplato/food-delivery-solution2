export const dynamic = "force-dynamic";

import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap', // optional, helps with font loading behavior
  variable: '--font-poppins', // optional, for use with CSS variables
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], // specify desired weights or a range
});
export const metadata: Metadata = {
  title: "Bunhub Burger",
  description:
    "Order delicious burgers, sides, and drinks for delivery or pickup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <body className={poppins.className}>
            <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
