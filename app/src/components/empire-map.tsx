"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface TopicBuilding {
  name: string;
  group: string;
  score: number;
  level: "wasteland" | "exploring" | "basic" | "strong" | "legendary";
  projectName?: string;
}

interface EmpireMapProps {
  topics: TopicBuilding[];
  weather: { name: string; emoji: string };
  streak: number;
  level: number;
  xp: number;
  gold: number;
  projectName: string;
  allProjectNames?: string[];
}

const LEVEL_COLORS = {
  wasteland: { wall: 0x8d8d8d, roof: 0x666666, trim: 0x999999 },
  exploring: { wall: 0xd4a574, roof: 0xc17a42, trim: 0xe8a040 },
  basic: { wall: 0xa0c4e8, roof: 0x4a90d9, trim: 0x5b8db8 },
  strong: { wall: 0xb39ddb, roof: 0x7e57c2, trim: 0x9575cd },
  legendary: { wall: 0xffd54f, roof: 0xe85d75, trim: 0xffd700 },
};

const PROJECT_ZONE_COLORS = [
  0x6366f1, 0x10b981, 0xf59e0b, 0xef4444, 0x06b6d4, 0x8b5cf6, 0xec4899,
];

export function EmpireMap({ topics, weather, streak, level, xp, gold, allProjectNames }: EmpireMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const flagsRef = useRef<THREE.Mesh[]>([]);
  const buildingMeshesRef = useRef<{ mesh: THREE.Group; topic: TopicBuilding }[]>([]);
  const waterRef = useRef<THREE.Mesh | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<TopicBuilding | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const W = container.clientWidth;
    const H = 560;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const skyColor = streak === 0 ? 0x374151 : streak <= 2 ? 0x87ceeb : 0x7dd3fc;
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.012);

    const camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 300);
    camera.position.set(28, 22, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 12;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minPolarAngle = Math.PI / 10;
    controls.target.set(0, 0, 0);
    controls.enablePan = false;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      streak === 0 ? 0x8899bb : 0xfff4e0,
      streak === 0 ? 0.5 : 1.3
    );
    dirLight.position.set(15, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 35;
    dirLight.shadow.camera.bottom = -35;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3a6b35, 0.3);
    scene.add(hemiLight);

    // === WORLD BUILDING ===
    buildOcean(scene);
    buildIsland(scene);
    buildMountains(scene);
    buildRiver(scene);
    buildBeach(scene);

    // Empire zone
    const projectGroups = groupByProject(topics, allProjectNames);
    const zones = layoutZones(projectGroups);

    // Build each project zone
    const allBuildingMeshes: { mesh: THREE.Group; topic: TopicBuilding }[] = [];
    zones.forEach((zone, zoneIdx) => {
      buildZoneWalls(scene, zone.cx, zone.cz, zone.radius, zoneIdx);
      zone.topics.forEach((topic, tIdx) => {
        const angle = (tIdx / zone.topics.length) * Math.PI * 2;
        const r = zone.radius * 0.55;
        const x = zone.cx + Math.cos(angle) * r;
        const z = zone.cz + Math.sin(angle) * r;
        const group = buildHouse(scene, x, z, topic);
        allBuildingMeshes.push({ mesh: group, topic });
      });
    });
    buildingMeshesRef.current = allBuildingMeshes;

    // Castle at center
    buildCastle(scene, level);

    // Nature
    buildForest(scene);
    buildRocks(scene);

    if (streak >= 3) {
      buildParticles(scene, streak);
    }

    // Collect flags
    flagsRef.current = [];
    scene.traverse((obj) => {
      if (obj.userData.isFlag) flagsRef.current.push(obj as THREE.Mesh);
    });

    // Animation
    function animate() {
      animRef.current = requestAnimationFrame(animate);
      const t = clockRef.current.getElapsedTime();
      controls.update();

      flagsRef.current.forEach((flag, i) => {
        flag.rotation.z = Math.sin(t * 5 + i * 2) * 0.15;
        flag.scale.x = 1 + Math.sin(t * 4 + i) * 0.1;
      });

      // Water animation
      if (waterRef.current) {
        waterRef.current.position.y = -0.3 + Math.sin(t * 0.8) * 0.08;
      }

      // Legendary glow
      allBuildingMeshes.forEach(({ mesh, topic }) => {
        if (topic.level === "legendary") {
          mesh.children.forEach((child) => {
            if ((child as THREE.Mesh).material instanceof THREE.MeshStandardMaterial) {
              const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
              if (mat.emissive) mat.emissiveIntensity = 0.15 + Math.sin(t * 3) * 0.08;
            }
          });
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = container.clientWidth;
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
      renderer.setSize(w, H);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animRef.current);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [topics, streak, level]);

  function handleMouseMove(e: React.MouseEvent) {
    const container = containerRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    const rect = container.getBoundingClientRect();
    mouseVecRef.current.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    setMousePos({ x: e.clientX, y: e.clientY });

    raycasterRef.current.setFromCamera(mouseVecRef.current, camera);
    let found: TopicBuilding | null = null;
    for (const { mesh, topic } of buildingMeshesRef.current) {
      if (raycasterRef.current.intersectObjects(mesh.children, true).length > 0) {
        found = topic;
        break;
      }
    }
    setHoveredTopic(found);
  }

  const projectGroups = groupByProject(topics, allProjectNames);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden"
        style={{ height: 560 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredTopic(null)}
      />

      {hoveredTopic && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-slate-700/50 bg-gray-900/90 px-3 py-2 text-sm text-white shadow-xl backdrop-blur"
          style={{ left: mousePos.x + 14, top: mousePos.y - 60 }}
        >
          <p className="font-semibold text-[13px]">{hoveredTopic.name}</p>
          <p className="text-[11px] text-slate-400">
            {hoveredTopic.projectName && <span className="text-indigo-300">{hoveredTopic.projectName}</span>}
            {hoveredTopic.projectName && " · "}
            {hoveredTopic.group} · {hoveredTopic.level}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 w-24 rounded-full bg-gray-700">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${hoveredTopic.score}%`,
                  background: hoveredTopic.level === "legendary"
                    ? "linear-gradient(90deg, #FFD700, #FFA000)"
                    : hoveredTopic.level === "strong"
                    ? "linear-gradient(90deg, #B39DDB, #7C4DFF)"
                    : "linear-gradient(90deg, #4CAF50, #81C784)",
                }}
              />
            </div>
            <span className="text-[11px] font-mono text-amber-300 tabular-nums">{hoveredTopic.score}%</span>
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="absolute left-3 top-3">
        <div className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-white backdrop-blur-sm text-xs shadow-lg">
          <span className="font-bold text-amber-300">Lv.{level}</span>
          <span className="text-white/20">|</span>
          <span className="text-cyan-300">✨{xp}</span>
          <span className="text-white/20">|</span>
          <span className="text-yellow-300">🪙{gold}</span>
        </div>
      </div>

      <div className="absolute right-3 top-3">
        <div className="rounded-lg bg-black/60 px-3 py-1.5 text-white backdrop-blur-sm text-xs shadow-lg">
          {weather.emoji} {weather.name}
          {streak > 0 && <span className="ml-1.5 text-orange-300">🔥{streak}d</span>}
        </div>
      </div>

      <div className="absolute left-3 bottom-10">
        <div className="rounded bg-black/40 px-2 py-1 text-[10px] text-white/50 backdrop-blur-sm">
          Kéo xoay · Scroll zoom · Shift+kéo nghiêng
        </div>
      </div>

      {/* Project zone badges */}
      {projectGroups.length > 0 && (
        <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap gap-1.5">
          {projectGroups.map((pg, i) => (
            <span
              key={pg.projectName}
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
              style={{ backgroundColor: `#${PROJECT_ZONE_COLORS[i % PROJECT_ZONE_COLORS.length].toString(16).padStart(6, "0")}` }}
            >
              {pg.projectName} ({pg.topics.length})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ====== Data helpers ======

interface ProjectGroup {
  projectName: string;
  topics: TopicBuilding[];
}

function groupByProject(topics: TopicBuilding[], allProjectNames?: string[]): ProjectGroup[] {
  const map = new Map<string, TopicBuilding[]>();
  if (allProjectNames) {
    allProjectNames.forEach((name) => map.set(name, []));
  }
  topics.forEach((t) => {
    const key = t.projectName ?? "Chung";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  });
  return Array.from(map.entries()).map(([projectName, topics]) => ({ projectName, topics }));
}

interface Zone {
  cx: number;
  cz: number;
  radius: number;
  topics: TopicBuilding[];
  projectName: string;
}

function layoutZones(projectGroups: ProjectGroup[]): Zone[] {
  if (projectGroups.length === 0) return [];
  if (projectGroups.length === 1) {
    return [{ cx: 0, cz: 0, radius: 7, topics: projectGroups[0].topics, projectName: projectGroups[0].projectName }];
  }

  const zones: Zone[] = [];
  const angleStep = (Math.PI * 2) / projectGroups.length;
  const dist = 6 + projectGroups.length;

  projectGroups.forEach((pg, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const radius = 4 + Math.min(pg.topics.length * 0.5, 4);
    zones.push({
      cx: Math.cos(angle) * dist,
      cz: Math.sin(angle) * dist,
      radius,
      topics: pg.topics,
      projectName: pg.projectName,
    });
  });

  return zones;
}

// ====== Scene building functions ======

function buildOcean(scene: THREE.Scene) {
  const oceanGeo = new THREE.CircleGeometry(80, 64);
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x1e6091,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -0.4;
  ocean.receiveShadow = true;
  scene.add(ocean);

  // Shallow water ring
  const shallowGeo = new THREE.RingGeometry(22, 28, 48);
  const shallowMat = new THREE.MeshStandardMaterial({
    color: 0x3da5d9,
    roughness: 0.2,
    transparent: true,
    opacity: 0.6,
  });
  const shallow = new THREE.Mesh(shallowGeo, shallowMat);
  shallow.rotation.x = -Math.PI / 2;
  shallow.position.y = -0.35;
  scene.add(shallow);
}

function buildIsland(scene: THREE.Scene) {
  // Main island - large irregular shape using merged circles
  const islandMat = new THREE.MeshStandardMaterial({ color: 0x5cb85c, roughness: 0.85 });
  const darkGrassMat = new THREE.MeshStandardMaterial({ color: 0x4a8c4a, roughness: 0.9 });

  // Main landmass
  const mainGeo = new THREE.CircleGeometry(20, 48);
  const main = new THREE.Mesh(mainGeo, islandMat);
  main.rotation.x = -Math.PI / 2;
  main.position.y = 0;
  main.receiveShadow = true;
  scene.add(main);

  // Peninsulas/extensions
  const extensions = [
    { x: 14, z: 8, r: 8 },
    { x: -12, z: 10, r: 7 },
    { x: 10, z: -12, r: 6 },
    { x: -8, z: -14, r: 7 },
    { x: -16, z: -4, r: 5 },
  ];
  extensions.forEach(({ x, z, r }) => {
    const geo = new THREE.CircleGeometry(r, 32);
    const mesh = new THREE.Mesh(geo, darkGrassMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, -0.01, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  // Sandy beaches at edges
  const beachGeo = new THREE.RingGeometry(18, 22, 48);
  const beachMat = new THREE.MeshStandardMaterial({ color: 0xe8d5a3, roughness: 0.95 });
  const beach = new THREE.Mesh(beachGeo, beachMat);
  beach.rotation.x = -Math.PI / 2;
  beach.position.y = -0.02;
  beach.receiveShadow = true;
  scene.add(beach);
}

function buildMountains(scene: THREE.Scene) {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.8, metalness: 0.05 });
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 });
  const darkRockMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.85 });

  const mountains = [
    { x: -16, z: -14, h: 8, r: 4, snow: true },
    { x: -18, z: -10, h: 6, r: 3, snow: true },
    { x: -14, z: -18, h: 5, r: 3, snow: false },
    { x: 16, z: -14, h: 7, r: 3.5, snow: true },
    { x: 18, z: -10, h: 4.5, r: 2.5, snow: false },
    { x: -18, z: 6, h: 5.5, r: 3, snow: false },
    { x: -20, z: 2, h: 4, r: 2.5, snow: false },
    { x: 14, z: 14, h: 6, r: 3, snow: true },
    { x: 17, z: 10, h: 4.5, r: 2.5, snow: false },
  ];

  mountains.forEach(({ x, z, h, r, snow }) => {
    // Mountain body
    const mtnGeo = new THREE.ConeGeometry(r, h, 8 + Math.floor(r));
    const mtn = new THREE.Mesh(mtnGeo, Math.random() > 0.5 ? rockMat : darkRockMat);
    mtn.position.set(x, h / 2, z);
    mtn.rotation.y = Math.random() * Math.PI;
    mtn.castShadow = true;
    mtn.receiveShadow = true;
    scene.add(mtn);

    // Snow cap
    if (snow) {
      const capGeo = new THREE.ConeGeometry(r * 0.4, h * 0.25, 8);
      const cap = new THREE.Mesh(capGeo, snowMat);
      cap.position.set(x, h * 0.88, z);
      cap.castShadow = true;
      scene.add(cap);
    }

    // Foothills
    const fh = h * 0.35;
    const fr = r * 1.3;
    const footGeo = new THREE.ConeGeometry(fr, fh, 10);
    const foot = new THREE.Mesh(footGeo, new THREE.MeshStandardMaterial({ color: 0x6d8f4e, roughness: 0.9 }));
    foot.position.set(x, fh / 2 - 0.1, z);
    foot.receiveShadow = true;
    scene.add(foot);
  });
}

function buildRiver(scene: THREE.Scene) {
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x4a9ece,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.75,
  });

  // Curved river using tube
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-18, 0, -12),
    new THREE.Vector3(-12, 0, -6),
    new THREE.Vector3(-6, 0, -3),
    new THREE.Vector3(-2, 0, 4),
    new THREE.Vector3(3, 0, 8),
    new THREE.Vector3(10, 0, 12),
    new THREE.Vector3(18, 0, 16),
  ]);

  const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.8, 8, false);
  const river = new THREE.Mesh(tubeGeo, riverMat);
  river.position.y = 0.02;
  river.receiveShadow = true;
  scene.add(river);

  // Small lake/pond
  const lakeGeo = new THREE.CircleGeometry(2.5, 24);
  const lake = new THREE.Mesh(lakeGeo, riverMat);
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(-2, 0.03, 4);
  scene.add(lake);
}

function buildBeach(scene: THREE.Scene) {
  // Small islands in the ocean
  const islandMat = new THREE.MeshStandardMaterial({ color: 0xe8d5a3, roughness: 0.95 });
  const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.8 });
  const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x2d8a4e, roughness: 0.6 });

  const smallIslands = [
    { x: 28, z: 5, r: 2 },
    { x: -25, z: 18, r: 1.5 },
    { x: 20, z: -22, r: 1.8 },
  ];

  smallIslands.forEach(({ x, z, r }) => {
    const geo = new THREE.CircleGeometry(r, 16);
    const island = new THREE.Mesh(geo, islandMat);
    island.rotation.x = -Math.PI / 2;
    island.position.set(x, -0.15, z);
    scene.add(island);

    // Palm tree
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2, 6), palmTrunkMat);
    trunk.position.set(x, 0.85, z);
    trunk.rotation.z = Math.sin(x) * 0.15;
    trunk.castShadow = true;
    scene.add(trunk);

    [0, 1, 2, 3].forEach((i) => {
      const leafGeo = new THREE.ConeGeometry(0.6, 1.2, 4);
      const leaf = new THREE.Mesh(leafGeo, palmLeafMat);
      const a = (i / 4) * Math.PI * 2;
      leaf.position.set(x + Math.cos(a) * 0.3, 1.9, z + Math.sin(a) * 0.3);
      leaf.rotation.z = Math.cos(a) * 0.8;
      leaf.rotation.x = Math.sin(a) * 0.8;
      leaf.castShadow = true;
      scene.add(leaf);
    });
  });
}

function buildZoneWalls(scene: THREE.Scene, cx: number, cz: number, radius: number, zoneIdx: number) {
  const wallH = 0.7;
  const color = PROJECT_ZONE_COLORS[zoneIdx % PROJECT_ZONE_COLORS.length];
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.6 });

  // Circular wall segments
  const segments = 24;
  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = ((i + 1) / segments) * Math.PI * 2;
    const x1 = cx + Math.cos(a1) * radius;
    const z1 = cz + Math.sin(a1) * radius;
    const x2 = cx + Math.cos(a2) * radius;
    const z2 = cz + Math.sin(a2) * radius;

    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);

    const wallGeo = new THREE.BoxGeometry(len, wallH, 0.2);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set((x1 + x2) / 2, wallH / 2, (z1 + z2) / 2);
    wall.rotation.y = -Math.atan2(dz, dx);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
  }

  // Gate towers (2 per zone)
  const gateMat = new THREE.MeshStandardMaterial({ color: 0xc8b8a4, roughness: 0.5 });
  const roofMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });

  [0, Math.PI].forEach((gateAngle) => {
    const gx = cx + Math.cos(gateAngle) * radius;
    const gz = cz + Math.sin(gateAngle) * radius;

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 2, 8), gateMat);
    tower.position.set(gx, 1, gz);
    tower.castShadow = true;
    scene.add(tower);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.9, 8), roofMat);
    cap.position.set(gx, 2.15, gz);
    cap.castShadow = true;
    scene.add(cap);
  });

  // Zone name banner (flag)
  const bannerPoleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4);
  const bannerPole = new THREE.Mesh(bannerPoleGeo, new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
  const bx = cx + Math.cos(-Math.PI / 2) * (radius + 0.5);
  const bz = cz + Math.sin(-Math.PI / 2) * (radius + 0.5);
  bannerPole.position.set(bx, 2.8, bz);
  scene.add(bannerPole);

  const bannerGeo = new THREE.PlaneGeometry(1.2, 0.4);
  const bannerMat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: 0.5 });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(bx + 0.6, 3.1, bz);
  banner.userData.isFlag = true;
  scene.add(banner);
}

function buildCastle(scene: THREE.Scene, level: number) {
  const s = 1 + level * 0.02;
  const group = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(3.5 * s, 2.8 * s, 3.5 * s);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.5, metalness: 0.05 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.4 * s;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const towerGeo = new THREE.CylinderGeometry(0.9 * s, 1 * s, 4.5 * s, 12);
  const towerMat = new THREE.MeshStandardMaterial({ color: 0xc8b8a4, roughness: 0.5 });
  const tower = new THREE.Mesh(towerGeo, towerMat);
  tower.position.y = 2.25 * s;
  tower.castShadow = true;
  group.add(tower);

  const roofGeo = new THREE.ConeGeometry(1.2 * s, 2.2 * s, 12);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xe85d75, roughness: 0.4, metalness: 0.1 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 5.2 * s;
  roof.castShadow = true;
  group.add(roof);

  const corners = [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]];
  corners.forEach(([cx, cz]) => {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.5 * s, 0.55 * s, 3.2 * s, 8), towerMat);
    st.position.set(cx * s, 1.6 * s, cz * s);
    st.castShadow = true;
    group.add(st);

    const stRoof = new THREE.Mesh(new THREE.ConeGeometry(0.65 * s, 1.3 * s, 8), roofMat);
    stRoof.position.set(cx * s, 3.5 * s, cz * s);
    stRoof.castShadow = true;
    group.add(stRoof);
  });

  // Windows
  const winMat = new THREE.MeshStandardMaterial({ color: 0xffe082, emissive: 0xffcc00, emissiveIntensity: 0.4, roughness: 0.3 });
  [[-0.5, 2.2, 1.76], [0.5, 2.7, 1.76], [-0.5, 2.2, -1.76], [0.5, 2.7, -1.76]].forEach(([wx, wy, wz]) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.25 * s, 0.4 * s), winMat);
    win.position.set(wx * s, wy * s, wz * s);
    if (wz < 0) win.rotation.y = Math.PI;
    group.add(win);
  });

  // Gate
  const gate = new THREE.Mesh(
    new THREE.BoxGeometry(0.7 * s, 1 * s, 0.15 * s),
    new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 })
  );
  gate.position.set(0, 0.5 * s, 1.77 * s);
  group.add(gate);

  // Flag
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.8 * s, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  flagPole.position.y = 6.8 * s;
  group.add(flagPole);

  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8 * s, 0.4 * s),
    new THREE.MeshStandardMaterial({ color: 0xffd700, side: THREE.DoubleSide, roughness: 0.5 })
  );
  flag.position.set(0.4 * s, 7.4 * s, 0);
  flag.userData.isFlag = true;
  group.add(flag);

  if (level >= 3) {
    const crownLight = new THREE.PointLight(0xffd700, 0.5, 10);
    crownLight.position.y = 7.5 * s;
    group.add(crownLight);
  }

  scene.add(group);
}

function buildHouse(scene: THREE.Scene, x: number, z: number, topic: TopicBuilding): THREE.Group {
  const group = new THREE.Group();
  const colors = LEVEL_COLORS[topic.level];
  const h = 0.8 + (topic.score / 100) * 1.2;
  const w = 1.2;
  const d = 1;

  const wallMat = new THREE.MeshStandardMaterial({
    color: colors.wall, roughness: 0.6,
    metalness: topic.level === "legendary" ? 0.15 : 0,
    emissive: topic.level === "legendary" ? 0xffd700 : 0x000000,
    emissiveIntensity: topic.level === "legendary" ? 0.15 : 0,
  });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  wall.position.y = h / 2;
  wall.castShadow = true;
  wall.receiveShadow = true;
  group.add(wall);

  const roofH = 0.5 + (topic.score / 100) * 0.4;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(w, d) * 0.55, roofH, 4),
    new THREE.MeshStandardMaterial({ color: colors.roof, roughness: 0.4 })
  );
  roof.position.y = h + roofH / 2;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  if (topic.level !== "wasteland") {
    const winMat = new THREE.MeshStandardMaterial({ color: 0xffe082, emissive: 0xffcc00, emissiveIntensity: 0.3 });
    [[-0.2, h * 0.6, d / 2 + 0.01], [0.2, h * 0.7, d / 2 + 0.01]].forEach(([wx, wy, wz]) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.2), winMat);
      win.position.set(wx, wy, wz);
      group.add(win);
    });
  }

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.35, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 })
  );
  door.position.set(0, 0.175, d / 2 + 0.025);
  group.add(door);

  if (topic.level === "strong" || topic.level === "legendary") {
    const chim = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.5, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.7 })
    );
    chim.position.set(w * 0.25, h + roofH * 0.3, -d * 0.15);
    chim.castShadow = true;
    group.add(chim);
  }

  if (topic.level !== "wasteland") {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.6, 4),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    pole.position.y = h + roofH + 0.3;
    group.add(pole);

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.15),
      new THREE.MeshStandardMaterial({ color: colors.trim, side: THREE.DoubleSide })
    );
    flag.position.set(0.15, h + roofH + 0.5, 0);
    flag.userData.isFlag = true;
    group.add(flag);
  }

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

function buildForest(scene: THREE.Scene) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 });
  const leafMats = [
    new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.7 }),
  ];

  // Dense forest clusters around the map edges
  const clusters = [
    { cx: -14, cz: 2, count: 8 },
    { cx: 14, cz: -4, count: 7 },
    { cx: -8, cz: -14, count: 6 },
    { cx: 8, cz: 14, count: 7 },
    { cx: -10, cz: 12, count: 5 },
    { cx: 12, cz: 8, count: 6 },
    { cx: 0, cz: -16, count: 5 },
    { cx: -16, cz: -8, count: 4 },
  ];

  clusters.forEach(({ cx, cz, count }) => {
    for (let i = 0; i < count; i++) {
      const tx = cx + (Math.sin(i * 17 + cx) * 3);
      const tz = cz + (Math.cos(i * 13 + cz) * 3);
      const scale = 0.6 + Math.abs(Math.sin(i * 7 + cx)) * 0.5;
      const isPine = i % 3 !== 1;

      if (isPine) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.8, 6), trunkMat);
        trunk.position.set(tx, 0.4, tz);
        trunk.castShadow = true;
        scene.add(trunk);

        [0, 1, 2].forEach((layer) => {
          const r = (0.55 - layer * 0.1) * scale;
          const h = 0.65 * scale;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), leafMats[layer]);
          cone.position.set(tx, 0.85 + layer * 0.45 * scale, tz);
          cone.castShadow = true;
          scene.add(cone);
        });
      } else {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1, 6), trunkMat);
        trunk.position.set(tx, 0.5, tz);
        trunk.castShadow = true;
        scene.add(trunk);

        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.65 * scale, 8, 8), leafMats[0]);
        crown.position.set(tx, 1.3, tz);
        crown.castShadow = true;
        scene.add(crown);
      }
    }
  });
}

function buildRocks(scene: THREE.Scene) {
  const rockMats = [
    new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x7a7a6a, roughness: 0.9 }),
  ];

  const rocks = [
    { x: -12, z: -8, s: 0.8 }, { x: 10, z: -10, s: 0.6 },
    { x: -6, z: 12, s: 0.5 }, { x: 8, z: 6, s: 0.7 },
    { x: -15, z: 6, s: 0.9 }, { x: 13, z: -6, s: 0.4 },
    { x: 5, z: -14, s: 0.6 }, { x: -4, z: -12, s: 0.5 },
  ];

  rocks.forEach(({ x, z, s }, i) => {
    const geo = new THREE.DodecahedronGeometry(s, 0);
    const rock = new THREE.Mesh(geo, rockMats[i % 2]);
    rock.position.set(x, s * 0.4, z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  });
}

function buildParticles(scene: THREE.Scene, streak: number) {
  const count = streak >= 14 ? 80 : streak >= 7 ? 50 : 25;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 12 + 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const color = streak >= 14 ? 0xffd700 : streak >= 7 ? 0xff88cc : 0xffffaa;
  const mat = new THREE.PointsMaterial({
    color, size: streak >= 14 ? 0.15 : 0.1,
    transparent: true, opacity: 0.7, sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
}
