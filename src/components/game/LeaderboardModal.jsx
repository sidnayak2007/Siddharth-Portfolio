import {
  useEffect,
} from "react";

/*
=========================================================
GLOBAL LEADERBOARD MODAL
=========================================================

Shows:

- Rank
- Player name
- Survival time
- Score
- Level

The leaderboard data itself is loaded through
playerService.js outside this component.

This component does NOT talk directly to Firestore.
=========================================================
*/

function formatTime(value) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return "0.0s";
  }

  return `${number.toFixed(1)}s`;
}

/*
=========================================================
RANK BADGE
=========================================================
*/

function RankBadge({
  rank,
}) {
  if (rank === 1) {
    return (
      <span
        className="ob-leaderboard-medal"
        aria-label="First place"
        title="First place"
      >
        🥇
      </span>
    );
  }

  if (rank === 2) {
    return (
      <span
        className="ob-leaderboard-medal"
        aria-label="Second place"
        title="Second place"
      >
        🥈
      </span>
    );
  }

  if (rank === 3) {
    return (
      <span
        className="ob-leaderboard-medal"
        aria-label="Third place"
        title="Third place"
      >
        🥉
      </span>
    );
  }

  return (
    <span className="ob-leaderboard-rank-number">
      #{rank}
    </span>
  );
}

/*
=========================================================
EMPTY STATE
=========================================================
*/

function EmptyLeaderboard() {
  return (
    <div className="ob-leaderboard-empty">
      <div
        className="ob-leaderboard-empty-icon"
        aria-hidden="true"
      >
        🏆
      </div>

      <strong>
        No scores yet
      </strong>

      <p>
        Be the first player on
        the leaderboard.
      </p>
    </div>
  );
}

/*
=========================================================
LOADING STATE
=========================================================
*/

function LoadingLeaderboard() {
  return (
    <div
      className="ob-leaderboard-loading"
      role="status"
      aria-live="polite"
    >
      <span
        className="ob-player-button-spinner"
        aria-hidden="true"
      />

      Loading leaderboard...
    </div>
  );
}

/*
=========================================================
LEADERBOARD
=========================================================
*/

function LeaderboardModal({
  open,
  loading = false,
  error = "",
  leaderboard = [],
  currentUserId = "",
  playerName = "",
  onClose,
  onRefresh,
  onChangeName,
}) {
  /*
  ========================================================
  ESCAPE TO CLOSE
  ========================================================
  */

  useEffect(() => {
    if (!open) {
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
    open,
    onClose,
  ]);

  /*
  ========================================================
  LOCK PAGE SCROLL
  ========================================================
  */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /*
  ========================================================
  BACKDROP CLOSE
  ========================================================
  */

  const handleBackdropClick =
    (event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        onClose?.();
      }
    };

  if (!open) {
    return null;
  }

  /*
  ========================================================
  CURRENT PLAYER
  ========================================================
  */

  const currentPlayer =
    Array.isArray(
      leaderboard
    )
      ? leaderboard.find(
          (player) =>
            player.uid ===
            currentUserId
        )
      : null;

  return (
    <div
      className="ob-leaderboard-modal"
      role="presentation"
      onMouseDown={
        handleBackdropClick
      }
    >
      <section
        className="ob-leaderboard-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ob-leaderboard-title"
      >
        {/*
        ===================================================
        HEADER
        ===================================================
        */}

        <header className="ob-leaderboard-header">
          <div className="ob-leaderboard-heading">
            <div
              className="ob-leaderboard-trophy"
              aria-hidden="true"
            >
              🏆
            </div>

            <div>
              <span className="ob-leaderboard-kicker">
                KEEP IT TOGETHER
              </span>

              <h2 id="ob-leaderboard-title">
                Global Leaderboard
              </h2>

              <p>
                Ranked by highest
                survival time.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ob-leaderboard-close"
            onClick={onClose}
            aria-label="Close leaderboard"
          >
            ×
          </button>
        </header>

        {/*
        ===================================================
        CURRENT PLAYER SUMMARY
        ===================================================
        */}

        <div className="ob-leaderboard-player-bar">
          <div className="ob-leaderboard-player-info">
            <span>
              Playing as
            </span>

            <strong>
              {playerName ||
                "Player"}
            </strong>
          </div>

          <div className="ob-leaderboard-player-actions">
            {currentPlayer && (
              <div className="ob-leaderboard-current-rank">
                <span>
                  YOUR RANK
                </span>

                <strong>
                  #
                  {
                    currentPlayer.rank
                  }
                </strong>
              </div>
            )}

            <button
              type="button"
              className="ob-leaderboard-name-button"
              onClick={
                onChangeName
              }
            >
              Change name
            </button>
          </div>
        </div>

        {/*
        ===================================================
        ERROR
        ===================================================
        */}

        {error && (
          <div
            className="ob-leaderboard-error"
            role="alert"
          >
            <strong>
              Could not load leaderboard.
            </strong>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={
                onRefresh
              }
            >
              Try again
            </button>
          </div>
        )}

        {/*
        ===================================================
        TABLE
        ===================================================
        */}

        <div className="ob-leaderboard-content">
          {loading ? (
            <LoadingLeaderboard />
          ) : !error &&
            leaderboard.length ===
              0 ? (
            <EmptyLeaderboard />
          ) : !error ? (
            <>
              {/*
              Desktop/tablet header.
              Hidden on smaller phones
              through responsive CSS.
              */}

              <div className="ob-leaderboard-table-head">
                <span>
                  RANK
                </span>

                <span>
                  PLAYER
                </span>

                <span>
                  TIME
                </span>

                <span>
                  SCORE
                </span>

                <span>
                  LEVEL
                </span>
              </div>

              <div className="ob-leaderboard-list">
                {leaderboard.map(
                  (
                    player
                  ) => {
                    const isCurrentPlayer =
                      player.uid ===
                      currentUserId;

                    return (
                      <div
                        key={
                          player.uid
                        }
                        className={`ob-leaderboard-row ${
                          isCurrentPlayer
                            ? "ob-leaderboard-row-current"
                            : ""
                        }`}
                      >
                        <div className="ob-leaderboard-rank">
                          <RankBadge
                            rank={
                              player.rank
                            }
                          />
                        </div>

                        <div className="ob-leaderboard-name">
                          <span
                            className="ob-leaderboard-avatar"
                            aria-hidden="true"
                          >
                            {(
                              player.name?.[0] ||
                              "P"
                            ).toUpperCase()}
                          </span>

                          <div>
                            <strong>
                              {
                                player.name
                              }
                            </strong>

                            {isCurrentPlayer && (
                              <small>
                                YOU
                              </small>
                            )}
                          </div>
                        </div>

                        <div className="ob-leaderboard-time">
                          <span className="ob-leaderboard-mobile-label">
                            TIME
                          </span>

                          <strong>
                            {formatTime(
                              player.bestTime
                            )}
                          </strong>
                        </div>

                        <div className="ob-leaderboard-score">
                          <span className="ob-leaderboard-mobile-label">
                            SCORE
                          </span>

                          <strong>
                            {
                              player.bestScore
                            }
                          </strong>
                        </div>

                        <div className="ob-leaderboard-level">
                          <span className="ob-leaderboard-mobile-label">
                            LEVEL
                          </span>

                          <strong>
                            {
                              player.level
                            }
                          </strong>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          ) : null}
        </div>

        {/*
        ===================================================
        FOOTER
        ===================================================
        */}

        <footer className="ob-leaderboard-footer">
          <div>
            <span>
              TOP
            </span>

            <strong>
              {leaderboard.length}
            </strong>

            <span>
              PLAYERS
            </span>
          </div>

          <div className="ob-leaderboard-footer-actions">
            <button
              type="button"
              className="ob-leaderboard-refresh"
              onClick={
                onRefresh
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              type="button"
              className="ob-leaderboard-done"
              onClick={
                onClose
              }
            >
              Done
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default LeaderboardModal;