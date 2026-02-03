import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support - Flowmate",
  description: "Get help and support for Flowmate",
};

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-6 bg-gradient-to-br from-[#E0F2FE] via-[#EEF2FF] to-[#93C5FD] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] transition-colors duration-500">
      <div className="w-full max-w-2xl pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            How can we help?
          </h1>
          <p className="text-slate-600 dark:text-cyan-200/80 text-sm">
            We&apos;d love to hear from you
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden p-6">
          <iframe
            src="https://tally.so/embed/Y50Qb5?alignLeft=1&hideTitle=1&transparentBackground=1"
            width="100%"
            height="520"
            title="Support Form"
            className="bg-transparent border-0"
          />
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
            <span className="font-medium">Open Flowmate</span>
          </Link>

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
