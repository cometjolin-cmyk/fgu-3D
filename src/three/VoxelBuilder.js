import * as THREE from 'three';
export { buildCampusMountainAndGuishan } from './CampusBuilder.js';

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

/**
 * VoxelBatch: 將地形、建築、樹木、路燈與橋樑體素整合為 THREE.InstancedMesh，減少 Draw Calls。
 */
export class VoxelBatch {
  constructor() {
    this.buckets = {
      matte: [],
      glossy: [],
      emissive: [],
    };
  }

  add(x, y, z, sx, sy, sz, colorHex, bucket = 'matte', jitter = 0) {
    this.buckets[bucket].push({ x, y, z, sx, sy, sz, colorHex, jitter });
  }

  addBottom(x, bottomY, z, sx, sy, sz, colorHex, bucket = 'matte', jitter = 0) {
    this.add(x, bottomY + sy * 0.5, z, sx, sy, sz, colorHex, bucket, jitter);
  }

  build(parentGroup, sharedGeo) {
    const materials = {
      matte: new THREE.MeshStandardMaterial({
        roughness: 0.84,
        metalness: 0.04,
      }),
      glossy: new THREE.MeshStandardMaterial({
        roughness: 0.22,
        metalness: 0.22,
      }),
      emissive: new THREE.MeshStandardMaterial({
        roughness: 0.3,
        metalness: 0.1,
        emissive: new THREE.Color(0xffe08a),
        emissiveIntensity: 0.42,
      }),
    };

    const meshes = [];
    Object.keys(this.buckets).forEach((key) => {
      const items = this.buckets[key];
      if (!items.length) return;

      const mesh = new THREE.InstancedMesh(sharedGeo, materials[key], items.length);
      mesh.castShadow = key !== 'glossy';
      mesh.receiveShadow = true;

      for (let i = 0; i < items.length; i++) {
        const v = items[i];
        _dummy.position.set(v.x, v.y, v.z);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.set(v.sx, v.sy, v.sz);
        _dummy.updateMatrix();
        mesh.setMatrixAt(i, _dummy.matrix);

        _color.set(v.colorHex);
        if (v.jitter > 0) {
          const offset = (((i * 37) % 11) - 5) * 0.006 * v.jitter;
          _color.offsetHSL(0, 0, offset);
        }
        mesh.setColorAt(i, _color);
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
      mesh.frustumCulled = false;

      parentGroup.add(mesh);
      meshes.push(mesh);
    });

    return meshes;
  }
}

function hexNorm(x, z) {
  return Math.max(Math.abs(x), Math.abs(x) * 0.5 + Math.abs(z) * 0.8660254);
}

function addThemedTreeVoxels(batch, x, baseY, z, height, theme) {
  batch.addBottom(x, baseY, z, 0.44, height * 0.85, 0.44, '#7A5438', 'matte');
  const crownY = baseY + height * 0.8;
  batch.addBottom(x, crownY, z, 1.55, 0.72, 1.55, theme.treeDark, 'matte', 2);
  batch.addBottom(x + 0.1, crownY + 0.68, z - 0.08, 1.15, 0.64, 1.15, theme.treeLeaf, 'matte', 2);
  batch.addBottom(
    x,
    crownY + 1.28,
    z,
    0.7,
    0.46,
    0.7,
    theme.treeAccent || theme.treeLeaf,
    'matte',
    1
  );
}

function addLampVoxels(batch, x, baseY, z, postColor) {
  batch.addBottom(x, baseY, z, 0.22, 1.5, 0.22, postColor, 'matte');
  batch.addBottom(x, baseY + 1.5, z, 0.42, 0.38, 0.42, '#F2D894', 'emissive');
  batch.addBottom(x, baseY + 1.88, z, 0.52, 0.16, 0.52, postColor, 'matte');
}

function addBenchVoxels(batch, x, baseY, z) {
  batch.addBottom(x, baseY, z, 0.55, 0.28, 1.25, '#8B5E3C', 'matte');
  batch.addBottom(x - 0.18, baseY + 0.28, z, 0.15, 0.34, 1.25, '#A36F46', 'matte');
}

function createSignboardMesh(island, renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#F4EFE6';
    ctx.fillRect(0, 0, 512, 192);
    ctx.strokeStyle = island.themeColors.primary;
    ctx.lineWidth = 14;
    ctx.strokeRect(8, 8, 496, 176);
    ctx.strokeStyle = island.themeColors.accent;
    ctx.lineWidth = 5;
    ctx.strokeRect(20, 20, 472, 152);

    ctx.fillStyle = '#C85A53';
    ctx.font = 'bold 26px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(island.departmentName, 256, 68);

    ctx.fillStyle = '#2B4C7E';
    ctx.font = 'bold 34px "Noto Sans TC", sans-serif';
    ctx.fillText(island.trackName, 256, 128);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const group = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: '#7A5438', roughness: 0.85 });
  const postGeo = new THREE.BoxGeometry(0.18, 1.85, 0.18);
  const leftPost = new THREE.Mesh(postGeo, postMat);
  leftPost.position.set(-1.35, 0.92, 0);
  leftPost.castShadow = true;
  const rightPost = new THREE.Mesh(postGeo, postMat);
  rightPost.position.set(1.35, 0.92, 0);
  rightPost.castShadow = true;

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(3.15, 1.2, 0.16),
    [
      postMat,
      postMat,
      postMat,
      postMat,
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }),
    ]
  );
  board.position.set(0, 1.65, 0);
  board.castShadow = true;

  group.add(leftPost, rightPost, board);
  return group;
}

function renderLabelCanvas(text, borderColor = '#2B4C7E') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(8, 10, 496, 108);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 10, 496, 108);
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 34px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    const trimmed = text.length > 13 ? `${text.slice(0, 12)}…` : text;
    ctx.fillText(trimmed, 256, 76);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCharacterLabelSprite(text, borderColor = '#2B4C7E', y = 1.85) {
  const tex = renderLabelCanvas(text, borderColor);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  sprite.position.set(0, y, 0);
  sprite.scale.set(2.35, 0.6, 1);
  sprite.userData = { defaultLabel: text, borderColor };
  return sprite;
}

export function setCharacterSpeechLabel(sprite, text, borderColor) {
  if (!sprite || !sprite.material) return;
  const nextTex = renderLabelCanvas(text, borderColor || sprite.userData?.borderColor || '#2B4C7E');
  if (sprite.material.map) sprite.material.map.dispose();
  sprite.material.map = nextTex;
  sprite.material.needsUpdate = true;
}

/**
 * 佩戴專屬金冠的動物混合精靈島長 (8 座島各有特色)
 */
function buildGoldenCrownGuardian(island) {
  const group = new THREE.Group();
  const coatMat = new THREE.MeshStandardMaterial({
    color: island.themeColors.primary,
    roughness: 0.65,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: island.themeColors.accent,
    roughness: 0.55,
  });
  const faceMat = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.72 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.45 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: '#FBBF24',
    roughness: 0.25,
    metalness: 0.65,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.66, 0.48), coatMat);
  body.position.y = 0.42;
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.08), faceMat);
  belly.position.set(0, 0.4, 0.24);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.5, 0.5), coatMat);
  head.position.y = 1.0;

  // Animal Ears / Wings
  const earGeo = new THREE.BoxGeometry(0.14, 0.26, 0.14);
  const earL = new THREE.Mesh(earGeo, accentMat);
  earL.position.set(-0.2, 1.32, 0);
  const earR = new THREE.Mesh(earGeo, accentMat);
  earR.position.set(0.2, 1.32, 0);

  const wingGeo = new THREE.BoxGeometry(0.12, 0.38, 0.36);
  const wingL = new THREE.Mesh(wingGeo, accentMat);
  wingL.position.set(-0.36, 0.46, -0.04);
  const wingR = new THREE.Mesh(wingGeo, accentMat);
  wingR.position.set(0.36, 0.46, -0.04);

  const eyeGeo = new THREE.BoxGeometry(0.09, 0.09, 0.06);
  const eyeL = new THREE.Mesh(eyeGeo, darkMat);
  eyeL.position.set(-0.12, 1.04, 0.26);
  const eyeR = new THREE.Mesh(eyeGeo, darkMat);
  eyeR.position.set(0.12, 1.04, 0.26);

  // 金冠 (Golden Crown)
  const crownBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.42), goldMat);
  crownBase.position.y = 1.31;
  const crownTip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.22), goldMat);
  crownTip.position.y = 1.43;

  [body, belly, head, earL, earR, wingL, wingR, eyeL, eyeR, crownBase, crownTip].forEach((m) => {
    m.castShadow = true;
    group.add(m);
  });

  const bubble = createCharacterLabelSprite(`💬 ${island.guardian.name}`, '#2B4C7E', 1.98);
  group.add(bubble);
  group.userData.speechSprite = bubble;
  return group;
}

/**
 * 原創動物混合精靈島民
 */
function buildVoxelHybridResident(island) {
  const group = new THREE.Group();
  const { body, accent, earOrWing } = island.hybridResident.colors;
  const bodyMat = new THREE.MeshStandardMaterial({ color: body, roughness: 0.72 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.7 });
  const wingMat = new THREE.MeshStandardMaterial({ color: earOrWing, roughness: 0.65 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.4 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.46, 0.48), bodyMat);
  torso.position.y = 0.32;
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.08), accentMat);
  belly.position.set(0, 0.3, 0.23);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.4, 0.44), bodyMat);
  head.position.y = 0.74;

  const earGeo = new THREE.BoxGeometry(0.12, 0.24, 0.12);
  const earL = new THREE.Mesh(earGeo, wingMat);
  earL.position.set(-0.16, 1.02, 0);
  const earR = new THREE.Mesh(earGeo, wingMat);
  earR.position.set(0.16, 1.02, 0);

  const wingGeo = new THREE.BoxGeometry(0.1, 0.3, 0.32);
  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.position.set(-0.31, 0.38, -0.04);
  const wingR = new THREE.Mesh(wingGeo, wingMat);
  wingR.position.set(0.31, 0.38, -0.04);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.28), accentMat);
  tail.position.set(0, 0.26, -0.32);

  const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.06);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.1, 0.78, 0.22);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.1, 0.78, 0.22);

  [torso, belly, head, earL, earR, wingL, wingR, tail, eyeL, eyeR].forEach((m) => {
    m.castShadow = true;
    group.add(m);
  });

  const bubble = createCharacterLabelSprite(
    `💬 ${island.hybridResident.name.split('「')[0]}`,
    '#C85A53',
    1.62
  );
  group.add(bubble);
  group.userData.speechSprite = bubble;
  return group;
}

/**
 * 建置八大專業學組「差異化異形建築」體素地標與即時動態元件
 */
function buildDistinctLandmark(batch, island, baseY, animContainer) {
  const type = island.landmark.type;

  if (type === 'ai-helix-tower') {
    // 1. AI 系統與軟體開發組：懸浮雙螺旋塔 + 發光水滴核心 + 全息代碼光屏
    batch.addBottom(0, baseY, 0, 3.4, 0.45, 3.4, '#DCE8F2', 'matte');
    batch.addBottom(0, baseY + 0.45, 0, 2.3, 1.3, 2.3, '#2B4C7E', 'matte');
    batch.addBottom(-1.45, baseY + 0.45, 1.1, 1.2, 1.0, 0.14, '#93C5FD', 'emissive'); // 全息代碼光屏

    for (let i = 0; i < 8; i++) {
      const ang = i * 0.82;
      const hx = Math.cos(ang) * 0.82;
      const hz = Math.sin(ang) * 0.82;
      batch.addBottom(hx, baseY + 1.75 + i * 0.42, hz, 0.52, 0.42, 0.52, '#60A5FA', 'glossy');
      batch.addBottom(-hx, baseY + 1.75 + i * 0.42, -hz, 0.52, 0.42, 0.52, '#E9C46A', 'matte');
    }
    const coreGrp = new THREE.Group();
    coreGrp.position.set(0, baseY + 5.65, 0);
    const droplet = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.65, 0),
      new THREE.MeshStandardMaterial({
        color: '#93C5FD',
        emissive: '#60A5FA',
        emissiveIntensity: 0.55,
        roughness: 0.15,
      })
    );
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.08, 8, 24),
      new THREE.MeshStandardMaterial({ color: '#FBBF24', roughness: 0.25, metalness: 0.65 })
    );
    halo.rotation.x = Math.PI / 2;
    coreGrp.add(droplet, halo);
    animContainer.add(coreGrp);
    animContainer.userData.updateAnim = (delta, elapsed) => {
      coreGrp.rotation.y += delta * 1.4;
      coreGrp.position.y = baseY + 5.65 + Math.sin(elapsed * 2.2) * 0.18;
    };
    return;
  }

  if (type === 'prism-cluster') {
    // 2. 智慧資訊與大數據應用組：7 根蜂巢稜鏡水晶柱 + 42 顆垂直穿梭數據粒子 + IoT 雷達碟盤
    batch.addBottom(0, baseY, 0, 3.6, 0.45, 3.6, '#C5D9D6', 'matte');
    const pillarOffsets = [
      [0, 0, 3.6],
      [-0.95, 0.55, 2.7],
      [0.95, 0.55, 2.9],
      [-0.95, -0.55, 2.3],
      [0.95, -0.55, 3.1],
      [0, 1.05, 2.1],
      [0, -1.05, 2.5],
    ];
    pillarOffsets.forEach(([px, pz, ph]) => {
      batch.addBottom(px, baseY + 0.45, pz, 0.72, ph, 0.72, '#2DD4BF', 'glossy');
      batch.addBottom(px, baseY + 0.45 + ph, pz, 0.48, 0.28, 0.48, '#67E8F9', 'emissive');
    });
    // IoT 雙向雷達碟盤
    batch.addBottom(2.05, baseY, 1.1, 0.36, 1.5, 0.36, '#1E4E5A', 'matte');
    const radar = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.55, 0.18),
      new THREE.MeshStandardMaterial({ color: '#F4EFE6', roughness: 0.3 })
    );
    radar.position.set(2.05, baseY + 1.65, 1.1);
    radar.rotation.x = -0.4;
    animContainer.add(radar);

    // 42 顆數據粒子 InstancedMesh
    const pCount = 42;
    const pGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const pMat = new THREE.MeshStandardMaterial({
      color: '#CCFBF1',
      emissive: '#67E8F9',
      emissiveIntensity: 0.85,
    });
    const pMesh = new THREE.InstancedMesh(pGeo, pMat, pCount);
    const pMeta = Array.from({ length: pCount }, (_, i) => {
      const col = pillarOffsets[i % pillarOffsets.length];
      return {
        x: col[0] + (((i * 13) % 5) - 2) * 0.1,
        z: col[1] + (((i * 7) % 5) - 2) * 0.1,
        maxH: col[2],
        speed: 0.6 + (i % 4) * 0.25,
        phase: i * 0.37,
      };
    });
    animContainer.add(pMesh);
    animContainer.userData.updateAnim = (delta, elapsed) => {
      radar.rotation.y += delta * 1.1;
      for (let i = 0; i < pCount; i++) {
        const m = pMeta[i];
        const t = ((elapsed * m.speed + m.phase) % 1 + 1) % 1;
        _dummy.position.set(m.x, baseY + 0.55 + t * m.maxH, m.z);
        _dummy.rotation.set(elapsed, elapsed, 0);
        _dummy.scale.setScalar(1);
        _dummy.updateMatrix();
        pMesh.setMatrixAt(i, _dummy.matrix);
      }
      pMesh.instanceMatrix.needsUpdate = true;
    };
    return;
  }

  if (type === 'aperture-dome') {
    // 3. 數位媒體與智能組：雙曲面鏡頭穹頂 + 6 片光圈葉片呼吸開合
    batch.addBottom(0, baseY, 0, 3.6, 0.45, 3.6, '#475569', 'matte');
    batch.addBottom(0, baseY + 0.45, 0, 2.9, 1.55, 2.9, '#C85A53', 'matte');
    batch.addBottom(0, baseY + 2.0, 0, 2.4, 0.55, 2.4, '#334155', 'matte');
    // 場記板拱門入口
    for (let k = -2; k <= 2; k++) {
      batch.addBottom(k * 0.5, baseY + 0.05, 2.15, 0.46, 0.14, 0.9, k % 2 === 0 ? '#1E293B' : '#F4EFE6', 'glossy');
    }
    // 6 片金色光圈葉片
    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, baseY + 2.75, 0);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: '#F2D894',
      roughness: 0.28,
      metalness: 0.5,
    });
    const blades = [];
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.25, 0.55), bladeMat);
      blade.userData = { ang };
      bladesGroup.add(blade);
      blades.push(blade);
    }
    const lensCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: '#38BDF8', emissive: '#60A5FA', emissiveIntensity: 0.45 })
    );
    bladesGroup.add(lensCore);
    animContainer.add(bladesGroup);
    animContainer.userData.updateAnim = (delta, elapsed) => {
      const open = 0.72 + Math.sin(elapsed * 2.0) * 0.28;
      blades.forEach((b) => {
        const a = b.userData.ang;
        b.position.set(Math.cos(a) * open, 0.25, Math.sin(a) * open);
        b.rotation.y = -a + 0.35 * open;
      });
      bladesGroup.rotation.y += delta * 0.35;
    };
    return;
  }

  if (type === 'ribbon-pavilion') {
    // 4. 廣告行銷與公關組：波浪摺紙飄帶館 + 擴音器廣播塔 + 音波環
    batch.addBottom(-0.4, baseY, -0.2, 2.8, 0.45, 2.6, '#E5D3B3', 'matte');
    for (let i = 0; i < 6; i++) {
      const h = 1.4 + Math.sin(i * 0.9) * 0.55;
      batch.addBottom(-1.5 + i * 0.46, baseY + 0.45, -0.2, 0.44, h, 2.1, i % 2 === 0 ? '#E07A5F' : '#E9C46A', 'matte');
    }
    batch.addBottom(-0.4, baseY + 0.55, 0.95, 1.6, 0.9, 0.14, '#FEFAE0', 'glossy'); // 海報牆
    // 擴音廣播塔
    batch.addBottom(1.65, baseY, 0.3, 0.5, 3.2, 0.5, '#7C3E24', 'matte');
    batch.addBottom(1.65, baseY + 3.0, 0.65, 0.95, 0.85, 0.85, '#E07A5F', 'matte');
    const sonicRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.75, 0.08, 8, 20),
      new THREE.MeshStandardMaterial({ color: '#FDE047', emissive: '#FBBF24', emissiveIntensity: 0.45 })
    );
    sonicRing.position.set(1.65, baseY + 3.4, 1.35);
    animContainer.add(sonicRing);
    animContainer.userData.updateAnim = (_d, elapsed) => {
      const s = 0.85 + ((elapsed * 1.1) % 1) * 0.65;
      sonicRing.scale.setScalar(s);
    };
    return;
  }

  if (type === 'acoustic-shell') {
    // 5. 流行音樂與展演策展組：5 片聲波律動貝殼劇場 + DJ 唱盤 + 黑白琴鍵步道
    batch.addBottom(0, baseY, -0.5, 3.6, 0.45, 2.4, '#312E52', 'matte');
    for (let k = -3; k <= 3; k++) {
      batch.addBottom(k * 0.42, baseY + 0.04, 1.45, 0.38, 0.18, 1.15, k % 2 === 0 ? '#FFFDF9' : '#1E293B', 'glossy');
    }
    const shells = [];
    const shellColors = ['#7C3AED', '#9F6BA0', '#C084FC', '#F472B6', '#F3E8FF'];
    for (let i = 0; i < 5; i++) {
      const sh = new THREE.Mesh(
        new THREE.BoxGeometry(3.2 - i * 0.45, 1.6 - i * 0.18, 0.35),
        new THREE.MeshStandardMaterial({ color: shellColors[i], roughness: 0.4 })
      );
      sh.position.set(0, baseY + 1.2 + i * 0.12, -1.25 + i * 0.38);
      sh.userData = { baseY: sh.position.y, phase: i * 0.6 };
      sh.castShadow = true;
      animContainer.add(sh);
      shells.push(sh);
    }
    const vinyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.16, 18),
      new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.25, metalness: 0.35 })
    );
    vinyl.position.set(1.5, baseY + 0.55, 0.55);
    animContainer.add(vinyl);
    animContainer.userData.updateAnim = (delta, elapsed) => {
      vinyl.rotation.y += delta * 2.2;
      shells.forEach((s) => {
        s.scale.y = 0.88 + Math.abs(Math.sin(elapsed * 2.8 + s.userData.phase)) * 0.24;
      });
    };
    return;
  }

  if (type === 'puffy-blocks') {
    // 6. 工業與產品設計組：4 層充氣積木疊疊樂工坊
    batch.addBottom(0, baseY, 0, 3.5, 0.45, 3.5, '#A89F91', 'matte');
    const tiers = [
      { w: 2.6, h: 0.85, d: 2.4, ox: 0, oz: 0, color: '#C85A53' },
      { w: 2.2, h: 0.85, d: 2.1, ox: 0.25, oz: -0.15, color: '#E9C46A' },
      { w: 1.85, h: 0.85, d: 1.8, ox: -0.25, oz: 0.2, color: '#2B4C7E' },
      { w: 1.4, h: 0.85, d: 1.4, ox: 0.1, oz: -0.1, color: '#FFFDF9' },
    ];
    const blockMeshes = [];
    let curY = baseY + 0.45;
    tiers.forEach((t, idx) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(t.w, t.h, t.d),
        new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.48 })
      );
      m.position.set(t.ox, curY + t.h * 0.5, t.oz);
      m.castShadow = true;
      m.userData = { baseX: t.ox, phase: idx * 0.8 };
      animContainer.add(m);
      blockMeshes.push(m);
      curY += t.h;
    });
    animContainer.userData.updateAnim = (_d, elapsed) => {
      blockMeshes.forEach((b, i) => {
        b.position.x = b.userData.baseX + Math.sin(elapsed * 1.8 + b.userData.phase) * (0.04 * (i + 1));
      });
    };
    return;
  }

  if (type === 'mobius-palette') {
    // 7. 互動媒體與視覺設計組：莫比烏斯無限迴圈廊 + 彩虹八面體 + 五色調色盤花園
    batch.addBottom(-0.5, baseY, -0.5, 2.4, 0.45, 2.2, '#E8D5D8', 'matte');
    // 五色調色盤花園 (巨型調色盤)
    batch.addBottom(1.0, baseY, 0.65, 2.35, 0.38, 1.85, '#E9C46A', 'matte');
    const blobs = [
      [0.35, 0.3, '#C85A53'],
      [0.95, 0.1, '#2B4C7E'],
      [1.55, 0.35, '#6A994E'],
      [1.4, 1.0, '#38BDF8'],
      [0.55, 1.0, '#F472B6'],
    ];
    blobs.forEach(([bx, bz, col]) => {
      batch.addBottom(bx, baseY + 0.38, bz, 0.44, 0.28, 0.44, col, 'glossy');
    });
    // 莫比烏斯 ∞ 體素環廊 + 彩虹八面體
    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.9, 0.24, 48, 8, 2, 1),
      new THREE.MeshStandardMaterial({ color: '#F472B6', roughness: 0.28 })
    );
    torusKnot.position.set(-0.55, baseY + 1.8, -0.45);
    torusKnot.castShadow = true;
    const rainbowGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.48, 0),
      new THREE.MeshStandardMaterial({
        color: '#38BDF8',
        emissive: '#FDE047',
        emissiveIntensity: 0.35,
        roughness: 0.2,
      })
    );
    rainbowGem.position.set(-0.55, baseY + 3.2, -0.45);
    animContainer.add(torusKnot, rainbowGem);
    animContainer.userData.updateAnim = (delta, elapsed) => {
      rainbowGem.rotation.y += delta * 1.6;
      rainbowGem.position.y = baseY + 3.2 + Math.sin(elapsed * 2.4) * 0.16;
    };
    return;
  }

  // 8. 'eco-terrace' — 建築與永續環境設計組：階梯梯田生態溫室 + 果凍苔蘚穹頂 + 自轉風力發電機
  batch.addBottom(0, baseY, -0.3, 3.5, 0.95, 2.8, '#C2B8A3', 'matte');
  batch.addBottom(0, baseY + 0.95, -0.5, 2.6, 0.9, 2.1, '#E6D5B8', 'matte');
  batch.addBottom(0, baseY + 1.85, -0.65, 1.7, 0.85, 1.5, '#6A994E', 'glossy');
  batch.addBottom(0, baseY + 0.95, 0.65, 3.2, 0.26, 0.7, '#8AB86E', 'matte', 2);
  batch.addBottom(0, baseY + 1.85, 0.2, 2.4, 0.26, 0.6, '#527D3B', 'matte', 2);
  // 風力發電機
  batch.addBottom(1.7, baseY, 0.95, 0.45, 2.9, 0.45, '#FFFDF9', 'matte');
  const turbine = new THREE.Group();
  turbine.position.set(1.7, baseY + 2.75, 1.25);
  const bMat = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.45 });
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.25, 0.06), bMat);
    blade.position.y = 0.62;
    arm.add(blade);
    arm.rotation.z = (i / 3) * Math.PI * 2;
    turbine.add(arm);
  }
  animContainer.add(turbine);
  animContainer.userData.updateAnim = (delta) => {
    turbine.rotation.z += delta * 1.45;
  };
}

/**
 * 建置外環八座「不同顏色與風格的六角形體素島嶼」
 */
export function buildHexVoxelIsland(island, renderer, sharedBoxGeo) {
  const group = new THREE.Group();
  group.position.set(...island.hexPosition);

  const batch = new VoxelBatch();
  const R = island.hexRadius;
  const theme = island.themeColors;
  const step = 0.98;

  for (let gx = -Math.ceil(R + 1.2); gx <= Math.ceil(R + 1.2); gx++) {
    for (let gz = -Math.ceil(R + 1.2); gz <= Math.ceil(R + 1.2); gz++) {
      const dist = hexNorm(gx, gz);

      // 淺水浪花圈
      if (dist > R && dist <= R + 0.95) {
        if ((gx + gz) % 2 === 0) {
          batch.addBottom(gx * step, -0.78, gz * step, 0.94, 0.16, 0.94, theme.foam, 'glossy');
        }
        continue;
      }
      if (dist > R) continue;

      // 海底岩基漸縮 (隨各島色調客製)
      if (dist <= R - 1.4) {
        batch.addBottom(gx * step, -1.75, gz * step, 0.98, 0.85, 0.98, theme.keelDeep, 'matte');
      }
      batch.addBottom(gx * step, -0.9, gz * step, 0.98, 0.92, 0.98, theme.keelMid, 'matte');

      const isCoast = dist > R - 1.15;
      const isWalkway =
        (Math.abs(gx) <= 0.6 && gz >= 0) || (Math.abs(gz) <= 0.6 && Math.abs(gx) <= R - 0.8);
      const isPond = gx <= -2 && gx >= -3 && gz >= 1 && gz <= 2 && dist <= R - 1.4;

      if (isCoast) {
        batch.addBottom(gx * step, 0.02, gz * step, 0.96, 0.42, 0.96, theme.sand, 'matte', 1);
      } else if (isPond) {
        batch.addBottom(gx * step, 0.02, gz * step, 0.96, 0.25, 0.96, theme.stone, 'matte');
        batch.addBottom(gx * step, 0.27, gz * step, 0.95, 0.22, 0.95, theme.water, 'glossy');
      } else if (isWalkway) {
        batch.addBottom(gx * step, 0.02, gz * step, 0.96, 0.66, 0.96, theme.stone, 'matte', 1);
      } else {
        const gCol = (gx * 3 + gz * 5) % 6 === 0 ? theme.grassAlt : theme.grass;
        batch.addBottom(gx * step, 0.02, gz * step, 0.96, 0.62, 0.96, gCol, 'matte', 2);
      }

      if (dist <= R * 0.56 && gz <= 0.8 && !isPond) {
        const plazaCol = dist > R * 0.42 ? theme.stone : theme.sand;
        batch.addBottom(gx * step, 0.64, gz * step, 0.95, 0.52, 0.95, plazaCol, 'matte', 1);
      }
    }
  }

  // 階梯與荷葉
  batch.addBottom(0, 0.64, 1.35, 1.9, 0.28, 0.65, theme.stone, 'matte');
  batch.addBottom(0, 0.92, 0.85, 1.9, 0.24, 0.55, theme.stone, 'matte');
  batch.addBottom(-2.45, 0.5, 1.45, 0.42, 0.08, 0.42, theme.treeLeaf, 'matte');

  // 各島風格樹木、路燈與長椅
  [
    [-R + 2.1, -1.8, 2.1],
    [R - 2.1, -1.6, 1.95],
    [R - 2.2, 2.0, 1.7],
    [-R + 2.4, -3.1, 1.6],
  ].forEach(([tx, tz, th]) => {
    if (hexNorm(tx, tz) <= R - 1.3) {
      addThemedTreeVoxels(batch, tx, 0.64, tz, th, theme);
    }
  });

  addLampVoxels(batch, -1.4, 0.64, 2.4, theme.primary);
  addLampVoxels(batch, 1.4, 0.64, 2.4, theme.primary);
  addBenchVoxels(batch, 2.2, 0.64, 1.4);

  // 差異化異形建築
  const animContainer = new THREE.Group();
  buildDistinctLandmark(batch, island, 1.16, animContainer);

  batch.build(group, sharedBoxGeo);
  group.add(animContainer);

  // 復古 CanvasTexture 木牌樓
  const sign = createSignboardMesh(island, renderer);
  sign.position.set(0, 0.64, R - 1.55);
  group.add(sign);

  // 金冠島長 & 原創混合精靈島民
  const guardianMesh = buildGoldenCrownGuardian(island);
  guardianMesh.position.set(-1.65, 0.64, 2.05);
  guardianMesh.rotation.y = 0.25;
  group.add(guardianMesh);

  const residentMesh = buildVoxelHybridResident(island);
  residentMesh.position.set(1.65, 0.64, 1.95);
  residentMesh.rotation.y = -0.35;
  group.add(residentMesh);

  // 六角選取框線
  const selectionRing = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.38, R + 0.38, 0.15, 6),
    new THREE.MeshStandardMaterial({
      color: theme.primary,
      emissive: theme.accent,
      emissiveIntensity: 0.45,
      roughness: 0.35,
    })
  );
  selectionRing.position.y = 0.28;
  selectionRing.rotation.y = Math.PI / 6;
  selectionRing.visible = false;
  group.add(selectionRing);

  // Layer 1 點擊碰撞體 (地標 & 整座島)
  const islandCollider = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.2, R + 0.2, 2.2, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  islandCollider.position.y = 0.5;
  islandCollider.rotation.y = Math.PI / 6;
  islandCollider.layers.set(1);
  islandCollider.userData = { zoneId: island.id, hitType: 'island' };
  group.add(islandCollider);

  const landmarkCollider = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 5.2, 3.8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  landmarkCollider.position.set(0, 3.2, -0.35);
  landmarkCollider.layers.set(1);
  landmarkCollider.userData = {
    zoneId: island.id,
    hitType: 'landmark',
    landmarkName: island.landmark.name,
  };
  group.add(landmarkCollider);

  // Layer 1 角色對話碰撞體 (金冠島長 & 混合精靈島民)
  const guardianCollider = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 1.85, 1.15),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  guardianCollider.position.set(0, 0.9, 0);
  guardianCollider.layers.set(1);
  guardianCollider.userData = {
    zoneId: island.id,
    hitType: 'resident',
    speakerType: 'guardian',
    speakerName: island.guardian.name,
  };
  guardianMesh.add(guardianCollider);

  const residentCollider = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 1.7, 1.15),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  residentCollider.position.set(0, 0.85, 0);
  residentCollider.layers.set(1);
  residentCollider.userData = {
    zoneId: island.id,
    hitType: 'resident',
    speakerType: 'resident',
    speakerName: island.hybridResident.name,
  };
  residentMesh.add(residentCollider);

  // Layer 2 可走動地面 (玩家精靈拋物線跳躍目標)
  const walkCollider = new THREE.Mesh(
    new THREE.CylinderGeometry(R - 0.5, R - 0.5, 0.35, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  walkCollider.position.y = 0.65;
  walkCollider.rotation.y = Math.PI / 6;
  walkCollider.layers.set(2);
  walkCollider.userData = { zoneId: island.id };
  group.add(walkCollider);

  return {
    id: island.id,
    group,
    baseY: island.hexPosition[1],
    phase: island.order * 0.75,
    selectionRing,
    landmarkCollider,
    islandCollider,
    guardianCollider,
    residentCollider,
    walkCollider,
    guardianMesh,
    residentMesh,
    animContainer,
  };
}

/**
 * 建置連接中央山城與八大外環六角島的常春藤紅磚木構拱橋
 */
export function buildArchipelagoBridges(islands, sharedBoxGeo) {
  const bridgeGroup = new THREE.Group();
  const batch = new VoxelBatch();
  const seenPairs = new Set();

  const nodeMap = new Map();
  nodeMap.set('campus-mountain', { hexPosition: [0, 0.8, 0], hexRadius: 11.2 });
  islands.forEach((i) => nodeMap.set(i.id, i));

  islands.forEach((src) => {
    (src.bridgeConnections || []).forEach((dstId) => {
      const pairKey = [src.id, dstId].sort().join('--');
      if (seenPairs.has(pairKey)) return;
      seenPairs.add(pairKey);

      const dst = nodeMap.get(dstId);
      if (!dst) return;

      const pA = new THREE.Vector3(...src.hexPosition);
      const pB = new THREE.Vector3(...dst.hexPosition);
      const dir = new THREE.Vector3().subVectors(pB, pA);
      const totalDist = dir.length();
      dir.normalize();

      const startDist = src.hexRadius - 0.6;
      const endDist = totalDist - (dst.hexRadius - 0.6);
      if (endDist <= startDist) return;

      const span = endDist - startDist;
      const steps = Math.max(9, Math.ceil(span / 0.92));
      const perp = new THREE.Vector3(-dir.z, 0, dir.x);

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const distAlong = startDist + span * t;
        const archHeight = Math.sin(t * Math.PI) * 1.35;
        const baseDeckY = THREE.MathUtils.lerp(pA.y, pB.y, t) + 0.45 + archHeight;

        const cx = pA.x + dir.x * distAlong;
        const cz = pA.z + dir.z * distAlong;

        batch.addBottom(cx, baseDeckY, cz, 0.96, 0.24, 0.96, '#B07D4F', 'matte', 1);
        batch.addBottom(cx + perp.x * 0.56, baseDeckY, cz + perp.z * 0.56, 0.64, 0.22, 0.64, '#8B5E3C', 'matte');
        batch.addBottom(cx - perp.x * 0.56, baseDeckY, cz - perp.z * 0.56, 0.64, 0.22, 0.64, '#8B5E3C', 'matte');

        if (s === 2 || s === steps - 2 || s === Math.floor(steps / 2)) {
          batch.addBottom(cx + perp.x * 0.78, -0.8, cz + perp.z * 0.78, 0.42, baseDeckY + 1.2, 0.42, '#C85A53', 'matte');
          batch.addBottom(cx - perp.x * 0.78, -0.8, cz - perp.z * 0.78, 0.42, baseDeckY + 1.2, 0.42, '#C85A53', 'matte');
          if (s === Math.floor(steps / 2)) {
            batch.addBottom(cx + perp.x * 0.78, baseDeckY + 0.45, cz + perp.z * 0.78, 0.34, 0.34, 0.34, '#F2D894', 'emissive');
            batch.addBottom(cx - perp.x * 0.78, baseDeckY + 0.45, cz - perp.z * 0.78, 0.34, 0.34, 0.34, '#F2D894', 'emissive');
          }
        }
      }
    });
  });

  batch.build(bridgeGroup, sharedBoxGeo);
  return bridgeGroup;
}

/**
 * 個人果凍島民 3D 角色建置 (支援 4 原型、5 馬卡龍體色、4 配件、番茄鐘學習光環與頭頂 3D 氣泡)
 */
export function createPlayerIslanderMesh(config, isStudying) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: config.bodyColor, roughness: 0.45 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.5 });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#FBBF24', roughness: 0.25, metalness: 0.5 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.68, 0.56), bodyMat);
  body.position.y = 0.42;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.54), bodyMat);
  head.position.y = 1.0;

  const eyeGeo = new THREE.BoxGeometry(0.09, 0.09, 0.06);
  const eyeL = new THREE.Mesh(eyeGeo, darkMat);
  eyeL.position.set(-0.14, 1.04, 0.27);
  const eyeR = new THREE.Mesh(eyeGeo, darkMat);
  eyeR.position.set(0.14, 1.04, 0.27);

  // Prototype features
  if (config.prototype === 'fox' || config.prototype === 'owl') {
    const eGeo = new THREE.BoxGeometry(0.14, 0.26, 0.14);
    const eL = new THREE.Mesh(eGeo, bodyMat);
    eL.position.set(-0.2, 1.35, 0);
    const eR = new THREE.Mesh(eGeo, bodyMat);
    eR.position.set(0.2, 1.35, 0);
    group.add(eL, eR);
  }
  if (config.prototype === 'penguin' || config.prototype === 'owl') {
    const wGeo = new THREE.BoxGeometry(0.12, 0.36, 0.34);
    const wL = new THREE.Mesh(wGeo, bodyMat);
    wL.position.set(-0.38, 0.44, 0);
    const wR = new THREE.Mesh(wGeo, bodyMat);
    wR.position.set(0.38, 0.44, 0);
    group.add(wL, wR);
  }
  if (config.prototype === 'bear') {
    const eGeo = new THREE.BoxGeometry(0.18, 0.18, 0.14);
    const eL = new THREE.Mesh(eGeo, bodyMat);
    eL.position.set(-0.24, 1.28, 0);
    const eR = new THREE.Mesh(eGeo, bodyMat);
    eR.position.set(0.24, 1.28, 0);
    group.add(eL, eR);
  }

  // Accessories
  if (config.accessory === 'grad-cap') {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.76), darkMat);
    cap.position.y = 1.3;
    const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), goldMat);
    tassel.position.set(0.36, 1.2, 0.22);
    group.add(cap, tassel);
  } else if (config.accessory === 'star-crown') {
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.42), goldMat);
    crown.position.y = 1.35;
    group.add(crown);
  } else if (config.accessory === 'vr-goggles') {
    const vr = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.22, 0.14),
      new THREE.MeshStandardMaterial({ color: '#38BDF8', emissive: '#0284C7', emissiveIntensity: 0.4 })
    );
    vr.position.set(0, 1.04, 0.26);
    group.add(vr);
  } else if (config.accessory === 'beret') {
    const beret = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.16, 0.64),
      new THREE.MeshStandardMaterial({ color: '#C85A53', roughness: 0.7 })
    );
    beret.position.set(-0.06, 1.32, 0);
    group.add(beret);
  }

  // Studying Halo
  if (isStudying) {
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.06, 8, 24),
      new THREE.MeshStandardMaterial({ color: '#FDE047', emissive: '#FBBF24', emissiveIntensity: 0.65 })
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
  }

  // Overhead 3D Speech Bubble
  const bubbleCanvas = document.createElement('canvas');
  bubbleCanvas.width = 512;
  bubbleCanvas.height = 128;
  const ctx = bubbleCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(8, 8, 496, 112);
    ctx.strokeStyle = '#2B4C7E';
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, 496, 112);
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 34px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.speechText || config.nickname, 256, 76);
  }
  const bTex = new THREE.CanvasTexture(bubbleCanvas);
  bTex.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: bTex });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.set(0, 2.05, 0);
  sprite.scale.set(2.5, 0.64, 1);

  [body, head, eyeL, eyeR].forEach((m) => {
    m.castShadow = true;
    group.add(m);
  });
  group.add(sprite);
  return group;
}

/**
 * 雙基因混合生物精靈 3D 建置
 */
export function createDualGeneHybridMesh(geneA, geneB, hybridMeta = null) {
  const palette = {
    capybara: '#C89F7B',
    owl: '#64748B',
    fox: '#EA7B4F',
    otter: '#8D6E63',
    deer: '#E2C6A6',
    whale: '#60A5FA',
  };
  const group = new THREE.Group();
  const matA = new THREE.MeshStandardMaterial({ color: palette[geneA] || '#7DD3FC', roughness: 0.55 });
  const matB = new THREE.MeshStandardMaterial({ color: palette[geneB] || '#FBBF24', roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.52), matA);
  body.position.y = 0.28;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.42), matA);
  head.position.set(0, 0.64, 0.08);
  const featL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.26), matB);
  featL.position.set(-0.32, 0.42, 0);
  const featR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.26), matB);
  featR.position.set(0.32, 0.42, 0);
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), matB);
  crown.position.set(0, 0.92, 0.08);

  [body, head, featL, featR, crown].forEach((m) => {
    m.castShadow = true;
    group.add(m);
  });

  if (hybridMeta) {
    const bubble = createCharacterLabelSprite(`💬 ${hybridMeta.name}`, '#6A994E', 1.48);
    group.add(bubble);
    group.userData.speechSprite = bubble;

    const collider = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.5, 1.1),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    collider.position.set(0, 0.75, 0);
    collider.layers.set(1);
    collider.userData = {
      zoneId: hybridMeta.assignedIslandId,
      hitType: 'resident',
      speakerType: 'hybrid',
      speakerId: hybridMeta.id,
      speakerName: hybridMeta.name,
    };
    group.add(collider);
    group.userData.collider = collider;
  }

  return group;
}

/**
 * 4 種解鎖 3D 裝飾物 (果凍櫻花樹、發光水晶柱、雲端熱氣球、彩虹許願噴泉)
 */
export function createDecorationMesh(type) {
  const group = new THREE.Group();

  if (type === 'sakura-tree') {
    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 1.4, 0.36),
      new THREE.MeshStandardMaterial({ color: '#7A5438', roughness: 0.85 })
    );
    trunk.position.y = 0.7;
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.95, 1.45),
      new THREE.MeshStandardMaterial({ color: '#FDA4AF', roughness: 0.45 })
    );
    crown.position.y = 1.65;
    trunk.castShadow = true;
    crown.castShadow = true;
    group.add(trunk, crown);
    return group;
  }

  if (type === 'crystal-pillar') {
    const crystal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.42, 2.2, 6),
      new THREE.MeshStandardMaterial({
        color: '#67E8F9',
        emissive: '#38BDF8',
        emissiveIntensity: 0.45,
        roughness: 0.2,
      })
    );
    crystal.position.y = 1.1;
    crystal.castShadow = true;
    group.add(crystal);
    return group;
  }

  if (type === 'hot-air-balloon') {
    group.userData.isFloatingBalloon = true;
    const basket = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.45, 0.6),
      new THREE.MeshStandardMaterial({ color: '#8B5E3C', roughness: 0.8 })
    );
    const balloon = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 1.7, 1.45),
      new THREE.MeshStandardMaterial({ color: '#C85A53', roughness: 0.55 })
    );
    balloon.position.y = 1.65;
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.52, 0.52, 1.52),
      new THREE.MeshStandardMaterial({ color: '#E9C46A', roughness: 0.5 })
    );
    stripe.position.y = 1.65;
    group.add(basket, balloon, stripe);
    return group;
  }

  // 'rainbow-fountain'
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.25, 0.35, 8),
    new THREE.MeshStandardMaterial({ color: '#D8CFC0', roughness: 0.75 })
  );
  base.position.y = 0.18;
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: 0.2 })
  );
  water.position.y = 0.22;
  const arc = new THREE.Mesh(
    new THREE.TorusGeometry(0.65, 0.1, 8, 18, Math.PI),
    new THREE.MeshStandardMaterial({
      color: '#F472B6',
      emissive: '#FDE047',
      emissiveIntensity: 0.35,
    })
  );
  arc.position.y = 0.5;
  group.add(base, water, arc);
  return group;
}
