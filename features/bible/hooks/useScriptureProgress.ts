"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchScriptureProgress,
  saveScriptureProgress,
} from "@/features/bible/api";
import {
  getActiveScriptureProgress,
  toScriptureProgressState,
} from "@/features/bible/selectors";
import type { ScriptureProgressItem } from "@/features/bible/types";

const QUERY_KEY = ["scripture-reading-progress"];

export function useScriptureProgress() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchScriptureProgress,
    staleTime: 30 * 1000,
  });

  const mutation = useMutation({
    mutationFn: saveScriptureProgress,
    onSuccess: (savedItem) => {
      queryClient.setQueryData<ScriptureProgressItem[]>(
        QUERY_KEY,
        (current = []) => {
          const next = current.filter(
            (item) => item.scriptureId !== savedItem.scriptureId,
          );
          next.push(savedItem);
          return next;
        },
      );
    },
  });

  const progress = useMemo(() => toScriptureProgressState(data), [data]);
  const activeScriptures = useMemo(
    () => getActiveScriptureProgress(progress),
    [progress],
  );

  const updateScriptureProgress = async (
    scriptureId: string,
    completedChapters: number,
  ) => {
    return mutation.mutateAsync({ scriptureId, completedChapters });
  };

  return {
    progress,
    activeScriptures,
    updateScriptureProgress,
    isLoading,
    isError,
    isSaving: mutation.isPending,
    refetch,
  };
}
