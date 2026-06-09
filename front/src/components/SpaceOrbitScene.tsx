import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

interface SpaceOrbitSceneProps {
  progress: number
  reduceMotion: boolean
}

export function SpaceOrbitScene({ progress, reduceMotion }: SpaceOrbitSceneProps) {
  return (
    <div className="space-canvas" aria-hidden>
      <Canvas
        camera={{ fov: 42, position: [0, 1.6, 8.4] }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 8, 17]} />
        <ambientLight intensity={0.36} />
        <directionalLight color="#e0faff" intensity={2.2} position={[-3.8, 4.6, 5.4]} />
        <pointLight color="#67e8f9" intensity={3.5} position={[3.2, 1.3, 2.4]} />
        <Stars radius={78} depth={48} count={2400} factor={4.6} saturation={0.35} fade speed={0.24} />
        <Sparkles
          color="#67e8f9"
          count={120}
          opacity={0.58}
          position={[0, 1.1, -3.8]}
          scale={[11, 4.2, 4.6]}
          size={2.4}
          speed={reduceMotion ? 0 : 0.18}
        />
        <Sparkles
          color="#34d399"
          count={64}
          opacity={0.34}
          position={[-1.8, -0.6, -2.8]}
          scale={[8, 2.2, 3.2]}
          size={1.8}
          speed={reduceMotion ? 0 : 0.12}
        />
        <Planet reduceMotion={reduceMotion} />
        <OrbitPath />
        <Rocket progress={progress} reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  )
}

function Planet({ reduceMotion }: { reduceMotion: boolean }) {
  const planet = useRef<THREE.Mesh>(null)
  const clouds = useRef<THREE.Group>(null)
  const texture = useMemo(() => createPlanetTexture(), [])

  useFrame((_, delta) => {
    if (reduceMotion) return
    if (planet.current) planet.current.rotation.y += delta * 0.035
    if (clouds.current) clouds.current.rotation.z += delta * 0.018
  })

  return (
    <group position={[0, -5.25, -0.4]} rotation={[-0.08, 0, 0]}>
      <mesh ref={planet}>
        <sphereGeometry args={[4.85, 96, 96]} />
        <meshStandardMaterial
          color="#0f3a43"
          map={texture}
          metalness={0.04}
          roughness={0.82}
        />
      </mesh>

      <mesh scale={1.018}>
        <sphereGeometry args={[4.85, 96, 96]} />
        <meshBasicMaterial
          color="#67e8f9"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      <group ref={clouds}>
        {[-0.58, -0.32, -0.05, 0.22, 0.48].map((latitude, index) => (
          <mesh key={latitude} rotation={[Math.PI / 2 + latitude * 0.1, 0, index * 0.24]}>
            <torusGeometry args={[4.88 * Math.cos(latitude * 0.7), 0.01, 8, 160]} />
            <meshBasicMaterial
              color={index % 2 ? '#67e8f9' : '#34d399'}
              transparent
              opacity={0.09}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function OrbitPath() {
  const points = useMemo(() => {
    return Array.from({ length: 42 }, (_, index) => orbitPoint(index / 41))
  }, [])

  return (
    <group>
      {points.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  )
}

function Rocket({ progress, reduceMotion }: { progress: number; reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const bobTime = useRef(0)
  const initialPosition = useMemo(() => orbitPoint(progress), [progress])

  useFrame((_, delta) => {
    const currentProgress = reduceMotion ? progress : Math.min(1, Math.max(0, progress))
    const position = orbitPoint(currentProgress)
    const tangent = orbitTangent(currentProgress)
    const angle = Math.atan2(tangent.y, tangent.x)

    if (!group.current) return
    group.current.position.copy(position)
    group.current.rotation.set(0, 0, angle)

    if (!reduceMotion) {
      bobTime.current += delta
      group.current.position.y += Math.sin(bobTime.current * 5.2) * 0.018
    }
  })

  return (
    <group ref={group} position={initialPosition} scale={0.62}>
      <pointLight color="#67e8f9" distance={0.95} intensity={1} position={[0.06, 0, 0.18]} />

      <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.115, 0.42, 24]} />
        <meshStandardMaterial
          color="#dbeafe"
          emissive="#0e7490"
          emissiveIntensity={0.12}
          metalness={0.28}
          roughness={0.38}
        />
      </mesh>

      <mesh position={[0.36, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.2, 24]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#67e8f9"
          emissiveIntensity={0.16}
          metalness={0.18}
          roughness={0.32}
        />
      </mesh>

      <mesh position={[0.14, 0.064, 0.082]} scale={[1, 0.65, 0.22]}>
        <sphereGeometry args={[0.04, 16, 10]} />
        <meshStandardMaterial
          color="#082f49"
          emissive="#38bdf8"
          emissiveIntensity={0.42}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[-0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.085, 0.28, 18]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.72}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function orbitPoint(progress: number) {
  const t = Math.min(1, Math.max(0, progress))
  const x = -4.42 + t * 8.84
  const y = -1.08 + Math.sin(t * Math.PI) * 1.14
  const z = -0.15 + Math.cos((t - 0.5) * Math.PI) * 0.22
  return new THREE.Vector3(x, y, z)
}

function orbitTangent(progress: number) {
  const t = Math.min(1, Math.max(0, progress))
  return new THREE.Vector3(8.84, Math.cos(t * Math.PI) * Math.PI * 1.14, 0)
}

function createPlanetTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#164e63')
  gradient.addColorStop(0.36, '#0f766e')
  gradient.addColorStop(0.68, '#082f49')
  gradient.addColorStop(1, '#020617')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 28; i += 1) {
    const y = 40 + i * 17 + Math.sin(i * 1.7) * 8
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.lineTo(x, y + Math.sin(x * 0.018 + i) * (4 + (i % 4)))
    }
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(103, 232, 249, 0.13)' : 'rgba(52, 211, 153, 0.09)'
    ctx.lineWidth = i % 5 === 0 ? 3 : 1.4
    ctx.stroke()
  }

  for (let i = 0; i < 90; i += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = 8 + Math.random() * 38
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, radius)
    cloud.addColorStop(0, 'rgba(224, 242, 254, 0.12)')
    cloud.addColorStop(1, 'rgba(224, 242, 254, 0)')
    ctx.fillStyle = cloud
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}
