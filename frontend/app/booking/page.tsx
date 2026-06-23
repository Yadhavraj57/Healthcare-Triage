"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { appointmentsApi } from "@/lib/api";
import { Activity, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session") || undefined;
  const specialistParam = searchParams.get("specialist") || "General Practitioner";

  const [form, setForm] = useState({
    specialist_type: specialistParam,
    patient_name: "",
    contact_email: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ bookingId: string; date: string; time: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((f) => ({ ...f, specialist_type: specialistParam }));
  }, [specialistParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patient_name || !form.contact_email || !form.appointment_date || !form.appointment_time) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await appointmentsApi.book({
        session_id: sessionId,
        specialist_type: form.specialist_type,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time + ":00",
        patient_name: form.patient_name,
        contact_email: form.contact_email,
      });
      setSuccess({
        bookingId: data.booking_id,
        date: data.appointment_date,
        time: data.appointment_time,
      });
    } catch {
      setError("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-[#2A9D8F]" size={48} />
        </div>
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">
          Appointment Booked!
        </h2>
        <p className="text-gray-500 mb-6">
          Your appointment with a <strong>{form.specialist_type}</strong> has been scheduled.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Patient</span>
            <span className="font-medium text-gray-900">{form.patient_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Specialist</span>
            <span className="font-medium text-gray-900">{form.specialist_type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">{success.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-medium text-gray-900">{success.time}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
            <span className="text-gray-500">Booking ID</span>
            <span className="font-mono text-xs font-bold text-gray-700">{success.bookingId}</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          Confirmation sent to <strong>{form.contact_email}</strong>
        </p>

        <button onClick={() => router.push("/")} className="btn-primary w-full">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg mx-auto">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Book Your Appointment</h2>
      <p className="text-gray-500 text-sm mb-6">
        Scheduling with: <strong>{form.specialist_type}</strong>
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Specialist Type *</label>
          <input
            type="text"
            value={form.specialist_type}
            onChange={(e) => setForm({ ...form, specialist_type: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
          <input
            type="text"
            value={form.patient_name}
            onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
            placeholder="Your full name"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address *</label>
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            placeholder="your@email.com"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Preferred Date *</label>
          <input
            type="date"
            value={form.appointment_date}
            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Preferred Time *</label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setForm({ ...form, appointment_time: slot })}
                className={`text-sm py-2.5 rounded-xl border transition-all ${
                  form.appointment_time === slot
                    ? "bg-[#0D7377] border-[#0D7377] text-white font-semibold"
                    : "border-gray-200 text-gray-600 hover:border-[#0D7377] hover:text-[#0D7377]"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mt-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-6 disabled:opacity-60"
      >
        {loading ? "Booking..." : "Confirm Appointment"}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4">
        This is a demo booking system. No real appointment will be made.
      </p>
    </form>
  );
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Activity className="text-[#0D7377]" size={22} />
            <span className="font-display text-lg font-semibold text-[#0D7377]">TriageAI</span>
          </Link>
          <Link href="/results" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0D7377] transition-colors">
            <ArrowLeft size={16} />
            Back to results
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
            Schedule Your Visit
          </h1>
          <p className="text-gray-500">
            Book an appointment with the recommended specialist.
          </p>
        </div>

        <Suspense fallback={<div className="card max-w-lg mx-auto h-64 skeleton rounded-2xl" />}>
          <BookingForm />
        </Suspense>
      </div>
    </main>
  );
}
