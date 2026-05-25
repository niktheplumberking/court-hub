"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ── brand tints ──────────────────────────────────────────────────────── */

const TINTS = {
  HEAD: new THREE.Color("#1E5AE8"),
  Wilson: new THREE.Color("#07C66A"),
  "Pre-Owned": new THREE.Color("#E84525"),
} as const;

type Brand = keyof typeof TINTS;
type Props = { activeBrand: Brand };

/* ── constants ────────────────────────────────────────────────────────── */

const MODEL_URL = "/models/adidas/scene.glb";
const TARGET_H = 1.7;
const FLOOR_Y = -1.05;

// Correction that makes the Adidas GLB stand upright and face the camera.
// The model is exported Z-up: rotating X by -90° tilts it from lying flat
// to standing. The extra 180° Y flip ensures the face is toward +Z (camera).
const CORRECTION: [number, number, number] = [-Math.PI / 2, Math.PI, 0];

/* ── Single racket component ─────────────────────────────────────────── */

type RacketProps = {
  baseX: number;
  active: boolean;
  brand: Brand;
  prefersReduced: boolean;
};

function Racket({ baseX, active, brand, prefersReduced }: RacketProps) {
  const gltf = useGLTF(MODEL_URL);

  const cloned = useMemo(() => {
    const c = gltf.scene.clone(true);
    c.rotation.set(...CORRECTION);
    c.updateMatrixWorld(true);
    return c;
  }, [gltf.scene]);

  // Scale by the longest axis of the corrected pose
  const { centerOffset, scale, height } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const s = TARGET_H / maxDim;
    return { centerOffset: center, scale: s, height: size.y * s };
  }, [cloned]);

  const group = useRef<THREE.Group>(null);
  const yBase = FLOOR_Y + height / 2;

  useFrame((state, dt) => {
    if (!group.current) return;
    // Float: gentle vertical bob
    group.current.position.y =
      yBase + Math.sin(state.clock.elapsedTime * 0.9 + baseX) * 0.048;
    // Very slow Y spin — keeps it mostly face-on (full revolution ~30 s)
    if (!prefersReduced) {
      group.current.rotation.y += 0.21 * dt;
    }
    // Active paddle sits slightly closer / larger
    const targetScale = active ? 1.05 : 0.95;
    const cur = group.current.scale.x;
    group.current.scale.setScalar(cur + (targetScale - cur) * Math.min(1, dt * 3));
  });

  return (
    <group ref={group} position={[baseX, yBase, 0]}>
      <group
        position={[
          -centerOffset.x * scale,
          -centerOffset.y * scale,
          -centerOffset.z * scale,
        ]}
        scale={scale}
      >
        <primitive object={cloned} />
      </group>
      <spotLight
        position={[0, 3.5, 1.8]}
        angle={0.36}
        penumbra={0.8}
        intensity={active ? 18 : 5}
        color={TINTS[brand].getStyle()}
        distance={8}
        castShadow={false}
      />
    </group>
  );
}

/* ── Animated floor glow ─────────────────────────────────────────────── */

function Floor({ activeBrand }: { activeBrand: Brand }) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: TINTS[activeBrand].clone(),
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  useFrame((_, dt) => {
    (mat.color as THREE.Color).lerp(TINTS[activeBrand], Math.min(1, dt * 2.5));
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} material={mat}>
      <circleGeometry args={[3.0, 64]} />
    </mesh>
  );
}

/* ── Sparse ambient particles ────────────────────────────────────────── */

function Particles() {
  const pts = useRef<THREE.Points>(null);
  const [geom, mat] = useMemo(() => {
    const count = 100;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 1] = Math.random() * 3.5 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return [
      g,
      new THREE.PointsMaterial({ size: 0.01, color: "#ffffff", opacity: 0.2, transparent: true, depthWrite: false }),
    ];
  }, []);
  useFrame((s) => {
    if (pts.current) pts.current.rotation.y = s.clock.elapsedTime * 0.025;
  });
  return <points ref={pts} geometry={geom} material={mat} />;
}

/* ── Mouse parallax camera ───────────────────────────────────────────── */

function ParallaxCamera() {
  const { camera, mouse } = useThree();
  const base = useRef(camera.position.clone());
  useEffect(() => { base.current = camera.position.clone(); }, [camera]);
  useFrame((_, dt) => {
    const a = Math.min(1, dt * 2.0);
    camera.position.x += (base.current.x + mouse.x * 0.22 - camera.position.x) * a;
    camera.position.y += (base.current.y + mouse.y * 0.12 - camera.position.y) * a;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ── Scene ────────────────────────────────────────────────────────────── */

function Scene({ activeBrand, prefersReduced }: { activeBrand: Brand; prefersReduced: boolean }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 3]} intensity={0.75} color="#e8eeff" />
      <directionalLight position={[-3, 2, -1]} intensity={0.38} color="#9bb3ff" />
      <Floor activeBrand={activeBrand} />
      <ContactShadows position={[0, FLOOR_Y, 0]} opacity={0.45} scale={5} blur={2.8} far={3} resolution={512} />
      <Particles />
      {/* Both slots show the same Adidas model as placeholder */}
      <Racket baseX={-1.5} active={activeBrand === "HEAD"} brand="HEAD" prefersReduced={prefersReduced} />
      <Racket baseX={1.5} active={activeBrand === "Wilson" || activeBrand === "Pre-Owned"} brand={activeBrand === "Pre-Owned" ? "Pre-Owned" : "Wilson"} prefersReduced={prefersReduced} />
      {!prefersReduced && <ParallaxCamera />}
    </>
  );
}

/* ── Error boundary ───────────────────────────────────────────────────── */

class ErrBound extends Component<{ children: ReactNode; fallback: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e: Error) { if (process.env.NODE_ENV !== "production") console.error("[RackShowcase3D]", e); }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

/* ── Public export ────────────────────────────────────────────────────── */

export function RackShowcase3D({ activeBrand }: Props) {
  const prefersReduced = useReducedMotion();
  return (
    <ErrBound fallback={<div className="h-full w-full" />}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.45, 6.5], fov: 40, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="h-full w-full"
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene activeBrand={activeBrand} prefersReduced={prefersReduced} />
        </Suspense>
      </Canvas>
    </ErrBound>
  );
}

useGLTF.preload(MODEL_URL);
