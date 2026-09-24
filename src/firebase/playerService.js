import {
  collection,
  doc,
  getDoc,
  getCountFromServer,
  getDocs,
  limit as firestoreLimit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import {
  db,
} from "./firebase";

/*
=========================================================
PLAYER NAME RULES
=========================================================
*/

export const PLAYER_NAME_MIN_LENGTH = 2;
export const PLAYER_NAME_MAX_LENGTH = 18;

const PLAYER_NAME_PATTERN =
  /^[A-Za-z0-9 _-]+$/;

/*
=========================================================
NORMALIZE PLAYER NAME
=========================================================
*/

export function normalizePlayerName(
  value
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ");
}

/*
=========================================================
VALIDATE PLAYER NAME
=========================================================
*/

export function validatePlayerName(
  value
) {
  const name =
    normalizePlayerName(value);

  if (!name) {
    return {
      valid: false,
      name: "",
      message:
        "Enter a player name.",
    };
  }

  if (
    name.length <
    PLAYER_NAME_MIN_LENGTH
  ) {
    return {
      valid: false,
      name,
      message:
        `Name must be at least ${PLAYER_NAME_MIN_LENGTH} characters.`,
    };
  }

  if (
    name.length >
    PLAYER_NAME_MAX_LENGTH
  ) {
    return {
      valid: false,
      name,
      message:
        `Name must be ${PLAYER_NAME_MAX_LENGTH} characters or less.`,
    };
  }

  if (
    !PLAYER_NAME_PATTERN.test(name)
  ) {
    return {
      valid: false,
      name,
      message:
        "Use only letters, numbers, spaces, _ or -.",
    };
  }

  return {
    valid: true,
    name,
    message: "",
  };
}

/*
=========================================================
NUMBER HELPERS
=========================================================
*/

function safeNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return fallback;
  }

  return number;
}

function normalizeTime(
  value
) {
  const number =
    safeNumber(value);

  if (number <= 0) {
    return 0;
  }

  /*
  Keep leaderboard time to
  one decimal place.
  */
  return Math.round(
    number * 10
  ) / 10;
}

function normalizeScore(
  value
) {
  return Math.max(
    0,
    Math.floor(
      safeNumber(value)
    )
  );
}

function normalizeLevel(
  value
) {
  return Math.max(
    1,
    Math.floor(
      safeNumber(
        value,
        1
      )
    )
  );
}

/*
=========================================================
PLAYER DOCUMENT REFERENCE
=========================================================
*/

function playerRef(uid) {
  return doc(
    db,
    "players",
    uid
  );
}

/*
=========================================================
GET PLAYER PROFILE
=========================================================
*/

export async function getPlayerProfile(
  uid
) {
  if (!uid) {
    return null;
  }

  const snapshot =
    await getDoc(
      playerRef(uid)
    );

  if (!snapshot.exists()) {
    return null;
  }

  const data =
    snapshot.data();

  return {
    uid:
      snapshot.id,

    name:
      typeof data.name === "string"
        ? data.name
        : "",

    bestTime:
      normalizeTime(
        data.bestTime
      ),

    bestScore:
      normalizeScore(
        data.bestScore
      ),

    level:
      normalizeLevel(
        data.level
      ),

    createdAt:
      data.createdAt ?? null,

    updatedAt:
      data.updatedAt ?? null,
  };
}

/*
=========================================================
SAVE / CHANGE PLAYER NAME
=========================================================
*/

export async function savePlayerName(
  uid,
  rawName
) {
  if (!uid) {
    throw new Error(
      "A Firebase player UID is required."
    );
  }

  const validation =
    validatePlayerName(
      rawName
    );

  if (!validation.valid) {
    throw new Error(
      validation.message
    );
  }

  const name =
    validation.name;

  const reference =
    playerRef(uid);

  await runTransaction(
    db,
    async (
      transaction
    ) => {
      const snapshot =
        await transaction.get(
          reference
        );

      if (
        snapshot.exists()
      ) {
        transaction.update(
          reference,
          {
            name,
            updatedAt:
              serverTimestamp(),
          }
        );

        return;
      }

      /*
      First-time player.

      Create a safe empty leaderboard
      profile before they have played.
      */
      transaction.set(
        reference,
        {
          name,

          bestTime: 0,

          bestScore: 0,

          level: 1,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );
    }
  );

  return name;
}

/*
=========================================================
SUBMIT BEST RUN
=========================================================

Leaderboard priority:

1. Highest survival time
2. Higher score when time is tied
3. Higher level when both are tied

Only the player's BEST run is stored.
=========================================================
*/

export async function submitBestRun({
  uid,
  name,
  survivalTime,
  score,
  level,
}) {
  if (!uid) {
    throw new Error(
      "A Firebase player UID is required."
    );
  }

  const validation =
    validatePlayerName(name);

  if (!validation.valid) {
    throw new Error(
      validation.message
    );
  }

  const cleanName =
    validation.name;

  const runTime =
    normalizeTime(
      survivalTime
    );

  const runScore =
    normalizeScore(
      score
    );

  const runLevel =
    normalizeLevel(
      level
    );

  if (runTime <= 0) {
    return {
      updated: false,
      bestTime: 0,
      bestScore: 0,
      level: 1,
    };
  }

  const reference =
    playerRef(uid);

  let result = {
    updated: false,
    bestTime:
      runTime,
    bestScore:
      runScore,
    level:
      runLevel,
  };

  await runTransaction(
    db,
    async (
      transaction
    ) => {
      const snapshot =
        await transaction.get(
          reference
        );

      /*
      -----------------------------------------------
      FIRST EVER RUN
      -----------------------------------------------
      */

      if (
        !snapshot.exists()
      ) {
        transaction.set(
          reference,
          {
            name:
              cleanName,

            bestTime:
              runTime,

            bestScore:
              runScore,

            level:
              runLevel,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

        result = {
          updated: true,
          bestTime:
            runTime,
          bestScore:
            runScore,
          level:
            runLevel,
        };

        return;
      }

      /*
      -----------------------------------------------
      EXISTING PLAYER
      -----------------------------------------------
      */

      const current =
        snapshot.data();

      const currentTime =
        normalizeTime(
          current.bestTime
        );

      const currentScore =
        normalizeScore(
          current.bestScore
        );

      const currentLevel =
        normalizeLevel(
          current.level
        );

      /*
      Do not overwrite a newly changed
      Firestore name using an older
      cached name from the game.
      */
      const storedName =
        typeof current.name ===
          "string" &&
        current.name.trim()
          ? current.name
          : cleanName;

      /*
      Primary ranking:
      SURVIVAL TIME

      If survival time ties:
      SCORE

      If both tie:
      LEVEL
      */

      const betterTime =
        runTime >
        currentTime;

      const tiedTime =
        runTime ===
        currentTime;

      const betterScore =
        tiedTime &&
        runScore >
          currentScore;

      const tiedScore =
        tiedTime &&
        runScore ===
          currentScore;

      const betterLevel =
        tiedScore &&
        runLevel >
          currentLevel;

      const isBetterRun =
        betterTime ||
        betterScore ||
        betterLevel;

      if (
        !isBetterRun
      ) {
        result = {
          updated: false,
          bestTime:
            currentTime,
          bestScore:
            currentScore,
          level:
            currentLevel,
        };

        return;
      }

      transaction.update(
        reference,
        {
          name:
            storedName,

          bestTime:
            runTime,

          bestScore:
            runScore,

          level:
            runLevel,

          updatedAt:
            serverTimestamp(),
        }
      );

      result = {
        updated: true,
        bestTime:
          runTime,
        bestScore:
          runScore,
        level:
          runLevel,
      };
    }
  );

  return result;
}

/*
=========================================================
GET GLOBAL LEADERBOARD
=========================================================
*/

export async function getLeaderboard(
  requestedLimit = 50
) {
  const amount =
    Math.min(
      50,
      Math.max(
        1,
        Math.floor(
          safeNumber(
            requestedLimit,
            50
          )
        )
      )
    );

  const leaderboardQuery =
    query(
      collection(
        db,
        "players"
      ),
      orderBy(
        "bestTime",
        "desc"
      ),
      firestoreLimit(
        amount
      )
    );

  const snapshot =
    await getDocs(
      leaderboardQuery
    );

  const players =
    snapshot.docs
      .map(
        (document) => {
          const data =
            document.data();

          return {
            uid:
              document.id,

            name:
              typeof data.name ===
                "string" &&
              data.name.trim()
                ? data.name.trim()
                : "Player",

            bestTime:
              normalizeTime(
                data.bestTime
              ),

            bestScore:
              normalizeScore(
                data.bestScore
              ),

            level:
              normalizeLevel(
                data.level
              ),

            updatedAt:
              data.updatedAt ??
              null,
          };
        }
      )

      /*
      Profiles are created before the
      player necessarily completes a run.

      Don't display zero-time profiles.
      */
      .filter(
        (player) =>
          player.bestTime > 0
      );

  /*
  Firestore already sorts by survival time.

  We sort again client-side so equal survival
  times can use score and then level as the
  visible tie-breakers without requiring a
  composite Firestore index.
  */
  players.sort(
    (a, b) => {
      if (
        b.bestTime !==
        a.bestTime
      ) {
        return (
          b.bestTime -
          a.bestTime
        );
      }

      if (
        b.bestScore !==
        a.bestScore
      ) {
        return (
          b.bestScore -
          a.bestScore
        );
      }

      if (
        b.level !==
        a.level
      ) {
        return (
          b.level -
          a.level
        );
      }

      return a.name.localeCompare(
        b.name
      );
    }
  );

  return players.map(
    (
      player,
      index
    ) => ({
      ...player,
      rank:
        index + 1,
    })
  );
}

/*
=========================================================
FIND PLAYER INSIDE LOADED LEADERBOARD
=========================================================
*/

export function findPlayerRank(
  leaderboard,
  uid
) {
  if (
    !Array.isArray(
      leaderboard
    ) ||
    !uid
  ) {
    return null;
  }

  const index =
    leaderboard.findIndex(
      (player) =>
        player.uid === uid
    );

  if (index === -1) {
    return null;
  }

  return index + 1;
}

// Count every completed run so a player's standing is not limited to the top 50.
export async function getPlayerStanding({ uid, bestTime, bestScore, level, name = "" }) {
  const time = normalizeTime(bestTime);
  if (!uid || time <= 0) return null;

  const players = collection(db, "players");
  const [totalSnapshot, fasterSnapshot, tiedSnapshot] = await Promise.all([
    getCountFromServer(query(players, where("bestTime", ">", 0))),
    getCountFromServer(query(players, where("bestTime", ">", time))),
    getDocs(query(players, where("bestTime", "==", time))),
  ]);

  const score = normalizeScore(bestScore);
  const playerLevel = normalizeLevel(level);
  let aheadOnTie = 0;
  let behindOnTie = 0;
  for (const entry of tiedSnapshot.docs) {
    if (entry.id === uid) continue;
    const other = entry.data();
    const otherScore = normalizeScore(other.bestScore);
    const otherLevel = normalizeLevel(other.level);
    const comparison = otherScore - score || otherLevel - playerLevel;
    if (comparison > 0) aheadOnTie += 1;
    else if (comparison < 0) behindOnTie += 1;
    else if ((other.name || "Player").localeCompare(name || "Player") < 0) aheadOnTie += 1;
  }

  const total = totalSnapshot.data().count;
  const rank = fasterSnapshot.data().count + aheadOnTie + 1;
  const slower = Math.max(0, total - fasterSnapshot.data().count - tiedSnapshot.size);
  const betterThan = total > 1
    ? Math.round(((slower + behindOnTie) / (total - 1)) * 100)
    : null;

  return { rank, total, betterThan };
}
