import { useCallback, useEffect, useRef, useState } from "react";

export default function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const remove = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success") => {
      const id = crypto.randomUUID();

      setToasts((prev) => [...prev, { id, message, type }]);

      const timer = setTimeout(() => {
        remove(id);
      }, 3500);

      timers.current.set(id, timer);
    },
    [remove],
  );

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, []);

  return {
    toasts,
    push,
    remove,
  };
}
