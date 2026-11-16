import React, { Component, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ISLANDS_DATA, OVERVIEW_CAMERA_PRESET } from '../data/islandsData.js';
import {
  VoxelBatch,
  buildCampusMountainAndGuishan,
  buildHexVoxelIsland,
  buildArchipelagoBridges,
  createPlayerIslanderMesh,
  createDualGeneHybridMesh,
  createDecorationMesh,
  setCharacterSpeechLabel,
} from './VoxelBuilder.js';

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.onErrorFallback;
    return this.props.children;
  }
}

function detectSoftwareWebGL() {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      probeCanvas.getContext('webgl2') ||
      probeCanvas.getContext('webgl');
    if (!gl) return { hasWebGL: false, isSoftwareGl: true };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { hasWebGL: true, isSoftwareGl };
  } catch {
    return { hasWebGL: false, isSoftwareGl: true };
  }
}

function disposeObjectSubtree(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}

function WebGLVoxelSceneInner({
  cameraTargetPreset,
  selectedZoneId,
  playerConfig,
  isStudying,
  hybrids,
  placedDecorations,
  activeDialogueCue,
  onSelectZone,
  onInspectLandmark,
  onTalkToResident,
  onTriggerFallback,
}) {
  const mountRef = useRef(null);
  const onSelectZoneRef = useRef(onSelectZone);
  onSelectZoneRef.current = onSelectZone;
  const onInspectLandmarkRef = useRef(onInspectLandmark);
  onInspectLandmarkRef.current = onInspectLandmark;
  const onTalkToResidentRef = useRef(onTalkToResident);
  onTalkToResidentRef.current = onTalkToResident;
  const onTriggerFallbackRef = useRef(onTriggerFallback);
  onTriggerFallbackRef.current = onTriggerFallback;
  const selectedIdRef = useRef(selectedZoneId);
  selectedIdRef.current = selectedZoneId;

  const builtIslandsRef = useRef([]);
  const hoveredIdRef = useRef(null);
  const dynamicHybridCollidersRef = useRef([]);

  const playerRootRef = useRef(null);
  const playerJumpRef = useRef({
    active: false,
    t: 1,
    duration: 0.65,
    start: new THREE.Vector3(0, 2.35, 7.8),
    end: new THREE.Vector3(0, 2.35, 7.8),
  });
  const hybridsRootRef = useRef(null);
  const decorsRootRef = useRef(null);

  const tweenRef = useRef({
    active: false,
    pos: new THREE.Vector3(...OVERVIEW_CAMERA_PRESET.position),
    target: new THREE.Vector3(...OVERVIEW_CAMERA_PRESET.target),
  });

  useEffect(() => {
    if (!cameraTargetPreset) return;
    tweenRef.current.pos.set(...cameraTargetPreset.position);
    tweenRef.current.target.set(...cameraTargetPreset.target);
    tweenRef.current.active = true;
  }, [cameraTargetPreset]);

  useEffect(() => {
    builtIslandsRef.current.forEach((item) => {
      item.selectionRing.visible = item.id === selectedZoneId;
    });

    // 切換到特定島嶼或山城時，讓玩家角色順便輕巧跳躍至該處迎賓區
    if (playerRootRef.current && selectedZoneId) {
      let dest = null;
      if (selectedZoneId === 'campus-mountain') {
        dest = new THREE.Vector3(0, 2.35, 8.1);
      } else {
        const isl = ISLANDS_DATA.find((i) => i.id === selectedZoneId);
        if (isl) {
          dest = new THREE.Vector3(
            isl.hexPosition[0],
            isl.hexPosition[1] + 0.68,
            isl.hexPosition[2] + 2.4
          );
        }
      }
      if (dest) {
        const currentPos = playerRootRef.current.position.clone();
        if (currentPos.distanceTo(dest) > 0.8) {
          playerJumpRef.current = {
            active: true,
            t: 0,
            duration: 0.72,
            start: currentPos,
            end: dest,
          };
        }
      }
    }
  }, [selectedZoneId]);

  // 同步個人果凍島民模型
  useEffect(() => {
    const root = playerRootRef.current;
    if (!root) return;
    while (root.children.length > 0) {
      const child = root.children[0];
      root.remove(child);
      disposeObjectSubtree(child);
    }
    if (playerConfig) {
      const mesh = createPlayerIslanderMesh(playerConfig, isStudying);
      root.add(mesh);
      root.visible = true;
    } else {
      root.visible = false;
    }
  }, [playerConfig, isStudying]);

  // 同步雙基因混合生物部署
  useEffect(() => {
    const root = hybridsRootRef.current;
    if (!root) return;
    while (root.children.length > 0) {
      const child = root.children[0];
      root.remove(child);
      disposeObjectSubtree(child);
    }
    const nextColliders = [];
    (hybrids || []).forEach((h, idx) => {
      const isl = ISLANDS_DATA.find((i) => i.id === h.assignedIslandId);
      if (!isl) return;
      const mesh = createDualGeneHybridMesh(h.geneA, h.geneB, h);
      const angle = (idx * 2.1) % (Math.PI * 2);
      const radius = 2.6 + (idx % 2) * 0.9;
      const baseX = isl.hexPosition[0] + Math.cos(angle) * radius;
      const baseY = isl.hexPosition[1] + 0.66;
      const baseZ = isl.hexPosition[2] + Math.sin(angle) * radius;
      mesh.position.set(baseX, baseY, baseZ);
      mesh.rotation.y = -angle;
      mesh.userData = { ...mesh.userData, baseY, phase: idx * 0.9, hybridId: h.id };
      root.add(mesh);
      if (mesh.userData.collider) {
        nextColliders.push(mesh.userData.collider);
      }
    });
    dynamicHybridCollidersRef.current = nextColliders;
  }, [hybrids]);

  // 同步 3D 島長與島民頭頂對話氣泡文字
  useEffect(() => {
    if (!activeDialogueCue) return;
    const islObj = builtIslandsRef.current.find((b) => b.id === activeDialogueCue.zoneId);
    if (!islObj) return;
    if (activeDialogueCue.speakerType === 'guardian') {
      setCharacterSpeechLabel(
        islObj.guardianMesh.userData.speechSprite,
        activeDialogueCue.text,
        '#2B4C7E'
      );
    } else if (activeDialogueCue.speakerType === 'resident') {
      setCharacterSpeechLabel(
        islObj.residentMesh.userData.speechSprite,
        activeDialogueCue.text,
        '#C85A53'
      );
    } else if (activeDialogueCue.speakerType === 'hybrid' && hybridsRootRef.current) {
      const targetMesh = hybridsRootRef.current.children.find(
        (m) => m.userData?.hybridId === activeDialogueCue.speakerId
      );
      if (targetMesh?.userData?.speechSprite) {
        setCharacterSpeechLabel(targetMesh.userData.speechSprite, activeDialogueCue.text, '#6A994E');
      }
    }
  }, [activeDialogueCue]);

  // 同步成就解鎖 3D 裝飾物
  useEffect(() => {
    const root = decorsRootRef.current;
    if (!root) return;
    while (root.children.length > 0) {
      const child = root.children[0];
      root.remove(child);
      disposeObjectSubtree(child);
    }
    (placedDecorations || []).forEach((dec, idx) => {
      const mesh = createDecorationMesh(dec.type);
      let basePos = [0, 2.35, 8.6];
      if (dec.targetZone === 'campus-mountain') {
        const ox = (dec.positionOffset && dec.positionOffset[0]) ?? ((idx % 3) - 1) * 3.1;
        const oz = (dec.positionOffset && dec.positionOffset[2]) ?? 7.8;
        basePos = [ox, 2.35, oz];
      } else {
        const isl = ISLANDS_DATA.find((i) => i.id === dec.targetZone);
        if (isl) {
          const ox = (dec.positionOffset && dec.positionOffset[0]) ?? Math.cos(idx * 1.4) * 3.2;
          const oz = (dec.positionOffset && dec.positionOffset[2]) ?? Math.sin(idx * 1.4) * 3.2;
          basePos = [isl.hexPosition[0] + ox, isl.hexPosition[1] + 0.66, isl.hexPosition[2] + oz];
        }
      }
      mesh.position.set(basePos[0], basePos[1], basePos[2]);
      mesh.userData.baseY = basePos[1];
      mesh.userData.phase = idx * 0.85;
      root.add(mesh);
    });
  }, [placedDecorations]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const { hasWebGL, isSoftwareGl } = detectSoftwareWebGL();
    if (!hasWebGL) {
      onTriggerFallbackRef.current();
      return;
    }

    let renderer;
    let scene;
    let camera;
    let controls;
    let frameId = 0;
    let disposed = false;

    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf4efe6);
      scene.fog = new THREE.FogExp2(0xf4efe6, 0.0042);

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 360);
      camera.position.set(...OVERVIEW_CAMERA_PRESET.position);

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.touchAction = 'none';
      container.appendChild(renderer.domElement);

      // RoomEnvironment IBL
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      pmremGenerator.dispose();

      // 復古美式校園日光組合
      const hemiLight = new THREE.HemisphereLight(0xfffdf7, 0x6c8ead, 0.94);
      hemiLight.position.set(0, 55, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xfff3d6, 1.38);
      dirLight.position.set(36, 52, 34);
      dirLight.castShadow = !isSoftwareGl;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      dirLight.shadow.camera.near = 2;
      dirLight.shadow.camera.far = 150;
      dirLight.shadow.camera.left = -50;
      dirLight.shadow.camera.right = 50;
      dirLight.shadow.camera.top = 50;
      dirLight.shadow.camera.bottom = -50;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0x9ab3ca, 0.48);
      rimLight.position.set(-34, 20, -34);
      scene.add(rimLight);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.06;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.target.set(...OVERVIEW_CAMERA_PRESET.target);
      controls.minDistance = 10;
      controls.maxDistance = 115;
      controls.minPolarAngle = 0.16;
      controls.maxPolarAngle = Math.PI / 2 - 0.1;
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
      controls.update();

      controls.addEventListener('start', () => {
        tweenRef.current.active = false;
      });

      // 柔和灰藍海平面 (#6C8EAD)
      const seaPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(420, 420),
        new THREE.MeshStandardMaterial({
          color: 0x6c8ead,
          roughness: 0.42,
          metalness: 0.14,
        })
      );
      seaPlane.rotation.x = -Math.PI / 2;
      seaPlane.position.y = -0.75;
      seaPlane.receiveShadow = true;
      scene.add(seaPlane);

      const sharedBoxGeo = new THREE.BoxGeometry(1, 1, 1);

      // 1. 中央佛光大學實景山城五級階梯 + 東方太平洋龜山島仙境
      const mountainData = buildCampusMountainAndGuishan(VoxelBatch, sharedBoxGeo, renderer);
      scene.add(mountainData.group);

      // 2. 外環八大專業學組獨立六角形體素島與紅磚拱橋
      const builtIslands = ISLANDS_DATA.map((island) =>
        buildHexVoxelIsland(island, renderer, sharedBoxGeo)
      );
      builtIslands.forEach((b) => {
        b.selectionRing.visible = b.id === selectedIdRef.current;
        scene.add(b.group);
      });
      builtIslandsRef.current = builtIslands;

      const bridgesGroup = buildArchipelagoBridges(ISLANDS_DATA, sharedBoxGeo);
      scene.add(bridgesGroup);

      // 3. 動態群組：個人島民、雙基因混合生物、成就解鎖裝飾物
      const playerRoot = new THREE.Group();
      playerRoot.position.copy(playerJumpRef.current.end);
      scene.add(playerRoot);
      playerRootRef.current = playerRoot;

      if (playerConfig) {
        playerRoot.add(createPlayerIslanderMesh(playerConfig, isStudying));
        playerRoot.visible = true;
      } else {
        playerRoot.visible = false;
      }

      const hybridsRoot = new THREE.Group();
      scene.add(hybridsRoot);
      hybridsRootRef.current = hybridsRoot;
      const initialHybridColliders = [];
      (hybrids || []).forEach((h, idx) => {
        const isl = ISLANDS_DATA.find((i) => i.id === h.assignedIslandId);
        if (!isl) return;
        const mesh = createDualGeneHybridMesh(h.geneA, h.geneB, h);
        const angle = (idx * 2.1) % (Math.PI * 2);
        const radius = 2.6 + (idx % 2) * 0.9;
        const baseY = isl.hexPosition[1] + 0.66;
        mesh.position.set(
          isl.hexPosition[0] + Math.cos(angle) * radius,
          baseY,
          isl.hexPosition[2] + Math.sin(angle) * radius
        );
        mesh.rotation.y = -angle;
        mesh.userData = { ...mesh.userData, baseY, phase: idx * 0.9, hybridId: h.id };
        hybridsRoot.add(mesh);
        if (mesh.userData.collider) {
          initialHybridColliders.push(mesh.userData.collider);
        }
      });
      dynamicHybridCollidersRef.current = initialHybridColliders;

      const decorsRoot = new THREE.Group();
      scene.add(decorsRoot);
      decorsRootRef.current = decorsRoot;
      (placedDecorations || []).forEach((dec, idx) => {
        const mesh = createDecorationMesh(dec.type);
        let basePos = [0, 2.35, 8.6];
        if (dec.targetZone === 'campus-mountain') {
          const ox = (dec.positionOffset && dec.positionOffset[0]) ?? ((idx % 3) - 1) * 3.1;
          const oz = (dec.positionOffset && dec.positionOffset[2]) ?? 7.8;
          basePos = [ox, 2.35, oz];
        } else {
          const isl = ISLANDS_DATA.find((i) => i.id === dec.targetZone);
          if (isl) {
            const ox = (dec.positionOffset && dec.positionOffset[0]) ?? Math.cos(idx * 1.4) * 3.2;
            const oz = (dec.positionOffset && dec.positionOffset[2]) ?? Math.sin(idx * 1.4) * 3.2;
            basePos = [isl.hexPosition[0] + ox, isl.hexPosition[1] + 0.66, isl.hexPosition[2] + oz];
          }
        }
        mesh.position.set(basePos[0], basePos[1], basePos[2]);
        mesh.userData.baseY = basePos[1];
        mesh.userData.phase = idx * 0.85;
        decorsRoot.add(mesh);
      });

      // 遠景低空雲朵
      const cloudGroup = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfffdf9, roughness: 0.9 });
      [
        [-38, 17, -28],
        [40, 18, -24],
        [-32, 15, 34],
        [34, 18, 32],
      ].forEach(([cx, cy, cz], idx) => {
        const c1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.2, 2.6), cloudMat);
        const c2 = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.1, 1.9), cloudMat);
        c2.position.set(0.9, 0.85, 0);
        const cg = new THREE.Group();
        cg.add(c1, c2);
        cg.position.set(cx, cy, cz);
        cg.userData = { baseX: cx, phase: idx * 1.4 };
        cloudGroup.add(cg);
      });
      scene.add(cloudGroup);

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      // Layer 1 點擊群島、地標與島民對話 / Layer 2 玩家精靈拋物線跳躍地板
      const raycasterL1 = new THREE.Raycaster();
      raycasterL1.layers.set(1);
      const layer1BaseTargets = [
        ...mountainData.clickableMeshes,
        ...builtIslands.flatMap((b) => [
          b.guardianCollider,
          b.residentCollider,
          b.landmarkCollider,
          b.islandCollider,
        ]),
      ];

      const raycasterL2 = new THREE.Raycaster();
      raycasterL2.layers.set(2);
      const layer2Targets = [
        ...mountainData.groundMeshes,
        ...builtIslands.map((b) => b.walkCollider),
      ];

      const pointerNdc = new THREE.Vector2();
      let downPos = { x: 0, y: 0 };
      let lastHoverTime = 0;

      const updateNdc = (clientX, clientY) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      };

      const onPointerDown = (e) => {
        downPos = { x: e.clientX, y: e.clientY };
      };

      const onPointerUp = (e) => {
        if (e.button === 2) return;
        if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 7) return;

        updateNdc(e.clientX, e.clientY);

        // 先檢查 Layer 1
        raycasterL1.setFromCamera(pointerNdc, camera);
        const targetsL1 = [...layer1BaseTargets, ...dynamicHybridCollidersRef.current];
        const hitsL1 = raycasterL1.intersectObjects(targetsL1, false);

        // 檢查 Layer 2 可走動地板
        raycasterL2.setFromCamera(pointerNdc, camera);
        const hitsL2 = raycasterL2.intersectObjects(layer2Targets, false);

        const residentHit = hitsL1.find((h) => h.object.userData?.hitType === 'resident');
        const landmarkHit = hitsL1.find((h) => h.object.userData?.hitType === 'landmark');
        const hitObj = residentHit
          ? residentHit.object
          : landmarkHit
            ? landmarkHit.object
            : hitsL1[0]?.object;
        const { zoneId, hitType, landmarkName, speakerType, speakerId, speakerName } =
          hitObj?.userData || {};

        // 如果角色已登入且使用者點擊「目前所在區域的可走動地面」（非點島民與地標），執行拋物線跳躍
        if (
          playerRootRef.current?.visible &&
          hitsL2.length > 0 &&
          !residentHit &&
          !landmarkHit &&
          hitsL2[0].object.userData?.zoneId === selectedIdRef.current
        ) {
          const p = hitsL2[0].point;
          playerJumpRef.current = {
            active: true,
            t: 0,
            duration: 0.55,
            start: playerRootRef.current.position.clone(),
            end: new THREE.Vector3(p.x, p.y + 0.12, p.z),
          };
          return;
        }

        if (!zoneId) return;

        onSelectZoneRef.current(zoneId);
        if (hitType === 'resident' && onTalkToResidentRef.current) {
          onTalkToResidentRef.current({
            zoneId,
            speakerType,
            speakerId,
            speakerName,
          });
        } else if (hitType === 'landmark' && onInspectLandmarkRef.current) {
          onInspectLandmarkRef.current(zoneId, landmarkName);
        }
      };

      const onPointerMove = (e) => {
        const now = performance.now();
        if (now - lastHoverTime < 55) return;
        lastHoverTime = now;

        updateNdc(e.clientX, e.clientY);
        raycasterL1.setFromCamera(pointerNdc, camera);
        const targetsL1 = [...layer1BaseTargets, ...dynamicHybridCollidersRef.current];
        const hits = raycasterL1.intersectObjects(targetsL1, false);
        if (hits.length > 0) {
          hoveredIdRef.current = hits[0].object.userData?.zoneId || null;
          renderer.domElement.style.cursor = 'pointer';
        } else {
          hoveredIdRef.current = null;
          renderer.domElement.style.cursor = 'grab';
        }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointermove', onPointerMove);

      const onContextLost = (e) => {
        e.preventDefault();
        onTriggerFallbackRef.current();
      };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);

      const onResize = () => {
        if (!container || disposed) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();

      function afterDraw(cb) {
        const gl = renderer.getContext();
        const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (sync && state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      }

      const tick = () => {
        if (disposed) return;
        const delta = Math.min(clock.getDelta(), 0.08);
        const elapsed = clock.elapsedTime;

        // 1. 山城雲五館知識之星、林美溪與龜山島雲環動畫
        const { knowledgeStar, guishanClouds, guishanGroup, streamWaves } = mountainData.animatables;
        if (knowledgeStar) {
          knowledgeStar.rotation.y += delta * 1.3;
          knowledgeStar.position.y = 8.13 + Math.sin(elapsed * 2.0) * 0.14;
        }
        if (guishanClouds) {
          guishanClouds.rotation.y += delta * 0.22;
        }
        if (guishanGroup) {
          guishanGroup.position.y = 0.3 + Math.sin(elapsed * 0.95) * 0.14;
        }
        if (streamWaves) {
          streamWaves.forEach((w) => {
            w.position.x = w.userData.baseX + Math.sin(elapsed * 1.9 + w.userData.phase) * 0.65;
          });
        }

        // 2. 八大專業學組島嶼漂浮與各自差異化異形建築動畫
        builtIslands.forEach((b) => {
          const isFocus = b.id === selectedIdRef.current || b.id === hoveredIdRef.current;
          const targetY =
            b.baseY + Math.sin(elapsed * 1.1 + b.phase) * 0.09 + (isFocus ? 0.28 : 0);
          b.group.position.y = THREE.MathUtils.damp(b.group.position.y, targetY, 6, delta);

          b.residentMesh.position.y = 0.64 + Math.abs(Math.sin(elapsed * 2.4 + b.phase)) * 0.1;
          b.guardianMesh.rotation.y = 0.25 + Math.sin(elapsed * 1.2 + b.phase) * 0.12;

          if (b.animContainer.userData.updateAnim) {
            b.animContainer.userData.updateAnim(delta, elapsed);
          }
        });

        // 3. 玩家島民拋物線跳躍
        if (playerJumpRef.current.active && playerRootRef.current) {
          const jmp = playerJumpRef.current;
          jmp.t = Math.min(1, jmp.t + delta / jmp.duration);
          const pos = new THREE.Vector3().lerpVectors(jmp.start, jmp.end, jmp.t);
          pos.y += Math.sin(jmp.t * Math.PI) * 2.6;
          playerRootRef.current.position.copy(pos);
          if (jmp.t >= 1) jmp.active = false;
        }

        // 4. 雙基因混合生物與熱氣球漂浮
        hybridsRoot.children.forEach((m) => {
          m.position.y = m.userData.baseY + Math.abs(Math.sin(elapsed * 2.2 + m.userData.phase)) * 0.14;
        });
        decorsRoot.children.forEach((m) => {
          if (m.userData.isFloatingBalloon) {
            m.position.y = m.userData.baseY + 1.8 + Math.sin(elapsed * 1.2 + m.userData.phase) * 0.38;
            m.rotation.y += delta * 0.35;
          }
        });

        cloudGroup.children.forEach((cg) => {
          cg.position.x = cg.userData.baseX + Math.sin(elapsed * 0.25 + cg.userData.phase) * 1.8;
        });

        // 5. 平滑相機飛行插值
        if (tweenRef.current.active) {
          const speed = 5.2;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, tweenRef.current.pos.x, speed, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, tweenRef.current.pos.y, speed, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, tweenRef.current.pos.z, speed, delta);
          controls.target.x = THREE.MathUtils.damp(controls.target.x, tweenRef.current.target.x, speed, delta);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, tweenRef.current.target.y, speed, delta);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, tweenRef.current.target.z, speed, delta);
          if (
            camera.position.distanceTo(tweenRef.current.pos) < 0.08 &&
            controls.target.distanceTo(tweenRef.current.target) < 0.08
          ) {
            tweenRef.current.active = false;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          afterDraw(tick);
        } else {
          frameId = requestAnimationFrame(tick);
        }
      };

      tick();

      return () => {
        disposed = true;
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        controls.dispose();
        envTex.dispose();
        sharedBoxGeo.dispose();
        disposeObjectSubtree(scene);
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch {
      onTriggerFallbackRef.current();
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative select-none"
      aria-label="佛光科技設計學習群島 3D 山城與八大六角體素微縮群島"
    />
  );
}

export default function SceneCanvas({
  cameraTargetPreset,
  selectedZoneId,
  playerConfig,
  isStudying,
  hybrids,
  placedDecorations,
  activeDialogueCue,
  onSelectZone,
  onInspectLandmark,
  onTalkToResident,
  forceFallback = false,
  renderFallbackView,
}) {
  const [webglError, setWebglError] = useState(false);

  if (forceFallback || webglError) {
    return (
      <div className="w-full h-full overflow-y-auto bg-[#F4EFE6] pt-20 pb-24 px-4 sm:px-8">
        {renderFallbackView(webglError)}
      </div>
    );
  }

  return (
    <SceneErrorBoundary
      onErrorFallback={
        <div className="w-full h-full overflow-y-auto bg-[#F4EFE6] pt-20 pb-24 px-4 sm:px-8">
          {renderFallbackView(true)}
        </div>
      }
    >
      <WebGLVoxelSceneInner
        cameraTargetPreset={cameraTargetPreset}
        selectedZoneId={selectedZoneId}
        playerConfig={playerConfig}
        isStudying={isStudying}
        hybrids={hybrids}
        placedDecorations={placedDecorations}
        activeDialogueCue={activeDialogueCue}
        onSelectZone={onSelectZone}
        onInspectLandmark={onInspectLandmark}
        onTalkToResident={onTalkToResident}
        onTriggerFallback={() => setWebglError(true)}
      />
    </SceneErrorBoundary>
  );
}
