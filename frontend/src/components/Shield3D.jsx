import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Icosahedron, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function ShieldMesh() {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.3
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05)
    }
  })

  return (
    <group>
      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[2.2, 32, 32]}>
        <meshBasicMaterial
          color="#1f4fd8"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main shield shape - Icosahedron */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <Icosahedron ref={meshRef} args={[1.6, 1]}>
          <MeshDistortMaterial
            color="#1f4fd8"
            emissive="#0037b1"
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.8}
            distort={0.15}
            speed={2}
            transparent
            opacity={0.85}
          />
        </Icosahedron>
      </Float>

      {/* Inner core glow */}
      <Sphere args={[0.6, 16, 16]}>
        <meshBasicMaterial color="#b7c4ff" transparent opacity={0.4} />
      </Sphere>

      {/* Orbiting particles */}
      <OrbitingParticles />
    </group>
  )
}

function OrbitingParticles() {
  const particlesRef = useRef()
  const count = 60

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.5 + Math.random() * 0.8
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.15
      particlesRef.current.rotation.x = state.clock.getElapsedTime() * 0.08
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#b7c4ff"
        size={0.04}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

export default function Shield3D({ className = '' }) {
  return (
    <div className={`canvas-3d-container ${className}`} style={{ minHeight: 380 }}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-3, -3, 3]} intensity={0.5} color="#b7c4ff" />
        <pointLight position={[3, -2, -3]} intensity={0.3} color="#62df7d" />
        <ShieldMesh />
      </Canvas>
    </div>
  )
}
