import { useEffect, useRef, useState } from "react";
import "../../css/game.css";

import { signInPlayer } from "../../firebase/firebase";

import {
  getLeaderboard,
  getPlayerProfile,
  savePlayerName,
  submitBestRun,
} from "../../firebase/playerService";

import PlayerNameModal from "../game/PlayerNameModal";
import LeaderboardModal from "../game/LeaderboardModal";
import AudioToggle from "../game/AudioToggle";
import useGameAudio from "../../hooks/useGameAudio";

const TAU = Math.PI * 2;
const STORAGE_KEY = "officeBalloonBest";
const PLAYER_NAME_STORAGE_KEY =
  "keep-together-player-name";

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const lerp = (a, b, t) =>
  a + (b - a) * t;

const randomBetween = (random, min, max) =>
  min + (max - min) * random();

const OFFICE_OBJECTS = [
  {
    id: "paper",
    unlock: 0,
    weight: 12,
    speed: 285,
    gravity: 45,
    radius: 13,
  },
  {
    id: "pen",
    unlock: 0,
    weight: 11,
    speed: 355,
    gravity: 80,
    radius: 9,
  },
  {
    id: "sticky",
    unlock: 0,
    weight: 10,
    speed: 270,
    gravity: 40,
    radius: 12,
  },
  {
    id: "eraser",
    unlock: 8,
    weight: 8,
    speed: 315,
    gravity: 145,
    radius: 13,
  },
  {
    id: "folder",
    unlock: 15,
    weight: 7,
    speed: 300,
    gravity: 90,
    radius: 20,
  },
  {
    id: "mug",
    unlock: 22,
    weight: 6,
    speed: 280,
    gravity: 185,
    radius: 19,
  },
  {
    id: "stapler",
    unlock: 28,
    weight: 5,
    speed: 315,
    gravity: 175,
    radius: 17,
  },
  {
    id: "bottle",
    unlock: 34,
    weight: 5,
    speed: 320,
    gravity: 125,
    radius: 16,
  },
  {
    id: "mouse",
    unlock: 42,
    weight: 4,
    speed: 340,
    gravity: 135,
    radius: 16,
  },
  {
    id: "keyboard",
    unlock: 52,
    weight: 3,
    speed: 300,
    gravity: 95,
    radius: 27,
  },
  {
    id: "files",
    unlock: 60,
    weight: 3,
    speed: 285,
    gravity: 140,
    radius: 26,
  },
  {
    id: "laptop",
    unlock: 72,
    weight: 2,
    speed: 270,
    gravity: 155,
    radius: 29,
  },
  {
    id: "box",
    unlock: 82,
    weight: 1.5,
    speed: 255,
    gravity: 185,
    radius: 31,
  },
];

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(
    r,
    Math.abs(w) / 2,
    Math.abs(h) / 2
  );

  ctx.beginPath();
  ctx.moveTo(x + radius, y);

  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);

  ctx.closePath();
}

function mulberry32(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let t = value;

    t = Math.imul(
      t ^ (t >>> 15),
      t | 1
    );

    t ^=
      t +
      Math.imul(
        t ^ (t >>> 7),
        t | 61
      );

    return (
      ((t ^ (t >>> 14)) >>> 0) /
      4294967296
    );
  };
}

function readBest() {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const value = Number(
      window.localStorage.getItem(STORAGE_KEY)
    );

    return Number.isFinite(value) && value > 0
      ? Math.floor(value)
      : 0;
  } catch {
    return 0;
  }
}

function floorY(runtime) {
  return (
    runtime.height -
    clamp(
      runtime.height * 0.12,
      64,
      92
    )
  );
}

function ceilingY(runtime) {
  return clamp(
    runtime.height * 0.09,
    50,
    70
  );
}

function difficultyFromTime(time) {
  const t = clamp(time / 105, 0, 1);

  return t * t * (3 - 2 * t);
}

function createRuntime(width, height, best) {
  const random = mulberry32(
    (
      Date.now() ^
      Math.floor(
        Math.random() * 0xffffffff
      )
    ) >>> 0
  );

  const scale = clamp(
    height / 650,
    0.74,
    1.08
  );

  return {
    width,
    height,
    scale,
    random,

    elapsed: 0,
    score: 0,
    best,

    difficulty: 0,

    blocks: 0,
    closeSaves: 0,
    combo: 0,
    highestCombo: 0,

    audioEvents: {
      block: 0,
      hit: 0,
    },

    nextAttackAt: 1.8,

    warnings: [],
    projectiles: [],
    fragments: [],

    dead: false,
    deadTimer: 0,

    lastFrame: 0,

    pointer: {
      active: false,
      down: false,

      x: width * 0.5,
      y: height * 0.54,
    },

    protector: {
      x: width * 0.5,
      y: height * 0.55,

      targetX: width * 0.5,
      targetY: height * 0.55,

      size: 52 * scale,

      angle: 0,
      impact: 0,
    },

    balloon: {
      x: width * 0.55,
      y: height * 0.39,

      vx: 38 * scale,
      vy: -14 * scale,

      targetX: width * 0.58,
      targetY: height * 0.38,

      wanderTimer: 1.2,

      angle: 0,
      wobble: 0,
      squash: 0,
    },
  };
}

function chooseObject(runtime) {
  const available = OFFICE_OBJECTS.filter(
    (item) =>
      runtime.elapsed >= item.unlock
  );

  const totalWeight = available.reduce(
    (total, item) => {
      const lateBias =
        1 +
        runtime.difficulty *
          (item.unlock / 100) *
          1.7;

      return (
        total +
        item.weight * lateBias
      );
    },
    0
  );

  let roll =
    runtime.random() * totalWeight;

  for (const item of available) {
    const lateBias =
      1 +
      runtime.difficulty *
        (item.unlock / 100) *
        1.7;

    roll -=
      item.weight * lateBias;

    if (roll <= 0) {
      return item;
    }
  }

  return available[0];
}

function chooseDirection(runtime) {
  const roll = runtime.random();

  if (runtime.elapsed < 18) {
    return roll < 0.5
      ? "left"
      : "right";
  }

  if (runtime.elapsed < 45) {
    if (roll < 0.44) {
      return "left";
    }

    if (roll < 0.88) {
      return "right";
    }

    return "top";
  }

  if (roll < 0.38) {
    return "left";
  }

  if (roll < 0.76) {
    return "right";
  }

  return "top";
}

function scheduleWarning(runtime, delay = 0) {
  const objectType = chooseObject(runtime);
  const direction = chooseDirection(runtime);

  const warningDuration = lerp(
    0.88,
    0.46,
    runtime.difficulty
  );

  runtime.warnings.push({
    objectType,
    direction,

    delay,

    timer:
      warningDuration + delay,

    warningDuration,
  });
}

function scheduleAttack(runtime) {
  scheduleWarning(runtime);

  if (
    runtime.elapsed > 28 &&
    runtime.random() <
      lerp(
        0,
        0.33,
        runtime.difficulty
      )
  ) {
    scheduleWarning(
      runtime,
      randomBetween(
        runtime.random,
        0.16,
        0.34
      )
    );
  }

  if (
    runtime.elapsed > 70 &&
    runtime.random() <
      0.13 * runtime.difficulty
  ) {
    scheduleWarning(
      runtime,
      randomBetween(
        runtime.random,
        0.36,
        0.54
      )
    );
  }

  const interval = lerp(
    1.75,
    0.68,
    runtime.difficulty
  );

  runtime.nextAttackAt =
    runtime.elapsed +
    interval +
    randomBetween(
      runtime.random,
      0.08,
      0.38
    );
}

function launchProjectile(runtime, warning) {
  const object = warning.objectType;
  const direction = warning.direction;

  const s = runtime.scale;

  const floor = floorY(runtime);
  const ceiling = ceilingY(runtime);

  const balloon = runtime.balloon;

  const predictedX =
    balloon.x +
    balloon.vx *
      lerp(
        0.24,
        0.42,
        runtime.difficulty
      );

  const predictedY =
    balloon.y +
    balloon.vy *
      lerp(
        0.24,
        0.42,
        runtime.difficulty
      );

  const spread = lerp(
    92,
    24,
    runtime.difficulty
  ) * s;

  const targetX = clamp(
    predictedX +
      randomBetween(
        runtime.random,
        -spread,
        spread
      ),

    75 * s,
    runtime.width - 75 * s
  );

  const targetY = clamp(
    predictedY +
      randomBetween(
        runtime.random,
        -spread,
        spread
      ),

    ceiling + 65 * s,
    floor - 70 * s
  );

  const speed =
    object.speed *
    lerp(
      0.92,
      1.48,
      runtime.difficulty
    ) *
    s;

  let x;
  let y;

  if (direction === "left") {
    x = -70 * s;

    y = clamp(
      targetY +
        randomBetween(
          runtime.random,
          -45,
          45
        ) *
          s,

      ceiling + 60 * s,
      floor - 65 * s
    );
  } else if (direction === "right") {
    x =
      runtime.width +
      70 * s;

    y = clamp(
      targetY +
        randomBetween(
          runtime.random,
          -45,
          45
        ) *
          s,

      ceiling + 60 * s,
      floor - 65 * s
    );
  } else {
    x = clamp(
      targetX +
        randomBetween(
          runtime.random,
          -80,
          80
        ) *
          s,

      65 * s,
      runtime.width - 65 * s
    );

    y =
      ceiling -
      75 * s;
  }

  const dx =
    targetX - x;

  const dy =
    targetY - y;

  const distance = Math.max(
    1,
    Math.hypot(dx, dy)
  );

  runtime.projectiles.push({
    type: object.id,

    x,
    y,

    vx:
      (dx / distance) *
      speed,

    vy:
      (dy / distance) *
      speed,

    gravity:
      object.gravity * s,

    radius:
      object.radius * s,

    rotation:
      randomBetween(
        runtime.random,
        -1,
        1
      ),

    vr:
      randomBetween(
        runtime.random,
        -5.5,
        5.5
      ),

    dead: false,
  });
}

function updateBalloon(runtime, dt) {
  const balloon = runtime.balloon;

  const s = runtime.scale;

  const floor = floorY(runtime);
  const ceiling = ceilingY(runtime);

  balloon.wanderTimer -= dt;

  if (balloon.wanderTimer <= 0) {
    const marginX = 110 * s;
    const marginTop =
      ceiling + 85 * s;

    const marginBottom =
      floor - 100 * s;

    balloon.targetX =
      randomBetween(
        runtime.random,
        marginX,
        runtime.width -
          marginX
      );

    balloon.targetY =
      randomBetween(
        runtime.random,
        marginTop,
        marginBottom
      );

    balloon.wanderTimer =
      randomBetween(
        runtime.random,
        1.35,
        2.55
      ) *
      lerp(
        1,
        0.75,
        runtime.difficulty
      );
  }

  const dx =
    balloon.targetX -
    balloon.x;

  const dy =
    balloon.targetY -
    balloon.y;

  const steering = lerp(
    0.78,
    1.15,
    runtime.difficulty
  );

  balloon.vx +=
    dx *
    steering *
    dt;

  balloon.vy +=
    dy *
    steering *
    dt;

  balloon.vy -=
    9 * s * dt;

  balloon.vx +=
    Math.sin(
      runtime.elapsed * 1.25
    ) *
    5 *
    s *
    dt;

  balloon.vy +=
    Math.cos(
      runtime.elapsed * 1.05
    ) *
    3 *
    s *
    dt;

  const maxSpeed = lerp(
    78,
    128,
    runtime.difficulty
  ) * s;

  const speed =
    Math.hypot(
      balloon.vx,
      balloon.vy
    );

  if (speed > maxSpeed) {
    const ratio =
      maxSpeed / speed;

    balloon.vx *= ratio;
    balloon.vy *= ratio;
  }

  const drag =
    Math.exp(-1.55 * dt);

  balloon.vx *= drag;
  balloon.vy *= drag;

  balloon.x +=
    balloon.vx * dt;

  balloon.y +=
    balloon.vy * dt;

  const rx = 31 * s;
  const ry = 40 * s;

  const left =
    38 * s + rx;

  const right =
    runtime.width -
    38 * s -
    rx;

  const top =
    ceiling +
    16 * s +
    ry;

  const bottom =
    floor -
    22 * s -
    ry;

  if (balloon.x < left) {
    balloon.x = left;

    balloon.vx =
      Math.abs(balloon.vx) *
      0.8;

    balloon.targetX =
      runtime.width * 0.55;
  }

  if (balloon.x > right) {
    balloon.x = right;

    balloon.vx =
      -Math.abs(balloon.vx) *
      0.8;

    balloon.targetX =
      runtime.width * 0.45;
  }

  if (balloon.y < top) {
    balloon.y = top;

    balloon.vy =
      Math.abs(balloon.vy) *
      0.75;

    balloon.targetY =
      runtime.height * 0.45;
  }

  if (balloon.y > bottom) {
    balloon.y = bottom;

    balloon.vy =
      -Math.abs(balloon.vy) *
      0.75;

    balloon.targetY =
      runtime.height * 0.38;
  }

  balloon.angle +=
    (
      clamp(
        balloon.vx /
          (480 * s),
        -0.2,
        0.2
      ) -
      balloon.angle
    ) *
    (
      1 -
      Math.exp(-5 * dt)
    );

  balloon.wobble +=
    dt *
    (
      1.7 +
      speed /
        (120 * s)
    );
}

function updateProtector(runtime, dt) {
  const protector =
    runtime.protector;

  const balloon =
    runtime.balloon;

  if (runtime.pointer.active) {
    protector.targetX =
      runtime.pointer.x;

    protector.targetY =
      runtime.pointer.y;
  }

  const response =
    runtime.pointer.down
      ? 22
      : 18;

  const smoothing =
    1 -
    Math.exp(
      -response * dt
    );

  protector.x +=
    (
      protector.targetX -
      protector.x
    ) *
    smoothing;

  protector.y +=
    (
      protector.targetY -
      protector.y
    ) *
    smoothing;

  const half =
    protector.size / 2;

  protector.x = clamp(
    protector.x,
    half + 8,
    runtime.width -
      half -
      8
  );

  protector.y = clamp(
    protector.y,
    ceilingY(runtime) +
      half +
      6,

    floorY(runtime) -
      half -
      6
  );

  // Do not allow the player to simply camp directly on the balloon.
  const dx =
    protector.x -
    balloon.x;

  const dy =
    protector.y -
    balloon.y;

  const distance =
    Math.max(
      0.001,
      Math.hypot(dx, dy)
    );

  const minimumDistance =
    58 *
    runtime.scale;

  if (
    distance <
    minimumDistance
  ) {
    const nx =
      dx / distance;

    const ny =
      dy / distance;

    protector.x =
      balloon.x +
      nx *
        minimumDistance;

    protector.y =
      balloon.y +
      ny *
        minimumDistance;

    protector.x = clamp(
      protector.x,
      half + 8,
      runtime.width -
        half -
        8
    );

    protector.y = clamp(
      protector.y,
      ceilingY(runtime) +
        half +
        6,

      floorY(runtime) -
        half -
        6
    );
  }

  protector.angle +=
    (
      clamp(
        (
          protector.targetX -
          protector.x
        ) /
          500,
        -0.08,
        0.08
      ) -
      protector.angle
    ) *
    (
      1 -
      Math.exp(
        -8 * dt
      )
    );

  protector.impact *=
    Math.exp(
      -7 * dt
    );
}
function circleVsProtector(
  projectile,
  protector
) {
  const half =
    protector.size *
    0.45;

  const closestX = clamp(
    projectile.x,
    protector.x - half,
    protector.x + half
  );

  const closestY = clamp(
    projectile.y,
    protector.y - half,
    protector.y + half
  );

  const dx =
    projectile.x -
    closestX;

  const dy =
    projectile.y -
    closestY;

  const radius =
    projectile.radius *
    0.72;

  return (
    dx * dx +
      dy * dy <=
    radius * radius
  );
}

function projectileHitsBalloon(
  projectile,
  runtime
) {
  const balloon =
    runtime.balloon;

  const s =
    runtime.scale;

  const rx =
    25 * s +
    projectile.radius *
      0.68;

  const ry =
    33 * s +
    projectile.radius *
      0.68;

  const nx =
    (
      projectile.x -
      balloon.x
    ) /
    rx;

  const ny =
    (
      projectile.y -
      balloon.y
    ) /
    ry;

  return (
    nx * nx +
      ny * ny <=
    1
  );
}

function distanceToBalloon(
  projectile,
  runtime
) {
  return Math.hypot(
    projectile.x -
      runtime.balloon.x,

    projectile.y -
      runtime.balloon.y
  );
}

function spawnBreakFragments(
  runtime,
  projectile,
  count = 6
) {
  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const angle =
      randomBetween(
        runtime.random,
        0,
        TAU
      );

    const speed =
      randomBetween(
        runtime.random,
        65,
        175
      ) *
      runtime.scale;

    runtime.fragments.push({
      kind: "object",

      x: projectile.x,
      y: projectile.y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
        speed,

      size:
        randomBetween(
          runtime.random,
          3,
          7
        ) *
        runtime.scale,

      rotation:
        randomBetween(
          runtime.random,
          -1,
          1
        ),

      vr:
        randomBetween(
          runtime.random,
          -8,
          8
        ),

      life:
        randomBetween(
          runtime.random,
          0.3,
          0.55
        ),

      color:
        projectile.type ===
        "mug"
          ? "#d8d2c6"
          : projectile.type ===
              "sticky"
            ? "#d3c36f"
            : projectile.type ===
                "paper"
              ? "#ece7dc"
              : "#6d6962",
    });
  }
}

function breakProjectile(
  runtime,
  projectile
) {
  projectile.dead = true;

  /*
  Audio is handled outside the physics engine.

  We only increment an event counter here.
  The React layer watches this value and
  plays the appropriate sound.
  */
  runtime.audioEvents.block += 1;

  runtime.blocks += 1;
  runtime.combo += 1;

  runtime.highestCombo =
    Math.max(
      runtime.highestCombo,
      runtime.combo
    );

  runtime.protector.impact = 1;

  const distance =
    distanceToBalloon(
      projectile,
      runtime
    );

  const closeDistance =
    108 *
    runtime.scale;

  const closeSave =
    distance <
    closeDistance;

  if (closeSave) {
    runtime.closeSaves += 1;
  }

  runtime.score +=
    50 +
    Math.min(
      runtime.combo,
      10
    ) *
      8 +
    (closeSave
      ? 100
      : 0);

  spawnBreakFragments(
    runtime,
    projectile,
    projectile.radius >
      22 *
        runtime.scale
      ? 8
      : 5
  );
}

function triggerBalloonPop(
  runtime
) {
  if (runtime.dead) {
    return;
  }

  runtime.dead = true;
  runtime.deadTimer = 0;

  /*
  Same approach as block sounds:
  physics only records the event.
  */
  runtime.audioEvents.hit += 1;

  const balloon =
    runtime.balloon;

  for (
    let i = 0;
    i < 15;
    i += 1
  ) {
    const angle =
      (
        i / 15
      ) *
        TAU +
      randomBetween(
        runtime.random,
        -0.18,
        0.18
      );

    const speed =
      randomBetween(
        runtime.random,
        100,
        245
      ) *
      runtime.scale;

    runtime.fragments.push({
      kind: "balloon",

      x: balloon.x,
      y: balloon.y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
          speed -
        35 *
          runtime.scale,

      size:
        randomBetween(
          runtime.random,
          4,
          9
        ) *
        runtime.scale,

      rotation:
        randomBetween(
          runtime.random,
          -1,
          1
        ),

      vr:
        randomBetween(
          runtime.random,
          -8,
          8
        ),

      life:
        randomBetween(
          runtime.random,
          0.38,
          0.72
        ),

      color:
        "#a9503d",
    });
  }
}

function projectileOffscreen(
  projectile,
  runtime
) {
  const margin =
    130 *
    runtime.scale;

  return (
    projectile.x <
      -margin ||
    projectile.x >
      runtime.width +
        margin ||
    projectile.y <
      -margin ||
    projectile.y >
      runtime.height +
        margin
  );
}

function updateFragments(
  runtime,
  dt
) {
  for (
    const fragment of
    runtime.fragments
  ) {
    fragment.life -= dt;

    fragment.vy +=
      350 *
      runtime.scale *
      dt;

    fragment.x +=
      fragment.vx *
      dt;

    fragment.y +=
      fragment.vy *
      dt;

    fragment.rotation +=
      fragment.vr *
      dt;
  }

  runtime.fragments =
    runtime.fragments.filter(
      (fragment) =>
        fragment.life > 0
    );
}

function updateRuntime(
  runtime,
  dt
) {
  if (runtime.dead) {
    runtime.deadTimer +=
      dt;

    updateFragments(
      runtime,
      dt * 0.75
    );

    return;
  }

  runtime.elapsed += dt;

  runtime.difficulty =
    difficultyFromTime(
      runtime.elapsed
    );

  updateBalloon(
    runtime,
    dt
  );

  updateProtector(
    runtime,
    dt
  );

  if (
    runtime.elapsed >=
    runtime.nextAttackAt
  ) {
    scheduleAttack(
      runtime
    );
  }

  const remainingWarnings =
    [];

  for (
    const warning of
    runtime.warnings
  ) {
    warning.timer -= dt;

    if (
      warning.timer <= 0
    ) {
      launchProjectile(
        runtime,
        warning
      );
    } else {
      remainingWarnings.push(
        warning
      );
    }
  }

  runtime.warnings =
    remainingWarnings;

  const remainingProjectiles =
    [];

  for (
    const projectile of
    runtime.projectiles
  ) {
    projectile.vy +=
      projectile.gravity *
      dt;

    projectile.x +=
      projectile.vx *
      dt;

    projectile.y +=
      projectile.vy *
      dt;

    projectile.rotation +=
      projectile.vr *
      dt;

    if (
      circleVsProtector(
        projectile,
        runtime.protector
      )
    ) {
      breakProjectile(
        runtime,
        projectile
      );

      continue;
    }

    if (
      projectileHitsBalloon(
        projectile,
        runtime
      )
    ) {
      triggerBalloonPop(
        runtime
      );

      remainingProjectiles.push(
        projectile
      );

      break;
    }

    if (
      projectileOffscreen(
        projectile,
        runtime
      )
    ) {
      runtime.combo = 0;

      continue;
    }

    remainingProjectiles.push(
      projectile
    );
  }

  runtime.projectiles =
    remainingProjectiles;

  updateFragments(
    runtime,
    dt
  );

  runtime.score +=
    dt *
    (
      62 +
      runtime.difficulty *
        28
    );
}

function drawBackground(
  ctx,
  runtime
) {
  const w =
    runtime.width;

  const h =
    runtime.height;

  const s =
    runtime.scale;

  const ceiling =
    ceilingY(runtime);

  const floor =
    floorY(runtime);

  const wall =
    ctx.createLinearGradient(
      0,
      0,
      0,
      floor
    );

  wall.addColorStop(
    0,
    "#ddd8d0"
  );

  wall.addColorStop(
    1,
    "#c9c2b8"
  );

  ctx.fillStyle =
    wall;

  ctx.fillRect(
    0,
    0,
    w,
    h
  );

  ctx.fillStyle =
    "#d4cfc6";

  ctx.fillRect(
    0,
    0,
    w,
    ceiling
  );

  ctx.strokeStyle =
    "rgba(64,60,55,0.12)";

  for (
    let x = 0;
    x < w;
    x += 150 * s
  ) {
    ctx.beginPath();

    ctx.moveTo(
      x,
      0
    );

    ctx.lineTo(
      x,
      ceiling
    );

    ctx.stroke();
  }

  const windowTop =
    ceiling +
    24 * s;

  const windowBottom =
    floor -
    150 * s;

  const windowLeft =
    50 * s;

  const windowRight =
    w -
    50 * s;

  const sky =
    ctx.createLinearGradient(
      0,
      windowTop,
      0,
      windowBottom
    );

  sky.addColorStop(
    0,
    "#e2e4e0"
  );

  sky.addColorStop(
    1,
    "#bdc4c1"
  );

  ctx.fillStyle =
    sky;

  ctx.fillRect(
    windowLeft,
    windowTop,
    windowRight -
      windowLeft,
    windowBottom -
      windowTop
  );

  const skylineBottom =
    windowBottom -
    8 * s;

  const count =
    Math.ceil(
      w /
        (90 * s)
    ) + 2;

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const width =
      (
        55 +
        ((i * 31) % 48)
      ) *
      s;

    const height =
      (
        48 +
        ((i * 73) % 125)
      ) *
      s;

    const x =
      windowLeft +
      i * 88 * s;

    ctx.fillStyle =
      i % 3 === 0
        ? "rgba(77,87,87,0.23)"
        : "rgba(90,98,97,0.18)";

    ctx.fillRect(
      x,
      skylineBottom -
        height,
      width,
      height
    );
  }

  ctx.fillStyle =
    "rgba(250,247,238,0.28)";

  ctx.fillRect(
    windowLeft,
    windowTop,
    windowRight -
      windowLeft,
    windowBottom -
      windowTop
  );

  ctx.strokeStyle =
    "rgba(54,57,56,0.42)";

  ctx.lineWidth =
    5 * s;

  ctx.strokeRect(
    windowLeft,
    windowTop,
    windowRight -
      windowLeft,
    windowBottom -
      windowTop
  );

  for (
    let i = 1;
    i < 5;
    i += 1
  ) {
    const x =
      windowLeft +
      (
        windowRight -
        windowLeft
      ) *
        (i / 5);

    ctx.beginPath();

    ctx.moveTo(
      x,
      windowTop
    );

    ctx.lineTo(
      x,
      windowBottom
    );

    ctx.stroke();
  }

  drawOfficeFurniture(
    ctx,
    runtime
  );

  const floorGradient =
    ctx.createLinearGradient(
      0,
      floor,
      0,
      h
    );

  floorGradient.addColorStop(
    0,
    "#b9aea2"
  );

  floorGradient.addColorStop(
    1,
    "#91877d"
  );

  ctx.fillStyle =
    floorGradient;

  ctx.fillRect(
    0,
    floor,
    w,
    h - floor
  );

  ctx.strokeStyle =
    "rgba(63,57,52,0.14)";

  for (
    let y =
      floor +
      28 * s;

    y < h;

    y +=
      30 * s
  ) {
    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      w,
      y
    );

    ctx.stroke();
  }
}

function drawOfficeFurniture(
  ctx,
  runtime
) {
  const s =
    runtime.scale;

  const floor =
    floorY(runtime);

  const deskY =
    floor -
    126 * s;

  const deskPositions =
    [
      runtime.width *
        0.1,

      runtime.width *
        0.4,
    ];

  deskPositions.forEach(
    (
      x,
      index
    ) => {
      const deskWidth =
        205 * s;

      ctx.fillStyle =
        index === 0
          ? "rgba(145,105,72,0.72)"
          : "rgba(127,92,67,0.72)";

      roundedRect(
        ctx,
        x,
        deskY,
        deskWidth,
        13 * s,
        4 * s
      );

      ctx.fill();

      ctx.fillStyle =
        "rgba(60,60,57,0.65)";

      ctx.fillRect(
        x +
          14 * s,

        deskY +
          13 * s,

        7 * s,

        70 * s
      );

      ctx.fillRect(
        x +
          deskWidth -
          21 * s,

        deskY +
          13 * s,

        7 * s,

        70 * s
      );

      const monitors =
        index === 0
          ? 1
          : 2;

      for (
        let i = 0;
        i < monitors;
        i += 1
      ) {
        const monitorX =
          x +
          (
            42 +
            i * 68
          ) *
            s;

        roundedRect(
          ctx,
          monitorX,
          deskY -
            55 * s,
          56 * s,
          37 * s,
          4 * s
        );

        ctx.fillStyle =
          "rgba(39,42,41,0.8)";

        ctx.fill();

        ctx.fillStyle =
          "rgba(102,118,113,0.5)";

        ctx.fillRect(
          monitorX +
            5 * s,

          deskY -
            50 * s,

          46 * s,

          25 * s
        );
      }
    }
  );

  const cabinetX =
    24 * s;

  ctx.fillStyle =
    "rgba(103,103,98,0.62)";

  roundedRect(
    ctx,
    cabinetX,
    floor -
      246 * s,
    72 * s,
    165 * s,
    5 * s
  );

  ctx.fill();

  ctx.strokeStyle =
    "rgba(43,42,39,0.25)";

  for (
    let i = 1;
    i < 4;
    i += 1
  ) {
    ctx.beginPath();

    ctx.moveTo(
      cabinetX +
        7 * s,

      floor -
        246 * s +
        i * 41 * s
    );

    ctx.lineTo(
      cabinetX +
        65 * s,

      floor -
        246 * s +
        i * 41 * s
    );

    ctx.stroke();
  }

  const plantX =
    runtime.width -
    78 * s;

  ctx.strokeStyle =
    "#557054";

  ctx.lineWidth =
    4 * s;

  ctx.beginPath();

  ctx.moveTo(
    plantX,
    floor -
      70 * s
  );

  ctx.lineTo(
    plantX,
    floor -
      172 * s
  );

  ctx.stroke();

  const leaves = [
    [
      -24,
      -136,
      -0.5,
    ],

    [
      23,
      -148,
      0.5,
    ],

    [
      -18,
      -112,
      -0.4,
    ],

    [
      24,
      -104,
      0.45,
    ],

    [
      0,
      -171,
      0,
    ],
  ];

  for (
    const [
      lx,
      ly,
      angle,
    ] of leaves
  ) {
    ctx.save();

    ctx.translate(
      plantX +
        lx * s,

      floor +
        ly * s
    );

    ctx.rotate(
      angle
    );

    ctx.fillStyle =
      "#668161";

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      14 * s,
      32 * s,
      0,
      0,
      TAU
    );

    ctx.fill();

    ctx.restore();
  }

  ctx.fillStyle =
    "#795942";

  ctx.beginPath();

  ctx.moveTo(
    plantX -
      27 * s,

    floor -
      80 * s
  );

  ctx.lineTo(
    plantX +
      27 * s,

    floor -
      80 * s
  );

  ctx.lineTo(
    plantX +
      20 * s,

    floor -
      33 * s
  );

  ctx.lineTo(
    plantX -
      20 * s,

    floor -
      33 * s
  );

  ctx.closePath();

  ctx.fill();
}
function drawWarnings(ctx, runtime) {
  const s =
    runtime.scale;

  const ceiling =
    ceilingY(runtime);

  const floor =
    floorY(runtime);

  for (
    const warning of
    runtime.warnings
  ) {
    if (
      warning.timer >
      warning.warningDuration
    ) {
      continue;
    }

    const progress =
      1 -
      warning.timer /
        warning.warningDuration;

    const pulse =
      0.72 +
      Math.sin(
        runtime.elapsed *
          15
      ) *
        0.18;

    ctx.save();

    ctx.globalAlpha =
      clamp(
        0.35 +
          progress *
            0.65,
        0,
        1
      ) *
      pulse;

    let x;
    let y;
    let rotation;

    if (
      warning.direction ===
      "left"
    ) {
      x = 28 * s;
      y =
        runtime.balloon.y;
      rotation = 0;
    } else if (
      warning.direction ===
      "right"
    ) {
      x =
        runtime.width -
        28 * s;

      y =
        runtime.balloon.y;

      rotation =
        Math.PI;
    } else {
      x =
        runtime.balloon.x;

      y =
        ceiling +
        20 * s;

      rotation =
        Math.PI / 2;
    }

    y = clamp(
      y,
      ceiling + 50 * s,
      floor - 50 * s
    );

    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.fillStyle =
      "#a8563d";

    ctx.beginPath();

    ctx.moveTo(
      -12 * s,
      -11 * s
    );

    ctx.lineTo(
      14 * s,
      0
    );

    ctx.lineTo(
      -12 * s,
      11 * s
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }
}

function drawProjectile(
  ctx,
  projectile,
  runtime
) {
  const s =
    runtime.scale;

  ctx.save();

  ctx.translate(
    projectile.x,
    projectile.y
  );

  ctx.rotate(
    projectile.rotation
  );

  switch (projectile.type) {
    case "paper": {
      ctx.fillStyle =
        "#eee9df";

      ctx.strokeStyle =
        "rgba(75,70,64,0.35)";

      ctx.beginPath();

      ctx.moveTo(
        -14 * s,
        -7 * s
      );

      ctx.lineTo(
        -5 * s,
        -13 * s
      );

      ctx.lineTo(
        11 * s,
        -8 * s
      );

      ctx.lineTo(
        14 * s,
        6 * s
      );

      ctx.lineTo(
        3 * s,
        12 * s
      );

      ctx.lineTo(
        -12 * s,
        7 * s
      );

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      break;
    }

    case "pen": {
      ctx.fillStyle =
        "#4c5960";

      roundedRect(
        ctx,
        -24 * s,
        -3 * s,
        48 * s,
        6 * s,
        3 * s
      );

      ctx.fill();

      ctx.fillStyle =
        "#bbb3a4";

      ctx.beginPath();

      ctx.moveTo(
        24 * s,
        -3 * s
      );

      ctx.lineTo(
        31 * s,
        0
      );

      ctx.lineTo(
        24 * s,
        3 * s
      );

      ctx.closePath();

      ctx.fill();

      break;
    }

    case "sticky": {
      ctx.fillStyle =
        "#d6c672";

      ctx.fillRect(
        -13 * s,
        -13 * s,
        26 * s,
        26 * s
      );

      break;
    }

    case "eraser": {
      ctx.fillStyle =
        "#b78b83";

      roundedRect(
        ctx,
        -15 * s,
        -10 * s,
        30 * s,
        20 * s,
        5 * s
      );

      ctx.fill();

      break;
    }

    case "folder": {
      ctx.fillStyle =
        "#917962";

      roundedRect(
        ctx,
        -27 * s,
        -18 * s,
        54 * s,
        36 * s,
        3 * s
      );

      ctx.fill();

      ctx.fillStyle =
        "#a28a70";

      ctx.fillRect(
        -21 * s,
        -23 * s,
        22 * s,
        8 * s
      );

      break;
    }

    case "mug": {
      ctx.fillStyle =
        "#d8d2c8";

      roundedRect(
        ctx,
        -17 * s,
        -16 * s,
        31 * s,
        32 * s,
        6 * s
      );

      ctx.fill();

      ctx.strokeStyle =
        "#b1aa9f";

      ctx.lineWidth =
        5 * s;

      ctx.beginPath();

      ctx.arc(
        15 * s,
        0,
        10 * s,
        -Math.PI / 2,
        Math.PI / 2
      );

      ctx.stroke();

      break;
    }

    case "stapler": {
      ctx.fillStyle =
        "#555753";

      roundedRect(
        ctx,
        -24 * s,
        -8 * s,
        48 * s,
        16 * s,
        5 * s
      );

      ctx.fill();

      ctx.fillStyle =
        "#777971";

      roundedRect(
        ctx,
        -20 * s,
        -15 * s,
        42 * s,
        9 * s,
        4 * s
      );

      ctx.fill();

      break;
    }

    case "bottle": {
      ctx.fillStyle =
        "rgba(121,150,141,0.84)";

      roundedRect(
        ctx,
        -11 * s,
        -24 * s,
        22 * s,
        48 * s,
        8 * s
      );

      ctx.fill();

      ctx.fillStyle =
        "#52625c";

      ctx.fillRect(
        -7 * s,
        -29 * s,
        14 * s,
        7 * s
      );

      break;
    }

    case "mouse": {
      ctx.fillStyle =
        "#4f504d";

      ctx.beginPath();

      ctx.ellipse(
        0,
        0,
        19 * s,
        14 * s,
        0,
        0,
        TAU
      );

      ctx.fill();

      break;
    }

    case "keyboard": {
      ctx.fillStyle =
        "#4a4b48";

      roundedRect(
        ctx,
        -36 * s,
        -13 * s,
        72 * s,
        26 * s,
        4 * s
      );

      ctx.fill();

      ctx.fillStyle =
        "rgba(220,217,207,0.22)";

      for (
        let row = 0;
        row < 3;
        row += 1
      ) {
        for (
          let col = 0;
          col < 8;
          col += 1
        ) {
          ctx.fillRect(
            (
              -29 +
              col * 8
            ) *
              s,

            (
              -8 +
              row * 7
            ) *
              s,

            5 * s,
            4 * s
          );
        }
      }

      break;
    }

    case "files": {
      const colors = [
        "#76675a",
        "#97836d",
        "#686b66",
        "#a18d72",
      ];

      for (
        let i = 0;
        i < 4;
        i += 1
      ) {
        ctx.fillStyle =
          colors[i];

        roundedRect(
          ctx,
          (
            -28 +
            i * 3
          ) *
            s,

          (
            -24 +
            i * 12
          ) *
            s,

          55 * s,
          11 * s,
          2 * s
        );

        ctx.fill();
      }

      break;
    }

    case "laptop": {
      ctx.fillStyle =
        "#565854";

      roundedRect(
        ctx,
        -31 * s,
        -24 * s,
        62 * s,
        43 * s,
        5 * s
      );

      ctx.fill();

      ctx.fillStyle =
        "#2c302e";

      roundedRect(
        ctx,
        -26 * s,
        -19 * s,
        52 * s,
        32 * s,
        2 * s
      );

      ctx.fill();

      ctx.fillStyle =
        "#777a74";

      ctx.fillRect(
        -34 * s,
        18 * s,
        68 * s,
        7 * s
      );

      break;
    }

    case "box": {
      ctx.fillStyle =
        "#a17e59";

      roundedRect(
        ctx,
        -31 * s,
        -30 * s,
        62 * s,
        60 * s,
        3 * s
      );

      ctx.fill();

      ctx.strokeStyle =
        "rgba(83,60,42,0.38)";

      ctx.beginPath();

      ctx.moveTo(
        0,
        -30 * s
      );

      ctx.lineTo(
        0,
        30 * s
      );

      ctx.stroke();

      break;
    }

    default:
      break;
  }

  ctx.restore();
}

function drawBalloon(ctx, runtime) {
  if (runtime.dead) {
    return;
  }

  const balloon =
    runtime.balloon;

  const s =
    runtime.scale;

  const rx =
    31 * s;

  const ry =
    40 * s;

  const sway = clamp(
    balloon.vx /
      (120 * s),
    -1,
    1
  );

  ctx.save();

  ctx.translate(
    balloon.x,
    balloon.y
  );

  ctx.rotate(
    balloon.angle +
      Math.sin(
        balloon.wobble
      ) *
        0.025
  );

  ctx.strokeStyle =
    "rgba(68,62,56,0.58)";

  ctx.lineWidth =
    1.2 * s;

  ctx.beginPath();

  ctx.moveTo(
    0,
    ry
  );

  ctx.bezierCurveTo(
    -sway * 9 * s,
    ry + 30 * s,

    -sway * 26 * s,
    ry + 67 * s,

    -sway * 18 * s,
    ry + 94 * s
  );

  ctx.stroke();

  const gradient =
    ctx.createRadialGradient(
      -12 * s,
      -16 * s,
      3 * s,
      0,
      0,
      48 * s
    );

  gradient.addColorStop(
    0,
    "#dd8970"
  );

  gradient.addColorStop(
    0.55,
    "#b96149"
  );

  gradient.addColorStop(
    1,
    "#8c4333"
  );

  ctx.fillStyle = gradient;

  ctx.beginPath();

  ctx.moveTo(
    0,
    -ry
  );

  ctx.bezierCurveTo(
    rx,
    -ry * 0.9,

    rx * 1.08,
    ry * 0.25,

    0,
    ry
  );

  ctx.bezierCurveTo(
    -rx * 1.08,
    ry * 0.25,

    -rx,
    -ry * 0.9,

    0,
    -ry
  );

  ctx.closePath();

  ctx.fill();

  ctx.fillStyle =
    "rgba(255,240,229,0.33)";

  ctx.beginPath();

  ctx.ellipse(
    -11 * s,
    -15 * s,
    7 * s,
    16 * s,
    -0.45,
    0,
    TAU
  );

  ctx.fill();

  ctx.fillStyle =
    "#81402f";

  ctx.beginPath();

  ctx.moveTo(
    -6 * s,
    ry - 1 * s
  );

  ctx.lineTo(
    6 * s,
    ry - 1 * s
  );

  ctx.lineTo(
    0,
    ry + 10 * s
  );

  ctx.closePath();

  ctx.fill();

  ctx.restore();
}

function drawProtector(ctx, runtime) {
  if (runtime.dead) {
    return;
  }

  const protector =
    runtime.protector;

  const s =
    runtime.scale;

  const size =
    protector.size *
    (
      1 +
      protector.impact *
        0.07
    );

  ctx.save();

  ctx.translate(
    protector.x,
    protector.y
  );

  ctx.rotate(
    protector.angle
  );

  ctx.fillStyle =
    "rgba(244,242,236,0.18)";

  ctx.strokeStyle =
    protector.impact > 0.25
      ? "rgba(184,102,70,0.95)"
      : "rgba(50,49,46,0.9)";

  ctx.lineWidth =
    2 * s;

  roundedRect(
    ctx,
    -size / 2,
    -size / 2,
    size,
    size,
    7 * s
  );

  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle =
    "rgba(255,255,255,0.5)";

  ctx.lineWidth =
    1 * s;

  roundedRect(
    ctx,
    -size / 2 +
      5 * s,

    -size / 2 +
      5 * s,

    size - 10 * s,
    size - 10 * s,
    4 * s
  );

  ctx.stroke();

  ctx.strokeStyle =
    "rgba(58,56,52,0.42)";

  ctx.beginPath();

  ctx.moveTo(
    -9 * s,
    0
  );

  ctx.lineTo(
    9 * s,
    0
  );

  ctx.moveTo(
    0,
    -9 * s
  );

  ctx.lineTo(
    0,
    9 * s
  );

  ctx.stroke();

  if (
    protector.impact >
    0.12
  ) {
    ctx.globalAlpha =
      protector.impact;

    ctx.strokeStyle =
      "#b6684d";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      size * 0.7,
      0,
      TAU
    );

    ctx.stroke();
  }

  ctx.restore();
}
function drawFragments(ctx, runtime) {
  for (
    const fragment of
    runtime.fragments
  ) {
    const alpha =
      clamp(
        fragment.life /
          0.55,
        0,
        1
      );

    ctx.save();

    ctx.globalAlpha = alpha;

    ctx.translate(
      fragment.x,
      fragment.y
    );

    ctx.rotate(
      fragment.rotation
    );

    ctx.fillStyle =
      fragment.color;

    ctx.beginPath();

    ctx.moveTo(
      -fragment.size,
      -fragment.size * 0.45
    );

    ctx.lineTo(
      fragment.size * 0.8,
      -fragment.size * 0.7
    );

    ctx.lineTo(
      fragment.size * 0.4,
      fragment.size
    );

    ctx.closePath();

    ctx.fill();

    ctx.restore();
  }
}

function drawHUD(ctx, runtime) {
  const s =
    runtime.scale;

  const padding =
    18 * s;

  roundedRect(
    ctx,
    padding,
    padding,
    318 * s,
    61 * s,
    13 * s
  );

  ctx.fillStyle =
    "rgba(242,239,232,0.91)";

  ctx.fill();

  ctx.strokeStyle =
    "rgba(45,42,38,0.12)";

  ctx.stroke();

  const values = [
    [
      "SURVIVAL",
      `${runtime.elapsed.toFixed(
        1
      )}s`,
    ],
    [
      "SCORE",
      Math.floor(
        runtime.score
      ).toLocaleString(),
    ],
    [
      "BLOCKS",
      runtime.blocks.toString(),
    ],
    [
      "COMBO",
      `${runtime.combo}×`,
    ],
  ];

  values.forEach(
    ([label, value], index) => {
      const x =
        padding +
        (
          15 +
          index * 76
        ) *
          s;

      ctx.fillStyle =
        "#302f2c";

      ctx.font =
        `700 ${
          13 * s
        }px Inter, ui-sans-serif, system-ui, sans-serif`;

      ctx.fillText(
        value,
        x,
        padding +
          25 * s
      );

      ctx.fillStyle =
        "#7d7870";

      ctx.font =
        `700 ${
          8 * s
        }px Inter, ui-sans-serif, system-ui, sans-serif`;

      ctx.fillText(
        label,
        x,
        padding +
          42 * s
      );
    }
  );

  const meterWidth =
    112 * s;

  const meterX =
    runtime.width -
    padding -
    meterWidth;

  roundedRect(
    ctx,
    meterX - 13 * s,
    padding,
    meterWidth + 26 * s,
    49 * s,
    13 * s
  );

  ctx.fillStyle =
    "rgba(242,239,232,0.9)";

  ctx.fill();

  const difficultyLabel =
    runtime.elapsed < 15
      ? "CALM"
      : runtime.elapsed < 35
        ? "BUSY"
        : runtime.elapsed < 65
          ? "CHAOTIC"
          : "MAYHEM";

  ctx.fillStyle =
    "#6e675f";

  ctx.font =
    `700 ${
      8.5 * s
    }px Inter, ui-sans-serif, system-ui, sans-serif`;

  ctx.fillText(
    difficultyLabel,
    meterX,
    padding + 18 * s
  );

  ctx.fillStyle =
    "rgba(61,57,52,0.12)";

  roundedRect(
    ctx,
    meterX,
    padding + 29 * s,
    meterWidth,
    5 * s,
    3 * s
  );

  ctx.fill();

  ctx.fillStyle =
    "#a35e43";

  roundedRect(
    ctx,
    meterX,
    padding + 29 * s,
    meterWidth *
      runtime.difficulty,
    5 * s,
    3 * s
  );

  ctx.fill();

  if (
    runtime.combo >= 3
  ) {
    ctx.fillStyle =
      "rgba(47,44,40,0.72)";

    ctx.font =
      `700 ${
        12 * s
      }px Inter, ui-sans-serif, system-ui, sans-serif`;

    ctx.textAlign =
      "center";

    ctx.fillText(
      `${runtime.combo}× COMBO`,

      runtime.width / 2,

      padding + 26 * s
    );

    ctx.textAlign =
      "start";
  }

  if (
    runtime.closeSaves > 0
  ) {
    ctx.fillStyle =
      "rgba(48,45,41,0.58)";

    ctx.font =
      `650 ${
        9.5 * s
      }px Inter, ui-sans-serif, system-ui, sans-serif`;

    ctx.fillText(
      `Close saves  ${runtime.closeSaves}`,

      padding,

      runtime.height -
        17 * s
    );
  }
}

function drawScene(
  ctx,
  runtime,
  showHUD = true
) {
  drawBackground(
    ctx,
    runtime
  );

  drawWarnings(
    ctx,
    runtime
  );

  for (
    const projectile of
    runtime.projectiles
  ) {
    drawProjectile(
      ctx,
      projectile,
      runtime
    );
  }

  drawBalloon(
    ctx,
    runtime
  );

  drawProtector(
    ctx,
    runtime
  );

  drawFragments(
    ctx,
    runtime
  );

  if (showHUD) {
    drawHUD(
      ctx,
      runtime
    );
  }
}

function drawPreview(
  ctx,
  width,
  height,
  best
) {
  const runtime =
    createRuntime(
      width,
      height,
      best
    );

  runtime.balloon.x =
    width * 0.59;

  runtime.balloon.y =
    height * 0.39;

  runtime.protector.x =
    width * 0.43;

  runtime.protector.y =
    height * 0.51;

  drawScene(
    ctx,
    runtime,
    false
  );
}

export default function Game({
  onBack,
}) {
  const canvasRef =
    useRef(null);

  const stageRef =
    useRef(null);

  const rafRef =
    useRef(0);

  const runtimeRef =
    useRef(null);

  const phaseRef =
    useRef("idle");

  const engineRef =
    useRef({
      ctx: null,
      width: 0,
      height: 0,
      dpr: 1,
    });

 const [
  best,
  setBest,
] = useState(
  () => readBest()
);

const bestRef =
  useRef(best);

const firebaseUserRef =
  useRef(null);

const playerNameRef =
  useRef("");

const pendingStartRef =
  useRef(false);

const audioEventRef =
  useRef({
    block: 0,
    hit: 0,
  });

const [
  phase,
  setPhase,
] = useState("idle"); 

  const [
    summary,
    setSummary,
  ] = useState(null);

  const [
    firebaseUser,
    setFirebaseUser,
  ] = useState(null);

  const [
    authReady,
    setAuthReady,
  ] = useState(false);

  const [
    playerReady,
    setPlayerReady,
  ] = useState(false);

  const [
    firebaseError,
    setFirebaseError,
  ] = useState("");

  const [
    playerName,
    setPlayerName,
  ] = useState(() => {
    try {
      return (
        window.localStorage.getItem(
          PLAYER_NAME_STORAGE_KEY
        ) || ""
      );
    } catch {
      return "";
    }
  });

  const [
    nameModalOpen,
    setNameModalOpen,
  ] = useState(false);

  const [
    nameMode,
    setNameMode,
  ] = useState("create");

  const [
    nameSaving,
    setNameSaving,
  ] = useState(false);

  const [
    nameError,
    setNameError,
  ] = useState("");

  const [
    leaderboardOpen,
    setLeaderboardOpen,
  ] = useState(false);

  const [
    leaderboard,
    setLeaderboard,
  ] = useState([]);

  const [
    leaderboardLoading,
    setLeaderboardLoading,
  ] = useState(false);

  const [
    leaderboardError,
    setLeaderboardError,
  ] = useState("");

  const [
    runSubmitStatus,
    setRunSubmitStatus,
  ] = useState("idle");

  const [
    runSubmitMessage,
    setRunSubmitMessage,
  ] = useState("");

  const {
    audioEnabled,
    toggleAudio,
    startBackgroundMusic,
    stopBackgroundMusic,
    playBlock,
    playHit,
    playGameOver,
    playUiClick,
  } = useGameAudio();

  useEffect(() => {
    firebaseUserRef.current =
      firebaseUser;
  }, [firebaseUser]);

  useEffect(() => {
    playerNameRef.current =
      playerName;
  }, [playerName]);

  useEffect(() => {
    let cancelled = false;

    const preparePlayer =
      async () => {
        setAuthReady(false);
        setFirebaseError("");

        try {
          const user =
            await signInPlayer();

          if (cancelled) {
            return;
          }

          if (
            !user ||
            !user.uid
          ) {
            throw new Error(
              "Firebase player session could not be created."
            );
          }

          if (
            !user.isAnonymous
          ) {
            throw new Error(
              "The admin account is currently signed in. Open the game in a normal player session to use the leaderboard."
            );
          }

          firebaseUserRef.current =
            user;

          setFirebaseUser(
            user
          );

          const profile =
            await getPlayerProfile(
              user.uid
            );

          if (cancelled) {
            return;
          }

          if (
            profile?.name
          ) {
            playerNameRef.current =
              profile.name;

            setPlayerName(
              profile.name
            );

            setPlayerReady(
              true
            );

            try {
              window.localStorage.setItem(
                PLAYER_NAME_STORAGE_KEY,
                profile.name
              );
            } catch {
              // Firestore remains the source of truth.
            }

            return;
          }

          setPlayerReady(
            false
          );

          setNameMode(
            "create"
          );

          setNameModalOpen(
            true
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "Game Firebase setup failed:",
            error
          );

          setFirebaseError(
            error?.message ||
              "Leaderboard connection is unavailable."
          );

          /*
          Firebase failure should never
          stop the actual game.
          */
          setPlayerReady(
            true
          );
        } finally {
          if (!cancelled) {
            setAuthReady(
              true
            );
          }
        }
      };

    void preparePlayer();

    return () => {
      cancelled = true;
    };
  }, []);

  const stopAnimation = () => {
    if (rafRef.current) {
      cancelAnimationFrame(
        rafRef.current
      );

      rafRef.current = 0;
    }
  };

  const resizeCanvas = () => {
    const canvas =
      canvasRef.current;

    const stage =
      stageRef.current;

    if (
      !canvas ||
      !stage
    ) {
      return;
    }

    const rect =
      stage.getBoundingClientRect();

    const width =
      Math.max(
        320,
        Math.round(
          rect.width
        )
      );

    const height =
      Math.max(
        360,
        Math.round(
          rect.height
        )
      );

    const dpr =
      Math.min(
        window.devicePixelRatio ||
          1,
        1.5
      );

    canvas.width =
      Math.round(
        width * dpr
      );

    canvas.height =
      Math.round(
        height * dpr
      );

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    const ctx =
      canvas.getContext(
        "2d",
        {
          alpha: false,
        }
      );

    if (!ctx) {
      return;
    }

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    ctx.imageSmoothingEnabled =
      true;

    engineRef.current = {
      ctx,
      width,
      height,
      dpr,
    };

    const runtime =
      runtimeRef.current;

    if (
      runtime &&
      phaseRef.current ===
        "playing"
    ) {
      const oldWidth =
        runtime.width;

      const oldHeight =
        runtime.height;

      runtime.width =
        width;

      runtime.height =
        height;

      runtime.scale =
        clamp(
          height / 650,
          0.74,
          1.08
        );

      runtime.protector.size =
        52 *
        runtime.scale;

      runtime.balloon.x =
        clamp(
          runtime.balloon.x *
            (
              width /
              Math.max(
                oldWidth,
                1
              )
            ),
          60,
          width - 60
        );

      runtime.balloon.y =
        clamp(
          runtime.balloon.y *
            (
              height /
              Math.max(
                oldHeight,
                1
              )
            ),
          80,
          height - 80
        );

      runtime.protector.x =
        clamp(
          runtime.protector.x *
            (
              width /
              Math.max(
                oldWidth,
                1
              )
            ),
          30,
          width - 30
        );

      runtime.protector.y =
        clamp(
          runtime.protector.y *
            (
              height /
              Math.max(
                oldHeight,
                1
              )
            ),
          60,
          height - 60
        );

      runtime.protector.targetX =
        runtime.protector.x;

      runtime.protector.targetY =
        runtime.protector.y;

      drawScene(
        ctx,
        runtime,
        true
      );
    } else {
      drawPreview(
        ctx,
        width,
        height,
        bestRef.current
      );
    }
  };
    const loadLeaderboard =
    async () => {
      const user =
        firebaseUserRef.current;

      if (
        !user ||
        !user.uid ||
        !user.isAnonymous
      ) {
        setLeaderboardError(
          "Leaderboard is unavailable in this session."
        );

        return;
      }

      setLeaderboardLoading(
        true
      );

      setLeaderboardError(
        ""
      );

      try {
        const players =
          await getLeaderboard(
            50
          );

        setLeaderboard(
          players
        );
      } catch (error) {
        console.error(
          "Leaderboard load failed:",
          error
        );

        setLeaderboardError(
          "Please check your connection and try again."
        );
      } finally {
        setLeaderboardLoading(
          false
        );
      }
    };

  const openLeaderboard =
    () => {
      playUiClick();

      setLeaderboardOpen(
        true
      );

      void loadLeaderboard();
    };

  const closeLeaderboard =
    () => {
      playUiClick();

      setLeaderboardOpen(
        false
      );
    };

  const openChangeName =
    () => {
      playUiClick();

      /*
      Avoid stacking two large modals
      on top of each other.
      */
      setLeaderboardOpen(
        false
      );

      setNameError("");

      setNameMode(
        "edit"
      );

      setNameModalOpen(
        true
      );
    };

  const saveLocalPlayerName =
    (name) => {
      playerNameRef.current =
        name;

      setPlayerName(
        name
      );

      try {
        window.localStorage.setItem(
          PLAYER_NAME_STORAGE_KEY,
          name
        );
      } catch {
        /*
        Firebase remains authoritative
        when storage is unavailable.
        */
      }
    };

  const handleSavePlayerName =
    async (name) => {
      setNameSaving(
        true
      );

      setNameError(
        ""
      );

      const user =
        firebaseUserRef.current;

      try {
        if (
          !user ||
          !user.uid ||
          !user.isAnonymous
        ) {
          /*
          Firebase may be unavailable.

          Do not prevent the user from
          playing the game because of that.
          */
          saveLocalPlayerName(
            name
          );

          setPlayerReady(
            true
          );

          setNameModalOpen(
            false
          );

          setFirebaseError(
            "Leaderboard is currently unavailable. You can still play normally."
          );

          if (
            pendingStartRef.current
          ) {
            pendingStartRef.current =
              false;

            window.setTimeout(
              () => {
                startGame();
              },
              0
            );
          }

          return;
        }

        const savedName =
          await savePlayerName(
            user.uid,
            name
          );

        saveLocalPlayerName(
          savedName
        );

        setPlayerReady(
          true
        );

        setNameModalOpen(
          false
        );

        setFirebaseError(
          ""
        );

        if (
          pendingStartRef.current
        ) {
          pendingStartRef.current =
            false;

          window.setTimeout(
            () => {
              startGame();
            },
            0
          );
        }
      } catch (error) {
        console.error(
          "Player name save failed:",
          error
        );

        /*
        The game itself must remain usable
        even when Firestore is unavailable.
        */
        saveLocalPlayerName(
          name
        );

        setPlayerReady(
          true
        );

        setNameModalOpen(
          false
        );

        setFirebaseError(
          "Your name is saved on this device, but the global leaderboard is temporarily unavailable."
        );

        if (
          pendingStartRef.current
        ) {
          pendingStartRef.current =
            false;

          window.setTimeout(
            () => {
              startGame();
            },
            0
          );
        }
      } finally {
        setNameSaving(
          false
        );
      }
    };

  const submitRun =
    async ({
      score,
      time,
      level,
    }) => {
      const user =
        firebaseUserRef.current;

      const name =
        playerNameRef.current;

      if (
        !user ||
        !user.uid ||
        !user.isAnonymous ||
        !name
      ) {
        setRunSubmitStatus(
          "offline"
        );

        setRunSubmitMessage(
          "Played locally. Global leaderboard unavailable."
        );

        return;
      }

      setRunSubmitStatus(
        "saving"
      );

      setRunSubmitMessage(
        "Saving leaderboard result..."
      );

      try {
        const result =
          await submitBestRun({
            uid: user.uid,
            name,
            survivalTime:
              time,
            score,
            level,
          });

        if (
          result.updated
        ) {
          setRunSubmitStatus(
            "saved"
          );

          setRunSubmitMessage(
            "New leaderboard best saved."
          );
        } else {
          setRunSubmitStatus(
            "unchanged"
          );

          setRunSubmitMessage(
            "Your existing leaderboard best is still higher."
          );
        }
      } catch (error) {
        console.error(
          "Leaderboard run submission failed:",
          error
        );

        setRunSubmitStatus(
          "error"
        );

        setRunSubmitMessage(
          "Result saved locally, but the leaderboard could not be updated."
        );
      }
    };

  const finalizeRun = () => {
    const runtime =
      runtimeRef.current;

    if (
      !runtime ||
      phaseRef.current !==
        "playing"
    ) {
      return;
    }

    stopAnimation();

    phaseRef.current =
      "gameover";

    stopBackgroundMusic();

    playGameOver();

    const finalScore =
      Math.floor(
        runtime.score
      );

    const survivalTime =
      Math.max(
        0,
        runtime.elapsed
      );

    /*
    Simple game level derived from
    survival time.

    This does not alter difficulty or
    physics. It is only leaderboard
    metadata.
    */
    const finalLevel =
      Math.max(
        1,
        Math.floor(
          survivalTime /
            15
        ) + 1
      );

    const nextBest =
      Math.max(
        bestRef.current,
        finalScore
      );

    bestRef.current =
      nextBest;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        String(nextBest)
      );
    } catch {
      // Game still works without storage.
    }

    setBest(
      nextBest
    );

    const finalSummary = {
      score:
        finalScore,

      time:
        survivalTime,

      blocks:
        runtime.blocks,

      closeSaves:
        runtime.closeSaves,

      combo:
        runtime.highestCombo,

      level:
        finalLevel,

      best:
        nextBest,
    };

    setSummary(
      finalSummary
    );

    setPhase(
      "gameover"
    );

    void submitRun(
      finalSummary
    );
  };

  const runFrame = (
    now
  ) => {
    const runtime =
      runtimeRef.current;

    const {
      ctx,
    } =
      engineRef.current;

    if (
      !runtime ||
      !ctx ||
      phaseRef.current !==
        "playing"
    ) {
      return;
    }

    const previous =
      runtime.lastFrame ||
      now;

    const dt =
      Math.min(
        (
          now -
          previous
        ) /
          1000,
        0.033
      );

    runtime.lastFrame =
      now;

    updateRuntime(
      runtime,
      dt
    );

    /*
    ======================================================
    AUDIO EVENTS
    ======================================================

    The physics engine only increments counters.

    React detects those counters here and plays
    sounds without changing collision behaviour.
    ======================================================
    */

    if (
      runtime.audioEvents.block >
      audioEventRef.current.block
    ) {
      playBlock();

      audioEventRef.current.block =
        runtime.audioEvents.block;
    }

    if (
      runtime.audioEvents.hit >
      audioEventRef.current.hit
    ) {
      playHit();

      audioEventRef.current.hit =
        runtime.audioEvents.hit;
    }

    drawScene(
      ctx,
      runtime,
      true
    );

    if (
      runtime.dead &&
      runtime.deadTimer >
        0.62
    ) {
      finalizeRun();

      return;
    }

    rafRef.current =
      requestAnimationFrame(
        runFrame
      );
  };

  const startGame = () => {
    stopAnimation();

    setLeaderboardOpen(
      false
    );

    setRunSubmitStatus(
      "idle"
    );

    setRunSubmitMessage(
      ""
    );

    resizeCanvas();

    const {
      ctx,
      width,
      height,
    } =
      engineRef.current;

    if (
      !ctx ||
      !width ||
      !height
    ) {
      return;
    }

    const runtime =
      createRuntime(
        width,
        height,
        bestRef.current
      );

    runtimeRef.current =
      runtime;

    audioEventRef.current = {
      block:
        runtime.audioEvents.block,

      hit:
        runtime.audioEvents.hit,
    };

    phaseRef.current =
      "playing";

    setSummary(
      null
    );

    setPhase(
      "playing"
    );

    drawScene(
      ctx,
      runtime,
      true
    );

    /*
    START GAME is a user interaction,
    so this is the correct place to
    request background audio.
    */
    void startBackgroundMusic();

    rafRef.current =
      requestAnimationFrame(
        runFrame
      );
  };

  const requestStartGame =
    () => {
      playUiClick();

      /*
      Wait until the initial Firebase
      player check has completed.
      */
      if (!authReady) {
        return;
      }

      /*
      A first-time Firebase player
      needs a name before their run
      can be attached to a leaderboard
      profile.
      */
      if (
        firebaseUserRef.current?.isAnonymous &&
        !playerReady
      ) {
        pendingStartRef.current =
          true;

        setNameMode(
          "create"
        );

        setNameError(
          ""
        );

        setNameModalOpen(
          true
        );

        return;
      }

      startGame();
    };

  const exitGame = () => {
    playUiClick();

    stopAnimation();

    stopBackgroundMusic();

    runtimeRef.current =
      null;

    phaseRef.current =
      "idle";

    pendingStartRef.current =
      false;

    setSummary(
      null
    );

    setPhase(
      "idle"
    );

    onBack?.();
  };

  const updatePointer = (
    event,
    forceActive = false
  ) => {
    const runtime =
      runtimeRef.current;

    const stage =
      stageRef.current;

    if (
      !runtime ||
      !stage ||
      phaseRef.current !==
        "playing"
    ) {
      return;
    }

    const rect =
      stage.getBoundingClientRect();

    runtime.pointer.x =
      clamp(
        event.clientX -
          rect.left,
        0,
        rect.width
      );

    runtime.pointer.y =
      clamp(
        event.clientY -
          rect.top,
        0,
        rect.height
      );

    if (
      event.pointerType ===
        "mouse" ||
      forceActive
    ) {
      runtime.pointer.active =
        true;

      runtime.protector.targetX =
        runtime.pointer.x;

      runtime.protector.targetY =
        runtime.pointer.y;
    }
  };

  useEffect(() => {
    const stage =
      stageRef.current;

    const handleResize =
      () => {
        resizeCanvas();
      };

    const handlePointerMove =
      (event) => {
        const runtime =
          runtimeRef.current;

        if (!runtime) {
          return;
        }

        if (
          event.pointerType ===
            "touch" &&
          !runtime.pointer.down
        ) {
          return;
        }

        updatePointer(
          event,
          runtime.pointer.down
        );
      };

    const handlePointerDown =
      (event) => {
        if (
          phaseRef.current !==
            "playing"
        ) {
          return;
        }

        event.preventDefault();

        const runtime =
          runtimeRef.current;

        if (!runtime) {
          return;
        }

        runtime.pointer.down =
          true;

        updatePointer(
          event,
          true
        );

        stage?.setPointerCapture?.(
          event.pointerId
        );
      };

    const handlePointerUp =
      (event) => {
        const runtime =
          runtimeRef.current;

        if (!runtime) {
          return;
        }

        runtime.pointer.down =
          false;

        if (
          event.pointerType ===
            "touch"
        ) {
          runtime.pointer.active =
            false;
        }
      };

    const handlePointerLeave =
      (event) => {
        const runtime =
          runtimeRef.current;

        if (
          !runtime ||
          event.pointerType ===
            "touch"
        ) {
          return;
        }

        if (
          !runtime.pointer.down
        ) {
          runtime.pointer.active =
            false;
        }
      };

    resizeCanvas();

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );

    window.addEventListener(
      "pointercancel",
      handlePointerUp
    );

    stage?.addEventListener(
      "pointermove",
      handlePointerMove
    );

    stage?.addEventListener(
      "pointerdown",
      handlePointerDown,
      {
        passive: false,
      }
    );

    stage?.addEventListener(
      "pointerleave",
      handlePointerLeave
    );

    return () => {
      stopAnimation();

      stopBackgroundMusic();

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );

      window.removeEventListener(
        "pointercancel",
        handlePointerUp
      );

      stage?.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      stage?.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      stage?.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );
    };
  }, [stopBackgroundMusic]);

  return (
    <div className="ob-game-page">
      <header className="ob-topbar">
        <button
          className="ob-back-button"
          type="button"
          onClick={
            exitGame
          }
          aria-label="Back to portfolio"
        >
          <span
            className="ob-back-arrow"
            aria-hidden="true"
          >
            ←
          </span>

          <span>
            Back
          </span>
        </button>

        <div className="ob-brand-lockup">
          <span className="ob-brand-kicker">
            Portfolio Mini Game
          </span>

          <strong className="ob-brand-title">
            Keep It Together
          </strong>
        </div>

        <div className="ob-game-toolbar">
          <button
            type="button"
            className="ob-leaderboard-button"
            onClick={
              openLeaderboard
            }
          >
            <span
              aria-hidden="true"
            >
              🏆
            </span>

            <span>
              Leaderboard
            </span>
          </button>

          <AudioToggle
            enabled={
              audioEnabled
            }
            onToggle={() => {
              toggleAudio();
            }}
            compact={
              phase ===
              "playing"
            }
          />

          <div className="ob-best-readout">
            <span className="ob-best-label">
              Best Score
            </span>

            <strong className="ob-best-value">
              {best.toLocaleString()}
            </strong>
          </div>
        </div>
      </header>

      <main className="ob-main">
        <section
          ref={stageRef}
          className={`ob-stage ${
            phase === "playing"
              ? "ob-stage--playing"
              : ""
          }`}
          aria-label="Keep It Together game area"
        >
          <canvas
            ref={canvasRef}
            className="ob-canvas"
          />

          {phase ===
            "idle" && (
            <div className="ob-overlay ob-start-overlay">
              <div className="ob-start-card">
                <span className="ob-eyebrow">
                  Protect it at all costs.
                </span>

                <h1 className="ob-title">
                  Keep It Together
                </h1>

                <p className="ob-description">
                  The balloon moves on its own. Move your protector around the office and smash anything before it reaches the balloon.
                </p>

                {playerName && (
                  <div className="ob-player-chip">
                    <span>
                      PLAYING AS
                    </span>

                    <strong>
                      {playerName}
                    </strong>

                    {firebaseUser?.isAnonymous && (
                      <button
                        type="button"
                        onClick={
                          openChangeName
                        }
                      >
                        Change
                      </button>
                    )}
                  </div>
                )}

                {firebaseError && (
                  <div
                    className="ob-game-service-notice"
                    role="status"
                  >
                    {firebaseError}
                  </div>
                )}

                <button
                  className="ob-primary-button"
                  type="button"
                  onClick={
                    requestStartGame
                  }
                  disabled={
                    !authReady
                  }
                >
                  {!authReady
                    ? "Connecting..."
                    : "Start Protecting"}
                </button>

                <div className="ob-start-secondary-actions">
                  <button
                    type="button"
                    className="ob-secondary-button"
                    onClick={
                      openLeaderboard
                    }
                  >
                    🏆 Global Leaderboard
                  </button>

                  <AudioToggle
                    enabled={
                      audioEnabled
                    }
                    onToggle={() => {
                      toggleAudio();
                    }}
                  />
                </div>

                <div
                  className="ob-controls"
                  aria-label="Game controls"
                >
                  <div className="ob-control">
                    <span className="ob-control-icon">
                      ↗
                    </span>

                    <span>
                      <strong>
                        Mouse
                      </strong>

                      <small>
                        Move the square with your cursor
                      </small>
                    </span>
                  </div>

                  <div className="ob-control">
                    <span className="ob-control-icon">
                      ⌁
                    </span>

                    <span>
                      <strong>
                        Touch
                      </strong>

                      <small>
                        Drag the protector with your finger
                      </small>
                    </span>
                  </div>

                  <div className="ob-control">
                    <span className="ob-control-icon">
                      ■
                    </span>

                    <span>
                      <strong>
                        Break
                      </strong>

                      <small>
                        Intercept objects before they reach the balloon
                      </small>
                    </span>
                  </div>
                </div>

                <p className="ob-start-hint">
                  The longer you survive, the faster and more chaotic the office becomes.
                </p>
              </div>
            </div>
          )}

          {phase ===
            "gameover" &&
            summary && (
              <div className="ob-overlay ob-gameover-overlay">
                <div className="ob-gameover-card">
                  <span className="ob-gameover-tag">
                    POP.
                  </span>

                  <h2 className="ob-gameover-title">
                    One got through.
                  </h2>

                  <div className="ob-results">
                    <div className="ob-result ob-result-primary">
                      <span className="ob-result-label">
                        Score
                      </span>

                      <strong>
                        {summary.score.toLocaleString()}
                      </strong>
                    </div>

                    <div className="ob-result">
                      <span className="ob-result-label">
                        Survived
                      </span>

                      <strong>
                        {summary.time.toFixed(
                          1
                        )}
                        s
                      </strong>
                    </div>

                    <div className="ob-result">
                      <span className="ob-result-label">
                        Broken
                      </span>

                      <strong>
                        {summary.blocks}
                      </strong>
                    </div>

                    <div className="ob-result">
                      <span className="ob-result-label">
                        Best combo
                      </span>

                      <strong>
                        {summary.combo}×
                      </strong>
                    </div>
                  </div>

                  <div className="ob-gameover-detail-grid">
                    <div className="ob-best-card">
                      <span>
                        Close saves
                      </span>

                      <strong>
                        {summary.closeSaves}
                      </strong>
                    </div>

                    <div className="ob-best-card">
                      <span>
                        Level
                      </span>

                      <strong>
                        {summary.level}
                      </strong>
                    </div>

                    <div className="ob-best-card">
                      <span>
                        Personal best
                      </span>

                      <strong>
                        {summary.best.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {runSubmitMessage && (
                    <div
                      className={`ob-run-save-status ob-run-save-status--${runSubmitStatus}`}
                      role="status"
                      aria-live="polite"
                    >
                      {runSubmitStatus ===
                        "saving" && (
                        <span
                          className="ob-player-button-spinner"
                          aria-hidden="true"
                        />
                      )}

                      <span>
                        {runSubmitMessage}
                      </span>
                    </div>
                  )}

                  <div className="ob-gameover-actions">
                    <button
                      className="ob-primary-button"
                      type="button"
                      onClick={() => {
                        playUiClick();
                        startGame();
                      }}
                    >
                      Try Again
                    </button>

                    <button
                      className="ob-secondary-button"
                      type="button"
                      onClick={
                        openLeaderboard
                      }
                    >
                      Leaderboard
                    </button>

                    <button
                      className="ob-secondary-button"
                      type="button"
                      onClick={
                        exitGame
                      }
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            )}

          {phase ===
            "playing" && (
            <>
              <div
                className="ob-live-help"
                aria-hidden="true"
              >
                <span className="ob-live-dot" />

                Move the square • Break everything
              </div>

              <div className="ob-live-audio">
                <AudioToggle
                  enabled={
                    audioEnabled
                  }
                  onToggle={() => {
                    toggleAudio();
                  }}
                  compact
                />
              </div>
            </>
          )}
        </section>

        <div className="ob-footer-row">
          <p>
            Destroy objects close to the balloon for bonus points.
          </p>

          <p>
            Global ranking is based on survival time.
          </p>
        </div>
      </main>

      <PlayerNameModal
        open={
          nameModalOpen
        }
        initialName={
          playerName
        }
        mode={
          nameMode
        }
        loading={
          nameSaving
        }
        externalError={
          nameError
        }
        canClose={
          nameMode ===
          "edit"
        }
        onSave={
          handleSavePlayerName
        }
        onClose={() => {
          if (
            nameSaving
          ) {
            return;
          }

          pendingStartRef.current =
            false;

          setNameModalOpen(
            false
          );

          setNameError(
            ""
          );
        }}
      />

      <LeaderboardModal
        open={
          leaderboardOpen
        }
        loading={
          leaderboardLoading
        }
        error={
          leaderboardError
        }
        leaderboard={
          leaderboard
        }
        currentUserId={
          firebaseUser?.uid ||
          ""
        }
        playerName={
          playerName
        }
        onClose={
          closeLeaderboard
        }
        onRefresh={
          loadLeaderboard
        }
        onChangeName={
          openChangeName
        }
      />
    </div>
  );
}