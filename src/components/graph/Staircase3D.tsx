import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OUTCOME_COLORS, layoutBlocks, type BlockLayout, type GraphConfig } from "./graphConfig";
import type { GraphPoint } from "../../domain/types";

interface Staircase3DProps {
  points: readonly GraphPoint[];
  config: GraphConfig;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
}

/** Fits an orthographic camera to the layout bounds at the configured yaw/pitch. */
function FitCamera({ bounds, config }: { bounds: ReturnType<typeof layoutBlocks>["bounds"]; config: GraphConfig }) {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    const camera = get().camera as THREE.OrthographicCamera;
    const center = new THREE.Vector3(
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minY + bounds.maxY) / 2,
      (bounds.minZ + bounds.maxZ) / 2,
    );
    const yaw = THREE.MathUtils.degToRad(config.cameraYaw);
    const pitch = THREE.MathUtils.degToRad(config.cameraPitch);
    const dir = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    );
    camera.position.copy(center).addScaledVector(dir, 80);
    camera.up.set(0, 1, 0);
    camera.lookAt(center);
    camera.updateMatrixWorld(true);

    // Project the 8 bounding-box corners into camera space to fit + recentre.
    const inv = camera.matrixWorldInverse;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const x of [bounds.minX, bounds.maxX])
      for (const y of [bounds.minY, bounds.maxY])
        for (const z of [bounds.minZ, bounds.maxZ]) {
          const v = new THREE.Vector3(x, y, z).applyMatrix4(inv);
          minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
        }
    const w = Math.max(maxX - minX, 1);
    const h = Math.max(maxY - minY, 1);
    const zoom = Math.min(size.width / (w * config.fitPadding), size.height / (h * config.fitPadding));

    // Shift along camera right/up so the projected box is centred in the view.
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    camera.position.addScaledVector(right, (minX + maxX) / 2).addScaledVector(up, (minY + maxY) / 2);

    camera.zoom = zoom;
    camera.near = 0.1;
    camera.far = 400;
    camera.updateProjectionMatrix();
    invalidate();
  }, [bounds, config, get, size, invalidate]);

  return null;
}

interface BlockMeshProps {
  block: BlockLayout;
  config: GraphConfig;
  selected: boolean;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
}

function BlockMesh({ block, config, selected, onSelect, reducedMotion }: BlockMeshProps) {
  const group = useRef<THREE.Group>(null);
  const scale = useRef(reducedMotion ? 1 : 0.001);
  const colors = OUTCOME_COLORS[block.point.outcome];

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || scale.current >= 1) return;
    const delay = block.index * config.entryStagger;
    if (state.clock.elapsedTime < delay) return state.invalidate();
    scale.current = Math.min(1, scale.current + delta * 4);
    const eased = 1 - Math.pow(1 - scale.current, 3);
    g.scale.setScalar(eased);
    state.invalidate();
  });

  // Per-face materials: lighter top, mid front, darker side keep levels readable.
  const materials = useMemo(
    () =>
      [colors.side, colors.side, colors.top, colors.side, colors.front, colors.front].map(
        (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.05 }),
      ),
    [colors],
  );

  const edges = useMemo(
    () =>
      new THREE.EdgesGeometry(
        new THREE.BoxGeometry(config.blockWidth, config.blockHeight, config.blockDepth),
      ),
    [config],
  );

  return (
    <group
      ref={group}
      position={[block.x, block.y, block.z]}
      scale={reducedMotion ? 1 : 0.001}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh material={materials} castShadow>
        <boxGeometry args={[config.blockWidth, config.blockHeight, config.blockDepth]} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={selected ? "#e2f5c8" : "#07100b"} transparent opacity={selected ? 1 : 0.5} />
      </lineSegments>
      {selected && (
        <mesh position={[0, config.blockHeight / 2 + 0.35, 0]}>
          <coneGeometry args={[0.18, 0.32, 4]} />
          <meshBasicMaterial color="#e2f5c8" />
        </mesh>
      )}
    </group>
  );
}

function Floor({ layout, config }: { layout: ReturnType<typeof layoutBlocks>; config: GraphConfig }) {
  const { bounds, floorY } = layout;
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const grid = useMemo(() => {
    const pos: number[] = [];
    for (let x = bounds.minX; x <= bounds.maxX + 0.001; x += config.blockWidth + config.gap)
      pos.push(x, floorY, bounds.minZ, x, floorY, bounds.maxZ);
    for (let z = bounds.minZ; z <= bounds.maxZ + 0.001; z += depth / 4)
      pos.push(bounds.minX, floorY, z, bounds.maxX, floorY, z);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [bounds, floorY, depth, config]);

  return (
    <group>
      <mesh position={[bounds.minX + width / 2, floorY - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color="#0d1710" />
      </mesh>
      <lineSegments geometry={grid}>
        <lineBasicMaterial color={config.gridColor} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

export default function Staircase3D({ points, config, selectedIndex, onSelect, reducedMotion }: Staircase3DProps) {
  const layout = useMemo(() => layoutBlocks(points, config), [points, config]);

  return (
    <Canvas
      orthographic
      frameloop="demand"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 10, 40], zoom: 30 }}
      aria-hidden="true"
      onPointerMissed={() => undefined}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[-6, 14, 10]} intensity={config.lightIntensity} />
      <directionalLight position={[10, 4, -6]} intensity={0.5} color="#b9dda0" />
      <FitCamera bounds={layout.bounds} config={config} />
      <Floor layout={layout} config={config} />
      {layout.blocks.map((b) => (
        <BlockMesh
          key={b.point.date}
          block={b}
          config={config}
          selected={selectedIndex === b.index}
          onSelect={onSelect}
          reducedMotion={reducedMotion}
        />
      ))}
    </Canvas>
  );
}
