"use client";

import { UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const SPECIALIST_ICONS: Record<string, string> = {
  Neurologist: "🧠",
  Cardiologist: "❤️",
  Orthopedist: "🦴",
  Dermatologist: "🩹",
  Gastroenterologist: "🫁",
  Pulmonologist: "🫁",
  Endocrinologist: "⚗️",
  Psychiatrist: "🧘",
  Ophthalmologist: "👁️",
  ENT: "👂",
  "General Practitioner": "🩺",
  "Emergency Medicine": "🚨",
};

interface Props {
  specialist: string;
  sessionId?: string;
}

export default function SpecialistCard({ specialist, sessionId }: Props) {
  const icon = SPECIALIST_ICONS[specialist] || "🏥";

  return (
    <div className="card border-[#0D7377] border-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-[#0D7377] uppercase tracking-widest mb-2">
            Recommended Specialist
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <h3 className="font-display text-2xl font-bold text-gray-900">{specialist}</h3>
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Based on your symptom profile, this specialist is best equipped to evaluate and treat your condition.
          </p>
        </div>
        <UserCheck className="text-[#0D7377] shrink-0" size={32} />
      </div>

      <Link
        href={`/booking${sessionId ? `?session=${sessionId}&specialist=${encodeURIComponent(specialist)}` : `?specialist=${encodeURIComponent(specialist)}`}`}
        className="btn-primary flex items-center justify-center gap-2 mt-5 w-full text-center"
      >
        Book Appointment <ArrowRight size={16} />
      </Link>
    </div>
  );
}
