"use client";

import { Component, Suspense, useRef, useMemo, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ─── Laser emitter ring positions ────────────────────────────────────────────
const LASERS = Array.from({ length: 38 }, (_, i) => {
  const a = (i / 38) * Math.PI * 2;
  const r = [1.55, 1.0, 0.42][i % 3];
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, ph: i * 0.619 };
});

// ─── Platform — Blender GLB ───────────────────────────────────────────────────
function Platform() {
  const { scene } = useGLTF("/models/who-we-are-platform.glb");

  const cloned = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((c) => {
      if (!(c instanceof THREE.Mesh)) return;
      const m = c.material as THREE.MeshStandardMaterial;
      if (!m || m.type !== "MeshStandardMaterial") return;
      if ((m.emissiveIntensity ?? 0) > 0.1) return;
      c.material = new THREE.MeshPhongMaterial({
        color: m.color?.clone() ?? new THREE.Color(0.12, 0.12, 0.12),
        specular: new THREE.Color(0.85, 0.88, 1.0),
        shininess: m.roughness != null ? Math.round((1 - m.roughness) * 120) + 20 : 80,
        reflectivity: 0.9,
      });
    });
    return s;
  }, [scene]);

  return (
    <group position={[0, -0.05, 0]} rotation={[0, 0.35, 0]} scale={[3.1, 1.5, 3.1]}>
      <primitive object={cloned} />
    </group>
  );
}

// ─── Vertical laser columns ───────────────────────────────────────────────────
function Lasers({ pr }: { pr: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#C8FF3D",
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const geo = useMemo(
    () => new THREE.CylinderGeometry(0.013, 0.03, 1, 5, 1, true),
    [],
  );

  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    // Flash white briefly during scroll transitions
    const p = pr.current;
    const flash =
      Math.sin(Math.max(0, Math.min(1, (p - 0.28) / 0.08)) * Math.PI) * 0.7 +
      Math.sin(Math.max(0, Math.min(1, (p - 0.62) / 0.08)) * Math.PI) * 0.7;
    mat.color.setStyle(flash > 0.6 ? "#ffffff" : "#C8FF3D");
    mat.opacity = 0.55 + flash * 0.45;

    for (let i = 0; i < LASERS.length; i++) {
      const e = LASERS[i];
      const flicker = 0.76 + 0.24 * Math.sin(t * 8.1 + e.ph);
      const h = 5.8 * flicker;
      dummy.position.set(e.x, 0.18 + h * 0.5, e.z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geo, mat, LASERS.length]}
      frustumCulled={false}
    />
  );
}

// ─── Wireframe padel racket ───────────────────────────────────────────────────
function Racket({ showRef }: { showRef: React.MutableRefObject<boolean> }) {
  const ref = useRef<THREE.Group>(null);

  const { headGeo, stringsGeo } = useMemo(() => {
    const hPts = Array.from({ length: 81 }, (_, i) => {
      const a = (i / 80) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 0.53, Math.sin(a) * 0.6 + 0.09, 0);
    });
    const sPts: THREE.Vector3[] = [];
    for (let i = -6; i <= 6; i++) {
      sPts.push(
        new THREE.Vector3(i * 0.075, -0.44, 0),
        new THREE.Vector3(i * 0.075, 0.66, 0),
      );
    }
    for (let i = -5; i <= 5; i++) {
      const y = i * 0.096 + 0.09;
      sPts.push(new THREE.Vector3(-0.5, y, 0), new THREE.Vector3(0.5, y, 0));
    }
    sPts.push(
      new THREE.Vector3(-0.17, -0.46, 0), new THREE.Vector3(0, -0.68, 0),
      new THREE.Vector3(0.17, -0.46, 0), new THREE.Vector3(0, -0.68, 0),
      new THREE.Vector3(0, -0.68, 0),    new THREE.Vector3(0, -1.1, 0),
    );
    return {
      headGeo: new THREE.BufferGeometry().setFromPoints(hPts),
      stringsGeo: new THREE.BufferGeometry().setFromPoints(sPts),
    };
  }, []);

  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#C8FF3D",
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    g.visible = showRef.current;
    if (!g.visible) return;
    const t = clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.38) * 0.2 + 0.3;
    g.rotation.z = Math.sin(t * 0.25) * 0.04 - 0.07;
    g.position.y = 2.2 + Math.sin(t * 0.82) * 0.055;
  });

  return (
    <group ref={ref} position={[0, 2.2, 0]} scale={1.6}>
      <lineLoop geometry={headGeo} material={mat} />
      <lineSegments geometry={stringsGeo} material={mat} />
    </group>
  );
}

// ─── Scene root ───────────────────────────────────────────────────────────────
function Scene({ pr }: { pr: React.MutableRefObject<number> }) {
  const showRacket = useRef(true);
  useFrame(() => {
    showRacket.current = pr.current < 0.38;
  });

  return (
    <>
      {/* Sky/ground hemisphere — makes metallic Phong materials visible */}
      <hemisphereLight args={["#5577aa", "#1a3322", 1.6]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 8, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-3, 3, 4]} intensity={1.1} color="#88aaff" />
      {/* Green rim light from below — cinematic */}
      <pointLight position={[0, -0.5, 1]} intensity={3} color="#C8FF3D" distance={8} />
      {/* Front fill */}
      <pointLight position={[0, 2, 4]} intensity={1.5} color="#aabbcc" distance={12} />

      <Platform />
      <Lasers pr={pr} />
      <Racket showRef={showRacket} />

      {/* Green glow disc on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[2.6, 64]} />
        <meshBasicMaterial
          color="#C8FF3D"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────
class ErrBound extends Component<
  { children: ReactNode; fallback: ReactNode },
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    return this.state.err ? this.props.fallback : this.props.children;
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function WhoWeAreScene({ pr }: { pr: React.MutableRefObject<number> }) {
  return (
    <ErrBound fallback={null}>
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        // Camera is above-right of platform, looking down slightly
        camera={{ position: [0, 1.35, 3.6], fov: 44, near: 0.1, far: 30 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="h-full w-full"
      >
        <Suspense fallback={null}>
          <Scene pr={pr} />
        </Suspense>
      </Canvas>
    </ErrBound>
  );
}

useGLTF.preload("/models/who-we-are-platform.glb");
