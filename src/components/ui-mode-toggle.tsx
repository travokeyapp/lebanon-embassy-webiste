"use client";

import { useEffect, useMemo, useState } from "react";

type UiMode = "classic" | "modern";

const STORAGE_KEY = "embassy-ui-mode";

export default function UiModeToggle({ locale }: { locale: "en" | "ar" }) {
  const [mode, setMode] = useState<UiMode>("classic");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial: UiMode = "classic";

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "classic" || saved === "modern") {
        initial = saved;
      }
    } catch {
      // Ignore storage errors and fall back to default mode.
    }

    setMode(initial);
    document.documentElement.dataset.uiMode = initial;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    document.documentElement.dataset.uiMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors.
    }
  }, [mode, ready]);

  const text = useMemo(
    () =>
      locale === "ar"
        ? {
            aria: "تبديل نمط العرض",
            classic: "تقليدي",
            modern: "حديث",
          }
        : {
            aria: "Toggle website style",
            classic: "Classic",
            modern: "Modern",
          },
    [locale],
  );

  return (
    <div className="uiModeToggle" role="group" aria-label={text.aria}>
      <button
        type="button"
        className={mode === "classic" ? "isActive" : ""}
        aria-pressed={mode === "classic"}
        onClick={() => setMode("classic")}
      >
        {text.classic}
      </button>
      <button
        type="button"
        className={mode === "modern" ? "isActive" : ""}
        aria-pressed={mode === "modern"}
        onClick={() => setMode("modern")}
      >
        {text.modern}
      </button>
    </div>
  );
}
