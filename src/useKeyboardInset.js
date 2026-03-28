import { useEffect, useState } from "react";

export default function useKeyboardInset() {
  const [metrics, setMetrics] = useState({
    keyboardInset: 0,
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const measure = () => {
      const viewport = window.visualViewport;
      const viewportHeight = viewport ? viewport.height : window.innerHeight;
      const viewportOffsetTop = viewport ? viewport.offsetTop : 0;
      const keyboardInset = Math.max(
        0,
        window.innerHeight - viewportHeight - viewportOffsetTop
      );

      setMetrics({
        keyboardInset: Math.round(keyboardInset),
        viewportHeight: Math.round(viewportHeight),
      });
    };

    measure();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", measure);
      window.visualViewport.addEventListener("scroll", measure);
    }
    window.addEventListener("resize", measure);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", measure);
        window.visualViewport.removeEventListener("scroll", measure);
      }
      window.removeEventListener("resize", measure);
    };
  }, []);

  return metrics;
}
