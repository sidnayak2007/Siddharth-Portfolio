import {
  useEffect,
  useRef,
} from "react";

/* =========================================================
   DEFAULT COLORS
========================================================= */

const DEFAULT_PRIMARY =
  "#2877d8";

const DEFAULT_SECONDARY =
  "#8ac4ff";

const DEFAULT_SOFT =
  "#edf6ff";

/* =========================================================
   HOME BACKGROUND
========================================================= */

function HomeBackground({
  primary = DEFAULT_PRIMARY,
  secondary = DEFAULT_SECONDARY,
  soft = DEFAULT_SOFT,
}) {
  const backgroundRef =
    useRef(null);

  useEffect(() => {
    const element = backgroundRef.current;
    if (!element) return undefined;
    const syncVisibility = () => {
      element.classList.toggle("ps-background-paused", document.hidden);
    };
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div
      ref={
        backgroundRef
      }
      className="ps-background"
      style={{
        "--bg-primary":
          primary ||
          DEFAULT_PRIMARY,

        "--bg-secondary":
          secondary ||
          DEFAULT_SECONDARY,

        "--bg-soft":
          soft ||
          DEFAULT_SOFT,
      }}
      aria-hidden="true"
    >
      {/*
      =====================================================
      BASE GRADIENT
      =====================================================
      */}

      <div className="ps-background-base" />

      {/*
      =====================================================
      AURORA GLOWS
      =====================================================
      */}

      <div className="ps-fast-glow ps-fast-glow-one" />

      <div className="ps-fast-glow ps-fast-glow-two" />

      <svg className="ps-decorative-curves" viewBox="0 0 1706 922" preserveAspectRatio="xMidYMid slice" focusable="false">
        <path className="ps-curve-blue" d="M-20 242 C 235 221 421 129 725 -12" />
        <path className="ps-curve-blue" d="M-35 494 C 200 473 345 755 693 792 S 1118 858 1360 671 S 1550 408 1745 320" />
        <path className="ps-curve-faint" d="M68 231 C 123 100 267 89 347 158 S 367 255 273 282 S 201 348 218 379" />
        <path className="ps-curve-faint" d="M1107 818 C 1358 728 1431 460 1737 303" />
        <circle className="ps-curve-white" cx="1552" cy="18" r="244" />
        <circle className="ps-curve-white" cx="1552" cy="18" r="143" />
        <circle className="ps-curve-white" cx="128" cy="819" r="219" />
        <circle className="ps-curve-white" cx="128" cy="819" r="321" />
      </svg>

      {/* Small decorations stay at the outer edges of the Home canvas. */}
      <div className="ps-bubble ps-bubble-one" />
      <div className="ps-bubble ps-bubble-two" />
      <div className="ps-bubble ps-bubble-three" />
      <div className="ps-bubble ps-bubble-four" />
      <div className="ps-bubble ps-bubble-five" />
      <div className="ps-bubble ps-bubble-six" />
      <div className="ps-bubble ps-bubble-seven" />
      <div className="ps-bubble ps-bubble-eight" />

      <div className="ps-dots ps-dots-one" />
      <div className="ps-dots ps-dots-two" />
      <div className="ps-dots ps-dots-three" />
      <div className="ps-dots ps-dots-four" />

      {/*
      =====================================================
      EDGE DEPTH
      =====================================================
      */}

      <div className="ps-background-vignette" />
    </div>
  );
}

export default HomeBackground;
