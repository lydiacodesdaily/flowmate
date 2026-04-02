"use client";

import { useState, useEffect, useRef } from "react";
import type { AuthState } from "../hooks/useAuth";

interface AuthModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  user: AuthState["user"];
  signInWithMagicLink: AuthState["signInWithMagicLink"];
  signInWithGoogle: AuthState["signInWithGoogle"];
}

type ModalState = "idle" | "email_sent" | "loading" | "error";

export function AuthModal({
  isVisible,
  onClose,
  onAuthSuccess,
  user,
  signInWithMagicLink,
  signInWithGoogle,
}: AuthModalProps) {
  const [state, setState] = useState<ModalState>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const wasVisibleRef = useRef(false);

  // When the user signs in while the modal is open, call onAuthSuccess
  useEffect(() => {
    if (isVisible && user) {
      onAuthSuccess();
      onClose();
    }
  }, [user, isVisible, onAuthSuccess, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isVisible && wasVisibleRef.current) {
      setState("idle");
      setEmail("");
      setErrorMsg("");
    }
    wasVisibleRef.current = isVisible;
  }, [isVisible]);

  if (!isVisible) return null;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    setErrorMsg("");
    try {
      await signInWithMagicLink(email.trim());
      setState("email_sent");
    } catch {
      setErrorMsg("Could not send link. Please try again.");
      setState("error");
    }
  };

  const handleGoogle = async () => {
    setState("loading");
    setErrorMsg("");
    try {
      await signInWithGoogle();
      // Page redirects away — no further state update needed
    } catch {
      setErrorMsg("Google sign-in failed. Please try again.");
      setState("error");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-8 pb-5 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-lg"
          >
            ✕
          </button>
          <div className="text-5xl mb-3">🍅</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Sign in to FlowMate
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {state === "email_sent"
              ? "Check your inbox for a sign-in link"
              : "Save your sessions and unlock premium"}
          </p>
        </div>

        <div className="px-6 pb-8 space-y-3">
          {state === "email_sent" ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-5 text-center space-y-2">
              <div className="text-3xl">📬</div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Link sent to {email}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Click the link in the email to sign in. You can close this window.
              </p>
              <button
                onClick={() => setState("idle")}
                className="text-xs text-emerald-600 dark:text-emerald-400 underline mt-1"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={state === "loading"}
                className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Magic link */}
              <form onSubmit={handleMagicLink} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={state === "loading"}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={state === "loading" || !email.trim()}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-2xl py-3 text-sm font-semibold transition-colors"
                >
                  {state === "loading" ? "Sending…" : "Send sign-in link"}
                </button>
              </form>

              {(state === "error") && (
                <p className="text-xs text-red-500 text-center">{errorMsg}</p>
              )}

              <p className="text-xs text-slate-400 text-center pt-1">
                No password needed. We&apos;ll email you a magic link.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
