import * as THREE from 'three';

/**
 * 為山城各級建築製作復古木牌樓／石碑招牌 (高解析度 CanvasTexture)
 */
function createCampusSignboard(title, subtitle, accentColor, renderer, scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#F4EFE6';
    ctx.fillRect(0, 0, 384, 128);
    ctx.strokeStyle = '#2B4C7E';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 374, 118);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, 356, 100);

    ctx.textAlign = 'center';
    if (subtitle) {
      ctx.fillStyle = '#C85A53';
      ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
      ctx.fillText(subtitle, 192, 46);
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 30px "Noto Sans TC", sans-serif';
      ctx.fillText(title, 192, 92);
    } else {
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 32px "Noto Sans TC", sans-serif';
      ctx.fillText(title, 192, 76);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  if (renderer?.capabilities?.getMaxAnisotropy) {
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }

  const grp = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: '#7A5438', roughness: 0.85 });
  const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 });

  const postGeo = new THREE.BoxGeometry(0.11 * scale, 0.9 * scale, 0.11 * scale);
  const leftPost = new THREE.Mesh(postGeo, postMat);
  leftPost.position.set(-0.78 * scale, 0.45 * scale, 0);
  const rightPost = new THREE.Mesh(postGeo, postMat);
  rightPost.position.set(0.78 * scale, 0.45 * scale, 0);

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.05 * scale, 0.72 * scale, 0.1 * scale),
    [postMat, postMat, postMat, postMat, faceMat, faceMat]
  );
  board.position.set(0, 0.95 * scale, 0);
  board.castShadow = true;

  grp.add(leftPost, rightPost, board);
  return grp;
}

/**
 * 建置中央「佛光大學實景山城五級階梯（17 大地標）」與東方太平洋「龜山島仙境」
 * 全面採用 VoxelBatch 彙整為 THREE.InstancedMesh，呈現復古美式校園微縮體素質感。
 */
export function buildCampusMountainAndGuishan(VoxelBatch, sharedBoxGeo, renderer = null) {
  const group = new THREE.Group();
  const batch = new VoxelBatch();
  const clickableMeshes = [];
  const groundMeshes = [];

  // 1. 五級地形基礎階梯岩盤 (Level 1 ~ Level 5 依林美山斜坡由南向北步步高升)
  const levels = [
    { lvl: 1, z: 13.0, y: 0.2, w: 16, d: 7, grass: '#6A994E', trim: '#D8CFC0' },
    { lvl: 2, z: 6.2, y: 1.6, w: 15, d: 7, grass: '#6A994E', trim: '#E9C46A' },
    { lvl: 3, z: -0.4, y: 3.0, w: 14, d: 7, grass: '#5C8BB8', trim: '#D8CFC0' }, // 溪谷區含林美溪
    { lvl: 4, z: -6.8, y: 4.4, w: 13, d: 7, grass: '#6A994E', trim: '#D8CFC0' },
    { lvl: 5, z: -12.6, y: 6.0, w: 10, d: 5.5, grass: '#527D3B', trim: '#F2D894' },
  ];

  // 海底岩基與海岸淺灘圈
  for (let gx = -9; gx <= 9; gx++) {
    for (let gz = -16; gz <= 17; gz++) {
      const rx = Math.abs(gx) / 9.2;
      const rz = Math.abs(gz) / 17.2;
      if (rx * rx + rz * rz <= 1.05) {
        batch.addBottom(gx * 0.98, -1.6, gz * 0.98, 0.98, 1.4, 0.98, '#2B4C7E', 'matte');
        if (rx * rx + rz * rz > 0.85 && (gx + gz) % 2 === 0) {
          batch.addBottom(gx * 0.98, -0.78, gz * 0.98, 0.94, 0.16, 0.94, '#B9D3E6', 'glossy');
        }
      }
    }
  }

  levels.forEach((lv) => {
    const halfW = Math.floor(lv.w / 2);
    const halfD = Math.floor(lv.d / 2);
    // 地形體素填方
    for (let x = -halfW; x <= halfW; x++) {
      for (let dz = -halfD; dz <= halfD; dz++) {
        const gz = lv.z + dz;
        const isEdge = Math.abs(x) === halfW || Math.abs(dz) === halfD;
        const isStream = lv.lvl === 3 && Math.abs(dz) <= 1;
        const topColor = isStream ? '#5C8BB8' : isEdge ? lv.trim : lv.grass;
        const bucket = isStream ? 'glossy' : 'matte';
        batch.addBottom(x * 0.98, -0.2, gz, 0.96, lv.y + 0.2, 0.96, '#4F6E8E', 'matte');
        batch.addBottom(x * 0.98, lv.y, gz, 0.96, 0.48, 0.96, topColor, bucket, isStream ? 0 : 1);
      }
    }

    // 中央登山石階
    if (lv.lvl < 5) {
      batch.addBottom(0, lv.y + 0.45, lv.z - halfD - 0.35, 2.2, 0.7, 1.1, '#EAE2D3', 'matte');
      batch.addBottom(0, lv.y + 0.95, lv.z - halfD - 0.85, 2.2, 0.7, 0.9, '#D8CFC0', 'matte');
    }

    // 每一層的可走動地板碰撞片 (Layer 2 供玩家島民跳躍落地)
    const walkFloor = new THREE.Mesh(
      new THREE.BoxGeometry(lv.w - 1, 0.3, lv.d - 0.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    walkFloor.position.set(0, lv.y + 0.45, lv.z);
    walkFloor.layers.set(2);
    walkFloor.userData = { zoneId: 'campus-mountain' };
    group.add(walkFloor);
    groundMeshes.push(walkFloor);
  });

  // 2. Level 1 地標：#15 校門牌樓、#16 百萬人興學碑牆、#17 百萬人興學紀念館
  const y1 = 0.68;
  // #15 校門牌樓 (中式歇山頂迎賓門)
  batch.addBottom(-1.5, y1, 15.6, 0.45, 2.0, 0.45, '#C85A53', 'matte');
  batch.addBottom(1.5, y1, 15.6, 0.45, 2.0, 0.45, '#C85A53', 'matte');
  batch.addBottom(0, y1 + 1.9, 15.6, 4.2, 0.42, 0.75, '#2B4C7E', 'matte');
  batch.addBottom(0, y1 + 2.32, 15.6, 3.3, 0.36, 0.6, '#E9C46A', 'matte');

  // #16 百萬人興學碑牆 (弧形大理石碑石牆)
  for (let i = -2; i <= 2; i++) {
    batch.addBottom(-4.5 + i * 0.65, y1, 12.6 + Math.abs(i) * 0.22, 0.62, 1.25, 0.45, '#FFFDF9', 'matte');
  }

  // #17 百萬人興學紀念館 (雙坡殿宇 + 功德金塔)
  batch.addBottom(4.5, y1, 12.8, 3.2, 1.45, 2.4, '#EAE2D3', 'matte');
  batch.addBottom(4.5, y1 + 1.45, 12.8, 3.6, 0.45, 2.7, '#C85A53', 'matte');
  batch.addBottom(6.4, y1, 12.8, 0.9, 2.5, 0.9, '#E9C46A', 'glossy');

  // 3. Level 2 地標：#10 雲慧樓（創科學院總館＋四大工坊）、#13 海雲樓、#9 雲水軒
  const y2 = 2.08;
  // #10 雲慧樓 (中央現代長方總館 + 玻璃長窗)
  batch.addBottom(0, y2, 6.2, 4.8, 2.0, 2.4, '#F4EFE6', 'matte');
  batch.addBottom(0, y2 + 0.7, 7.45, 3.8, 0.75, 0.12, '#6C8EAD', 'glossy');
  batch.addBottom(0, y2 + 2.0, 6.2, 5.1, 0.35, 2.6, '#2B4C7E', 'matte');
  // 四大系所特色工坊小屋 (資應藍、傳播紅、產媒黃、建築綠)
  batch.addBottom(-3.4, y2, 5.6, 1.3, 1.1, 1.3, '#2B4C7E', 'matte');
  batch.addBottom(-3.4, y2, 7.2, 1.3, 1.1, 1.3, '#C85A53', 'matte');
  batch.addBottom(3.4, y2, 5.6, 1.3, 1.1, 1.3, '#E9C46A', 'matte');
  batch.addBottom(3.4, y2, 7.2, 1.3, 1.1, 1.3, '#6A994E', 'matte');
  // #13 海雲樓 & #9 雲水軒宿舍
  batch.addBottom(-5.6, y2, 6.2, 2.1, 1.75, 2.2, '#D8CFC0', 'matte');
  batch.addBottom(-5.6, y2 + 1.75, 6.2, 2.3, 0.35, 2.4, '#6C8EAD', 'matte');
  batch.addBottom(5.6, y2, 6.2, 2.1, 1.75, 2.2, '#EAE2D3', 'matte');
  batch.addBottom(5.6, y2 + 1.75, 6.2, 2.3, 0.35, 2.4, '#C85A53', 'matte');

  // 4. Level 3 地標：#11 十六亭橋＋林美溪、#12 滴水坊、#14 林美射箭場、#7 懷恩館
  const y3 = 3.48;
  // #11 十六亭橋 (朱紅木構風雨長廊跨林美溪)
  batch.addBottom(0, y3 + 0.15, -0.4, 1.6, 0.25, 3.6, '#B07D4F', 'matte');
  batch.addBottom(-0.7, y3 + 0.4, -0.4, 0.2, 1.15, 3.4, '#C85A53', 'matte');
  batch.addBottom(0.7, y3 + 0.4, -0.4, 0.2, 1.15, 3.4, '#C85A53', 'matte');
  batch.addBottom(0, y3 + 1.55, -0.4, 2.1, 0.38, 3.8, '#2B4C7E', 'matte');

  // #12 滴水坊 (茶香露天座與遮陽茶傘)
  batch.addBottom(-3.4, y3 + 0.1, 1.6, 1.8, 0.9, 1.6, '#8B5E3C', 'matte');
  batch.addBottom(-3.4, y3 + 1.4, 1.6, 1.4, 0.25, 1.4, '#C85A53', 'matte');
  batch.addBottom(-4.9, y3 + 1.3, 1.6, 1.1, 0.22, 1.1, '#E9C46A', 'matte');

  // #14 林美射箭場 (白色天幕棚架 + 三色靶位)
  batch.addBottom(3.8, y3 + 0.1, 1.5, 2.6, 0.2, 1.6, '#FFFDF9', 'matte');
  batch.addBottom(3.8, y3 + 1.3, 1.5, 2.8, 0.22, 1.7, '#FFFDF9', 'matte');
  batch.addBottom(3.3, y3 + 0.3, 0.85, 0.55, 0.55, 0.2, '#C85A53', 'matte');
  batch.addBottom(4.3, y3 + 0.3, 0.85, 0.55, 0.55, 0.2, '#2B4C7E', 'matte');

  // #7 懷恩館 (圓頂巨蛋＋流線葉形翼樓)
  batch.addBottom(4.8, y3 + 0.1, -1.6, 2.8, 1.35, 2.4, '#EAE2D3', 'matte');
  batch.addBottom(4.8, y3 + 1.45, -1.6, 2.2, 0.75, 1.8, '#6C8EAD', 'glossy');
  batch.addBottom(2.6, y3 + 0.1, -2.1, 1.9, 0.95, 1.3, '#D8CFC0', 'matte');

  // 林美溪流動水浪塊
  const streamWaves = [];
  for (let i = 0; i < 4; i++) {
    const wave = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.12, 0.45),
      new THREE.MeshStandardMaterial({ color: '#DCE8F2', roughness: 0.2 })
    );
    const bx = -4.2 + i * 2.7;
    wave.position.set(bx, y3 + 0.15, -0.4);
    wave.userData = { baseX: bx, phase: i * 1.3 };
    group.add(wave);
    streamWaves.push(wave);
  }

  // 5. Level 4 地標：#3 雲五館圖書館（三層退台綠建築＋旋轉知識之星）、#2 德香樓＋高山操場足球場
  const y4 = 4.88;
  // #3 雲五館圖書館
  batch.addBottom(-3.2, y4, -6.8, 3.6, 0.9, 3.2, '#D8CFC0', 'matte');
  batch.addBottom(-3.2, y4 + 0.9, -6.8, 2.7, 0.85, 2.4, '#6A994E', 'matte');
  batch.addBottom(-3.2, y4 + 1.75, -6.8, 1.8, 0.8, 1.7, '#2B4C7E', 'matte');
  const knowledgeStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    new THREE.MeshStandardMaterial({
      color: '#E9C46A',
      emissive: '#FDE047',
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.45,
    })
  );
  knowledgeStar.position.set(-3.2, y4 + 3.25, -6.8);
  knowledgeStar.castShadow = true;
  group.add(knowledgeStar);

  // #2 德香樓＋高山操場紅跑道足球場
  batch.addBottom(1.6, y4, -7.8, 3.4, 1.55, 1.8, '#EAE2D3', 'matte');
  batch.addBottom(1.6, y4 + 1.55, -7.8, 3.6, 0.35, 2.0, '#C85A53', 'matte');
  batch.addBottom(2.6, y4, -5.6, 4.4, 0.14, 2.4, '#C85A53', 'matte'); // 紅色跑道外框
  batch.addBottom(2.6, y4 + 0.08, -5.6, 3.1, 0.14, 1.4, '#6A994E', 'matte'); // 足球草坪

  // 6. Level 5 地標：#1 雲起樓（古典紅瓦三合院）＋ 360° 觀海露台與望遠鏡
  const y5 = 6.48;
  batch.addBottom(0, y5, -13.3, 4.2, 1.35, 1.4, '#FFFDF9', 'matte'); // 正身
  batch.addBottom(-1.8, y5, -12.0, 1.2, 1.15, 1.8, '#FFFDF9', 'matte'); // 左護龍
  batch.addBottom(1.8, y5, -12.0, 1.2, 1.15, 1.8, '#FFFDF9', 'matte'); // 右護龍
  batch.addBottom(0, y5 + 1.35, -13.3, 4.5, 0.42, 1.7, '#C85A53', 'matte');
  batch.addBottom(-1.8, y5 + 1.15, -12.0, 1.4, 0.35, 2.0, '#C85A53', 'matte');
  batch.addBottom(1.8, y5 + 1.15, -12.0, 1.4, 0.35, 2.0, '#C85A53', 'matte');
  // 觀海露台＋望遠鏡
  batch.addBottom(3.8, y5, -12.2, 1.8, 0.25, 1.8, '#F2D894', 'matte');
  batch.addBottom(4.1, y5 + 0.25, -12.2, 0.22, 0.85, 0.22, '#2B4C7E', 'matte');
  batch.addBottom(4.3, y5 + 1.05, -12.2, 0.85, 0.24, 0.24, '#E9C46A', 'glossy');

  // 山坡鬆柏綠樹點綴
  [
    [-6.6, 0.68, 14.5],
    [6.8, 0.68, 14.2],
    [-6.5, 2.08, 8.2],
    [6.6, 2.08, 8.1],
    [-5.8, 4.88, -8.5],
    [-3.6, 6.48, -12.6],
  ].forEach(([tx, ty, tz]) => {
    batch.addBottom(tx, ty, tz, 0.42, 1.35, 0.42, '#7A5438', 'matte');
    batch.addBottom(tx, ty + 1.25, tz, 1.45, 0.85, 1.45, '#527D3B', 'matte', 2);
    batch.addBottom(tx, ty + 2.05, tz, 0.95, 0.65, 0.95, '#6A994E', 'matte', 1);
  });

  batch.build(group, sharedBoxGeo);

  // 為山城五級階梯 17 大核心建築設置復古 3D 招牌
  const campusSigns = [
    // Level 1
    { title: '15 校門牌樓', sub: '佛光大學迎賓門', color: '#C85A53', pos: [0, y1 + 1.85, 16.05], scale: 0.9 },
    { title: '16 百萬人興學碑牆', sub: 'Level 1', color: '#E9C46A', pos: [-4.5, y1, 13.7], scale: 0.72 },
    { title: '17 百萬人興學紀念館', sub: '創校精神典藏', color: '#C85A53', pos: [4.5, y1, 14.35], scale: 0.85 },
    // Level 2
    { title: '10 雲慧樓', sub: '創科學院總館 & 四大工坊', color: '#2B4C7E', pos: [0, y2 + 1.35, 7.62], scale: 1.05 },
    { title: '13 海雲樓', sub: 'Level 2', color: '#6C8EAD', pos: [-5.6, y2, 7.65], scale: 0.75 },
    { title: '9 雲水軒宿舍', sub: 'Level 2', color: '#C85A53', pos: [5.6, y2, 7.65], scale: 0.75 },
    // Level 3
    { title: '11 十六亭橋', sub: '林美溪風雨長廊', color: '#C85A53', pos: [0, y3 + 1.15, 1.6], scale: 0.78 },
    { title: '12 滴水坊', sub: '茶香露天座', color: '#E9C46A', pos: [-3.4, y3, 2.68], scale: 0.72 },
    { title: '14 林美射箭場', sub: '國手培訓基地', color: '#2B4C7E', pos: [3.8, y3, 2.65], scale: 0.76 },
    { title: '7 懷恩館', sub: '體育巨蛋 & 會議長廊', color: '#6C8EAD', pos: [4.8, y3, -0.15], scale: 0.86 },
    // Level 4
    { title: '3 雲五館圖書館', sub: '知識之星綠建築', color: '#527D3B', pos: [-3.2, y4 + 1.4, -4.95], scale: 0.92 },
    { title: '2 德香樓 & 操場', sub: 'Level 4', color: '#C85A53', pos: [1.6, y4, -4.2], scale: 0.85 },
    // Level 5
    { title: '1 雲起樓', sub: '佛光之巔紅瓦三合院', color: '#C85A53', pos: [0, y5, -10.85], scale: 0.92 },
    { title: '360° 觀海露台', sub: '遠眺太平洋・龜山島', color: '#E9C46A', pos: [3.8, y5, -11.05], scale: 0.76 },
  ];

  campusSigns.forEach((s) => {
    const signMesh = createCampusSignboard(s.title, s.sub, s.color, renderer, s.scale);
    signMesh.position.set(s.pos[0], s.pos[1], s.pos[2]);
    group.add(signMesh);
  });

  // 山城 Layer 1 點擊碰撞體
  const mountainCollider = new THREE.Mesh(
    new THREE.CylinderGeometry(11.5, 12.5, 8.5, 6),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  mountainCollider.position.set(0, 3.2, 0);
  mountainCollider.layers.set(1);
  mountainCollider.userData = { zoneId: 'campus-mountain', hitType: 'island' };
  group.add(mountainCollider);
  clickableMeshes.push(mountainCollider);

  // 7. 太平洋・龜山島仙境（翡翠果凍/體素海龜仙島 + 火山錐 + 流動雲環）
  const guishanGroup = new THREE.Group();
  guishanGroup.position.set(55, 0.3, -22);

  const gBatch = new VoxelBatch();
  // 海底岩基與浪花
  for (let gx = -5; gx <= 5; gx++) {
    for (let gz = -4; gz <= 4; gz++) {
      if ((gx * gx) / 25 + (gz * gz) / 16 <= 1.0) {
        gBatch.addBottom(gx * 0.98, -1.2, gz * 0.98, 0.98, 1.0, 0.98, '#2D6F7D', 'matte');
        gBatch.addBottom(gx * 0.98, -0.2, gz * 0.98, 0.96, 0.65, 0.96, '#4EA89E', 'glossy', 2);
      }
    }
  }
  // 龜甲火山錐 (翡翠山巒階梯)
  gBatch.addBottom(0, 0.45, 0, 5.2, 1.25, 4.4, '#527D3B', 'matte', 2);
  gBatch.addBottom(-0.4, 1.7, 0, 3.4, 1.35, 3.0, '#6A994E', 'matte', 2);
  gBatch.addBottom(-0.5, 3.05, 0, 1.8, 1.2, 1.7, '#8AB86E', 'matte', 1);
  // 昂首龜首 (面向西方宜蘭海岸)
  gBatch.addBottom(-5.6, -0.1, 0, 2.2, 1.35, 1.8, '#4EA89E', 'glossy');
  gBatch.addBottom(-6.4, 1.2, 0, 1.7, 1.1, 1.5, '#6A994E', 'matte');
  // 龜尾與海龜四肢
  gBatch.addBottom(5.0, -0.35, 0, 1.6, 0.55, 1.0, '#4EA89E', 'glossy');
  gBatch.build(guishanGroup, sharedBoxGeo);

  // 流動白雲環
  const guishanClouds = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.85 });
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 1.3), cloudMat);
    c.position.set(Math.cos(ang) * 7.2, 2.8 + (i % 2) * 0.5, Math.sin(ang) * 5.6);
    c.rotation.y = -ang;
    guishanClouds.add(c);
  }
  guishanGroup.add(guishanClouds);

  const guishanSign = createCampusSignboard(
    '龜山島仙境',
    '太平洋翡翠海龜仙島',
    '#4EA89E',
    renderer,
    1.15
  );
  guishanSign.position.set(0, 0.35, 3.85);
  guishanGroup.add(guishanSign);

  const guishanCollider = new THREE.Mesh(
    new THREE.CylinderGeometry(7.2, 7.2, 5.5, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  guishanCollider.position.y = 1.6;
  guishanCollider.layers.set(1);
  guishanCollider.userData = { zoneId: 'guishan', hitType: 'island' };
  guishanGroup.add(guishanCollider);
  clickableMeshes.push(guishanCollider);

  group.add(guishanGroup);

  return {
    group,
    clickableMeshes,
    groundMeshes,
    animatables: {
      knowledgeStar,
      guishanClouds,
      guishanGroup,
      streamWaves,
    },
  };
}
