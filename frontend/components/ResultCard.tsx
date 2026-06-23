"use client";

import { TriageCondition } from "@/lib/api";

const PROBABILITY_WIDTH: Record<string, string> = {
  High: "w-full",
  Medium: "w-2/3",
  Low: "w-1/3",
};

const PROBABILITY_COLOR: Record<string, string> = {
  High: "bg-red-400",
  Medium: "bg-amber-400",
  Low: "bg-green-400",
};

interface Props {
  conditions: TriageCondition[];
}

export default function ResultCard({ conditions }: Props) {
  if (!conditions.length) return null;

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-4">Possible Conditions</h3>
      <div className="space-y-4">
        {conditions.map((c) => (
          <div key={c.name}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-gray-800">{c.name}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                c.probability === "High"
                  ? "bg-red-50 text-red-700"
                  : c.probability === "Medium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-green-50 text-green-700"
              }`}>
                {c.probability} probability
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${PROBABILITY_WIDTH[c.probability]} ${PROBABILITY_COLOR[c.probability]}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
