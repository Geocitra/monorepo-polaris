'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';

interface UsePromptAutocompleteOptions {
  endpoint: string | null;
  value: string;
  mode?: string;
  extraBody?: Record<string, unknown>;
  disabled?: boolean;
  minLength?: number;
  debounceMs?: number;
}

const sessionAutocompleteCache = new Map<string, string>();

export function usePromptAutocomplete({
  endpoint,
  value,
  mode,
  extraBody,
  disabled = false,
  minLength = 12,
  debounceMs = 600,
}: UsePromptAutocompleteOptions) {
  const [ghostSuffix, setGhostSuffix] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const extraBodyRef = useRef(extraBody);
  extraBodyRef.current = extraBody;

  const clearGhost = useCallback(() => {
    setGhostSuffix('');
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (disabled || !endpoint) {
      clearGhost();
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length < minLength || value.includes('\n')) {
      clearGhost();
      return;
    }

    const cacheKey = `${endpoint}::${mode || 'AUTO'}::${value}`;
    const cached = sessionAutocompleteCache.get(cacheKey);
    if (cached !== undefined) {
      setGhostSuffix(cached);
      return;
    }

    setGhostSuffix('');
    const timer = setTimeout(async () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setLoadingSuggestion(true);

      try {
        const res = await ApiClient.request<{ completion?: string }>(endpoint, {
          method: 'POST',
          signal: controller.signal,
          body: JSON.stringify({
            prefix: value,
            mode,
            ...(extraBodyRef.current || {}),
          }),
        });
        if (controller.signal.aborted) return;
        const suffix = res?.completion || '';
        sessionAutocompleteCache.set(cacheKey, suffix);
        setGhostSuffix(suffix);
      } catch {
        if (!controller.signal.aborted) {
          setGhostSuffix('');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSuggestion(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [clearGhost, debounceMs, disabled, endpoint, minLength, mode, value]);

  const acceptGhost = useCallback((): string | null => {
    if (!ghostSuffix) return null;
    const completed = `${value}${ghostSuffix}`;
    setGhostSuffix('');
    return completed;
  }, [ghostSuffix, value]);

  return {
    ghostSuffix,
    loadingSuggestion,
    acceptGhost,
    clearGhost,
  };
}
