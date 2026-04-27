import localFont from "next/font/local";
import "./globals.css";

const bebasNeue = localFont({
  src: "../../public/fonts/BebasNeue-Regular.woff2",
  variable: "--font-bebas",
  display: "swap",
});

const barlow = localFont({
  src: [
    { path: "../../public/fonts/Barlow-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Barlow-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = localFont({
  src: [
    { path: "../../public/fonts/BarlowCondensed-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/BarlowCondensed-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const lora = localFont({
  src: "../../public/fonts/Lora-Regular.woff2",
  variable: "--font-lora",
  display: "swap",
});

const abuget = localFont({
  src: "../../public/fonts/Abuget.woff2",
  variable: "--font-abuget",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${barlow.variable} ${barlowCondensed.variable} ${lora.variable} ${abuget.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
