import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MeuIngresso",
  description:
    "Plataforma de eventos e ingressos para clientes, organizadores e portaria",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#12152b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang='pt-BR'
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className='min-h-full bg-slate-950 text-slate-100'>
        <SiteHeader />
        <QueryProvider>{children}</QueryProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
