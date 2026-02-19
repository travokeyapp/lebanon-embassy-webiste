"use client";

import { useEffect } from "react";

export default function ScrollEffects() {
  useEffect(() => {
    let frame = 0;

    const updateVars = () => {
      frame = 0;
      const y = window.scrollY || window.pageYOffset || 0;
      const root = document.documentElement;
      const maxScrollable =
        Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight;
      const progress = maxScrollable > 0 ? Math.min(y / maxScrollable, 1) : 0;

      const parallax = Math.min(y * 0.32, 180);
      const zoom = 1.06 + Math.min(y, 520) / 6200;
      const overlayTop = Math.min(0.56 + y / 3200, 0.74);
      const overlayBottom = Math.min(0.72 + y / 2600, 0.9);
      const panX = Math.sin(y / 260) * 14;
      const pageFloatY = Math.min(y * 0.2, 240);

      root.style.setProperty("--hero-parallax-y", `${parallax.toFixed(1)}px`);
      root.style.setProperty("--hero-zoom", zoom.toFixed(3));
      root.style.setProperty("--hero-overlay-top", overlayTop.toFixed(3));
      root.style.setProperty("--hero-overlay-bottom", overlayBottom.toFixed(3));
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
      root.style.setProperty("--hero-pan-x", `${panX.toFixed(1)}px`);
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
