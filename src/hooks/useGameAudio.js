import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/*
=========================================================
KEEP IT TOGETHER — AUDIO MANAGER
=========================================================

Game audio is stored under public/audio.

Browser autoplay rules are respected:
background music should only be started
after a user interaction such as START GAME.
=========================================================
*/

const AUDIO_STORAGE_KEY =
  "keep-together-audio";

const AUDIO_BASE_PATH = `${import.meta.env.BASE_URL}audio/`;

const AUDIO_FILES = {
  background:
    `${AUDIO_BASE_PATH}background.wav`,

  block:
    `${AUDIO_BASE_PATH}shield-block.wav`,

  hit:
    `${AUDIO_BASE_PATH}balloon-hit.wav`,

  gameOver:
    `${AUDIO_BASE_PATH}game-over.wav`,

  click:
    `${AUDIO_BASE_PATH}ui-click.wav`,
};

const AUDIO_VOLUMES = {
  background: 0.28,
  block: 0.55,
  hit: 0.65,
  gameOver: 0.7,
  click: 0.35,
};

/*
=========================================================
LOCAL STORAGE
=========================================================
*/

function getInitialAudioPreference() {
  try {
    return (
      localStorage.getItem(
        AUDIO_STORAGE_KEY
      ) !== "off"
    );
  } catch {
    return true;
  }
}

function saveAudioPreference(
  enabled
) {
  try {
    localStorage.setItem(
      AUDIO_STORAGE_KEY,
      enabled
        ? "on"
        : "off"
    );
  } catch {
    /*
    Audio still works even when
    localStorage is unavailable.
    */
  }
}

/*
=========================================================
CREATE AUDIO ELEMENT
=========================================================
*/

function createAudio(
  source,
  {
    volume = 1,
    loop = false,
  } = {}
) {
  if (
    typeof window ===
      "undefined" ||
    typeof Audio ===
      "undefined"
  ) {
    return null;
  }

  const audio =
    new Audio();

  audio.src = source;
  audio.preload = "auto";
  audio.volume = volume;
  audio.loop = loop;

  /*
  Missing files must never crash
  the portfolio/game.
  */
  audio.addEventListener(
    "error",
    () => {
      /*
      Intentionally silent.

      This allows the project to run
      before the user adds the actual
      audio files.
      */
    }
  );

  return audio;
}

/*
=========================================================
HOOK
=========================================================
*/

export default function useGameAudio() {
  const [
    audioEnabled,
    setAudioEnabledState,
  ] = useState(
    getInitialAudioPreference
  );

  /*
  Holds all Audio objects.

  We create them once rather than
  recreating sounds on every render.
  */
  const audioRef =
    useRef({
      background: null,
      block: null,
      hit: null,
      gameOver: null,
      click: null,
    });

  /*
  Tracks whether background music
  was intentionally started.

  This lets us resume it when audio
  is turned back on.
  */
  const musicRequestedRef =
    useRef(false);

  /*
  Avoid firing the shield sound
  dozens of times in a few milliseconds
  during rapid collisions.
  */
  const lastBlockSoundRef =
    useRef(0);

  /*
  ========================================================
  INITIALIZE AUDIO
  ========================================================
  */

  useEffect(() => {
    const audioInstances = {
      background: createAudio(AUDIO_FILES.background, {
        volume: AUDIO_VOLUMES.background,
        loop: true,
      }),
      block: createAudio(AUDIO_FILES.block, {
        volume: AUDIO_VOLUMES.block,
      }),
      hit: createAudio(AUDIO_FILES.hit, {
        volume: AUDIO_VOLUMES.hit,
      }),
      gameOver: createAudio(AUDIO_FILES.gameOver, {
        volume: AUDIO_VOLUMES.gameOver,
      }),
      click: createAudio(AUDIO_FILES.click, {
        volume: AUDIO_VOLUMES.click,
      }),
    };

    audioRef.current = audioInstances;

    return () => {
      Object.values(
        audioInstances
      ).forEach(
        (audio) => {
          if (!audio) {
            return;
          }

          audio.pause();

          audio.removeAttribute(
            "src"
          );

          try {
            audio.load();
          } catch {
            /*
            Cleanup failure is harmless.
            */
          }
        }
      );
      if (audioRef.current === audioInstances) {
        audioRef.current = {
          background: null,
          block: null,
          hit: null,
          gameOver: null,
          click: null,
        };
      }
    };
  }, []);

  /*
  ========================================================
  BASIC SOUND PLAYER
  ========================================================
  */

  const playSound =
    useCallback(
      async (
        key,
        {
          restart = true,
        } = {}
      ) => {
        if (!audioEnabled) {
          return false;
        }

        const audio =
          audioRef.current[
            key
          ];

        if (!audio) {
          return false;
        }

        try {
          if (restart) {
            audio.currentTime = 0;
          }

          await audio.play();

          return true;
        } catch {
          /*
          Possible reasons:

          - file has not been added yet
          - browser blocked playback
          - audio is unsupported
          - user interaction has not happened

          None of these should break
          the actual game.
          */
          return false;
        }
      },
      [audioEnabled]
    );

  /*
  ========================================================
  BACKGROUND MUSIC
  ========================================================
  */

  const startBackgroundMusic =
    useCallback(
      async () => {
        /*
        Remember that the game wants
        music running even if audio
        is currently muted.
        */
        musicRequestedRef.current =
          true;

        if (!audioEnabled) {
          return false;
        }

        const music =
          audioRef.current.background;

        if (!music) {
          return false;
        }

        try {
          if (music.ended) {
            music.currentTime =
              0;
          }

          await music.play();

          return true;
        } catch {
          return false;
        }
      },
      [audioEnabled]
    );

  const pauseBackgroundMusic =
    useCallback(() => {
      const music =
        audioRef.current.background;

      if (!music) {
        return;
      }

      music.pause();
    }, []);

  const stopBackgroundMusic =
    useCallback(() => {
      musicRequestedRef.current =
        false;

      const music =
        audioRef.current.background;

      if (!music) {
        return;
      }

      music.pause();

      try {
        music.currentTime = 0;
      } catch {
        /*
        Ignore browser-specific
        media reset errors.
        */
      }
    }, []);

  /*
  ========================================================
  GAME SOUND EFFECTS
  ========================================================
  */

  const playBlock =
    useCallback(() => {
      const now =
        performance.now();

      /*
      55 ms cooldown prevents the same
      collision from sounding harsh when
      several objects are blocked together.
      */
      if (
        now -
          lastBlockSoundRef.current <
        55
      ) {
        return;
      }

      lastBlockSoundRef.current =
        now;

      void playSound(
        "block"
      );
    }, [playSound]);

  const playHit =
    useCallback(() => {
      void playSound(
        "hit"
      );
    }, [playSound]);

  const playGameOver =
    useCallback(() => {
      /*
      Stop music before the game-over
      sound is played.
      */
      stopBackgroundMusic();

      void playSound(
        "gameOver"
      );
    }, [
      playSound,
      stopBackgroundMusic,
    ]);

  const playUiClick =
    useCallback(() => {
      void playSound(
        "click"
      );
    }, [playSound]);

  /*
  ========================================================
  AUDIO ON / OFF
  ========================================================
  */

  const setAudioEnabled =
    useCallback(
      (enabled) => {
        const next =
          Boolean(enabled);

        setAudioEnabledState(
          next
        );

        saveAudioPreference(
          next
        );

        if (!next) {
          Object.values(
            audioRef.current
          ).forEach(
            (audio) => {
              audio?.pause();
            }
          );

          return;
        }

        /*
        If music was already requested
        by START GAME, try to resume it.

        Because turning audio ON itself
        is a user interaction, browsers
        normally permit playback here.
        */
        if (
          musicRequestedRef.current
        ) {
          const music =
            audioRef.current.background;

          if (music) {
            music
              .play()
              .catch(() => {
                /*
                Never interrupt gameplay
                because of audio.
                */
              });
          }
        }
      },
      []
    );

  const toggleAudio =
    useCallback(() => {
      const next =
        !audioEnabled;

      setAudioEnabled(
        next
      );

      return next;
    }, [
      audioEnabled,
      setAudioEnabled,
    ]);

  /*
  ========================================================
  TAB VISIBILITY
  ========================================================

  Pause music while the browser tab
  is hidden.

  Resume only when:
  - audio is enabled
  - the game previously requested music
  ========================================================
  */

  useEffect(() => {
    const handleVisibilityChange = () => {
      const music = audioRef.current.background;
      if (!music) return;

      if (document.hidden) {
        music.pause();
        return;
      }

      if (audioEnabled && musicRequestedRef.current) {
        music.play().catch(() => {
          // Resume failures must never interrupt gameplay.
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [audioEnabled]);

  /*
  ========================================================
  PUBLIC API
  ========================================================
  */

  return {
    audioEnabled,

    setAudioEnabled,

    toggleAudio,

    startBackgroundMusic,

    pauseBackgroundMusic,

    stopBackgroundMusic,

    playBlock,

    playHit,

    playGameOver,

    playUiClick,
  };
}
