export const SCENE = {
  /* Sky & fog (§5.5.2) */
  COLOR_SKY_TOP: '#dbe9f0', // soft pale blue, scene background
  COLOR_SKY_BOTTOM: '#f3e7d8', // warm pale cream
  COLOR_FOG: '#e3ecec',
  FOG_NEAR: 20,
  FOG_FAR: 90,

  /* Road (§5.5.2) */
  COLOR_ROAD: '#cdc3b4', // warm light stone
  COLOR_ROAD_LINE: '#f5f0e6', // soft cream centerline

  /* Trees (§5.5.2) */
  COLOR_TRUNK: '#8a6f56', // muted warm brown
  COLOR_FOLIAGE: ['#87a08a', '#a9c3a4', '#c9dcc3'], // 3 desaturated sage/forest greens

  /* Car (§5.5.2) */
  COLOR_CAR_BODY: '#e07a5f', // muted coral-red accent
  COLOR_CAR_CABIN: '#f4a261', // soft warm amber
  COLOR_WHEEL: '#3d3d3d', // dark muted gray

  /* Flags (§5.5.2) */
  COLOR_FLAG_START: '#81b29a', // muted sage green
  COLOR_FLAG_END: '#e07a5f', // matches car accent

  /* Smoke (§5.5.2) */
  COLOR_SMOKE: '#f4f1ec', // warm off-white

  /* Lighting (§5.5.2) */
  LIGHT_AMBIENT_COLOR: '#fff1e0', // warm-tinted ambient
  LIGHT_DIRECTIONAL_COLOR: '#ffe9c7',
  AMBIENT_INTENSITY: 0.7,
  DIRECTIONAL_INTENSITY: 0.8,
  DIRECTIONAL_POSITION: [5, 10, 5],
}

/* Road curve constants (§6.2) */
export const ROAD_LENGTH = 120 // total world-Z length of the road
export const ROAD_CONTROL_POINTS = 6 // number of waypoints along the curve
export const ROAD_SWAY_AMPLITUDE = 6 // max X deviation of the wave
export const ROAD_WIDTH = 4

/* Road end alignment (§6.3) - computed in Phase 7 with orthographic camera */
export const ROAD_END_X = -8 // placeholder, will be computed from camera math

/* Forest constants (§6.5) */
export const FOREST_TREE_COUNT = 80
export const FOREST_SEED = 12345

/* Car constants (§6.6) */
export const CAR_BODY_LENGTH = 2.4
export const CAR_BODY_WIDTH = 1.0
export const CAR_BODY_HEIGHT = 0.5
export const CAR_CABIN_LENGTH = 1.2
export const CAR_CABIN_WIDTH = 0.9
export const CAR_CABIN_HEIGHT = 0.4
export const CAR_WHEEL_RADIUS = 0.3
export const CAR_WHEEL_WIDTH = 0.2
export const DRIFT_FREQUENCY = 3
export const DRIFT_MAX_ANGLE = 0.15

/* Smoke constants (§6.7) */
export const SMOKE_PARTICLE_COUNT = 40
export const SMOKE_SPAWN_RATE = 0.02
