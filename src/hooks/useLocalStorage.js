import { useCallback, useEffect, useState } from "react";

export default function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return {
        value: saved === null ? initialValue : JSON.parse(saved),
        error: "",
      };
    } catch {
      return {
        value: initialValue,
        error: "Τα αποθηκευμένα δεδομένα δεν μπόρεσαν να αναγνωστούν.",
      };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(stored.value));
    } catch {
      const error = "Δεν ήταν δυνατή η αποθήκευση των αλλαγών στη συσκευή.";
      setStored((current) => current.error === error ? current : { ...current, error });
    }
  }, [key, stored.value]);

  const setValue = useCallback((nextValue) => {
    setStored((current) => ({
      value: typeof nextValue === "function" ? nextValue(current.value) : nextValue,
      error: "",
    }));
  }, []);

  return [stored.value, setValue, stored.error];
}
