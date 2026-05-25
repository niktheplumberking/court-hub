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
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

const SLIDES = [
  "/images/who-we-are/slide-rackets.png",
  "/images/who-we-are/slide-brands.png",
  "/images/who-we-are/slide-pillars.png",
];

const CYCLE_S = 5.4;
const FADE_S = 0.7;

// Target world-space radius of the metal base disc (in three.js units).
// +35% from previous 0.32
const BASE_RADIUS = 0.43;

// ─── Hologram shader ─────────────────────────────────────────────────────────
// Treats the source PNG's luminance as the alpha mask so the slide's black
// render background disappears and only the subject shows. Adds scan lines,
// flicker, lime tint, and edge falloff so it reads as projected light.
const holoVS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const holoFS = /* glsl */ `
  precision highp float;
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3 uTint;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float lum = max(max(tex.r, tex.g), tex.b);
    float mask = smoothstep(0.04, 0.18, lum) * tex.a;
    if (mask < 0.01) discard;

    vec3 col = mix(tex.rgb, tex.rgb * uTint, 0.32);
    float scan = 0.85 + 0.15 * sin(vUv.y * 320.0 + uTime * 2.1);
    col *= scan;
    float flick = 0.94 + 0.06 * sin(uTime * 13.0);
    col *= flick;

    float edge = smoothstep(0.0, 0.18, vUv.x) *
                 smoothstep(1.0, 0.82, vUv.x) *
                 smoothstep(0.0, 0.14, vUv.y) *
                 smoothstep(1.0, 0.86, vUv.y);

    gl_FragColor = vec4(col, mask * uOpacity * edge);
  }
`;

// ─── Platform ────────────────────────────────────────────────────────────────
// Scales the imported GLB so the metal disc has radius == BASE_RADIUS, then
// reports the world-space top-Y of the lights structure so we can park the
// hologram billboard cleanly above it.
function usePlatformLayout() {
  const { scene } = useGLTF("/models/hologram-platform.glb");

  return useMemo(() => {
    const root = scene.clone(true);

    const found: { metal: THREE.Mesh | null; lights: THREE.Mesh | null } = {
      metal: null,
      lights: null,
    };
    root.traverse((c) => {
      if (!(c instanceof THREE.Mesh)) return;
      if (c.name.includes("Metal-part")) found.metal = c;
      if (c.name.includes("Hologram-lights")) found.lights = c;
    });
    const metal = found.metal;
    const lights = found.lights;

    const metalBox = new THREE.Box3().setFromObject(metal ?? root);
    const metalSize = metalBox.getSize(new THREE.Vector3());
    const metalRadius = Math.max(metalSize.x, metalSize.z) * 0.5 || 1;
    const scale = BASE_RADIUS / metalRadius;

    // Lift the lights mesh so its base aligns with the metal disc top
    // (the source asset's light cone extends below the platform — clip it)
    if (lights && metal) {
      const lBox = new THREE.Box3().setFromObject(lights);
      const mBox = new THREE.Box3().setFromObject(metal);
      lights.position.y += mBox.max.y - lBox.min.y - 0.02;
    }

    // Brighten + warm-tint the hologram cone material
    if (lights) {
      const m = (lights as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (m && "emissive" in m) {
        m.emissive = new THREE.Color("#C8FF3D");
        m.emissiveIntensity = 1.6;
        m.toneMapped = false;
      }
    }

    root.scale.setScalar(scale);
    root.updateMatrixWorld(true);

    const worldBox = new THREE.Box3().setFromObject(lights ?? root);
    const lightsTopY = isFinite(worldBox.max.y) ? worldBox.max.y : BASE_RADIUS;
    const metalWorldBox = new THREE.Box3().setFromObject(metal ?? root);
    const baseY = isFinite(metalWorldBox.min.y) ? metalWorldBox.min.y : 0;

    return { root, scale, lightsTopY: lightsTopY - baseY, baseY };
  }, [scene]);
}

function Platform() {
  const { root, baseY } = usePlatformLayout();
  return <primitive object={root} position={[0, -baseY, 0]} />;
}

// ─── Hologram billboard ──────────────────────────────────────────────────────
function HologramBillboard({ heightY }: { heightY: number }) {
  const textures = useTexture(SLIDES) as THREE.Texture[];
  const start = useRef(0);

  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 8;
    });
  }, [textures]);

  const materials = useMemo(
    () =>
      textures.map(
        () =>
          new THREE.ShaderMaterial({
            vertexShader: holoVS,
            fragmentShader: holoFS,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
            side: THREE.DoubleSide,
            uniforms: {
              uMap: { value: null as THREE.Texture | null },
              uOpacity: { value: 0 },
              uTime: { value: 0 },
              uTint: { value: new THREE.Vector3(0.78, 1.0, 0.66) },
            },
          }),
      ),
    [textures],
  );

  useEffect(() => {
    materials.forEach((m, i) => {
      m.uniforms.uMap.value = textures[i];
    });
  }, [materials, textures]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (start.current === 0) start.current = t;
    const elapsed = t - start.current;
    const phase = elapsed % CYCLE_S;
    const slot = Math.floor(elapsed / CYCLE_S) % SLIDES.length;

    const fIn = Math.min(1, phase / FADE_S);
    const fOut = Math.min(1, (CYCLE_S - phase) / FADE_S);
    const opacity = Math.max(0, Math.min(fIn, fOut));

    materials.forEach((m, i) => {
      m.uniforms.uTime.value = t;
      m.uniforms.uOpacity.value = i === slot ? opacity : 0;
    });
  });

  return (
    <group position={[0, heightY, 0]}>
      {materials.map((mat, i) => (
        <mesh key={SLIDES[i]} material={mat} position={[0, 0, i * 0.001]}>
          <planeGeometry args={[1.0, 1.0]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Slow rotation rig ──────────────────────────────────────────────────────
function Rig() {
  const layout = usePlatformLayout();
  const g = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    g.current.rotation.y = Math.sin(t * 0.18) * 0.16;
    g.current.position.y = Math.sin(t * 0.45) * 0.012;
  });

  // Park the slide near the top of the platform's light cone (compact composition)
  const slideY = layout.lightsTopY * 0.42 + 0.02;

  return (
    <group ref={g}>
      <Platform />
      <HologramBillboard heightY={slideY} />
    </group>
  );
}

function Scene() {
  const { camera } = useThree();
  useEffect(() => {
    // Aim camera at the hologram column's mid-height so the platform
    // reads as "on a table" and the light shoots up, not at us.
    camera.lookAt(0, 0.55, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 3]} intensity={1.3} color="#dfe8ff" />
      <directionalLight position={[-3, 2, 1]} intensity={0.55} color="#C8FF3D" />
      <pointLight position={[0, 0.5, 2]} intensity={1.2} color="#C8FF3D" distance={6} />
      <Rig />
    </>
  );
}

class ErrBound extends Component<
  { children: ReactNode; fallback: ReactNode },
  { err: boolean }
> {
  state = { err: false };
  static getDerivedStateFromError() {
    return { err: true };
  }
  componentDidCatch(err: Error) {
    if (process.env.NODE_ENV !== "production") console.error("[hologram]", err);
  }
  render() {
    return this.state.err ? this.props.fallback : this.props.children;
  }
}

export function WhoWeAreScene() {
  return (
    <ErrBound fallback={null}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.65, 4.0], fov: 26, near: 0.1, far: 25 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="h-full w-full"
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </ErrBound>
  );
}

useGLTF.preload("/models/hologram-platform.glb");
useTexture.preload(SLIDES);
