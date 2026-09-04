# Portfolio Site — taskchecklist.md

## How to use this file (read this first)
- Work **one phase at a time, in order**. Do not jump ahead.
- Every phase ends with a **STOP** line. When you reach it, stop generating code entirely and wait for the human to say "continue" or give feedback. Do not silently proceed to the next phase.
- Every task is a single, small, verifiable action. If a task feels too big to do in one step, it has been split incorrectly — do only what the checkbox literally says.
- Always re-read `spec.md` section referenced in `(spec §X)` before doing that task, don't rely on memory of it.
- Never invent new files, libraries, or architectural decisions not in `spec.md`. If something is genuinely ambiguous, leave a `// TODO(ask-human):` comment and continue with the simplest reasonable placeholder.

---

## Phase 0 — Project Setup
- [ ] Scaffold a new Vite + React project (`npm create vite@latest portfolio-site -- --template react`).
- [ ] Install dependencies: `three`, `@react-three/fiber`, `@react-three/drei`.
- [ ] Delete Vite's default boilerplate content from `App.jsx` and `index.css` (keep the files, empty the contents).
- [ ] Create the folder structure exactly as listed in spec §3 (empty files are fine for now, just create them).
- [ ] Confirm `npm run dev` starts a blank page with no console errors.

**STOP — confirm the dev server runs cleanly before continuing to Phase 1.**

---

## Phase 1 — Static Page Shell
- [ ] Build `Navbar.jsx` per spec §5.1: site name/initials on the left, GitHub + LinkedIn icon links on the right. Use placeholder URLs as constants at the top of the file.
- [ ] Style the navbar fixed to the top, full width (spec §5.1).
- [ ] In `App.jsx`, build the two-column grid described in spec §5.2 (Navbar on top, then a `grid-template-columns: 1fr 1fr` row below).
- [ ] Make the right column `position: sticky; top: 0; height: 100vh;`.
- [ ] Temporarily fill the left column with 5–6 tall placeholder `<div>`s (just colored blocks with height, no real content yet) so there's enough scroll length to test stickiness.
- [ ] Temporarily fill the right column with a plain colored `<div>` (no Canvas yet) to confirm it visually stays in place while the left column scrolls.

**STOP — confirm the sticky right-half behavior works correctly in the browser before continuing to Phase 2.**

---

## Phase 2 — Left Half: Project Data & Cards
- [ ] Create `public/projects.json` with 3–4 sample entries following the exact schema in spec §4.
- [ ] Implement `useProjects.js` per the contract in spec §4 (`fetch('/projects.json')`, returns `{ projects, loading, error }`).
- [ ] Build `ProjectCard.jsx`: title (clickable link, opens new tab), summary, stack badges, image card — in that order, per spec §5.3.
- [ ] Build `ProjectList.jsx`: uses `useProjects()`, maps over `projects`, renders one `ProjectCard` per entry, handles the `loading` and `error` states with simple placeholder text.
- [ ] Replace the Phase 1 placeholder `<div>`s in the left column with `<ProjectList />`.
- [ ] Add basic CSS: card spacing, badge pill styling, image `object-fit: cover` inside a rounded container (spec §5.3).

**STOP — confirm real project cards render correctly and links open the right repo URLs before continuing to Phase 3.**

---

## Phase 3 — Empty 3D Scene
- [ ] Replace the Phase 1 placeholder `<div>` in the right column with `Scene.jsx` containing a bare `<Canvas>` (no ScrollControls yet, no road, no car).
- [ ] Add the two lights described in spec §5.4 (ambient + directional).
- [ ] Add a single temporary test mesh (e.g. a plain `<mesh><boxGeometry/><meshStandardMaterial/></mesh>`) just to confirm the canvas renders and is lit correctly.
- [ ] Create `sceneConfig.js` and copy in every constant listed across spec §6.2, §6.5, §6.6 (values can be the spec's suggested defaults).

**STOP — confirm a lit test cube renders inside the right-half canvas before continuing to Phase 4.**

---

## Phase 4 — Scroll Wiring (do this before any curve/car work)
- [ ] Measure the left column's real scroll height (`ResizeObserver` or `useEffect` + `scrollHeight`) and convert it to a page count `N` for `<ScrollControls pages={N}>` (spec §7).
- [ ] Wrap the scene contents in `<ScrollControls pages={N} damping={0.25}>`.
- [ ] Temporarily log `useScroll().offset` to the console every frame (inside a `useFrame`) to confirm it moves from `0` to `1` as the page is scrolled.
- [ ] Remove the console log once confirmed. Remove the Phase 3 test cube.

**STOP — confirm `scroll.offset` reliably reaches close to `1` at the bottom of the page before continuing to Phase 5. This is a hard dependency for every phase after this — do not proceed if it's not working.**

---

## Phase 5 — Road Curve (math only, no visuals yet)
- [ ] Implement `RoadCurve.js` exactly per spec §6.2: generate waypoints, pin the first waypoint to `(0,0,0)` and the last to `ROAD_END_X` (spec §6.3), build the `CatmullRomCurve3`, export `getPointAt(t)` / `getTangentAt(t)`.
- [ ] Write a tiny throwaway test (a temporary console.log or a temporary `<Line>` from drei showing the raw curve points) to visually sanity-check the curve looks wavy and runs roughly along -Z.
- [ ] Remove the throwaway test once the curve shape looks right.

**STOP — confirm the curve's shape (wavy, correct start/end points) visually before continuing to Phase 6.**

---

## Phase 6 — Road Mesh
- [ ] Implement `Road.jsx` per spec §6.4: sample the curve, build a ribbon `BufferGeometry` of width `ROAD_WIDTH`, apply the asphalt-colored material.
- [ ] Add `<Road />` to `Scene.jsx`.
- [ ] Confirm the road renders as a continuous surface with no gaps or twisted triangles along the curve.

**STOP — confirm the road mesh looks correct from the fixed camera view before continuing to Phase 7.**

---

## Phase 7 — Camera Framing
- [ ] Implement `CameraRig.jsx` per spec §6.9 (fixed camera for v1 — no orbit controls).
- [ ] Tune `CAMERA_POSITION` / `CAMERA_LOOKAT` in `sceneConfig.js` until the road is nicely framed within the right-half canvas at `scrollProgress = 0`.
- [ ] Tune `ROAD_END_X` (spec §6.3) so the far end of the road visually approaches the left edge of the right-half canvas — this is the "ends at the centre of the left half" requirement. Note in a comment that this is an empirically-tuned value.

**STOP — show the human the current framing before continuing to Phase 8. This is a visual-judgment step, not a purely mechanical one.**

---

## Phase 8 — Pine Forest
- [ ] Add the seeded PRNG helper (spec §6.5) in `utils/random.js`.
- [ ] Implement `Tree.jsx`: `BoxGeometry` trunk + one or more low-segment `ConeGeometry` foliage pieces, per spec §6.5.
- [ ] Implement `Forest.jsx`: generate `FOREST_TREE_COUNT` placements using the algorithm in spec §6.5 (random `t` along curve, perpendicular offset, left/right choice, rotation/scale variety, exclusion radius near flags).
- [ ] Use `<Instances>`/`<Instance>` from drei for trunks and for foliage (two instanced batches total).
- [ ] Add `<Forest />` to `Scene.jsx`.

**STOP — confirm the forest renders on both sides of the road without trees overlapping the road itself, and confirm frame rate still feels smooth, before continuing to Phase 9.**

---

## Phase 9 — Flags
- [ ] Implement `Flag.jsx` per spec §6.8 (pole + flag shape + idle sway animation).
- [ ] Place `<Flag variant="start" />` at `curve.getPointAt(0)`.
- [ ] Place `<Flag variant="end" />` at `curve.getPointAt(1)`.

**STOP — confirm both flags are visible and correctly positioned before continuing to Phase 10.**

---

## Phase 10 — Car (placeholder primitives)
- [ ] Implement `Car.jsx` per spec §6.6: `<group name="CarModel">` containing box body/cabin + 4 cylinder wheels, dimensions from `sceneConfig.js`.
- [ ] Place the car statically at `curve.getPointAt(0)` first (no scroll-driven movement yet) to confirm proportions and orientation look right next to the start flag.

**STOP — confirm the car's proportions and starting position/orientation look correct before continuing to Phase 11.**

---

## Phase 11 — Car Movement + Drift
- [ ] In `Car.jsx`'s `useFrame`, read `scroll.offset`, compute `point`/`tangent` via `curve.getPointAt(t)`/`getTangentAt(t)`, update the car group's position and orientation (spec §6.6).
- [ ] Add the drift yaw oscillation (`DRIFT_FREQUENCY`, `DRIFT_MAX_ANGLE` from `sceneConfig.js`).
- [ ] Add continuous wheel-spin rotation on each wheel mesh, driven by scroll delta (not wall-clock time).
- [ ] Scroll through the full page and confirm the car smoothly follows the road from start flag to end flag with no jitter or snapping.

**STOP — confirm the full scroll-driven car animation looks correct end-to-end before continuing to Phase 12.**

---

## Phase 12 — Smoke Trail
- [ ] Implement `SmokeTrail.jsx` per spec §6.7: fixed-size instanced particle pool, spawn behind the car opposite its tangent direction, tied to scroll delta (no particles while not scrolling), fade/grow/drift over each particle's life, recycle oldest particle when pool is full.
- [ ] Add `<SmokeTrail />` to `Scene.jsx`, positioned/driven relative to the car's current transform.

**STOP — confirm smoke appears while scrolling and stops appearing when scrolling stops, and that it doesn't grow unbounded in particle count, before continuing to Phase 13.**

---

## Phase 13 — Polish Pass
- [ ] Re-check spec §6.3 alignment: scroll all the way to the bottom and confirm the end flag/car position reads as roughly centered on the left half's final project card.
- [ ] Sanity-check performance (rough FPS impression) with the full scene (road + forest + car + smoke) all active at once.
- [ ] Clean up any leftover `console.log`s, unused test meshes, or commented-out experimental code.
- [ ] Verify every tunable value referenced anywhere in the code actually lives in `sceneConfig.js` (no stray magic numbers left in component files).

**STOP — final review with the human before considering v1 complete.**

---

## Explicitly not part of this checklist (see spec §8)
Do not attempt: mobile/responsive layout, GLTF model loading, physics/collision, camera orbit controls, backend/CMS integration, theming. These are future work only.
