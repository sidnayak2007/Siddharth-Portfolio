import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

/** Read the existing portfolio/{sectionId} document without changing its shape. */
export function usePublicPortfolioDocument(sectionId, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let active = true;

    getDoc(doc(db, "portfolio", sectionId))
      .then((snapshot) => {
        if (!active) return;

        const remote = snapshot.exists() ? snapshot.data() : {};
        setData({ ...fallback, ...remote });
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;

        console.error(`Could not load portfolio/${sectionId}:`, loadError);
        setData(fallback);
        setError("The latest content is unavailable. Showing the saved preview.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sectionId, fallback, retryToken]);

  const retry = () => {
    setLoading(true);
    setError("");
    setRetryToken((value) => value + 1);
  };

  return { data, loading, error, retry };
}