"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { triageApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";

const AGENT_STEPS = [
  "Extracting symptoms...",
  "Analyzing conditions...",
  "Matching specialist...",
  "Preparing your report...",
];

const URGENCY_EXAMPLES = [
  "I have had a severe headache for 3 days with blurry vision",
  "My knee has been swollen and painful after a fall yesterday",
  "I've been feeling exhausted for weeks with unexplained weight loss",
];

export default function SymptomForm() {
  const router = useRouter();
  const { triageInput, setTriageInput, setTriageResult } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [showOptional, setShowOptional] = useState(false);
  const [error, setError] = useState("");

  const charCount = triageInput.symptoms.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (charCount < 10) {
      setError("Please describe your symptoms in at least 10 characters.");
      return;
    }

    setError("");
    setLoading(true);
    setAgentStep(0);

    // Simulate step progression while waiting
    const stepTimer = setInterval(() => {
      setAgentStep((s) => (s < AGENT_STEPS.length - 1 ? s + 1 : s));
    }, 4000);

    try {
      const { data } = await triageApi.submit({
        symptoms: triageInput.symptoms,
        age: triageInput.age ? parseInt(triageInput.age) : undefined,
        gender: triageInput.gender || undefined,
        existing_conditions: triageInput.existing_conditions
          ? triageInput.existing_conditions.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        medications: triageInput.medications
          ? triageInput.medications.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      });
      setTriageResult(data);
      router.push("/results");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="card max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Activity className="text-[#0D7377] animate-pulse" size={32} />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-3">
          Analyzing your symptoms
        </h2>
        <p className="text-gray-500 mb-10">Our AI agents are working together to assess your situation.</p>

        <div className="space-y-3 max-w-xs mx-auto">
          {AGENT_STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                i === agentStep
                  ? "bg-teal-50 border border-teal-200 text-[#0D7377] font-medium"
                  : i < agentStep
                  ? "text-gray-400 line-through"
                  : "text-gray-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${i === agentStep ? "bg-[#0D7377] animate-pulse" : i < agentStep ? "bg-gray-300" : "bg-gray-200"}`} />
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-2">
          <span className="w-3 h-3 bg-[#0D7377] rounded-full dot-1" />
          <span className="w-3 h-3 bg-[#0D7377] rounded-full dot-2" />
          <span className="w-3 h-3 bg-[#0D7377] rounded-full dot-3" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
        Describe your symptoms
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Write naturally — like you&apos;re telling a friend. Include duration, severity, and where it hurts.
      </p>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {URGENCY_EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setTriageInput({ symptoms: ex })}
            className="text-xs bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 text-gray-600 hover:text-[#0D7377] px-3 py-1.5 rounded-full transition-all"
          >
            {ex.slice(0, 40)}…
          </button>
        ))}
      </div>

      <div className="relative mb-1">
        <textarea
          value={triageInput.symptoms}
          onChange={(e) => setTriageInput({ symptoms: e.target.value })}
          placeholder="e.g. I've had a severe headache for 3 days, along with nausea and sensitivity to light. The pain is mostly on the left side..."
          rows={5}
          className="input-field resize-none text-base leading-relaxed"
          aria-label="Symptom description"
          maxLength={2000}
        />
      </div>
      <div className="text-right text-xs text-gray-400 mb-5">{charCount} / 2000</div>

      {/* Optional fields toggle */}
      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="flex items-center gap-2 text-sm text-[#0D7377] font-medium mb-4 hover:underline"
      >
        {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {showOptional ? "Hide" : "Add"} optional details (age, gender, conditions, medications)
      </button>

      {showOptional && (
        <div className="grid sm:grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Age</label>
            <input
              type="number"
              value={triageInput.age}
              onChange={(e) => setTriageInput({ age: e.target.value })}
              placeholder="e.g. 32"
              min={1}
              max={120}
              className="input-field"
              aria-label="Age"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Gender</label>
            <select
              value={triageInput.gender}
              onChange={(e) => setTriageInput({ gender: e.target.value })}
              className="input-field"
              aria-label="Gender"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Existing conditions <span className="text-gray-400">(comma separated)</span>
            </label>
            <input
              type="text"
              value={triageInput.existing_conditions}
              onChange={(e) => setTriageInput({ existing_conditions: e.target.value })}
              placeholder="e.g. hypertension, diabetes"
              className="input-field"
              aria-label="Existing conditions"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Current medications <span className="text-gray-400">(comma separated)</span>
            </label>
            <input
              type="text"
              value={triageInput.medications}
              onChange={(e) => setTriageInput({ medications: e.target.value })}
              placeholder="e.g. amlodipine, metformin"
              className="input-field"
              aria-label="Current medications"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <button type="submit" className="btn-primary w-full text-base py-4">
        Analyze My Symptoms →
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        Not a substitute for emergency care. Call 911 if you have a life-threatening emergency.
      </p>
    </form>
  );
}
