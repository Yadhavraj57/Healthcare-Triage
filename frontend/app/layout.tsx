import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TriageAI — Describe your symptoms. Get guided to the right care.",
  description:
    "AI-powered healthcare triage. Describe your symptoms in natural language and get an instant assessment, specialist recommendation, and appointment booking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC]`}>{children}</body>
    </html>
  );
}
