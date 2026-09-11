<script setup>
defineProps({
  /** Rendered size in pixels; the artwork itself is resolution independent. */
  size: { type: [Number, String], default: 220 },
})

const BALL = { cx: 100, cy: 100, radius: 44 }
const BALL_CENTRE = { x: BALL.cx, y: BALL.cy }

/**
 * The centre panel's corners point in these directions. A seam runs out along
 * each one, and at the end of every seam sits another panel — that is how the
 * real thing is stitched, and what a drawn ball has to copy to be recognisable.
 */
const PANEL_ANGLES = [-90, -18, 54, 126, 198]

const CENTRE_PANEL_RADIUS = 14
const RIM_PANEL_RADIUS = 15
const RIM_PANEL_DISTANCE = 39.5

function point(angleDeg, distance) {
  const radians = (angleDeg * Math.PI) / 180
  return {
    x: BALL.cx + distance * Math.cos(radians),
    y: BALL.cy + distance * Math.sin(radians),
  }
}

function pentagon(centre, radius, rotationDeg) {
  return Array.from({ length: 5 }, (_, index) => {
    const radians = ((rotationDeg + index * 72) * Math.PI) / 180
    const x = centre.x + radius * Math.cos(radians)
    const y = centre.y + radius * Math.sin(radians)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

const centrePanel = pentagon(BALL_CENTRE, CENTRE_PANEL_RADIUS, -90)

// Each seam bridges the gap between the centre panel and the rim panel facing it.
const seams = PANEL_ANGLES.map((angle) => {
  const from = point(angle, CENTRE_PANEL_RADIUS)
  const to = point(angle, RIM_PANEL_DISTANCE - RIM_PANEL_RADIUS)
  return `M${from.x.toFixed(1)},${from.y.toFixed(1)} L${to.x.toFixed(1)},${to.y.toFixed(1)}`
})

/**
 * Rim panels point a corner back down their seam towards the centre panel, and
 * run off the edge of the ball, where the silhouette clips them. That clipping
 * is what gives a flat drawing its curvature.
 */
const rimPanels = PANEL_ANGLES.map((angle) =>
  pentagon(point(angle, RIM_PANEL_DISTANCE), RIM_PANEL_RADIUS, angle + 180),
)

/**
 * The name fills the top of the ring; the bottom carries three stars, the way
 * a club crest does. They sit on the band's centre line, fanned about 6 o'clock.
 */
const STAR_ANGLES = [72, 90, 108]
const STAR_RING = 84.5

function star(centre, outer, inner) {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner
    const radians = ((index * 36 - 90) * Math.PI) / 180
    const x = centre.x + radius * Math.cos(radians)
    const y = centre.y + radius * Math.sin(radians)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

const stars = STAR_ANGLES.map((angle, index) =>
  // The middle star is a touch larger, so the three read as a set.
  star(point(angle, STAR_RING), index === 1 ? 7 : 5.6, index === 1 ? 2.9 : 2.3),
)
</script>

<template>
  <!--
    A club crest: the name curved around the ring, a football in the middle.
    The text sits on two arcs — the top runs left-to-right over the top, the
    bottom left-to-right under the bottom, which keeps both halves upright.

    Depth is painted, not simulated: a domed disc, a lit ring, and a ball lit
    from the upper left. Only the panels turn — the highlight, the shading and
    the bounce light stay put, so the ball reads as a sphere rotating under a
    fixed light rather than a picture being spun round.
  -->
  <div class="crest">
    <div>
      <svg
        class="crest-art"
        :width="size"
        :height="size"
        viewBox="0 0 200 200"
        role="img"
        aria-label="Peluutin"
      >
        <defs>
          <path id="badge-arc-top" d="M 23,100 A 77,77 0 0 1 177,100" />

          <radialGradient id="badge-dome" cx="34%" cy="26%" r="80%">
            <stop offset="0%" stop-color="#1F6140" />
            <stop offset="55%" stop-color="#143F28" />
            <stop offset="100%" stop-color="#0A2718" />
          </radialGradient>

          <linearGradient id="badge-ring" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F8D793" />
            <stop offset="45%" stop-color="#E8A33D" />
            <stop offset="100%" stop-color="#A2660F" />
          </linearGradient>

          <radialGradient id="badge-ball" cx="33%" cy="27%" r="74%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="52%" stop-color="#F0F8ED" />
            <stop offset="100%" stop-color="#BCCCC0" />
          </radialGradient>

          <radialGradient id="badge-gloss" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
          </radialGradient>

          <!-- Terminator and edge falloff: what turns a flat disc into a ball. -->
          <radialGradient id="badge-ball-shade" cx="35%" cy="29%" r="74%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0" />
            <stop offset="56%" stop-color="#000000" stop-opacity="0" />
            <stop offset="84%" stop-color="#000000" stop-opacity="0.26" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.55" />
          </radialGradient>

          <!-- Light bouncing back off the far side. -->
          <radialGradient id="badge-ball-bounce" cx="72%" cy="80%" r="38%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
          </radialGradient>

          <linearGradient id="badge-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
          </linearGradient>

          <clipPath id="badge-ball-clip">
            <circle :cx="BALL.cx" :cy="BALL.cy" :r="BALL.radius" />
          </clipPath>
          <clipPath id="badge-disc-clip">
            <circle cx="100" cy="100" r="97" />
          </clipPath>
        </defs>

        <circle class="disc" cx="100" cy="100" r="97" />
        <circle class="ring ring--outer" cx="100" cy="100" r="97" />
        <circle class="ring" cx="100" cy="100" r="72" />

        <text class="crest-text">
          <textPath href="#badge-arc-top" startOffset="50%" text-anchor="middle">PELUUTIN</textPath>
        </text>
        <polygon
          v-for="(points, index) in stars"
          :key="`star-${index}`"
          class="star"
          :points="points"
        />

        <!-- Where the two halves of the ring meet. -->
        <circle class="pip" cx="15" cy="100" r="2.6" />
        <circle class="pip" cx="185" cy="100" r="2.6" />

        <g clip-path="url(#badge-ball-clip)">
          <circle class="ball" :cx="BALL.cx" :cy="BALL.cy" :r="BALL.radius" />

          <g class="ball-spin">
            <polygon
              v-for="(panel, index) in rimPanels"
              :key="index"
              class="panel"
              :points="panel"
            />
            <polygon class="panel" :points="centrePanel" />
            <path v-for="(seam, index) in seams" :key="`seam-${index}`" class="seam" :d="seam" />
          </g>

          <circle class="ball-shade" :cx="BALL.cx" :cy="BALL.cy" :r="BALL.radius" />
          <circle class="ball-bounce" :cx="BALL.cx" :cy="BALL.cy" :r="BALL.radius" />
          <ellipse class="gloss" cx="83" cy="78" rx="21" ry="13" transform="rotate(-30 83 78)" />
          <circle class="ball-edge" :cx="BALL.cx" :cy="BALL.cy" :r="BALL.radius - 0.7" />
        </g>

        <g clip-path="url(#badge-disc-clip)">
          <g transform="rotate(18 100 100)">
            <rect class="sheen" x="-70" y="-60" width="44" height="320" />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.crest {
  animation: crest-enter 900ms cubic-bezier(0.2, 0.85, 0.25, 1) both;
}

.crest-art {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 16px 26px rgba(0, 0, 0, 0.45));
}

@keyframes crest-enter {
  from {
    opacity: 0;
    transform: scale(0.88);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Only the panels turn; the lighting above them does not. */
.ball-spin {
  transform-box: view-box;
  transform-origin: 100px 100px;
  animation: ball-spin 26s linear infinite;
}

@keyframes ball-spin {
  to {
    transform: rotate(360deg);
  }
}

.sheen {
  fill: url(#badge-sheen);
  animation: crest-sheen 7s ease-in-out 1.2s infinite;
}

/* Mostly parked off-frame; it crosses the badge once every cycle. */
@keyframes crest-sheen {
  0%,
  62% {
    transform: translateX(0);
  }
  90%,
  100% {
    transform: translateX(300px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .crest,
  .ball-spin,
  .sheen {
    animation: none;
  }
}

.disc {
  fill: url(#badge-dome);
}

.ring {
  fill: none;
  stroke: url(#badge-ring);
  stroke-width: 1.6;
}

.ring--outer {
  stroke-width: 3.4;
}

.crest-text {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 6px;
}

.crest-text {
  fill: var(--chalk);
}

.star {
  fill: var(--amber);
}

.pip {
  fill: var(--amber);
}

.ball {
  fill: url(#badge-ball);
}

.panel {
  fill: #10301e;
}

.seam {
  stroke: #10301e;
  stroke-width: 3.4;
  stroke-linecap: butt;
  fill: none;
}

/* Keeps the clipped panels from bleeding into the ring. */
.ball-edge {
  fill: none;
  stroke: rgba(16, 48, 30, 0.5);
  stroke-width: 1.4;
}

.ball-shade {
  fill: url(#badge-ball-shade);
}

.ball-bounce {
  fill: url(#badge-ball-bounce);
}

.gloss {
  fill: url(#badge-gloss);
}
</style>
