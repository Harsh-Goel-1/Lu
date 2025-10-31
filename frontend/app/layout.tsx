import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aptos Crowdfund",
  description: "Decentralized crowdfunding on Aptos blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen antialiased`}>
        <WalletProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </main>
            <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
              <p>© 2024 Aptos Crowdfund. Built with Move & Next.js</p>
            </footer>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}