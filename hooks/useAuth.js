"use client";

import { useEffect, useState, useCallback } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setLoading(true);
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        setUser(data.user);
        setProfile(data.profile);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  return { user, profile, loading, refresh };
}
