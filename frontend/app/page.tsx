"use client";

import Link from "next/link";
import { Activity, ClipboardList, UserCheck, AlertTriangle } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-[#0D7377]" size={24} />
            <span className="font-display text-xl font-semibold text-[#0D7377]">TriageAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm text-gray-600 hover:text-[#0D7377] transition-colors font-medium">
              Sign in
            </Link>
            <Link href="/triage" className="btn-primary text-sm py-2 px-5">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-[#0D7377] text-xs font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-[#0D7377] rounded-full animate-pulse" />
          AI-Powered Triage — No appointment needed
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Describe how you feel.
          <br />
          <span className="text-[#0D7377]">We&apos;ll guide you to the right care.</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Tell us your symptoms in plain language. Our AI analyzes them and connects
          you with the right specialist — in minutes, not weeks.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/triage" className="btn-primary text-lg px-10 py-4 inline-block">
            Start Triage →
          </Link>
          <a href="#how-it-works" className="btn-secondary text-lg px-10 py-4 inline-block">
            How it works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl font-bold text-center text-gray-900 mb-4">
            Three steps to clarity
          </h2>
          <p className="text-center text-gray-500 mb-14">No medical jargon. No long forms. Just describe how you feel.</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ClipboardList size={28} className="text-[#0D7377]" />,
                step: "1",
                title: "Describe your symptoms",
                desc: "Type naturally — like you're texting a doctor friend. Tell us what you feel, for how long, and how severe.",
              },
              {
                icon: <Activity size={28} className="text-[#0D7377]" />,
                step: "2",
                title: "AI analyzes in seconds",
                desc: "Four specialized AI agents work together to extract, analyze, and assess your symptoms against medical knowledge.",
              },
              {
                icon: <UserCheck size={28} className="text-[#0D7377]" />,
                step: "3",
                title: "Get guided to care",
                desc: "Receive a clear report with urgency level, possible conditions, specialist recommendation, and self-care advice.",
              },
            ].map((item) => (
              <div key={item.step} className="card text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-[#0D7377] uppercase tracking-widest mb-2">
                  Step {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="card border-amber-200 bg-amber-50 flex items-start gap-4">
          <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={20} />
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Important:</strong> This tool is for informational purposes only and does not constitute medical advice.
            Always consult a qualified healthcare professional. In case of emergency, call your local emergency number immediately.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0D7377] py-20 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          Ready to understand your symptoms?
        </h2>
        <p className="text-teal-100 text-lg mb-10">Free to use. No account required to start.</p>
        <Link href="/triage" className="bg-white text-[#0D7377] font-bold px-10 py-4 rounded-xl text-lg hover:bg-gray-50 transition-colors inline-block">
          Start Triage Now →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity size={16} className="text-[#0D7377]" />
          <span className="text-white font-medium">TriageAI</span>
        </div>
        <p>Not a substitute for professional medical advice. Always seek qualified care.</p>
      </footer>
    </main>
  );
}
