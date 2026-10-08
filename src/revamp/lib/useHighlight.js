import { useEffect, useRef } from "react";

/** Scrolls the element into view once when `active` becomes true (notification deep links). */
export function useHighlight(active) {
  const ref = useRef(null);
  useEffect(() => {
    if (active && ref.current) {
      const t = setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [active]);
  return ref;
}
