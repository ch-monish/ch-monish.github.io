'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import { DoubleSide, Shape, type Group } from 'three';

export type SharkInteraction = {
  id: string;
  x: number;
  y: number;
  active: boolean;
  attacking: boolean;
  attackId: number;
  attackStartedAt: number;
};

const bodyShape = new Shape();
bodyShape.moveTo(-1.35, 0.02);
bodyShape.quadraticCurveTo(-0.85, 0.42, -0.12, 0.4);
bodyShape.quadraticCurveTo(0.62, 0.34, 1.2, 0.13);
bodyShape.quadraticCurveTo(1.48, 0.07, 1.58, 0.02);
bodyShape.quadraticCurveTo(1.22, -0.07, 0.86, -0.14);
bodyShape.quadraticCurveTo(0.36, -0.4, -0.24, -0.34);
bodyShape.quadraticCurveTo(-0.85, -0.25, -1.35, 0.02);

const bellyShape = new Shape();
bellyShape.moveTo(-1.05, -0.04);
bellyShape.quadraticCurveTo(-0.38, -0.15, 0.18, -0.15);
bellyShape.quadraticCurveTo(0.74, -0.13, 1.28, 0.01);
bellyShape.quadraticCurveTo(0.76, -0.4, 0.05, -0.38);
bellyShape.quadraticCurveTo(-0.55, -0.32, -1.05, -0.04);

const tailShape = new Shape();
tailShape.moveTo(0, 0);
tailShape.quadraticCurveTo(-0.45, 0.48, -0.86, 0.54);
tailShape.quadraticCurveTo(-0.7, 0.18, -0.46, 0.02);
tailShape.quadraticCurveTo(-0.72, -0.08, -0.9, -0.46);
tailShape.quadraticCurveTo(-0.38, -0.37, 0, 0);

const dorsalShape = new Shape();
dorsalShape.moveTo(-0.31, 0.12);
dorsalShape.quadraticCurveTo(-0.14, 0.62, 0.04, 0.88);
dorsalShape.quadraticCurveTo(0.13, 0.46, 0.41, 0.18);
dorsalShape.lineTo(-0.31, 0.12);

const pectoralShape = new Shape();
pectoralShape.moveTo(0.2, 0.08);
pectoralShape.quadraticCurveTo(-0.18, -0.04, -0.74, -0.48);
pectoralShape.quadraticCurveTo(-0.38, -0.46, 0.32, -0.2);
pectoralShape.lineTo(0.2, 0.08);

const jawShape = new Shape();
jawShape.moveTo(-0.06, 0.04);
jawShape.quadraticCurveTo(0.32, -0.02, 0.72, -0.12);
jawShape.quadraticCurveTo(0.47, -0.34, 0.08, -0.22);
jawShape.lineTo(-0.06, 0.04);

function SharkModel({ interactionRef, active }: { interactionRef: MutableRefObject<SharkInteraction>; active: boolean }) {
  const sharkRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const jawRef = useRef<Group>(null);
  const { size, viewport } = useThree();
  const motion = useRef({ initialized: false, nextDartAt: 0, dartX: 0, dartY: 0, attackId: -1, facing: 1 });

  useFrame(({ clock }, delta) => {
    const shark = sharkRef.current;
    if (!shark) return;
    const interaction = interactionRef.current;
    if (!interaction.active && !interaction.attacking) {
      shark.visible = false;
      return;
    }
    shark.visible = true;

    const now = performance.now() / 1000;
    const attackProgress = interaction.attacking
      ? Math.min(1, Math.max(0, (now - interaction.attackStartedAt) / 0.78))
      : 0;
    const attackEase = attackProgress * attackProgress * (3 - 2 * attackProgress);
    const targetX = (interaction.x / size.width - 0.5) * viewport.width;
    const targetY = (0.5 - interaction.y / size.height) * viewport.height;
    const waveX = interaction.attacking ? 0 : Math.sin(clock.elapsedTime * 1.45) * 0.24 + Math.sin(clock.elapsedTime * 0.43) * 0.18;
    const waveY = interaction.attacking ? 0 : Math.sin(clock.elapsedTime * 2.1 + 0.7) * 0.16 + Math.cos(clock.elapsedTime * 0.68) * 0.12;

    if (!motion.current.initialized) {
      shark.position.set(targetX, targetY, 0.8);
      motion.current.initialized = true;
      motion.current.nextDartAt = clock.elapsedTime + 1.2;
    }

    if (!interaction.attacking && clock.elapsedTime > motion.current.nextDartAt) {
      motion.current.dartX = (Math.random() - 0.5) * 0.72;
      motion.current.dartY = (Math.random() - 0.5) * 0.5;
      motion.current.nextDartAt = clock.elapsedTime + 1.1 + Math.random() * 2.1;
    }

    const desiredX = targetX + waveX + motion.current.dartX * (interaction.attacking ? 0 : 1);
    const desiredY = targetY + waveY + motion.current.dartY * (interaction.attacking ? 0 : 1);
    const follow = 1 - Math.exp(-delta * (interaction.attacking ? 8.5 : 2.8));
    shark.position.x += (desiredX - shark.position.x) * follow;
    shark.position.y += (desiredY - shark.position.y) * follow;
    shark.position.z += (0.8 + Math.sin(clock.elapsedTime * 1.7) * 0.08 - shark.position.z) * follow;

    const horizontalMotion = desiredX - shark.position.x;
    if (Math.abs(horizontalMotion) > 0.025) motion.current.facing = horizontalMotion > 0 ? 1 : -1;
    shark.rotation.y = motion.current.facing === 1 ? 0 : Math.PI;
    shark.rotation.z = Math.max(-0.23, Math.min(0.23, (desiredY - shark.position.y) * 0.28)) + Math.sin(clock.elapsedTime * 2.2) * 0.018;
    const worldScale = (viewport.width / size.width) * 48 / 3.2;
    const biteScale = 1 + attackEase * 0.45;
    shark.scale.setScalar(worldScale * biteScale);

    if (tailRef.current) tailRef.current.rotation.z = Math.sin(clock.elapsedTime * 11) * 0.42;
    if (jawRef.current) {
      const bite = interaction.attacking ? Math.min(1, attackProgress * 3.5) : 0;
      jawRef.current.rotation.z = -bite * 0.8;
    }
  });

  return (
    <group ref={sharkRef} visible={active}>
      <mesh position={[0, 0, -0.21]} castShadow>
        <extrudeGeometry args={[bodyShape, { depth: 0.42, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.035 }]} />
        <meshPhysicalMaterial color="#657d88" roughness={0.55} metalness={0.12} clearcoat={0.28} clearcoatRoughness={0.42} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.245]}>
        <shapeGeometry args={[bellyShape]} />
        <meshStandardMaterial color="#c3cfca" roughness={0.72} side={DoubleSide} />
      </mesh>
      <group ref={tailRef} position={[-1.22, 0.02, 0]}>
        <mesh position={[-0.45, 0, 0]}>
          <shapeGeometry args={[tailShape]} />
          <meshPhysicalMaterial color="#526c77" side={DoubleSide} roughness={0.56} clearcoat={0.2} />
        </mesh>
      </group>
      <mesh position={[-0.1, 0.27, -0.02]}>
        <shapeGeometry args={[dorsalShape]} />
        <meshStandardMaterial color="#526c77" side={DoubleSide} roughness={0.58} />
      </mesh>
      <mesh position={[0.2, -0.12, 0.2]} rotation={[0.2, 0.05, -0.1]}>
        <shapeGeometry args={[pectoralShape]} />
        <meshStandardMaterial color="#526c77" side={DoubleSide} roughness={0.58} />
      </mesh>
      <mesh position={[0.2, -0.12, -0.2]} rotation={[-0.2, -0.05, -0.1]}>
        <shapeGeometry args={[pectoralShape]} />
        <meshStandardMaterial color="#526c77" side={DoubleSide} roughness={0.58} />
      </mesh>
      {[0.15, 0.3, 0.45, 0.6].map((x) => (
        <mesh key={x} position={[x, -0.03, 0.248]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.018, 0.16, 0.012]} />
          <meshStandardMaterial color="#334a54" roughness={0.65} />
        </mesh>
      ))}
      {[0.15, 0.3, 0.45, 0.6].map((x) => (
        <mesh key={`back-${x}`} position={[x, -0.03, -0.248]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.018, 0.16, 0.012]} />
          <meshStandardMaterial color="#334a54" roughness={0.65} />
        </mesh>
      ))}
      {[1, -1].map((side) => (
        <group key={side} position={[0.99, 0.13, side * 0.235]}>
          <mesh><sphereGeometry args={[0.052, 10, 8]} /><meshStandardMaterial color="#d7c29a" roughness={0.3} /></mesh>
          <mesh position={[0.012, 0, side * 0.035]}><sphereGeometry args={[0.032, 8, 6]} /><meshStandardMaterial color="#101820" roughness={0.18} /></mesh>
          <mesh position={[0.022, 0.014, side * 0.054]}><sphereGeometry args={[0.009, 6, 5]} /><meshBasicMaterial color="#f0f2df" /></mesh>
        </group>
      ))}
      <group ref={jawRef} position={[0.86, -0.1, 0.05]}>
        <mesh position={[0.2, -0.09, 0]}>
          <shapeGeometry args={[jawShape]} />
          <meshStandardMaterial color="#bdc9c4" side={DoubleSide} roughness={0.68} />
        </mesh>
        <mesh position={[0.18, -0.035, 0.015]} scale={[0.33, 0.09, 0.12]}><sphereGeometry args={[0.5, 10, 8]} /><meshStandardMaterial color="#26353b" roughness={0.7} /></mesh>
        {[-0.02, 0.08, 0.18, 0.28, 0.38].map((x) => (
          <mesh key={x} position={[x, 0.015, 0.14]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.035, 0.11, 3]} /><meshStandardMaterial color="#e2e2d7" roughness={0.52} /></mesh>
        ))}
      </group>
    </group>
  );
}

export function FooterShark({ interactionRef, active }: { interactionRef: MutableRefObject<SharkInteraction>; active: boolean }) {
  return (
    <div className="footer-shark-canvas" aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [0, 0, 8], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 4, 5]} intensity={2.1} color="#e7fbff" />
        <pointLight position={[-3, 1, 3]} intensity={16} color="#55d1e2" distance={9} />
        <SharkModel interactionRef={interactionRef} active={active} />
      </Canvas>
    </div>
  );
}
