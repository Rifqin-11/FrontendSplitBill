import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://splitbill.rifqinaufal11.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Split Bill Online – Bagi Tagihan Otomatis dari Struk",
    template: "%s | Split Bill Online",
  },
  description:
    "Aplikasi split bill online untuk membagi tagihan restoran secara otomatis dari struk. Unggah struk, tetapkan item per orang, dan hitung pembagian biaya dengan mudah, cepat, dan adil.",
  keywords: [
    "split bill online",
    "bagi tagihan",
    "bagi tagihan restoran",
    "OCR struk",
    "pembagian tagihan otomatis",
    "scan struk",
    "aplikasi split bill",
    "bagi biaya makan",
  ],
  icons: { icon: "/favicon.png" },
  authors: [{ name: "Rifqi Naufal", url: "https://github.com/Rifqin-11" }],
  creator: "Rifqi Naufal",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: "index,follow",
  },
  openGraph: {
    title: "Split Bill Online – Bagi Tagihan Otomatis dari Struk",
    description:
      "Web app untuk membagi tagihan makanan dari struk: upload, assign item ke teman, dan hitung otomatis. Mudah, cepat, adil.",
    url: "/",
    siteName: "Split Bill Receipt",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Split Bill Receipt Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Split Bill Online – Bagi Tagihan Otomatis dari Struk",
    description:
      "Bagi tagihan otomatis dari struk dengan mudah. Unggah struk, pilih item per orang, hasil adil & transparan.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Toaster />
        {/* JSON-LD: WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Split Bill Online",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              url: SITE_URL,
              description:
                "Aplikasi split bill online untuk membagi tagihan restoran otomatis dari struk.",
              image: `${SITE_URL}/og-image.jpg`,
              author: { "@type": "Person", name: "Rifqi Naufal" },
              offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
            }),
          }}
        />
      </body>
    </html>
  );
}
