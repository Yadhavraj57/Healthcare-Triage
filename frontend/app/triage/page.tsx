import SymptomForm from "@/components/SymptomForm";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function TriagePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Activity className="text-[#0D7377]" size={22} />
            <span className="font-display text-lg font-semibold text-[#0D7377]">TriageAI</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
            How are you feeling?
          </h1>
          <p className="text-gray-500 text-lg">
            Describe your symptoms below and our AI will guide you to the right care.
          </p>
        </div>

        <SymptomForm />
      </div>
    </main>
  );
}
