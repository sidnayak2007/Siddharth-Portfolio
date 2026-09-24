import { useCallback, useEffect, useState } from "react";
import { getPortfolioDocument, savePortfolioDocument } from "../firebase/portfolioService";

const clone = (value) => JSON.parse(JSON.stringify(value));
const serialize = (value) => JSON.stringify(value);
const errorMessage = (error) => error?.message || "Something went wrong. Please try again.";

export function useAdminPortfolioDocument(sectionId, fallback) {
  const [value, setValue] = useState(() => clone(fallback));
  const [savedSnapshot, setSavedSnapshot] = useState(() => serialize(fallback));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const dirty = serialize(value) !== savedSnapshot;

  useEffect(() => {
    let cancelled = false;
    getPortfolioDocument(sectionId, fallback).then((loaded) => {
      if (cancelled) return;
      const next = clone(loaded);
      setValue(next);
      setSavedSnapshot(serialize(next));
      setLoadError("");
      setStatus("idle");
      setMessage("");
      setLoading(false);
    }).catch((error) => {
      if (cancelled) return;
      setLoadError(errorMessage(error));
      setStatus("error");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [sectionId, fallback, retryToken]);

  const retry = useCallback(() => {
    setLoading(true);
    setLoadError("");
    setRetryToken((current) => current + 1);
  }, []);

  const save = useCallback(async (nextValue, validationErrors = []) => {
    if (validationErrors.length) {
      setStatus("validation");
      setMessage(validationErrors.join(" "));
      return false;
    }
    if (!nextValue || typeof nextValue !== "object" || Array.isArray(nextValue)) {
      setStatus("validation");
      setMessage("The editor data is invalid.");
      return false;
    }
    const snapshotAtSave = serialize(value);
    setStatus("saving");
    setMessage("");
    try {
      const saved = clone(await savePortfolioDocument(sectionId, nextValue));
      setValue((current) => serialize(current) === snapshotAtSave ? saved : current);
      setSavedSnapshot(serialize(saved));
      setStatus("saved");
      setMessage("Your changes are live.");
      return true;
    } catch (error) {
      setStatus("error");
      setMessage(errorMessage(error));
      return false;
    }
  }, [sectionId, value]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Firestore stores media URLs; there are no Firebase Storage objects to remove.
  const queueDelete = useCallback(() => {}, []);
  const registerUpload = useCallback(() => {}, []);

  return { value, setValue, loading, loadError, status, message, dirty, save, retry, queueDelete, registerUpload };
}
