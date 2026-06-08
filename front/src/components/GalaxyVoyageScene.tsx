import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { PLANETS } from '../domain/planets'

type Planet = (typeof PLANETS)[number]

export type VoyagePlanet = Planet & {
  unlocked: boolean
}

interface GalaxyVoyageSceneProps {
  planets: VoyagePlanet[]
  completedMinutes: number
  isVoyaging: boolean
  reduceMotion: boolean
}

const PLANET_COLORS: Record<string, string> = {
  moon: '#cbd5e1',
  mars: '#f97316',
  jupiter: '#fbbf24',
  saturn: '#facc15',
  neptune: '#38bdf8',
}

export function GalaxyVoyageScene({
  planets,
  completedMinutes,
  isVoyaging,
  reduceMotion,
}: GalaxyVoyageSceneProps) {
  return (
    <div className="galaxy-voyage-canvas" aria-label="3D 행성 항해 화면">
      <Canvas
        camera={{ fov: 44, position: [0, 1.8, 8.2] }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 8, 22]} />
        <ambientLight intensity={0.28} />
        <directionalLight color="#e0faff" intensity={2.4} position={[-4, 5, 6]} />
        <pointLight color="#67e8f9" intensity={3.2} position={[2.5, 1.8, 3]} />
        <pointLight color="#fbbf24" intensity={1.8} position={[-3.5, -1.2, 1.8]} />
        <Stars radius={96} depth={58} count={3200} factor={4.8} saturation={0.4} fade speed={0.18} />
        <Sparkles
          color="#67e8f9"
          count={140}
          opacity={0.46}
          position={[0, 0.4, -3.8]}
          scale={[12, 4.6, 6]}
          size={2.2}
          speed={reduceMotion ? 0 : 0.18}
        />
        <VoyageCamera enabled={isVoyaging && !reduceMotion} />
        <Route planets={planets} completedMinutes={completedMinutes} />
        <VoyageRocket
          planetCount={planets.length}
          isVoyaging={isVoyaging}
          reduceMotion={reduceMotion}
        />
      </Canvas>
    </div>
  )
}

function VoyageCamera({ enabled }: { enabled: boolean }) {
  useFrame(({ camera, clock }) => {
    if (!enabled) {
      camera.position.lerp(new THREE.Vector3(0, 1.8, 8.2), 0.05)
      camera.lookAt(0, -0.08, 0)
      return
    }

    const elapsed = clock.getElapsedTime()
    camera.position.x = Math.sin(elapsed * 0.22) * 0.72
    camera.position.y = 1.8 + Math.sin(elapsed * 0.42) * 0.16
    camera.position.z = 7.6 + Math.cos(elapsed * 0.18) * 0.38
    camera.lookAt(Math.sin(elapsed * 0.18) * 0.8, -0.14, -1.4)
  })

  return null
}

function Route({
  planets,
  completedMinutes,
}: {
  planets: VoyagePlanet[]
  completedMinutes: number
}) {
  const points = useMemo(() => createRoutePoints(planets.length), [planets.length])
  const completedRatio = Math.min(
    1,
    completedMinutes / Math.max(...planets.map((planet) => planet.requiredMinutes)),
  )

  return (
    <group>
      {points.map((point, index) => (
        <mesh key={`${point.x}-${index}`} position={point}>
          <sphereGeometry args={[index / Math.max(1, points.length - 1) <= completedRatio ? 0.032 : 0.022, 10, 10]} />
          <meshBasicMaterial
            color={index / Math.max(1, points.length - 1) <= completedRatio ? '#67e8f9' : '#334155'}
            transparent
            opacity={index / Math.max(1, points.length - 1) <= completedRatio ? 0.76 : 0.34}
          />
        </mesh>
      ))}
      {planets.map((planet, index) => (
        <VoyagePlanetMesh key={planet.id} planet={planet} index={index} />
      ))}
    </group>
  )
}

function VoyagePlanetMesh({ planet, index }: { planet: VoyagePlanet; index: number }) {
  const group = useRef<THREE.Group>(null)
  const texture = useMemo(
    () => createPlanetTexture(PLANET_COLORS[planet.id] ?? '#67e8f9', planet.unlocked),
    [planet.id, planet.unlocked],
  )
  const position = planetPosition(index)
  const size = planet.id === 'jupiter' ? 0.78 : planet.id === 'saturn' ? 0.68 : 0.54
  const color = PLANET_COLORS[planet.id] ?? '#67e8f9'

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * (planet.unlocked ? 0.16 : 0.06)
  })

  return (
    <group ref={group} position={position}>
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          color={planet.unlocked ? color : '#334155'}
          emissive={planet.unlocked ? color : '#020617'}
          emissiveIntensity={planet.unlocked ? 0.16 : 0.02}
          map={texture}
          metalness={0.08}
          roughness={0.78}
        />
      </mesh>

      {planet.id === 'saturn' && (
        <mesh rotation={[Math.PI / 2.5, 0, 0.38]}>
          <torusGeometry args={[0.98, 0.045, 16, 128]} />
          <meshBasicMaterial
            color={planet.unlocked ? '#fde68a' : '#64748b'}
            transparent
            opacity={planet.unlocked ? 0.72 : 0.28}
          />
        </mesh>
      )}

      <mesh scale={1.12}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshBasicMaterial
          color={planet.unlocked ? color : '#475569'}
          transparent
          opacity={planet.unlocked ? 0.1 : 0.035}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

    </group>
  )
}

function VoyageRocket({
  planetCount,
  isVoyaging,
  reduceMotion,
}: {
  planetCount: number
  isVoyaging: boolean
  reduceMotion: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const progress = useRef(0.1)

  useFrame((_, delta) => {
    if (!group.current) return
    if (isVoyaging && !reduceMotion) {
      progress.current = (progress.current + delta * 0.075) % 1
    }

    const position = routePoint(progress.current, planetCount)
    const ahead = routePoint(Math.min(1, progress.current + 0.01), planetCount)
    const tangent = ahead.clone().sub(position)
    group.current.position.copy(position)
    group.current.rotation.z = Math.atan2(tangent.y, tangent.x)
    group.current.rotation.y = -0.18
  })

  return (
    <group ref={group} scale={0.78}>
      <pointLight color="#67e8f9" distance={1.4} intensity={1.8} position={[-0.24, 0, 0.12]} />
      <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.13, 0.52, 24]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#0891b2" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0.42, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.22, 24]} />
        <meshStandardMaterial color="#f8fafc" emissive="#67e8f9" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[-0.36, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.32, 18]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.82} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

function createRoutePoints(planetCount: number) {
  return Array.from({ length: 70 }, (_, index) => routePoint(index / 69, planetCount))
}

function routePoint(progress: number, planetCount: number) {
  const t = Math.min(1, Math.max(0, progress))
  const start = planetPosition(0)
  const end = planetPosition(Math.max(0, planetCount - 1))
  const x = THREE.MathUtils.lerp(start.x - 0.8, end.x + 0.8, t)
  const y = -0.32 + Math.sin(t * Math.PI * 1.18) * 1.18
  const z = THREE.MathUtils.lerp(0.46, -3.1, t) + Math.sin(t * Math.PI * 2.1) * 0.16
  return new THREE.Vector3(x, y, z)
}

function planetPosition(index: number) {
  return new THREE.Vector3(-4.25 + index * 2.1, -0.86 + Math.sin(index * 0.9) * 0.56, -0.68 - index * 0.46)
}

function createPlanetTexture(baseColor: string, unlocked: boolean) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = unlocked ? baseColor : '#1e293b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 18; i += 1) {
    const y = 14 + i * 14
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= canvas.width; x += 28) {
      ctx.lineTo(x, y + Math.sin(x * 0.024 + i * 1.4) * (2.4 + (i % 3)))
    }
    ctx.strokeStyle = unlocked ? 'rgba(255,255,255,0.18)' : 'rgba(148,163,184,0.1)'
    ctx.lineWidth = i % 4 === 0 ? 2 : 1
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}
