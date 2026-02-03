import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - FlowMate",
  description: "Terms of Service for FlowMate focus timer app",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-6 bg-gradient-to-br from-[#E0F2FE] via-[#EEF2FF] to-[#93C5FD] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] transition-colors duration-500">
      <div className="w-full max-w-2xl pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-slate-600 dark:text-cyan-200/80 text-sm">
            Effective date: February 3, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden p-6 sm:p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">

            {/* Agreement to Terms */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Agreement to Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                By using FlowMate, you agree to these terms. If you do not agree, please do not use the app. These terms apply to the FlowMate website and mobile app (together, the "Service").
              </p>
            </section>

            {/* Who Can Use the Service */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Who Can Use the Service
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                FlowMate is available to anyone. You do not need an account to use the app. If you are under 13 years old, please use the app with a parent or guardian.
              </p>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Acceptable Use
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                We ask that you use FlowMate responsibly. Please do not:
              </p>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1 mb-0 list-disc list-inside">
                <li>Attempt to interfere with or disrupt the Service</li>
                <li>Use the Service for any unlawful purpose</li>
                <li>Copy, modify, or distribute the app without permission</li>
                <li>Reverse engineer or attempt to extract the source code</li>
              </ul>
            </section>

            {/* No Medical Advice */}
            <section className="mb-8 p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mt-0 mb-3">
                No Medical Advice
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                FlowMate is a focus timer designed for time awareness. It is not a medical device and does not provide medical advice, diagnosis, or treatment.
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                If you have concerns about focus, attention, or any health matter, please consult a qualified healthcare professional.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Intellectual Property
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                FlowMate, including its design, code, audio files, and content, is owned by Lydia Studio. You may use the app for personal purposes, but you may not reproduce, distribute, or create derivative works without written permission.
              </p>
            </section>

            {/* Third Party Services */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Third Party Services
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                FlowMate uses the following third party services:
              </p>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1 mb-2 list-disc list-inside">
                <li><strong className="text-slate-800 dark:text-white">Vercel:</strong> Hosts the web app</li>
                <li><strong className="text-slate-800 dark:text-white">Tally.so:</strong> Processes feedback form submissions</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                These services have their own terms and privacy policies. We encourage you to review them.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Disclaimers
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                FlowMate is provided "as is" without warranties of any kind. We do our best to keep the app running smoothly, but we cannot guarantee that it will always be available or error free.
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                Your use of FlowMate is at your own discretion and risk.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Limitation of Liability
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                To the fullest extent permitted by law, Lydia Studio shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of FlowMate. This includes, but is not limited to, loss of data or interruption of service.
              </p>
            </section>

            {/* Changes to These Terms */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Changes to These Terms
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                We may update these terms from time to time. When we do, we will revise the effective date at the top of this page. Continued use of FlowMate after any changes means you accept the updated terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Contact
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">
                If you have questions about these terms, please reach out through our{" "}
                <Link href="/support" className="text-blue-600 dark:text-cyan-400 hover:underline">
                  support page
                </Link>
                .
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                For information about how we handle your data, please see our{" "}
                <Link href="/privacy" className="text-blue-600 dark:text-cyan-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-md border border-white/50 dark:border-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Open FlowMate</span>
          </Link>

          <div className="text-sm text-slate-500 dark:text-cyan-200/60">
            <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-cyan-300 underline transition-colors">
              Privacy Policy
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="text-sm text-slate-500 dark:text-cyan-200/60">
              Made by Liddy
            </div>
            <a
              href="https://lydiastud.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-cyan-400 hover:underline"
            >
              Lydia Studio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
