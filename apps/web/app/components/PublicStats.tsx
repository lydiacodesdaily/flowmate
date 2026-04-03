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

  // Hidden for now — re-enable once numbers are meaningful
  return null;
}
