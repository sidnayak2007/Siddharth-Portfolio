import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  PLAYER_NAME_MAX_LENGTH,
  normalizePlayerName,
  validatePlayerName,
} from "../../firebase/playerService";

/*
=========================================================
PLAYER NAME MODAL
=========================================================

Used for:

1. First-time game player setup
2. Changing an existing player name

The actual Firestore save happens outside this component.

This component only handles:
- input
- validation
- loading state
- error display
- accessibility
=========================================================
*/

function PlayerNameModal({
  open,
  initialName = "",
  mode = "create",
  loading = false,
  externalError = "",
  canClose = false,
  onSave,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <PlayerNameDialog
      key={`${mode}:${initialName}`}
      initialName={initialName}
      mode={mode}
      loading={loading}
      externalError={externalError}
      canClose={canClose}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

/* =========================================================
   PLAYER NAME DIALOG
========================================================= */

function PlayerNameDialog({
  initialName,
  mode,
  loading,
  externalError,
  canClose,
  onSave,
  onClose,
}) {
  const inputRef =
    useRef(null);

  const [
    name,
    setName,
  ] = useState(
    initialName || ""
  );

  const [
    localError,
    setLocalError,
  ] = useState("");

  /*
  ========================================================
  FOCUS WHEN MODAL OPENS
  ========================================================
  */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          inputRef.current?.focus();
          inputRef.current?.select();
        },
        80
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  /*
  ========================================================
  ESCAPE TO CLOSE
  ========================================================
  */

  useEffect(() => {
    if (!canClose) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          onClose?.();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    canClose,
    onClose,
  ]);

  /*
  ========================================================
  SUBMIT
  ========================================================
  */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      const validation =
        validatePlayerName(
          name
        );

      if (
        !validation.valid
      ) {
        setLocalError(
          validation.message
        );

        return;
      }

      setLocalError("");

      try {
        await onSave?.(
          validation.name
        );
      } catch (error) {
        console.error(
          "Player name save failed:",
          error
        );

        setLocalError(
          error?.message ||
            "Could not save your name. Please try again."
        );
      }
    };

  /*
  ========================================================
  INPUT CHANGE
  ========================================================
  */

  const handleNameChange =
    (event) => {
      const nextValue =
        event.target.value;

      if (
        nextValue.length >
        PLAYER_NAME_MAX_LENGTH
      ) {
        return;
      }

      setName(
        nextValue
      );

      if (localError) {
        setLocalError("");
      }
    };

  /*
  ========================================================
  BACKDROP CLOSE
  ========================================================
  */

  const handleBackdropClick =
    (event) => {
      if (
        !canClose ||
        loading
      ) {
        return;
      }

      if (
        event.target ===
        event.currentTarget
      ) {
        onClose?.();
      }
    };

  const isEditing =
    mode === "edit";

  const displayedError =
    externalError ||
    localError;

  const characterCount =
    normalizePlayerName(
      name
    ).length;

  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (
    <div
      className="ob-player-modal"
      role="presentation"
      onMouseDown={
        handleBackdropClick
      }
    >
      <section
        className="ob-player-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ob-player-modal-title"
        aria-describedby="ob-player-modal-description"
      >
        <div
          className="ob-player-modal-icon"
          aria-hidden="true"
        >
          {isEditing
            ? "✎"
            : "★"}
        </div>

        <span className="ob-player-modal-kicker">
          {isEditing
            ? "PLAYER PROFILE"
            : "WELCOME PLAYER"}
        </span>

        <h2 id="ob-player-modal-title">
          {isEditing
            ? "Change your name"
            : "Choose your name"}
        </h2>

        <p id="ob-player-modal-description">
          {isEditing
            ? "Update the name shown on the global leaderboard."
            : "This is the name other players will see on the global leaderboard."}
        </p>

        <form
          className="ob-player-name-form"
          onSubmit={
            handleSubmit
          }
        >
          <label
            className="ob-player-name-field"
            htmlFor="ob-player-name-input"
          >
            <span>
              Player name
            </span>

            <div className="ob-player-name-input-wrap">
              <input
                ref={inputRef}
                id="ob-player-name-input"
                type="text"
                value={name}
                onChange={
                  handleNameChange
                }
                placeholder="Enter your name"
                minLength={2}
                maxLength={
                  PLAYER_NAME_MAX_LENGTH
                }
                autoComplete="nickname"
                autoCapitalize="words"
                enterKeyHint="done"
                disabled={
                  loading
                }
                required
              />

              <span
                className="ob-player-name-count"
                aria-hidden="true"
              >
                {characterCount}/
                {
                  PLAYER_NAME_MAX_LENGTH
                }
              </span>
            </div>
          </label>

          <div className="ob-player-name-rules">
            Letters, numbers,
            spaces, _ and -
          </div>

          {displayedError && (
            <div
              className="ob-player-name-error"
              role="alert"
              aria-live="polite"
            >
              {displayedError}
            </div>
          )}

          <div className="ob-player-name-actions">
            {canClose && (
              <button
                type="button"
                className="ob-player-name-cancel"
                onClick={
                  onClose
                }
                disabled={
                  loading
                }
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="ob-player-name-save"
              disabled={
                loading
              }
              aria-busy={
                loading
              }
            >
              {loading ? (
                <>
                  <span
                    className="ob-player-button-spinner"
                    aria-hidden="true"
                  />

                  Saving...
                </>
              ) : isEditing ? (
                "Save name"
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </form>

        {!canClose && (
          <div className="ob-player-name-note">
            Your progress will be
            linked to this browser
            using Firebase.
          </div>
        )}
      </section>
    </div>
  );
}

export default PlayerNameModal;