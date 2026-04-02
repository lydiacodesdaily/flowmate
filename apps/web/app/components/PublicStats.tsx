"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalFocusSeconds: number;
  totalSessions: number;
  totalUsers: number;
}

export function PublicStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      fetch("/api/stats/public")
        .then((r) => r.json())
        .then((data: Stats) => setStats(data))
        .catch(() => {}); // Stay hidden on error
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!stats || (stats.totalUsers === 0 && stats.totalFocusSeconds === 0)) {
    return null;
  }

  const hours = Math.floor(stats.totalFocusSeconds / 3600);
  const userCount = stats.totalUsers;

  // Don't show until there's meaningful data
  if (userCount === 0 && hours === 0) return null;

  const parts: string[] = [];
  if (userCount > 0) parts.push(`${userCount.toLocaleString()} users`);
  if (hours > 0) parts.push(`${hours.toLocaleString()} hours focused`);

  return (
    <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
      {parts.join(" · ")}
    </p>
  );
}
