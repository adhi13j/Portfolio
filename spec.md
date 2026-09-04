# Portfolio Site — spec.md

## 0. Purpose of this document
This is a technical specification meant to be read by an AI coding model (local Qwen2.5-Coder) implementing this project step by step. Every section is written to be unambiguous. If something is not specified here, the model should NOT invent large architectural decisions — it should use the simplest placeholder that satisfies the requirement and leave a `// TODO(spec):` comment.

Companion file: `taskchecklist.md` — always work through that file in order, phase by phase, and STOP at each checkpoint.

---

## 1. Project Overview

A single-page portfolio site. The homepage has two halves:

- **Left half** — a scrollable list of projects pulled from `projects.json`.
- **Right half** — a fixed/sticky 3D scene: a cartoony road that curves and winds down the page, flanked by a procedurally generated pine forest. A low-poly drift car starts at a "start flag" at the top and drives/drifts along the road as the user scrolls, leaving smoke behind it, ending exactly at an "end flag" positioned at the vertical center of the left half when the user has scrolled to the bottom.

All 3D models are **placeholder primitives** (boxes, cylinders, cones) for now. Real GLTF models will be swapped in later — so the code must be structured so a primitive-built object (e.g. the car) can be replaced by a loaded GLTF model with minimal changes (same group name, same position/rotation contract).

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| 3D rendering | `three` + `@react-three/fiber` |
| 3D helpers | `@react-three/drei` (useScroll, ScrollControls, Line, Text, etc.) |
| Scroll-linked animation | `@react-three/drei`'s `<ScrollControls>` + `useScroll` (preferred over GSAP so scroll stays inside the R3F tree) |
| Styling | Plain CSS Modules (no Tailwind unless you already have it configured) |
| Data | Static local `projects.json` (no backend) |
| Language | JavaScript (JSX). TypeScript NOT required for v1. |

Do not introduce Redux, React Router, or a backend. This is a static single-page site.

---

## 3. Folder Structure

```
portfolio-site/
├── public/
│   └── projects.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── data/
│   │   └── useProjects.js          # fetches/parses projects.json
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Navbar.module.css
│   │   ├── ProjectList.jsx         # left half container
│   │   ├── ProjectCard.jsx         # one project entry
│   │   ├── ProjectCard.module.css
│   ├── scene/
│   │   ├── Scene.jsx               # <Canvas> root, right half
│   │   ├── RoadCurve.js            # bezier curve math (pure functions)
│   │   ├── Road.jsx                # road mesh built from RoadCurve
│   │   ├── Forest.jsx              # procedural pine forest
│   │   ├── Tree.jsx                # single low-poly pine tree
│   │   ├── Car.jsx                 # placeholder car (boxes + cylinders)
│   │   ├── SmokeTrail.jsx          # particle system behind the car
│   │   ├── Flag.jsx                # reusable start/end flag primitive
│   │   ├── CameraRig.jsx           # camera follow/frame logic
│   │   └── sceneConfig.js          # all tunable constants in one place
│   ├── App.module.css
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

`sceneConfig.js` is important: every "magic number" (curve control points, tree count, colors, car dimensions, smoke particle count) lives there, not scattered across components. This makes later tuning and later model-swapping fast.

---

## 4. Data Model — `projects.json`

Located at `public/projects.json`, fetched at runtime (not imported statically), so it can be edited without rebuilding.

```json
[
  {
    "id": "carbon-school",
    "title": "Carbon School",
    "repoUrl": "https://github.com/username/carbon-school",
    "summary": "A school study-material platform with role-based access, built as both a MERN web app and a Flutter mobile app.",
    "stack": ["React", "Node.js", "Express", "MongoDB", "Flutter", "Supabase"],
    "image": "/projects/carbon-school.png"
  }
]
```

Field contract:
- `id` — string, unique, used as React key.
- `title` — string, rendered as a clickable link (`<a href={repoUrl} target="_blank" rel="noopener noreferrer">`).
- `repoUrl` — absolute URL string.
- `summary` — string, 1–3 sentences.
- `stack` — array of strings, rendered as small pill/badge elements.
- `image` — string, path to an image under `public/`, rendered inside the project card.

`useProjects.js` contract:
```js
// returns { projects, loading, error }
function useProjects() { ... }
```
Fetches `/projects.json` on mount with `fetch()`. No external libraries needed.

---

## 5. Homepage Layout

### 5.1 Navbar
- Fixed to the top, full width, height ~64px, sits above both halves (z-index above the 3D canvas).
- Left side: site name / initials (placeholder text is fine).
- Right side: two icon links —
  - GitHub → opens `https://github.com/<username>` in a new tab.
  - LinkedIn → opens `https://linkedin.com/in/<username>` in a new tab.
- Both URLs are placeholder constants at the top of `Navbar.jsx` (`const GITHUB_URL = "..."`, `const LINKEDIN_URL = "..."`) so they're easy to find and replace.

### 5.2 Overall page grid
```
+-------------------------------------------------------+
|                       Navbar                           |
+---------------------------+-----------------------------+
|                           |                             |
|   Left half (scrolls      |   Right half (position:     |
|   normally, full page     |   sticky/fixed, height =    |
|   height content)         |   100vh, holds <Canvas>)    |
|                           |                             |
+---------------------------+-----------------------------+
```
- Two-column CSS grid, `grid-template-columns: 1fr 1fr`, on `App.jsx`'s root element (below the navbar).
- Left column: normal document flow, height determined by content (number of projects × card height). This is what drives the scroll length of the whole page.
- Right column: `position: sticky; top: 0; height: 100vh;` — it visually stays in place while the left column scrolls past it. This is what creates the "road drives past as you scroll" illusion.

### 5.3 Left half — `ProjectList` / `ProjectCard`
Each `ProjectCard` renders, top to bottom:
1. Title (clickable link to `repoUrl`, opens in new tab).
2. Summary paragraph.
3. Stack badges (flex-wrap row of small pill elements, one per stack item).
4. Image card (the project's `image`, in a rounded-corner container, `object-fit: cover`).

Cards are stacked vertically with consistent spacing (e.g. `padding: 4rem 2rem` per card, or a min-height per card so scroll distance is predictable — needed later for aligning the road's end flag).

### 5.4 Right half — `Scene.jsx`
A single `<Canvas>` from `@react-three/fiber`, wrapped in `<ScrollControls pages={N} damping={0.25}>` from drei, where `N` is derived from the left column's scroll height (see §7).

Inside `<Scroll>` (drei's 3D-scroll-linked group) or read via `useScroll()`:
- `<Road />`
- `<Forest />`
- `<Car />`
- `<SmokeTrail />`
- `<Flag position="start" />` and `<Flag position="end" />`
- `<CameraRig />`
- Lighting: one `<ambientLight intensity={0.6} />` + one `<directionalLight position={[5, 10, 5]} intensity={1} />`.

---

## 5.5 Design Language & Color Scheme

Two distinct but complementary moods: the left half should feel like native **macOS UI** (clean, light, frosted glass, system typography). The right half should feel like a **calm, muted low-poly diorama** (soft desaturated palette, gentle light, not garish/saturated game-asset colors).

### 5.5.1 Left half — "macOS" feel
CSS variables (add to `index.css` or `App.module.css` root):
```css
--bg-page: #f5f5f7;          /* Apple system light gray, page background */
--bg-card: #ffffff;
--border-subtle: rgba(0, 0, 0, 0.06);
--shadow-card: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06);
--text-primary: #1d1d1f;
--text-secondary: #6e6e73;
--accent: #0071e3;           /* Apple system blue, used for links/hover */
--pill-bg: #f0f0f2;
--pill-text: #48484a;
--radius-lg: 16px;
--radius-pill: 999px;
--font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Helvetica, Arial, sans-serif;
```
- Whole left column and navbar use `font-family: var(--font-system)`.
- Navbar: frosted-glass style — `background: rgba(255,255,255,0.72); backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid var(--border-subtle);`
- Project cards: `background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); border: 1px solid var(--border-subtle);` — subtle lift on hover (`transform: translateY(-2px)`, transition ~150ms ease).
- Titles: `color: var(--text-primary)`, medium/semibold weight, `color: var(--accent)` only on hover/focus (macOS links aren't blue by default, they go blue on interaction).
- Summary text: `color: var(--text-secondary)`.
- Stack badges: `background: var(--pill-bg); color: var(--pill-text); border-radius: var(--radius-pill); font-size: 0.8rem; padding: 4px 10px;`
- Page background (left column + navbar): `var(--bg-page)`.

### 5.5.2 Right half — "calm low-poly forest" feel
Add these to `sceneConfig.js` as the single source of truth for scene colors:
```js
export const COLOR_SKY_TOP = "#dbe9f0";     // soft pale blue, used for scene background/fog
export const COLOR_SKY_BOTTOM = "#f3e7d8";  // warm pale cream, subtle gradient feel
export const COLOR_FOG = "#e3ecec";
export const FOG_NEAR = 20;
export const FOG_FAR = 90;

export const COLOR_ROAD = "#cdc3b4";        // warm light stone, not harsh black asphalt
export const COLOR_ROAD_LINE = "#f5f0e6";   // soft cream centerline

export const COLOR_TRUNK = "#8a6f56";       // muted warm brown
export const COLOR_FOLIAGE = ["#87a08a", "#a9c3a4", "#c9dcc3"]; // 3 desaturated sage/forest greens, picked randomly per tree for variety

export const COLOR_CAR_BODY = "#e07a5f";    // muted coral-red accent, the one "pop" of color in the scene
export const COLOR_CAR_CABIN = "#f4a261";   // soft warm amber
export const COLOR_WHEEL = "#3d3d3d";       // dark muted gray, not pure black

export const COLOR_FLAG_START = "#81b29a";  // muted sage green
export const COLOR_FLAG_END = "#e07a5f";    // matches car accent, ties start/end together

export const COLOR_SMOKE = "#f4f1ec";       // warm off-white, soft not sooty-black
export const LIGHT_AMBIENT_COLOR = "#fff1e0";     // warm-tinted ambient, golden-hour feel
export const LIGHT_DIRECTIONAL_COLOR = "#ffe9c7";
```
- `<Canvas>` background / `scene.background` uses `COLOR_SKY_TOP` (or a simple vertical gradient plane behind everything if a true gradient sky is wanted — flat color is an acceptable v1).
- Add `<fog attach="fog" args={[COLOR_FOG, FOG_NEAR, FOG_FAR]} />` inside the `<Canvas>` — this alone does a lot of work for the "calm" feeling by softening the far tree line and road horizon instead of it hard-cutting off.
- Foliage cones pick one of the 3 `COLOR_FOLIAGE` values per tree (seeded random, same PRNG as placement) rather than every tree being identical — subtle variety reads as more natural/calm than a uniform green.
- Lights use the warm-tinted colors above instead of pure white, and keep intensities modest (ambient ~0.7, directional ~0.8) — avoid harsh contrast/shadows, this is a soft-lit diorama, not a dramatic scene.
- Materials throughout the scene: prefer `MeshStandardMaterial` with `roughness` high (~0.8–1) and `metalness` near 0 — low-poly calm scenes read better matte than shiny/plastic.

### 5.5.3 Wavy blended seam between the two halves
Rather than a hard vertical line at the 50/50 column boundary, blend the two halves together with a soft wavy seam — this echoes the wavy road motif and stops the white-macOS-panel vs green-forest-panel contrast from looking like two stitched-together apps.

Implementation approach (pure CSS/SVG overlay, does not touch scroll or 3D logic):
- Add a new absolutely-positioned `<div className="seam">` in `App.jsx`, sitting on top of both columns at the boundary, full viewport height, `z-index` above both halves but below the navbar.
- Inside it, an inline SVG (`viewBox` matching viewport height) with a single vertical wavy path built from a smooth sine-like curve (reuse a small `Q`/`C` path, 3–4 gentle undulations top to bottom — a fixed amplitude of roughly 40–60px is enough, don't overdo it).
- The SVG path is used as a `clip-path` (via `clipPath` in the SVG def, referenced by `clip-path: url(#seamClip)`) applied to a thin strip container (~120–160px wide, centered on the 50% boundary) that contains a horizontal gradient blending `--bg-page` (left, macOS gray/white) into `COLOR_FOLIAGE[1]` or `COLOR_SKY_TOP` (right, forest green) from spec §5.5.1/§5.5.2 — so the actual colors blending are pulled from the existing variables/constants, not new ones.
- Apply a small `filter: blur(6–10px)` to that gradient strip so the seam looks like a soft blended edge rather than a crisp wavy line.
- Optional, only if it reads as calm rather than distracting: a very slow (20–30s loop) idle `transform: translateY()` oscillation on the wave path for a gentle "breathing" feel — keep it subtle, this is decorative, not another scroll-driven system.
- This seam is purely decorative CSS/SVG — it must not affect the `<ScrollControls>` page-count math (spec §7) or the sticky right-column layout (spec §5.2).

---

## 6. The 3D Scene

### 6.1 Coordinate system & scroll mapping
- World space: road runs primarily along the **Z axis**, going from `z = 0` (start, top of scroll) to `z = -ROAD_LENGTH` (end, bottom of scroll), with X used for the "wavy" left-right sway and Y mostly flat (small elevation changes optional, not required for v1).
- `scrollProgress` is a single number in `[0, 1]` read every frame from drei's `useScroll().offset` inside a `useFrame` loop. `0` = top of page, `1` = bottom of page.
- Every animated thing in the scene (car position, camera, smoke spawn) is a pure function of `scrollProgress`. No component should keep its own independent "scroll state" — always derive from `useScroll()`.

### 6.2 Road curve — `RoadCurve.js`
Pure math module, framework-agnostic (no React/three imports except `THREE.Vector3` / `THREE.CatmullRomCurve3`).

```js
// sceneConfig.js
export const ROAD_LENGTH = 120;     // total world-Z length of the road
export const ROAD_CONTROL_POINTS = 6; // number of waypoints along the curve
export const ROAD_SWAY_AMPLITUDE = 6; // max X deviation of the wave
export const ROAD_WIDTH = 4;
```

Algorithm:
1. Generate `ROAD_CONTROL_POINTS` waypoints evenly spaced along Z from `0` to `-ROAD_LENGTH`.
2. For each intermediate waypoint (not first, not last), offset X by a sine-based wave: `x = ROAD_SWAY_AMPLITUDE * Math.sin(i * someFrequency + seed)` — this is the "wavy" part.
3. **Force the first waypoint to `(0, 0, 0)`** (start flag position) and the **last waypoint to a fixed target X that visually aligns with the left half's screen center** (see §6.3 below) — the wave must interpolate smoothly between, but the endpoints are pinned exactly. This satisfies "the curve perfectly ends on the centre of the left half when the scroll ends."
4. Build a `THREE.CatmullRomCurve3(waypoints)` — this gives a smooth curve through all waypoints (not a single cubic bezier, since we need multiple undulations — CatmullRom is the right primitive for "wavy bezier-like road"; call it what the user asked for in comments but implement with CatmullRom for smoothness through N points).
5. Export the curve object plus a helper `getPointAt(t)` and `getTangentAt(t)` (both wrap the curve's built-in `.getPointAt` / `.getTangentAt`, which take a `t` in `[0,1]` — i.e. directly usable with `scrollProgress`).

### 6.3 Aligning the end point to the left half's center
The camera is **orthographic** (see §6.9) specifically because it makes this solvable with math instead of eyeballing:
- With an orthographic camera, a world point's horizontal screen position is `screenX = (worldPointProjectedOntoCameraRight / orthoHalfWidth) * 0.5 + 0.5` (in normalized `[0,1]` viewport space) — **this ratio does not depend on depth/distance from camera**, unlike a perspective camera. That means once the camera's position, look direction, and zoom are fixed, the mapping from world X to screen X is a single fixed linear scale for every point in the scene, always.
- Since the canvas only covers the right half of the page, "ends at the centre of the left half" is interpreted the same way as before: the end waypoint should project to approximately the **left edge of the canvas viewport** (screen fraction ≈ 0, within the canvas's own coordinate space) at `scrollProgress = 1` — which visually reads as sitting at/near the page's horizontal center, right at the boundary with the left column.
- Because the projection is now linear and depth-independent, `ROAD_END_X` (in `sceneConfig.js`) can be **computed directly** from the camera's orthographic half-width and position, rather than tuned by trial and error:
  ```js
  // Given: camera at CAMERA_POSITION looking at CAMERA_LOOKAT, orthographic zoom/frustum size ORTHO_SIZE
  // Solve for the world-X offset (relative to camera) that projects to screen fraction ~0 (canvas left edge):
  // targetScreenFraction = 0 → worldOffsetAlongCameraRight ≈ -orthoHalfWidth
  // ROAD_END_X = CAMERA_LOOKAT.x - orthoHalfWidth  (adjust sign/axis depending on camera rotation — see §6.9)
  ```
  Implement this as a small helper (`getWorldXForScreenFraction(fraction)`) in `CameraRig.jsx` or `sceneConfig.js`, and derive `ROAD_END_X` from it rather than hardcoding a guessed number. Still expose `ROAD_END_X` as an overridable constant for manual nudging later — the formula gives a correct starting point, not a law.
- No raycasting or DOM measurement needed for v1 — the orthographic math above is exact and cheap.

### 6.4 Road mesh — `Road.jsx`
- Build the road visual as a `THREE.TubeGeometry` or a flat extruded ribbon (`THREE.ExtrudeGeometry` along the curve, or simpler: a series of connected flat quads following `curve.getPointAt(t)` for `t` in small steps, width = `ROAD_WIDTH`, oriented using the curve's tangent/normal).
- Simplest correct v1 implementation: sample the curve at ~100 points, build a ribbon mesh (two vertices per sample point, offset ± `ROAD_WIDTH/2` along the curve's normal), triangulate into a `BufferGeometry`. Flat gray/asphalt-colored `MeshStandardMaterial`, cartoony = slightly saturated color (e.g. `#4a4a52`) with a simple lighter-gray dashed centerline strip (optional, can be a second thin ribbon).
- No physics, no collision — purely visual.

### 6.5 Pine forest — `Forest.jsx` + `Tree.jsx`
- `Tree.jsx` = one low-poly pine: a `CylinderGeometry` trunk (brown, short, thin — this is the "cuboid trunk" the user mentioned; a `BoxGeometry` is also acceptable and matches the literal request — **use `BoxGeometry` for the trunk** since the spec explicitly says "cuboid trunks") + one or more stacked `ConeGeometry`/pyramid shapes for foliage (use `ConeGeometry` with a low `radialSegments` like 4 to get a "pyramid" look, per the "pyramids" wording — 4-sided cone = pyramid). 2–3 stacked cones of decreasing size look more tree-like; 1 cone is the minimum acceptable v1.
- `Forest.jsx` generates N trees (`sceneConfig.FOREST_TREE_COUNT`, e.g. 80) using a **seeded random function** (write a tiny seeded PRNG — e.g. mulberry32 — in `sceneConfig.js` or a `utils/random.js`, so the forest layout is stable across reloads instead of jittering every refresh).
- Placement algorithm per tree:
  1. Pick a random `t` in `[0, 1]` along the road curve.
  2. Get `curve.getPointAt(t)` and the curve's normal/perpendicular at that point.
  3. Offset perpendicular to the road by a random distance in `[ROAD_WIDTH/2 + MIN_TREE_OFFSET, MAX_FOREST_OFFSET]`, randomly choosing left or right side.
  4. Randomize the tree's Y-rotation, and scale within a small range (e.g. `0.8–1.3x`) for visual variety.
  5. Skip/reroll if the tree would land too close to the start or end flag (keep a clear radius around both).
- Use **instancing** (`InstancedMesh` via drei's `<Instances>`/`<Instance>`) for trunks and for foliage separately (two instanced meshes total, not N separate meshes) — this matters for performance with 80+ trees.

### 6.6 Car — `Car.jsx` (placeholder, primitives only)
Build as a `<group name="CarModel">` so a GLTF can later replace its children without touching parent logic:
- Body: 1–2 `BoxGeometry` meshes (main chassis box + a smaller box on top for a "cabin").
- Wheels: 4 `CylinderGeometry` meshes (radial segments ~12, thin depth), rotated 90° on Z so the cylinder's circular face points sideways like a wheel, positioned at the four corners of the chassis box.
- Store all dimensions in `sceneConfig.js` (`CAR_BODY_SIZE`, `CAR_WHEEL_RADIUS`, etc.) so proportions are easy to retune.
- Car color: any single flat cartoony color (e.g. `#e63946`), `MeshStandardMaterial`.

Car positioning/orientation each frame (in `useFrame`, inside `Car.jsx`):
```js
const t = scroll.offset; // 0..1
const point = curve.getPointAt(t);
const tangent = curve.getTangentAt(t);
groupRef.current.position.copy(point).setY(WHEEL_RADIUS); // keep wheels on "ground"
groupRef.current.lookAt(point.clone().add(tangent));
```
Then apply **drift**: an additional small oscillating yaw offset and slight lateral position offset, e.g.:
```js
const driftAngle = Math.sin(t * DRIFT_FREQUENCY) * DRIFT_MAX_ANGLE;
groupRef.current.rotation.y += driftAngle;
```
This makes the car appear to swing its rear out as it follows the wavy curve, per "the drift car drifts [along] the bezier curve." Wheel spin: rotate each wheel mesh's local X rotation continuously based on scroll delta (purely cosmetic, not required to be physically exact).

### 6.7 Smoke trail — `SmokeTrail.jsx`
- Simple particle system: an array of small flat circular sprites (or low-poly `SphereGeometry` billboards) spawned just behind the car's current position (opposite the tangent direction), each with:
  - A spawn time / age.
  - Fades out (opacity → 0) and grows slightly and drifts upward/backward over its lifetime (e.g. 1–2 seconds of simulated life, driven by `useFrame`'s delta or by scroll delta — since motion here is scroll-driven, tie particle spawn rate to how much scroll delta happened this frame, not wall-clock time, so no smoke appears while the user isn't scrolling).
  - Recycle particles in a fixed-size pool (e.g. 40 particles) rather than creating/destroying objects every frame — reuse the oldest particle when a new one is needed.
- Use `InstancedMesh` for the particle pool for performance.
- Gray/white semi-transparent `MeshBasicMaterial` with `transparent: true`.

### 6.8 Flags — `Flag.jsx`
- Reusable component: a thin `CylinderGeometry` pole + a flat `BoxGeometry` or `PlaneGeometry` flag shape near the top, slight idle sway animation (small sine rotation over time) for visual life.
- `<Flag variant="start" />` placed at the curve's `t=0` point.
- `<Flag variant="end" />` placed at the curve's `t=1` point (this is the point tuned in §6.3).
- Different flag color per variant (e.g. green start, checkered-pattern texture optional/skippable for v1 — flat red is an acceptable placeholder for "end").

### 6.9 Camera — `CameraRig.jsx`
Use an **orthographic camera at an isometric-style elevated 3/4 angle**, not a perspective camera. This fits the low-poly diorama aesthetic (§5.5.2) better than a ground-level/chase view, and — more importantly — makes the end-point alignment in §6.3 solvable with exact math instead of guesswork, since orthographic screen-X doesn't depend on depth.

- Use `@react-three/fiber`'s `<orthographicCamera>` (set `makeDefault`) instead of the default perspective camera.
- All camera parameters live in `sceneConfig.js` as named, independently-tweakable constants — this is meant to be adjusted later, not hardcoded inline:
  ```js
  export const CAMERA_ELEVATION_DEG = 35;   // angle above horizontal, classic isometric ≈ 35.26°
  export const CAMERA_AZIMUTH_DEG = 35;     // rotation around Y so both road sides are visible, not a flat side-on view
  export const CAMERA_DISTANCE = 40;        // how far back the camera sits from CAMERA_LOOKAT
  export const CAMERA_LOOKAT = new THREE.Vector3(0, 0, -10); // slightly down the road from the start, not exactly on the start flag
  export const ORTHO_SIZE = 18;             // half-height of the orthographic frustum — this is the "zoom" knob
  ```
  Derive `CAMERA_POSITION` from `CAMERA_ELEVATION_DEG` / `CAMERA_AZIMUTH_DEG` / `CAMERA_DISTANCE` with basic spherical-to-cartesian math around `CAMERA_LOOKAT`, rather than hardcoding an XYZ position — that way changing the two angle constants alone re-aims the camera correctly.
- v1: **fixed camera** — does not move or rotate as the user scrolls. The whole road, forest, and car's journey should fit inside the frustum via `ORTHO_SIZE` and `CAMERA_DISTANCE` being large enough to cover `ROAD_LENGTH`. If the road is too long to read clearly at a single fixed zoom, that's a signal to shorten `ROAD_LENGTH` rather than switch to a moving camera — keep v1 simple.
- Stretch (documented but not required for v1, mark as TODO): camera could track the car's Z position for a longer road without needing a huge `ORTHO_SIZE`. If implemented later, keep the same fixed elevation/azimuth angles — only the `CAMERA_LOOKAT`/position's Z component would follow the car, so §6.3's math still holds since the depth-independence of orthographic projection doesn't care about a Z-only camera translation along the viewing axis.
- No `OrbitControls` — this is a passive, scroll-driven scene, not a user-navigable 3D viewer.

---

## 7. Scroll System

- Left column's real DOM scroll height determines how many "pages" of scroll exist. Compute this via a `ResizeObserver`/`useEffect` measuring the left column's `scrollHeight`, convert to an integer page count for `<ScrollControls pages={N}>` (round up, minimum `2`).
- All the right half's animation reads `useScroll().offset` (0→1) each frame — never read `window.scrollY` directly, and never let the 3D canvas itself capture scroll gestures (the left column's native page scroll drives everything, consistent with `<ScrollControls>`'s default HTML-scroll-proxy mode).
- Confirm early (Phase in checklist) that scrolling the left column visibly moves `useScroll().offset` from 0 to 1 before building any of the curve/car/forest logic on top of it — this dependency must be verified first.

---

## 8. Non-Goals for v1 (explicitly out of scope)
- No real GLTF models (primitives only — this is intentional, models come later).
- No mobile-specific layout (single-column stacking) — note it as a known gap, do not attempt responsive breakpoints unless asked.
- No physics engine, no collision detection.
- No camera orbit/user 3D navigation.
- No backend, no CMS — `projects.json` is static.
- No dark/light theme toggle.

## 9. Performance Notes
- Forest must use instancing (§6.5) — do not render 80+ individual `<mesh>` components.
- Smoke must use a fixed-size recycled particle pool (§6.7) — do not `push` new objects into an ever-growing array.
- Keep all polycounts low (this is intentionally a low-poly aesthetic, not just a performance shortcut).

## 10. Future Work (not part of this spec's implementation, for context only)
- Swap `Car.jsx`'s primitive children for a loaded GLTF (`useGLTF` from drei) once the user provides model files — the `<group name="CarModel">` wrapper and the per-frame position/rotation logic should not need to change.
- Same swap-in approach for trees and flags if custom models are provided later.