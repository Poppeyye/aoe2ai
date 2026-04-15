"use client";

import { useRef, useCallback, useEffect } from "react";

const NEAR_BOTTOM_THRESHOLD = 120;

export function useSmartScroll(deps: unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < NEAR_BOTTOM_THRESHOLD;

    if (scrollTop < lastScrollTopRef.current && !isNearBottom) {
      userScrolledUpRef.current = true;
    } else if (isNearBottom) {
      userScrolledUpRef.current = false;
    }

    lastScrollTopRef.current = scrollTop;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (userScrolledUpRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const scrollToBottom = useCallback(() => {
    userScrolledUpRef.current = false;
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  return { containerRef, scrollToBottom, userScrolledUpRef };
}
