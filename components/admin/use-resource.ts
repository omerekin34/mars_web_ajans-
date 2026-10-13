"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { friendlyError } from "@/lib/admin/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useSupabaseResource<T>(table: string, column = "created_at", ascending = false) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(true);
  const loadedOnce = useRef(false);

  const reload = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setReady(false);
      setRows([]);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setReady(true);
    if (loadedOnce.current) setRefreshing(true);
    else setLoading(true);

    const { data, error: queryError } = await supabase.from(table).select("*").order(column, { ascending });

    if (queryError) {
      setError(friendlyError(queryError.message));
      if (!loadedOnce.current) setRows([]);
    } else {
      setError(null);
      setRows((data ?? []) as T[]);
    }

    loadedOnce.current = true;
    setLoading(false);
    setRefreshing(false);
  }, [ascending, column, table]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  return { rows, loading, refreshing, error, ready, reload };
}
