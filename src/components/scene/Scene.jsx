import { Canvas } from '@react-three/fiber'
import { ScrollControls, useScroll, Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import { SCENE } from './sceneConfig.js'
import { roadCurve, getPointAt } from './RoadCurve.js'
import Road from './Road.jsx'

function ScrollDebug() {
  const { offset } = useScroll()
  const lastLog = useRef(0)

  useFrame(() => {
    if (Math.abs(offset - lastLog.current) > 0.01) {
      console.log('scroll.offset:', offset.toFixed(3))
      lastLog.current = offset
    }
  })

  return null
}

function CurveDebug() {
  // Sample the curve at 100 points for smooth visualization
  const points = useMemo(() => {
    return roadCurve.getPoints(100).map((p) => [p.x, p.y, p.z])
  }, [])

  return <Line points={points} color="#ff6b6b" lineWidth={2} />
}

export default function Scene({ pages }) {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 50 }}
      style={{ background: SCENE.COLOR_SKY_TOP }}
    >
      <color attach="background" args={[SCENE.COLOR_SKY_TOP]} />
      <fog attach="fog" args={[SCENE.COLOR_FOG, SCENE.FOG_NEAR, SCENE.FOG_FAR]} />

      <ambientLight intensity={SCENE.AMBIENT_INTENSITY} color={SCENE.LIGHT_AMBIENT_COLOR} />
      <directionalLight
        position={SCENE.DIRECTIONAL_POSITION}
        intensity={SCENE.DIRECTIONAL_INTENSITY}
        color={SCENE.LIGHT_DIRECTIONAL_COLOR}
      />

      <ScrollControls pages={pages} damping={0.25}>
        <ScrollDebug />
        <CurveDebug />
        <Road />
      </ScrollControls>
    </Canvas>
  )
}
