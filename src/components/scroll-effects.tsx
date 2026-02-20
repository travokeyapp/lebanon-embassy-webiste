"use client";

import { useEffect } from "react";

export default function ScrollEffects() {
  useEffect(() => {
    let frame = 0;

    const updateVars = () => {
      frame = 0;
      const y = window.scrollY || window.pageYOffset || 0;
      const root = document.documentElement;
      const pageFloatY = Math.min(y * 0.2, 240);

      root.style.setProperty("--page-float-y", `${pageFloatY.toFixed(1)}px`);
    };

    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updateVars);
      }
    };

    updateVars();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return null;
}
