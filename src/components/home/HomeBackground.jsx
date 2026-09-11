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

  /* =======================================================
     DESKTOP POINTER PARALLAX
  ======================================================== */

  useEffect(() => {
    const element =
      backgroundRef.current;

    if (!element) {
      return undefined;
    }

    const finePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      );

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (
      !finePointer.matches ||
      reducedMotion.matches
    ) {
      element.style.transform =
        "";

      return undefined;
    }

    let frameId = null;

    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;

    /*
    ======================================================
    ANIMATION

    The movement is intentionally very small.
    It should feel like depth, not like the page
    is following the cursor.
    ======================================================
    */

    const animate = () => {
      currentX +=
        (targetX -
          currentX) *
        0.075;

      currentY +=
        (targetY -
          currentY) *
        0.075;

      element.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0) scale(1.025)`;

      const stillMoving =
        Math.abs(
          targetX -
            currentX
        ) >
          0.05 ||
        Math.abs(
          targetY -
            currentY
        ) >
          0.05;

      if (stillMoving) {
        frameId =
          window.requestAnimationFrame(
            animate
          );
      } else {
        frameId = null;
      }
    };

    const requestAnimation =
      () => {
        if (
          frameId !==
          null
        ) {
          return;
        }

        frameId =
          window.requestAnimationFrame(
            animate
          );
      };

    /*
    ======================================================
    POINTER MOVE
    ======================================================
    */

    const handlePointerMove =
      (event) => {
        const normalizedX =
          event.clientX /
            window.innerWidth -
          0.5;

        const normalizedY =
          event.clientY /
            window.innerHeight -
          0.5;

        targetX =
          normalizedX *
          -12;

        targetY =
          normalizedY *
          -8;

        requestAnimation();
      };

    /*
    ======================================================
    RESET WHEN POINTER LEAVES
    ======================================================
    */

    const handlePointerLeave =
      () => {
        targetX = 0;
        targetY = 0;

        requestAnimation();
      };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive: true,
      }
    );

    document.addEventListener(
      "mouseleave",
      handlePointerLeave
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      document.removeEventListener(
        "mouseleave",
        handlePointerLeave
      );

      if (
        frameId !== null
      ) {
        window.cancelAnimationFrame(
          frameId
        );
      }

      element.style.transform =
        "";
    };
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

      {/*
      =====================================================
      PS5-INSPIRED WAVES
      =====================================================
      */}

      <div className="ps-fast-wave ps-fast-wave-one" />

      <div className="ps-fast-wave ps-fast-wave-two" />

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