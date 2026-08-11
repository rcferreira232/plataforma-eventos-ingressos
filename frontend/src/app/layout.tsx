import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeuIngresso",
  description:
    "Plataforma de eventos e ingressos para clientes, organizadores e portaria",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang='pt-BR'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='min-h-full bg-slate-950 text-slate-100'>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
