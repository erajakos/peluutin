<script setup>
/**
 * The pitch the app sits on, drawn as actual blades of grass.
 *
 * The blades are generated once into a repeating SVG pattern rather than laid
 * out individually, so the whole backdrop costs a single tiled fill however
 * large the screen. Blades that cross a tile edge are redrawn on the opposite
 * side, which is what stops the repeat from showing as a grid.
 */
const TILE = 150
const BLADE_COUNT = 260
const MAX_HEIGHT = 16

/**
 * Greens kept close to the background. The backdrop has to read as turf at a
 * glance and then get out of the way — text sits directly on it, outdoors, and
 * legibility beats texture every time.
 */
const PALETTE = ['#11391f', '#133f27', '#16482d', '#1a5233', '#1f5c3a']

/**
 * A small deterministic generator: the grass must look scattered, but it must
 * be the same grass on every render, or the pattern would shift on updates.
 */
function createRandom(seed) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function buildBlades() {
  const random = createRandom(20260911)
  return Array.from({ length: BLADE_COUNT }, () => {
    const height = MAX_HEIGHT * (0.45 + random() * 0.55)
    return {
      x: random() * TILE,
      y: random() * TILE,
      height,
      // Lean and curve: a blade bends further the taller it is.
      lean: (random() - 0.5) * height * 0.9,
      bend: (random() - 0.5) * height * 0.45,
      width: 0.7 + random() * 1.1,
      colour: PALETTE[Math.floor(random() * PALETTE.length)],
      opacity: 0.3 + random() * 0.45,
    }
  })
}

/** A blade near an edge is drawn again on the far side so the tile is seamless. */
function tilePositions(blade) {
  const reach = blade.height + Math.abs(blade.lean)
  const shiftsX = blade.x < reach ? [TILE] : blade.x > TILE - reach ? [-TILE] : []
  const shiftsY = blade.y < reach ? [TILE] : blade.y > TILE - reach ? [-TILE] : []

  const positions = [{ dx: 0, dy: 0 }]
  shiftsX.forEach((dx) => positions.push({ dx, dy: 0 }))
  shiftsY.forEach((dy) => positions.push({ dx: 0, dy }))
  shiftsX.forEach((dx) => shiftsY.forEach((dy) => positions.push({ dx, dy })))
  return positions
}

const blades = buildBlades().flatMap((blade) =>
  tilePositions(blade).map(({ dx, dy }) => ({
    ...blade,
    d:
      `M${(blade.x + dx).toFixed(1)},${(blade.y + dy).toFixed(1)}` +
      ` q${blade.bend.toFixed(1)},${(-blade.height * 0.6).toFixed(1)}` +
      ` ${blade.lean.toFixed(1)},${(-blade.height).toFixed(1)}`,
  })),
)
</script>

<template>
  <div class="grass" aria-hidden="true">
    <svg width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <pattern id="grass-tile" :width="TILE" :height="TILE" patternUnits="userSpaceOnUse">
          <path
            v-for="(blade, index) in blades"
            :key="index"
            :d="blade.d"
            :stroke="blade.colour"
            :stroke-width="blade.width"
            :opacity="blade.opacity"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grass-tile)" />
    </svg>
  </div>
</template>

<style scoped>
.grass {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.6;
}

.grass svg {
  display: block;
}

.grass path {
  fill: none;
  stroke-linecap: round;
}
</style>
