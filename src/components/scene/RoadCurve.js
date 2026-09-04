import * as THREE from 'three'
import {
  ROAD_LENGTH,
  ROAD_CONTROL_POINTS,
  ROAD_SWAY_AMPLITUDE,
  ROAD_END_X,
} from './sceneConfig.js'

// Seeded PRNG (mulberry32) for stable waypoint generation
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Generate waypoints for the wavy road curve.
 * First waypoint pinned to (0, 0, 0), last waypoint pinned to (ROAD_END_X, 0, -ROAD_LENGTH).
 * Intermediate waypoints follow a sine-based wave that gently trends from start to end X.
 */
function generateWaypoints() {
  const rng = mulberry32(42) // fixed seed for stable layout
  const waypoints = []
  const frequency = 1.5 // controls how many undulations

  for (let i = 0; i < ROAD_CONTROL_POINTS; i++) {
    const t = i / (ROAD_CONTROL_POINTS - 1) // 0 to 1
    const z = -t * ROAD_LENGTH

    let x
    if (i === 0) {
      // First waypoint: pinned to origin
      x = 0
    } else if (i === ROAD_CONTROL_POINTS - 1) {
      // Last waypoint: pinned to ROAD_END_X
      x = ROAD_END_X
    } else {
      // Intermediate waypoints: gentle sine wave oscillation around a trend line
      // that smoothly interpolates from 0 to ROAD_END_X
      const trendX = t * ROAD_END_X
      const wave = Math.sin(t * Math.PI * 2 * frequency) * ROAD_SWAY_AMPLITUDE
      const jitter = (rng() - 0.5) * 1 // small random offset ±0.5
      x = trendX + wave + jitter
    }

    waypoints.push(new THREE.Vector3(x, 0, z))
  }

  return waypoints
}

// Build the curve once at module load
const waypoints = generateWaypoints()
const curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.5)

// Export the curve and helper functions
export const roadCurve = curve

export function getPointAt(t) {
  return curve.getPointAt(t)
}

export function getTangentAt(t) {
  return curve.getTangentAt(t)
}

// Debug: log waypoints to console for verification
console.log('[RoadCurve] Waypoints:', waypoints.map((p) => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`).join(' → '))
