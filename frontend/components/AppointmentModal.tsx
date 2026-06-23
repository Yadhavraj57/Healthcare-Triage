"use client";

import { useState } from "react";
import { appointmentsApi } from "@/lib/api";
import { CheckCircle, X } from "lucide-react";

interface Props {
  specialist: string;
  sessionId?: string;
  onClose: () => void;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export default function AppointmentModal({ specialist, sessionId, onClose }: Props) {
  const [form, setForm] = useState({
    patient_name: "",
    contact_email: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleBook(e: React.FormEvent) {
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
        specialist_type: specialist,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time + ":00",
        patient_name: form.patient_name,
        contact_email: form.contact_email,
      });
      setSuccess(data.booking_id);
    } catch {
      setError("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle className="text-[#2A9D8F] mx-auto mb-4" size={56} />
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
          <p className="text-gray-500 mb-4">
            Your appointment with a <strong>{specialist}</strong> has been scheduled.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <p className="text-xs text-gray-400 mb-1">Booking Reference</p>
            <p className="font-mono text-sm font-bold text-gray-800">{success}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            A confirmation will be sent to <strong>{form.contact_email}</strong>
          </p>
          <button onClick={onClose} className="btn-primary w-full">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="font-display text-2xl font-bold text-gray-900 mb-1">Book Appointment</h2>
        <p className="text-gray-500 text-sm mb-6">
          Specialist: <strong>{specialist}</strong>
        </p>

        <form onSubmit={handleBook} className="space-y-4">
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
                  className={`text-sm py-2 rounded-lg border transition-all ${
                    form.appointment_time === slot
                      ? "bg-[#0D7377] border-[#0D7377] text-white font-medium"
                      : "border-gray-200 text-gray-600 hover:border-[#0D7377] hover:text-[#0D7377]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}
