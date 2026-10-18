import { useEffect, useState } from "react";

/**
 * Seconds left of a `seconds`-long countdown that (re)starts whenever `key`
 * changes. Returns null while there's no key (nothing to time).
 */
export default function useCountdown(seconds, key) {
  const [left, setLeft] = useState(null);

  useEffect(() => {
    if (!key || !seconds) {
      setLeft(null);
      return undefined;
    }
    const endsAt = Date.now() + seconds * 1000;
    const tick = () => setLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [seconds, key]);

  return left;
}
