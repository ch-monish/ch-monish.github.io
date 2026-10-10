'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import { Vector3, type Group } from 'three';
import { useEffect, useRef, useState } from 'react';
import { crossLayout, sitePalettes, type CrossLayout, type HeroInteraction, type SitePaletteId } from '@/data/site';

function PipeEnd({ side, socket }: { side: -1 | 1; socket: string }) {
  return (
    <group position={[0, side * 0.73, 0]} rotation={[side < 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0, 0.008]}>
        <circleGeometry args={[0.105, 24]} />
        <meshPhysicalMaterial color="#020306" transparent opacity={0.32} roughness={0.22} metalness={0.2} transmission={0.35} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.157, 0.025, 8, 24]} />
        <meshPhysicalMaterial color={socket} transparent opacity={0.42} roughness={0.22} metalness={0.2} transmission={0.35} />
      </mesh>
    </group>
  );
}

function PipeAxis({ color, socket, rotation }: { color: string; socket: string; rotation: [number, number, number] }) {
  return (
    <group rotation={rotation}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.23, 0.23, 1.48, 24]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.34} roughness={0.26} metalness={0.16} transmission={0.38} />
      </mesh>
      <PipeEnd side={-1} socket={socket} />
      <PipeEnd side={1} socket={socket} />
    </group>
  );
}

function ShapeCore({ item, palette }: { item: CrossLayout; palette: (typeof sitePalettes)[SitePaletteId] }) {
  const accent = palette.accent;
  const accent2 = palette.accent2;
  const material = {
    transparent: true,
    opacity: 0.32,
    emissive: accent,
    emissiveIntensity: 0.08,
    roughness: 0.34,
    metalness: 0.16,
    depthWrite: false,
  } as const;

  switch (item.shape) {
    case 'tetra':
      return <mesh rotation={[0.4, 0.8, 0.2]}><tetrahedronGeometry args={[0.62, 0]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'octa':
      return <mesh rotation={[0.7, 0.4, 0.2]}><octahedronGeometry args={[0.62, 0]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'icosa':
      return <mesh rotation={[0.8, 1.1, 0.2]}><icosahedronGeometry args={[0.62, 0]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'dodeca':
      return <mesh rotation={[0.8, 0.3, 0.6]}><dodecahedronGeometry args={[0.58, 0]} /><meshStandardMaterial color={accent} {...material} /></mesh>;
    case 'box':
      return <mesh rotation={[0.8, 1.4, 0.5]}><boxGeometry args={[0.86, 0.86, 0.86]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'diamond':
      return <mesh rotation={[0.2, 0.7, 0.1]}><octahedronGeometry args={[0.62, 0]} /><meshStandardMaterial color={accent} {...material} /></mesh>;
    case 'torus':
      return <mesh rotation={[1.2, 0.6, 0.7]}><torusGeometry args={[0.46, 0.12, 8, 20]} /><meshStandardMaterial color={accent} {...material} /></mesh>;
    case 'torusKnot':
      return <mesh rotation={[0.4, 1.1, 0.2]}><torusKnotGeometry args={[0.42, 0.1, 36, 6, 2, 3]} /><meshStandardMaterial color={accent} {...material} />
      </mesh>;
    case 'sphere':
      return <mesh><sphereGeometry args={[0.52, 12, 10]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'planet':
      return <group rotation={[0.3, 0.25, -0.28]}><mesh><sphereGeometry args={[0.42, 12, 10]} /><meshStandardMaterial color={accent2} {...material} /></mesh><mesh rotation={[0.18, 0, 0.2]}><torusGeometry args={[0.58, 0.035, 6, 24]} /><meshBasicMaterial color={accent} transparent opacity={0.55} /></mesh></group>;
    case 'capsule':
      return <mesh rotation={[0.3, 0.5, 0.8]}><capsuleGeometry args={[0.27, 0.42, 4, 8]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'cone':
      return <mesh rotation={[0.1, 0.25, 0.4]}><coneGeometry args={[0.5, 0.9, 7]} /><meshStandardMaterial color={accent} {...material} /></mesh>;
    case 'cylinder':
      return <mesh rotation={[0.6, 0.2, 0.3]}><cylinderGeometry args={[0.38, 0.38, 0.8, 10]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'triPrism':
      return <mesh rotation={[0.3, 0.7, 0.2]}><cylinderGeometry args={[0.47, 0.47, 0.66, 3]} /><meshStandardMaterial color={accent} {...material} /></mesh>;
    case 'hexPrism':
      return <mesh rotation={[0.2, 0.9, 0.1]}><cylinderGeometry args={[0.48, 0.48, 0.62, 6]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'pyramid':
      return <mesh rotation={[0.2, 0.4, 0.1]}><coneGeometry args={[0.5, 0.84, 4]} /><meshStandardMaterial color={accent} {...material} /></mesh>;
    case 'star':
      return <group><mesh><octahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color={accent2} {...material} /></mesh><mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.72, 0.72, 0.72]}><octahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color={accent} {...material} /></mesh></group>;
    case 'doubleTorus':
      return <group><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.36, 0.09, 6, 16]} /><meshStandardMaterial color={accent} {...material} /></mesh><mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.36, 0.09, 6, 16]} /><meshStandardMaterial color={accent2} {...material} /></mesh></group>;
    case 'orbital':
      return <group><mesh><sphereGeometry args={[0.3, 10, 8]} /><meshStandardMaterial color={accent2} {...material} /></mesh><mesh rotation={[0.4, 0.2, 0.7]}><torusGeometry args={[0.5, 0.04, 5, 18]} /><meshBasicMaterial color={accent} transparent opacity={0.65} /></mesh><mesh position={[0.46, 0.25, 0.1]}><sphereGeometry args={[0.11, 8, 6]} /><meshStandardMaterial color={accent} {...material} /></mesh></group>;
    case 'helix':
      return <mesh rotation={[0.8, 0.5, 0.1]}><torusKnotGeometry args={[0.32, 0.075, 32, 5, 3, 2]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'barrel':
      return <mesh rotation={[0.5, 0.3, 0.4]}><cylinderGeometry args={[0.34, 0.46, 0.7, 8]} /><meshStandardMaterial color={accent} {...material} /></mesh>;
    case 'wireCube':
      return <mesh rotation={[0.6, 0.8, 0.2]}><boxGeometry args={[0.82, 0.82, 0.82]} /><meshBasicMaterial color={accent2} wireframe transparent opacity={0.7} /></mesh>;
    case 'ringedSphere':
      return <group rotation={[0.2, 0.4, -0.3]}><mesh><sphereGeometry args={[0.34, 10, 8]} /><meshStandardMaterial color={accent2} {...material} /></mesh><mesh rotation={[0.15, 0, 0.2]}><torusGeometry args={[0.54, 0.045, 5, 20]} /><meshBasicMaterial color={accent} transparent opacity={0.6} /></mesh></group>;
    case 'crystal':
      return <mesh rotation={[0.4, 0.6, 0.3]}><octahedronGeometry args={[0.6, 0]} /><meshBasicMaterial color={accent2} wireframe transparent opacity={0.68} /></mesh>;
    case 'octaFrame':
      return <mesh rotation={[0.1, 0.8, 0.2]}><octahedronGeometry args={[0.58, 0]} /><meshBasicMaterial color={accent} wireframe transparent opacity={0.72} /></mesh>;
    case 'spindle':
      return <mesh rotation={[0.2, 0.7, 0.4]}><cylinderGeometry args={[0.04, 0.48, 0.9, 8]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'saturn':
      return <group rotation={[0.35, 0.1, -0.42]}><mesh><sphereGeometry args={[0.34, 10, 8]} /><meshStandardMaterial color={accent} {...material} /></mesh><mesh rotation={[Math.PI / 2.8, 0, 0]}><torusGeometry args={[0.55, 0.07, 5, 22]} /><meshBasicMaterial color={accent2} transparent opacity={0.56} /></mesh></group>;
    case 'plusCluster':
      return <group><PipeAxis color={accent} socket={palette.strong} rotation={[0, 0, 0]} /><PipeAxis color={accent} socket={palette.strong} rotation={[0, 0, Math.PI / 2]} /><PipeAxis color={accent} socket={palette.strong} rotation={[Math.PI / 2, 0, 0]} /></group>;
    case 'disc':
      return <mesh rotation={[0.6, 0.2, 0.3]}><cylinderGeometry args={[0.48, 0.48, 0.16, 18]} /><meshStandardMaterial color={accent2} {...material} /></mesh>;
    case 'cross':
    default:
      return (
        <>
          <PipeAxis color={accent} socket={palette.strong} rotation={[0, 0, 0]} />
          <PipeAxis color={accent} socket={palette.strong} rotation={[0, 0, Math.PI / 2]} />
          <mesh>
            <sphereGeometry args={[0.22, 8, 6]} />
            <meshStandardMaterial color={accent} {...material} />
          </mesh>
        </>
      );
  }
}

function CrossJunction({ item, index, setObjectRef, onContact, onPaletteSelect }: {
  item: CrossLayout;
  index: number;
  setObjectRef: (group: Group | null) => void;
  onContact: (index: number, point: Vector3, rayDirection: Vector3) => void;
  onPaletteSelect: (paletteId: SitePaletteId) => void;
}) {
  const palette = sitePalettes[item.paletteId];

  return (
    <group
      ref={setObjectRef}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        onContact(index, event.point, event.ray.direction);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPaletteSelect(item.paletteId);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onPaletteSelect(item.paletteId);
      }}
    >
      <ShapeCore item={item} palette={palette} />
    </group>
  );
}

type CrossMotion = {
  position: Vector3;
  velocity: Vector3;
  rotationOffset: Vector3;
  angularVelocity: Vector3;
  lastHit: number;
};

function InteractiveObjects({ interaction, onPaletteSelect, reduceMotion }: {
  interaction: HeroInteraction;
  onPaletteSelect: (paletteId: SitePaletteId) => void;
  reduceMotion: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const objectRefs = useRef<Array<Group | null>>([]);
  const { camera, viewport } = useThree();
  const view = viewport.getCurrentViewport(camera, new Vector3(0, 0, -3.5));
  const scaleX = view.width * 0.46;
  const scaleY = view.height * 0.43;
  const bodies = useRef<CrossMotion[]>(crossLayout.map((item) => ({
    position: new Vector3(item.position[0] * scaleX, item.position[1] * scaleY, item.position[2]),
    velocity: new Vector3(),
    rotationOffset: new Vector3(),
    angularVelocity: new Vector3(),
    lastHit: -1,
  })));
  const nextBumpAt = useRef(2.2);
  const handleContact = (index: number, point: Vector3, rayDirection: Vector3) => {
    if (reduceMotion) return;
    const body = bodies.current[index];
    const object = objectRefs.current[index];
    if (!body || !object) return;

    const now = performance.now() / 1000;
    if (now - body.lastHit < 0.38) return;

    const away = object.getWorldPosition(new Vector3()).sub(point);
    if (away.lengthSq() < 0.0001) away.copy(rayDirection).negate();
    away.normalize();
    body.velocity.addScaledVector(away, 7.5);
    body.velocity.z += 18;
    body.angularVelocity.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
    );
    body.lastHit = now;
  };

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const step = Math.min(delta, 0.035);
    const elapsed = clock.elapsedTime;
    const blend = 1 - Math.exp(-step * 3.5);
    const sceneViewport = viewport.getCurrentViewport(camera, new Vector3(0, 0, -3.5));
    const responsiveScaleX = sceneViewport.width * 0.46;
    const responsiveScaleY = sceneViewport.height * 0.43;
    const active = !reduceMotion && interaction.active ? 1 : 0;
    const targetX = -interaction.x * 0.24 * active;
    const targetY = -interaction.y * 0.15 * active;
    const cursorX = interaction.x * sceneViewport.width * 0.5;
    const cursorY = interaction.y * sceneViewport.height * 0.5;

    group.position.x += (targetX - group.position.x) * blend;
    group.position.y += (targetY - group.position.y) * blend;
    group.rotation.y += (interaction.x * 0.035 * active - group.rotation.y) * blend;
    group.rotation.x += (-interaction.y * 0.025 * active - group.rotation.x) * blend;

    if (reduceMotion) return;

    bodies.current.forEach((body, index) => {
      const object = objectRefs.current[index];
      if (!object) return;

      const origin = crossLayout[index].position;
      const idleX = Math.sin(elapsed * 0.34 + index * 1.7) * 0.075;
      const idleY = Math.cos(elapsed * 0.29 + index * 1.3) * 0.06;
      body.velocity.x += (origin[0] * responsiveScaleX + idleX - body.position.x) * 1.7 * step;
      body.velocity.y += (origin[1] * responsiveScaleY + idleY - body.position.y) * 1.7 * step;
      body.velocity.z += (origin[2] - body.position.z) * 1.7 * step;

      if (active) {
        const cursorDX = body.position.x - cursorX;
        const cursorDY = body.position.y - cursorY;
        const cursorDistance = Math.max(0.1, Math.hypot(cursorDX, cursorDY));
        const cursorRadius = 1.55;
        if (cursorDistance < cursorRadius) {
          const cursorForce = (1 - cursorDistance / cursorRadius) * 2.4;
          body.velocity.x += (cursorDX / cursorDistance) * cursorForce * step;
          body.velocity.y += (cursorDY / cursorDistance) * cursorForce * step;
          body.velocity.z += cursorForce * 0.35 * step;
        }
      }

      const damping = Math.exp(-1.35 * step);
      body.velocity.multiplyScalar(damping);
      body.position.addScaledVector(body.velocity, step);
      body.rotationOffset.addScaledVector(body.angularVelocity, step);
      body.angularVelocity.multiplyScalar(Math.exp(-1.8 * step));
      body.rotationOffset.multiplyScalar(Math.exp(-0.28 * step));

      object.position.copy(body.position);
      object.rotation.set(
        crossLayout[index].rotation[0] + body.rotationOffset.x,
        crossLayout[index].rotation[1] + body.rotationOffset.y,
        crossLayout[index].rotation[2] + body.rotationOffset.z,
      );
    });

    if (elapsed > nextBumpAt.current) {
      const first = Math.floor(Math.random() * bodies.current.length);
      const body = bodies.current[first];
      body.velocity.x += (Math.random() - 0.5) * 1.1;
      body.velocity.y += (Math.random() - 0.5) * 1.1;
      body.angularVelocity.set(
        (Math.random() - 0.5) * 2.2,
        (Math.random() - 0.5) * 2.2,
        (Math.random() - 0.5) * 2.2,
      );
      nextBumpAt.current = elapsed + 0.8 + Math.random() * 1.4;
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {crossLayout.map((item, index) => (
          <CrossJunction
            key={item.position.join('-')}
            item={item}
            index={index}
            setObjectRef={(object) => { objectRefs.current[index] = object; }}
            onContact={handleContact}
            onPaletteSelect={onPaletteSelect}
          />
        ))}
        </group>
    </>
  );
}

export function HeroScene({ interaction, onPaletteSelect, frameloop }: {
  interaction: HeroInteraction;
  onPaletteSelect: (paletteId: SitePaletteId) => void;
  frameloop: 'always' | 'never';
}) {
  const reduceMotion = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarsePointer(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const allowOrbit = !coarsePointer;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.75]}
      frameloop={frameloop}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <hemisphereLight args={['#e8ecff', '#1a1c24', 0.55]} />
      <directionalLight position={[4, 5, 4]} intensity={2.4} color="#f7f8ff" />
      <directionalLight position={[-4, -1, 2]} intensity={1.35} color="#4d63ff" />
      <pointLight position={[0, 1.4, 2.2]} intensity={1.1} color="#c9d4ff" distance={10} />

      <InteractiveObjects interaction={interaction} onPaletteSelect={onPaletteSelect} reduceMotion={!!reduceMotion} />

      <OrbitControls
        enableZoom={allowOrbit}
        enablePan={allowOrbit}
        enableRotate={allowOrbit}
        autoRotate={!reduceMotion}
        autoRotateSpeed={0.12}
        minDistance={4.2}
        maxDistance={15}  
        minPolarAngle={Math.PI / 2.7}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
