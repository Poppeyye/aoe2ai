"use client";

import { useRef, useCallback, useEffect, useState } from "react";

const AUTO_SCROLL_THRESHOLD = 80;

export function useSmartScroll(deps: unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollEnabledRef = useRef(true);
  const userScrolledUpRef = useRef(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isAtBottom = distanceFromBottom <= AUTO_SCROLL_THRESHOLD;

    if (isAtBottom) {
      autoScrollEnabledRef.current = true;
      userScrolledUpRef.current = false;
      setIsScrolledUp(false);
    } else {
      autoScrollEnabledRef.current = false;
      userScrolledUpRef.current = true;
      setIsScrolledUp(true);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      checkScrollPosition();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [checkScrollPosition]);

  useEffect(() => {
    if (!autoScrollEnabledRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    // Use requestAnimationFrame to prevent layout thrashing
    requestAnimationFrame(() => {
      if (el && autoScrollEnabledRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const scrollToBottom = useCallback(() => {
    autoScrollEnabledRef.current = true;
    userScrolledUpRef.current = false;
    setIsScrolledUp(false);
    const el = containerRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return { containerRef, scrollToBottom, userScrolledUpRef, isScrolledUp };
}
