"use client";

import { useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { UserProgress } from "@/types";

export function useProgress(licenseKeyId: string | null) {
  const [progress, setProgress] = useState<Map<string, UserProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!licenseKeyId) return;

    setIsLoading(true);
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("license_key_id", licenseKeyId);

    if (!error && data) {
      const progressMap = new Map<string, UserProgress>();
      data.forEach((p) => {
        progressMap.set(p.lesson_id, p);
      });
      setProgress(progressMap);
    }

    setIsLoading(false);
  }, [licenseKeyId]);

  const updateProgress = useCallback(
    async (lessonId: string, watchSeconds: number, isCompleted: boolean = false) => {
      if (!licenseKeyId) return;

      const supabase = getSupabase();

      const { error } = await supabase.from("user_progress").upsert(
        {
          license_key_id: licenseKeyId,
          lesson_id: lessonId,
          watch_seconds: watchSeconds,
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
        },
        {
          onConflict: "license_key_id,lesson_id",
        }
      );

      if (!error) {
        // 로컬 상태 업데이트
        setProgress((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(lessonId);
          newMap.set(lessonId, {
            id: existing?.id || "",
            license_key_id: licenseKeyId,
            lesson_id: lessonId,
            watch_seconds: watchSeconds,
            is_completed: isCompleted || existing?.is_completed || false,
            last_watched_at: new Date().toISOString(),
          });
          return newMap;
        });
      }

      return !error;
    },
    [licenseKeyId]
  );

  const markCompleted = useCallback(
    async (lessonId: string) => {
      const existing = progress.get(lessonId);
      return updateProgress(
        lessonId,
        existing?.watch_seconds || 0,
        true
      );
    },
    [progress, updateProgress]
  );

  const getProgress = useCallback(
    (lessonId: string): UserProgress | undefined => {
      return progress.get(lessonId);
    },
    [progress]
  );

  const isCompleted = useCallback(
    (lessonId: string): boolean => {
      return progress.get(lessonId)?.is_completed || false;
    },
    [progress]
  );

  const getCompletionRate = useCallback(
    (lessonIds: string[]): number => {
      if (lessonIds.length === 0) return 0;
      const completed = lessonIds.filter((id) => isCompleted(id)).length;
      return Math.round((completed / lessonIds.length) * 100);
    },
    [isCompleted]
  );

  return {
    progress,
    isLoading,
    fetchProgress,
    updateProgress,
    markCompleted,
    getProgress,
    isCompleted,
    getCompletionRate,
  };
}
