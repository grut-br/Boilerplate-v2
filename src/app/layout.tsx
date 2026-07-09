import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devio Master Boilerplate | Fundação de Alto Padrão",
  description: "A fundação definitiva para a criação de sites institucionais modernos, rápidos e otimizados para conversão.",
  keywords: ["boilerplate", "nextjs", "react", "tailwind", "framer-motion", "frontend"],
  authors: [{ name: "Devio" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-black">
        {children}
      </body>
    </html>
  );
}
