import { useMemo } from 'react'
import * as THREE from 'three'
import { roadCurve } from './RoadCurve.js'
import { SCENE, ROAD_WIDTH } from './sceneConfig.js'

export default function Road() {
  const geometry = useMemo(() => {
    const steps = 100
    const halfWidth = ROAD_WIDTH / 2
    const vertices = []
    const indices = []
    const uvs = []

    // Sample points and compute normals along the curve
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const point = roadCurve.getPointAt(t)
      const tangent = roadCurve.getTangentAt(t).normalize()

      // Compute a stable "up" vector and derive the right vector
      const up = new THREE.Vector3(0, 1, 0)
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize()

      // Offset left and right to create the road edges
      const left = point.clone().addScaledVector(right, -halfWidth)
      const rightEdge = point.clone().addScaledVector(right, halfWidth)

      vertices.push(left.x, left.y, left.z)
      vertices.push(rightEdge.x, rightEdge.y, rightEdge.z)

      // UV coordinates for potential texture mapping
      uvs.push(0, t)
      uvs.push(1, t)
    }

    // Build triangle indices for the ribbon
    for (let i = 0; i < steps; i++) {
      const a = i * 2
      const b = i * 2 + 1
      const c = (i + 1) * 2
      const d = (i + 1) * 2 + 1

      // Two triangles per quad segment
      indices.push(a, c, b)
      indices.push(b, c, d)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()

    return geo
  }, [])

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color={SCENE.COLOR_ROAD}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}
