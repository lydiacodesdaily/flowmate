"use client";

import { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

interface AccountButtonProps {
  user: User | null;
  isPremium: boolean;
  onSignOut: () => void;
  onSignIn: () => void;
  onManageSubscription?: () => void;
}

function getFirstName(user: User): string {
  const full = user.user_metadata?.full_name || user.user_metadata?.name;
  if (full) return full.trim().split(' ')[0];
  return user.email?.split('@')[0] ?? 'there';
}

function getInitials(user: User): string {
  const full = user.user_metadata?.full_name || user.user_metadata?.name;
  if (full) {
    const parts = full.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return (user.email?.[0] ?? '?').toUpperCase();
}

export function AccountButton({ user, isPremium, onSignOut, onSignIn, onManageSubscription }: AccountButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 dark:border-cyan-500/30"
        title={user ? `Account — ${user.email}` : 'Sign in'}
        aria-label="Account"
      >
        {user ? (
          <>
            {/* Initials avatar */}
            <div className="w-6 h-6 rounded-full bg-blue-600 dark:bg-cyan-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white leading-none">{getInitials(user)}</span>
            </div>
            {/* Sync dot */}
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-800" />
          </>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400 dark:text-slate-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scaleIn origin-top-right z-50">
          {user ? (
            <>
              {/* Greeting */}
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-base font-bold text-slate-800 dark:text-white">
                  Hi, {getFirstName(user)}!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email}</p>
              </div>

              {/* Status rows */}
              <div className="px-4 py-3 space-y-2.5 border-b border-slate-100 dark:border-slate-700">
                {/* Sync */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">Sessions synced</span>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">On</span>
                </div>

                {/* Plan */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 shrink-0 ${isPremium ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}>
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-slate-600 dark:text-slate-300">Plan</span>
                  </div>
                  {isPremium ? (
                    <button
                      onClick={() => { setOpen(false); onManageSubscription?.(); }}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Premium · Manage
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">Free</span>
                  )}
                </div>
              </div>

              {/* Sign out */}
              <div className="px-4 py-3">
                <button
                  onClick={() => { setOpen(false); onSignOut(); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Signed-out state */}
              <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Not signed in</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Sign in to back up your sessions and sync across devices.
                </p>
              </div>
              <div className="px-4 py-3">
                <button
                  onClick={() => { setOpen(false); onSignIn(); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 dark:bg-cyan-500 text-white text-xs font-semibold hover:bg-blue-700 dark:hover:bg-cyan-400 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign in
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
