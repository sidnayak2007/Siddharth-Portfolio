import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  deletePortfolioFile,
  getPortfolioDocument,
  savePortfolioDocument,
} from "../firebase/portfolioService";

/* =========================================================
   HELPERS
========================================================= */

function cloneData(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return value;
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}

function serializeData(value) {
  try {
    return JSON.stringify(
      value
    );
  } catch {
    return "";
  }
}

function getErrorMessage(error) {
  if (
    typeof error?.message ===
      "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "Something went wrong. Please try again.";
}

/* =========================================================
   ADMIN PORTFOLIO DOCUMENT HOOK
========================================================= */

export function useAdminPortfolioDocument(
  sectionId,
  fallback
) {
  /* =======================================================
     EDITOR STATE
  ======================================================= */

  const [
    value,
    setValue,
  ] = useState(
    () =>
      cloneData(
        fallback
      )
  );

  const [
    savedSnapshot,
    setSavedSnapshot,
  ] = useState(
    () =>
      serializeData(
        fallback
      )
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("idle");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    retryToken,
    setRetryToken,
  ] = useState(0);

  /*
  Files are only deleted from Firebase Storage
  after the Firestore document saves successfully.

  A ref is appropriate here because this queue does
  not affect rendering.
  */

  const pendingDeletePathsRef =
    useRef(
      new Set()
    );

  /* =======================================================
     DIRTY STATE
  ======================================================= */

  const dirty =
    serializeData(value) !==
    savedSnapshot;

  /* =======================================================
     LOAD DOCUMENT
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    /*
    Important:

    We intentionally do not synchronously call setState()
    inside this effect.

    The state updates happen only after the asynchronous
    Firestore request resolves or rejects, which keeps this
    compatible with the React 19 lint rules.
    */

    getPortfolioDocument(
      sectionId,
      fallback
    )
      .then(
        (loadedValue) => {
          if (cancelled) {
            return;
          }

          const nextValue =
            cloneData(
              loadedValue
            );

          setValue(
            nextValue
          );

          setSavedSnapshot(
            serializeData(
              nextValue
            )
          );

          setLoadError(
            ""
          );

          setStatus(
            "idle"
          );

          setMessage(
            ""
          );

          setLoading(
            false
          );

          pendingDeletePathsRef.current.clear();
        }
      )
      .catch(
        (error) => {
          if (cancelled) {
            return;
          }

          console.error(
            `Could not load portfolio/${sectionId}:`,
            error
          );

          setLoadError(
            getErrorMessage(
              error
            )
          );

          setStatus(
            "error"
          );

          setMessage(
            ""
          );

          setLoading(
            false
          );
        }
      );

    return () => {
      cancelled =
        true;
    };
  }, [
    sectionId,
    fallback,
    retryToken,
  ]);

  /* =======================================================
     RETRY
  ======================================================= */

  const retry =
    useCallback(
      () => {
        setLoading(
          true
        );

        setLoadError(
          ""
        );

        setStatus(
          "idle"
        );

        setMessage(
          ""
        );

        setRetryToken(
          (current) =>
            current + 1
        );
      },
      []
    );

  /* =======================================================
     QUEUE STORAGE FILE FOR DELETION
  ======================================================= */

  const queueDelete =
    useCallback(
      (storagePath) => {
        if (
          typeof storagePath !==
            "string" ||
          !storagePath.trim()
        ) {
          return;
        }

        const cleanPath =
          storagePath.trim();

        /*
        Only portfolio-owned Storage paths are ever
        accepted by this queue.
        */

        if (
          !cleanPath.startsWith(
            "portfolio/"
          )
        ) {
          console.warn(
            "Ignored invalid portfolio Storage path:",
            cleanPath
          );

          return;
        }

        pendingDeletePathsRef.current.add(
          cleanPath
        );
      },
      []
    );

  /* =======================================================
     SAVE DOCUMENT
  ======================================================= */

  const save =
    useCallback(
      async (
        nextValue,
        validationErrors = []
      ) => {
        /* -------------------------------------------------
           VALIDATION
        ------------------------------------------------- */

        if (
          Array.isArray(
            validationErrors
          ) &&
          validationErrors.length >
            0
        ) {
          setStatus(
            "validation"
          );

          setMessage(
            validationErrors.join(
              " "
            )
          );

          return false;
        }

        if (
          !nextValue ||
          typeof nextValue !==
            "object" ||
          Array.isArray(
            nextValue
          )
        ) {
          setStatus(
            "validation"
          );

          setMessage(
            "The editor data is invalid."
          );

          return false;
        }

        /*
        Remember exactly what the editor looked like when
        Save was clicked.

        If the user continues typing while Firebase is
        saving, we won't accidentally overwrite those newer
        edits when the request finishes.
        */

        const editorSnapshotAtSave =
          serializeData(
            value
          );

        setStatus(
          "saving"
        );

        setMessage(
          ""
        );

        try {
          /* -----------------------------------------------
             SAVE FIRESTORE FIRST
          ----------------------------------------------- */

          const savedValue =
            await savePortfolioDocument(
              sectionId,
              nextValue
            );

          const cleanSavedValue =
            cloneData(
              savedValue
            );

          const cleanSavedSnapshot =
            serializeData(
              cleanSavedValue
            );

          /*
          Replace the visible editor with the cleaned saved
          version only if the user has not made additional
          edits while the network request was running.
          */

          setValue(
            (current) => {
              if (
                serializeData(
                  current
                ) ===
                editorSnapshotAtSave
              ) {
                return cleanSavedValue;
              }

              return current;
            }
          );

          setSavedSnapshot(
            cleanSavedSnapshot
          );

          /* -----------------------------------------------
             DELETE OLD STORAGE FILES
          ----------------------------------------------- */

          const pendingPaths =
            Array.from(
              pendingDeletePathsRef.current
            );

          const failedPaths =
            [];

          for (
            const storagePath
            of pendingPaths
          ) {
            try {
              await deletePortfolioFile(
                storagePath
              );

              pendingDeletePathsRef.current.delete(
                storagePath
              );
            } catch (
              deleteError
            ) {
              failedPaths.push(
                storagePath
              );

              console.warn(
                "Portfolio content saved, but an old Storage file could not be deleted:",
                deleteError
              );
            }
          }

          /* -----------------------------------------------
             SUCCESS
          ----------------------------------------------- */

          setStatus(
            "saved"
          );

          if (
            failedPaths.length >
            0
          ) {
            setMessage(
              "Your content was saved. An old uploaded file could not be cleaned up yet."
            );
          } else {
            setMessage(
              "Your changes are live."
            );
          }

          return true;
        } catch (error) {
          console.error(
            `Could not save portfolio/${sectionId}:`,
            error
          );

          setStatus(
            "error"
          );

          setMessage(
            getErrorMessage(
              error
            )
          );

          return false;
        }
      },
      [
        sectionId,
        value,
      ]
    );

  /* =======================================================
     UNSAVED CHANGES WARNING
  ======================================================= */

  useEffect(() => {
    if (!dirty) {
      return undefined;
    }

    const handleBeforeUnload =
      (event) => {
        event.preventDefault();

        /*
        Required by some browsers for the native
        unsaved-changes confirmation dialog.
        */

        event.returnValue =
          "";
      };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [
    dirty,
  ]);

  /* =======================================================
     PUBLIC API
  ======================================================= */

  return {
    value,
    setValue,

    loading,
    loadError,

    status,
    message,

    dirty,

    save,
    retry,
    queueDelete,
  };
}