import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Allo Inventory",
  description: "Reservation-first stock control for multi-warehouse retail",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.15 0.007 250)",
              border: "1px solid oklch(0.22 0.008 250)",
              color: "oklch(0.96 0.005 250)",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              borderRadius: "8px",
            },
          }}
        />
      </body>
    </html>
  );
}
