"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import ResultCard from "@/components/ResultCard";
import SpecialistCard from "@/components/SpecialistCard";
import { Activity, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

const URGENCY_CONFIG = {
  Emergency: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-800",
    badge: "bg-red-500 text-white",
    icon: <Zap size={20} />,
    label: "Emergency — Seek immediate care",
  },
  Urgent: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    text: "text-orange-800",
    badge: "bg-orange-500 text-white",
    icon: <AlertTriangle size={20} />,
    label: "Urgent — See a doctor today",
  },
  "Semi-urgent": {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-800",
    badge: "bg-yellow-500 text-white",
    icon: <AlertTriangle size={20} />,
    label: "Semi-Urgent — Book within 48 hours",
  },
  "Non-urgent": {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-800",
    badge: "bg-green-500 text-white",
    icon: <ShieldCheck size={20} />,
    label: "Non-Urgent — Schedule when convenient",
  },
};

export default function ResultsPage() {
  const { triageResult } = useAppStore();
  const router = useRouter();
  const [showFullReport, setShowFullReport] = useState(false);

  useEffect(() => {
    if (!triageResult) router.replace("/triage");
  }, [triageResult, router]);

  if (!triageResult) return null;

  const urgency = URGENCY_CONFIG[triageResult.urgency_level] ?? URGENCY_CONFIG["Semi-urgent"];

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Activity className="text-[#0D7377]" size={22} />
            <span className="font-display text-lg font-semibold text-[#0D7377]">TriageAI</span>
          </Link>
          <Link href="/triage" className="btn-secondary text-sm py-2 px-4">
            New Triage
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Your Triage Report</h1>
          <p className="text-gray-500">Session ID: <span className="font-mono text-sm">{triageResult.session_id}</span></p>
        </div>

        {/* Urgency Banner */}
        <div className={`rounded-2xl border-2 p-6 flex items-center gap-4 ${urgency.bg} ${urgency.border}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${urgency.badge}`}>
            {urgency.icon}
          </div>
          <div>
            <div className={`font-bold text-lg ${urgency.text}`}>{urgency.label}</div>
            <div className={`text-sm ${urgency.text} opacity-80`}>
              Urgency level: <strong>{triageResult.urgency_level}</strong>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        {triageResult.red_flags.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-red-600" size={18} />
              <h3 className="font-semibold text-red-800">Red Flag Symptoms Detected</h3>
            </div>
            <ul className="space-y-1">
              {triageResult.red_flags.map((flag) => (
                <li key={flag} className="text-red-700 text-sm flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Conditions */}
          <ResultCard conditions={triageResult.conditions} />

          {/* Self Care */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Self-Care Tips</h3>
            {triageResult.self_care.length > 0 ? (
              <ul className="space-y-2">
                {triageResult.self_care.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-[#2A9D8F] rounded-full shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No specific self-care recommendations.</p>
            )}
          </div>
        </div>

        {/* Specialist */}
        <SpecialistCard
          specialist={triageResult.specialist}
          sessionId={triageResult.session_id}
        />

        {/* Emergency Advice */}
        {triageResult.emergency_advice && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <div>
              <div className="font-semibold text-red-800 mb-1 text-sm">When to go to the Emergency Room</div>
              <p className="text-red-700 text-sm">{triageResult.emergency_advice}</p>
            </div>
          </div>
        )}

        {/* Full Report */}
        <div className="card">
          <button
            onClick={() => setShowFullReport(!showFullReport)}
            className="flex items-center justify-between w-full"
          >
            <h3 className="font-semibold text-gray-900">Full Triage Report</h3>
            {showFullReport ? (
              <ChevronUp className="text-gray-400" size={20} />
            ) : (
              <ChevronDown className="text-gray-400" size={20} />
            )}
          </button>

          {showFullReport && (
            <div className="mt-5 pt-5 border-t border-gray-100 prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-600 prose-li:text-gray-600">
              <ReactMarkdown>{triageResult.report_markdown}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-start gap-3">
          <ShieldCheck className="text-gray-400 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-gray-500">
            This report is for informational purposes only and does not constitute medical advice.
            Always consult a qualified healthcare professional for diagnosis and treatment.
            In case of emergency, call your local emergency services immediately.
          </p>
        </div>
      </div>
    </main>
  );
}
