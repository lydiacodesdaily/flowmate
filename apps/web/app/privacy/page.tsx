import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - FlowMate",
  description: "FlowMate is 100% private. No account, no tracking — your focus data stays on your device.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-cyan-200/80 text-sm">
            Effective date: February 3, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden p-6 sm:p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">

            {/* Summary */}
            <section className="mb-8 p-4 bg-blue-50/50 dark:bg-cyan-900/20 rounded-2xl border border-blue-100 dark:border-cyan-800/30">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mt-0 mb-3">
                Summary
              </h2>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-2 mb-0 list-disc list-inside">
                <li>Your focus sessions, stats, and settings stay on your device.</li>
                <li>We do not require an account or collect personal information.</li>
                <li>We do not use ads or sell your data.</li>
                <li>Feedback you submit through our form is voluntary and handled by a trusted third party.</li>
                <li>If you use &ldquo;✨ Generate steps&rdquo;, your focus intent text is sent to an AI service to create step suggestions. It is not stored on our servers or used for ads.</li>
              </ul>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Information We Collect
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">
                FlowMate is designed to respect your privacy. Here is what we store:
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                <strong className="text-slate-800 dark:text-white">Stored locally on your device:</strong>
              </p>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1 mb-4 list-disc list-inside">
                <li>Focus session history (timestamps, durations, notes you add)</li>
                <li>Usage statistics (total focus time, session counts)</li>
                <li>App settings (theme, sounds, notifications)</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                This data never leaves your device unless you choose to clear it.
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                <strong className="text-slate-800 dark:text-white">Voluntarily submitted:</strong>
              </p>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1 mb-0 list-disc list-inside">
                <li>Feedback or support messages you choose to send through our feedback form</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                How We Use Information
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                Data stored on your device is used solely to provide you with a better experience, including:
              </p>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1 mb-3 list-disc list-inside">
                <li>Showing your focus history and progress</li>
                <li>Remembering your preferred settings</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                If you submit feedback, we use it only to improve FlowMate and respond to your questions.
              </p>
            </section>

            {/* Sharing */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Sharing
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                We do not sell, rent, or share your data with third parties for marketing purposes.
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                <strong className="text-slate-800 dark:text-white">Service providers:</strong>
              </p>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1 mb-0 list-disc list-inside">
                <li>Our feedback form is hosted by Tally.so. When you submit feedback, Tally processes that submission according to their privacy policy.</li>
                <li>The web app is hosted on Vercel. Standard web server logs may include your IP address and browser type for security and performance purposes.</li>
                <li>
                  <strong className="text-slate-800 dark:text-white">AI step generation:</strong>{" "}
                  When you tap &ldquo;✨ Generate steps&rdquo;, your focus intent text is sent to OpenAI to
                  generate step suggestions. OpenAI processes this data according to their{" "}
                  <a
                    href="https://openai.com/policies/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-cyan-400 hover:underline"
                  >
                    privacy policy
                  </a>
                  . We do not store your intent text on our servers.
                </li>
              </ul>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Data Retention
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                <strong className="text-slate-800 dark:text-white">Local data:</strong> Your session history, stats, and settings remain on your device until you clear your browser data or uninstall the app. Session history is limited to your most recent 30 sessions.
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                <strong className="text-slate-800 dark:text-white">Feedback submissions:</strong> Retained as long as needed to respond and improve the app, then deleted.
              </p>
            </section>

            {/* Security */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Security
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                Because your data stays on your device, you control its security. We recommend keeping your device and browser updated. The web app is served over HTTPS to protect data in transit.
              </p>
            </section>

            {/* Children */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Children
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                FlowMate is a general audience app and does not knowingly collect personal information from children under 13. Since we do not collect personal information from anyone, this applies equally to all users.
              </p>
            </section>

            {/* Your Choices */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Your Choices
              </h2>
              <ul className="text-slate-700 dark:text-slate-300 text-sm space-y-1 mb-0 list-disc list-inside">
                <li><strong className="text-slate-800 dark:text-white">Delete your data:</strong> Clear your browser storage or uninstall the mobile app to remove all local data.</li>
                <li><strong className="text-slate-800 dark:text-white">Feedback:</strong> Submitting feedback is entirely optional.</li>
                <li><strong className="text-slate-800 dark:text-white">Notifications:</strong> You can enable or disable notifications in your device settings at any time.</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3">
                Contact
              </h2>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-0">
                If you have questions about this policy or your privacy, please reach out through our{" "}
                <Link href="/support" className="text-blue-600 dark:text-cyan-400 hover:underline">
                  support page
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
            <Link href="/terms" className="hover:text-slate-700 dark:hover:text-cyan-300 underline transition-colors">
              Terms of Service
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
