import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Split Bill Receipt - Bagi Tagihan Otomatis dari Struk",
  description:
    "Aplikasi web pintar untuk membagi tagihan restoran secara otomatis dari struk belanja. Unggah struk, tetapkan item ke orang, dan hitung pembagian biaya dengan mudah dan adil.",
  keywords: [
    "split bill",
    "bagi tagihan",
    "OCR struk",
    "bagi biaya makan",
    "aplikasi struk restoran",
    "pembagian tagihan otomatis",
    "scan receipt split bill",
    "web split bill teman",
  ],
  authors: [{ name: "Rifqi Naufal", url: "https://github.com/Rifqin-11" }],
  creator: "Rifqi Naufal",
  metadataBase: new URL("https://splitbill.rifqinaufal11.studio/"),
  openGraph: {
    title: "Split Bill Receipt - Bagi Tagihan Otomatis dari Struk",
    description:
      "Web app yang memudahkan pembagian tagihan makanan dengan upload struk dan pembagian item per orang.",
    url: "https://splitbill.rifqinaufal11.studio/",
    siteName: "Split Bill Receipt",
    images: [
      {
        url: "https://splitbill.rifqinaufal11.studio/og-image.jpg",
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
    title: "Split Bill Receipt",
    description:
      "Bagi tagihan restoran secara otomatis hanya dengan upload struk belanja. Praktis, cepat, dan adil.",
    creator: "@rifqinaufal", // opsional, jika punya
    images: ["https://splitbill.rifqinaufal11.studio/og-image.jpg"],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
