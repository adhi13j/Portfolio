import { Canvas } from '@react-three/fiber'
import { SCENE } from './sceneConfig.js'

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 50 }}
      style={{ background: SCENE.COLOR_BACKGROUND }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      {/* Temporary test mesh - remove in Phase 4 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </Canvas>
  )
}
