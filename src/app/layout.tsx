import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

// Lora font (elegant serif similar to Teodor)
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Suntzu: Realestate AI Assistant",
  description: "Tu asistente de IA para encontrar la casa ideal con Suntzu Realestate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${lora.variable} antialiased`}
        style={{ fontFamily: 'var(--font-lora), serif' }}
      >
        {children}
      </body>
    </html>
  );
}
