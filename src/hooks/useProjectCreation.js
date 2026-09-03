import { useCallback, useRef, useState } from "react";

/**
 * Orchestrates the "create project in the background, optionally solve a
 * puzzle while you wait" flow shared by every project-creation entry point.
 *
 * `createFn` performs the actual creation (e.g. apiServices.createProject).
 * `start` fires it without awaiting, so the caller can show the puzzle/choice
 * gate immediately and the request keeps running even if the user dismisses
 * the gate and navigates elsewhere on the same page. A request id guards
 * against a stale response overwriting a newer one if `start` is called
 * again before the previous call has settled.
 */
export function useProjectCreation(createFn) {
  const [gateOpen, setGateOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | pending | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const gateOpenRef = useRef(false);
  gateOpenRef.current = gateOpen;
  const requestIdRef = useRef(0);

  const start = useCallback(
    (payload) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setStatus("pending");
      setResult(null);
      setError(null);
      setNotification(null);
      setGateOpen(true);

      createFn(payload)
        .then((project) => {
          if (requestIdRef.current !== requestId) return;
          setResult(project);
          setStatus("done");
          if (!gateOpenRef.current) {
            setNotification({ tone: "positive", project });
          }
        })
        .catch((err) => {
          if (requestIdRef.current !== requestId) return;
          setError(err);
          setStatus("error");
          if (!gateOpenRef.current) {
            setNotification({ tone: "negative", error: err });
          }
        });
    },
    [createFn]
  );

  const dismissGate = useCallback(() => setGateOpen(false), []);
  const dismissNotification = useCallback(() => setNotification(null), []);

  return {
    gateOpen,
    status,
    result,
    error,
    notification,
    start,
    dismissGate,
    dismissNotification,
  };
}
