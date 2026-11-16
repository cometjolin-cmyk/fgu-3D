export const COLLEGE_INFO = {
  name: '佛光大學應用科技與設計學院',
  englishName: 'College of Applied Technology and Design, Fo Guang University',
  officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
  archipelagoTitle: '佛光科技設計學習群島',
};

export const OVERVIEW_CAMERA_PRESET = {
  position: [0, 38, 56],
  target: [0, 3.2, 0],
};

export const CAMPUS_MOUNTAIN_PRESET = {
  position: [0, 22, 30],
  target: [0, 4.5, 0],
};

export const GUISHAN_PRESET = {
  position: [36, 15, -6],
  target: [55, 2.2, -22],
};

export const CAMPUS_LANDMARKS = [
  {
    number: 15,
    level: 1,
    levelTitle: 'Level 1 · 山腳迎賓區',
    name: '校門牌樓',
    description: '中式歇山頂迎賓山門，展現佛光大學林美山校園的典雅氣象。',
  },
  {
    number: 16,
    level: 1,
    levelTitle: 'Level 1 · 山腳迎賓區',
    name: '百萬人興學碑牆',
    description: '弧形玉石大理石紀念碑石牆，銘刻百萬人護持興學的感人歷史。',
  },
  {
    number: 17,
    level: 1,
    levelTitle: 'Level 1 · 山腳迎賓區',
    name: '百萬人興學紀念館',
    description: '雙坡殿宇建築搭配莊嚴功德金塔，傳承創校精神與人文典藏。',
  },
  {
    number: 10,
    level: 2,
    levelTitle: 'Level 2 · 創科學院核心基地',
    name: '雲慧樓（創科學院總館）',
    description: '應用科技與設計學院總館，現代長方量體結合玻璃長窗，周邊設有資應、傳播、產媒、建築四大系所特色工坊。',
  },
  {
    number: 13,
    level: 2,
    levelTitle: 'Level 2 · 創科學院核心基地',
    name: '海雲樓',
    description: '依山而建的現代化學生住宿與生活學習空間。',
  },
  {
    number: 9,
    level: 2,
    levelTitle: 'Level 2 · 創科學院核心基地',
    name: '雲水軒宿舍',
    description: '林美山坡靜謐宿區，清晨推窗即可遠望蘭陽平原薄霧。',
  },
  {
    number: 11,
    level: 3,
    levelTitle: 'Level 3 · 溪谷休閒與體育景觀',
    name: '十六亭橋',
    description: '朱紅木構風雨長廊橫跨林美溪碧藍清泉，是校園最具詩意的散步地標。',
  },
  {
    number: 12,
    level: 3,
    levelTitle: 'Level 3 · 溪谷休閒與體育景觀',
    name: '滴水坊',
    description: '茶香露天座與遮陽茶傘，供師生課餘品茗交流與閱讀休憩。',
  },
  {
    number: 14,
    level: 3,
    levelTitle: 'Level 3 · 溪谷休閒與體育景觀',
    name: '林美射箭場',
    description: '白色遮陽天幕棚架搭配三色同心圓專業靶位，孕育國手級射箭好手。',
  },
  {
    number: 7,
    level: 3,
    levelTitle: 'Level 3 · 溪谷休閒與體育景觀',
    name: '懷恩館',
    description: '圓頂體育巨蛋搭配標誌性流線葉形會議長廊翼樓，舉辦大型典禮與賽事。',
  },
  {
    number: 3,
    level: 4,
    levelTitle: 'Level 4 · 學術自習與社科管理聖地',
    name: '雲五館圖書館',
    description: '三層退台階梯綠建築搭配旋轉金色知識之星尖塔，提供靜謐多元的數位自習空間。',
  },
  {
    number: 2,
    level: 4,
    levelTitle: 'Level 4 · 學術自習與社科管理聖地',
    name: '德香樓與高山操場',
    description: '弧形教學大樓旁坐落著紅色跑道高山操場與足球場，奔跑時可俯瞰蘭陽海景。',
  },
  {
    number: 1,
    level: 5,
    levelTitle: 'Level 5 · 佛光之巔與海景秘境',
    name: '雲起樓',
    description: '位於校園最高峰的古典紅瓦三合院空間，坐擁雲起海湧壯麗景致。',
  },
  {
    number: null,
    level: 5,
    levelTitle: 'Level 5 · 佛光之巔與海景秘境',
    name: '360 度觀海露台與觀景望遠鏡',
    description: '從佛光之巔極目遠眺太平洋與翡翠果凍海龜仙島——龜山島。',
  },
];

// R = 32 外環六角群島軌道
function ringPos(index, total = 8, radius = 32) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return [
    Number((Math.cos(angle) * radius).toFixed(2)),
    0.55 + (index % 2) * 0.45,
    Number((Math.sin(angle) * radius).toFixed(2)),
  ];
}

function ringCam(pos) {
  const [x, y, z] = pos;
  const dist = Math.hypot(x, z) || 1;
  const ux = x / dist;
  const uz = z / dist;
  return {
    position: [
      Number((x + ux * 15.2).toFixed(2)),
      y + 10.8,
      Number((z + uz * 15.2).toFixed(2)),
    ],
    target: [x, y + 2.2, z],
  };
}

const p0 = ringPos(0);
const p1 = ringPos(1);
const p2 = ringPos(2);
const p3 = ringPos(3);
const p4 = ringPos(4);
const p5 = ringPos(5);
const p6 = ringPos(6);
const p7 = ringPos(7);

export const ISLANDS_DATA = [
  {
    id: 'ai-sys',
    order: 0,
    departmentName: '資訊應用學系',
    trackName: 'AI 系統與軟體開發組',
    officialFullName: '資訊應用學系－AI 系統與軟體開發組',
    shortLabel: 'AI 系統軟體',
    styleTag: '深海藍晶科技風',
    hexPosition: p0,
    hexRadius: 6.4,
    bridgeConnections: ['campus-mountain', 'big-data', 'arch-sustain'],
    themeColors: {
      grass: '#4F778E',
      grassAlt: '#6C8EAD',
      sand: '#DCE8F2',
      stone: '#B8C7D9',
      water: '#3B82F6',
      foam: '#E0F2FE',
      keelDeep: '#1E3A5F',
      keelMid: '#2B4C7E',
      treeLeaf: '#4E8077',
      treeDark: '#355E58',
      treeAccent: '#93C5FD',
      primary: '#2B4C7E',
      accent: '#E9C46A',
    },
    guardian: {
      name: '靈狐羽',
      title: 'AI 科技島長',
      emoji: '🦊🦉',
      speciesDesc: '狐狸＋貓頭鷹金冠混合精靈',
      greeting:
        '嗨！我是金冠島長「靈狐羽」，歡迎登上深海藍晶風格的「懸浮雙螺旋塔」六角島！我們正開發「智慧校園導覽 App」，歡迎問我 128 學分課綱或接取跨島任務！',
    },
    hybridResident: {
      name: '演算小狐「庫比」',
      species: '星紋狐狸 × 電路貓頭鷹精靈',
      emoji: '🦊💻',
      bio: '擁有立體藍金羽耳，最喜歡坐在懸浮雙螺旋塔下方的全息代碼光屏旁除錯。',
      colors: { body: '#3B629B', accent: '#93C5FD', earOrWing: '#E9C46A' },
    },
    landmark: {
      name: '懸浮果凍雙螺旋塔',
      type: 'ai-helix-tower',
      description: '天空藍與金黃雙螺旋光帶交織上升，頂端懸浮自轉發光數據水滴核心與金光光環，旁設全息代碼光屏。',
    },
    officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
    creditsInfo: '畢業學分 128 學分（含院共同核心、程式與演算法基礎、AI 系統專題及企業實務實習）',
    featuredCourses: [
      'Python 程式設計與資料結構',
      '機器學習與深度學習應用',
      '生成式 AI 與 RAG 系統開發實務',
      '全端網頁開發與雲端微服務架構',
    ],
    awardsAndHighlights: [
      '全國大專校院資訊應用服務創新競賽獲獎團隊',
      '跨系合作開發智慧校園導覽與 AI 對話系統',
      '雲慧樓配備雲端 GPU 運算實作環境',
    ],
    menuQuestions: [
      {
        id: 'ai-what',
        question: '這裡學什麼？',
        answer:
          '資訊應用學系「AI 系統與軟體開發組」培育具備程式設計、資料結構演算法、前後端系統架構與生成式 AI 模型整合能力的軟體工程師。',
        sourceLabel: '資訊應用學系官網簡介',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'ai-courses',
        question: '有哪些課程或活動？',
        answer:
          '必修與選修包含 Python 程式設計、機器學習、RAG 知識檢索系統與雲端微服務；【課堂示範】師生積極組隊參與全國資訊應用競賽與跨系校園 App 開發。',
        isDemo: true,
        sourceLabel: '128 學分課程規劃',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'ai-start',
        question: '從哪裡開始探索？',
        answer:
          '推薦先接取下方跨島迷你任務，走過紅磚拱橋前往「互動媒體與視覺設計組」收集 UI/UX 色彩藍圖，親身體驗 AI 演算法與視覺設計如何協作！',
        sourceLabel: '學院跨組學習指南',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
    miniQuest: {
      id: 'quest-ai-uiux',
      title: '跨島協作：智慧校園導覽 App 藍圖 ⭐',
      type: 'cross-island',
      description:
        '靈狐羽與庫比已完成智慧校園 App 的後端與 AI 檢索架構，還缺視覺規範！請前往「互動媒體與視覺設計組」點擊「莫比烏斯迴圈與巨型調色盤地標」取得藍圖線索，再回來回答交付。',
      clueIslandId: 'interactive-visual',
      clueLandmarkName: '莫比烏斯無限迴圈與調色盤地標',
      clueItemName: 'clue-uiux-palette',
      clueCardText: 'UI/UX 互動色彩藍圖（常春藤磚紅＋海軍藍高對比設計規範）',
      questionPrompt: '取得「UI/UX 互動色彩藍圖」後，資應組與互動設計組該如何分工合作？',
      options: [
        {
          id: 'a',
          label: '資應負責 AI 演算法與 API 系統架構，產媒互動組負責使用者介面與視覺原型',
          isCorrect: true,
        },
        {
          id: 'b',
          label: '只留下黑底白字終端機介面，不需考慮操作動線與美感',
          isCorrect: false,
        },
      ],
      interdisciplinaryTitle: '跨域解析：資訊應用（AI 系統）× 產品與媒體設計（UI/UX 原型）',
      interdisciplinaryExplanation:
        '資訊應用學系建構穩健的演算法、資料庫與後端服務；產品與媒體設計學系則透過使用者研究與介面色彩規範將複雜科技化為親切體驗，兩者合作才能做出真正受歡迎的智慧應用！',
      badgeName: 'AI × UI/UX 跨域開發徽章',
    },
    knowledgeBase: [
      {
        id: 'ai-kb-1',
        keywords: ['ai', '人工智慧', '程式', '軟體', 'python', '雙螺旋', '演算法'],
        topic: 'AI 系統與軟體開發',
        answer:
          'AI 系統與軟體開發組結合軟體工程、前後端網站開發與生成式 AI 實務，從雙螺旋塔出發培養全端與 AI 系統開發力。',
        sourceLabel: '資訊應用學系官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
  },
  {
    id: 'big-data',
    order: 1,
    departmentName: '資訊應用學系',
    trackName: '智慧資訊與大數據應用組',
    officialFullName: '資訊應用學系－智慧資訊與大數據應用組',
    shortLabel: '大數據應用',
    styleTag: '薄荷冰晶數據風',
    hexPosition: p1,
    hexRadius: 6.3,
    bridgeConnections: ['ai-sys', 'digital-media'],
    themeColors: {
      grass: '#45A095',
      grassAlt: '#7CC7BD',
      sand: '#E2F1EE',
      stone: '#C5D9D6',
      water: '#2DD4BF',
      foam: '#CCFBF1',
      keelDeep: '#1E4E5A',
      keelMid: '#2D6F7D',
      treeLeaf: '#5AA897',
      treeDark: '#3A7D6F',
      treeAccent: '#67E8F9',
      primary: '#2D7D8C',
      accent: '#67E8F9',
    },
    guardian: {
      name: '波特獺',
      title: '數據智慧島長',
      emoji: '🦦🐦',
      speciesDesc: '海獺＋機器鳥金冠混合精靈',
      greeting:
        '嘰啾！我是金冠島長「波特獺」，歡迎來到薄荷青藍晶體島！這裡有 7 根蜂巢稜鏡水晶柱與 42 顆日夜垂直穿梭的數據粒子喔！',
    },
    hybridResident: {
      name: '雷達獺「晶晶」',
      species: '智慧水獺 × 通訊雨燕精靈',
      emoji: '🦦📡',
      bio: '在物聯網雙向雷達碟盤旁紀錄林美山的微氣候感測波形。',
      colors: { body: '#45A095', accent: '#CCFBF1', earOrWing: '#1E4E5A' },
    },
    landmark: {
      name: '蜂巢稜鏡水晶簇',
      type: 'prism-cluster',
      description: '薄荷藍半透水晶簇由 7 根高低錯落六角柱組成，內部有 42 顆發光數據粒子垂直流動，旁設 IoT 雙向雷達碟盤。',
    },
    officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
    creditsInfo: '畢業學分 128 學分（聚焦大數據分析、資料庫系統、IoT 感測網路與資訊安全）',
    featuredCourses: [
      '大數據分析與資料視覺化',
      '關聯式與 NoSQL 資料庫系統',
      '物聯網感測整合與邊緣運算',
      '網路安全與雲端系統維運',
    ],
    awardsAndHighlights: [
      '宜蘭智慧農業與環境感測資料分析產學合作',
      '42 節點即時資料流視覺化實驗專題',
      '雲端架構與資料分析專業證照輔導',
    ],
    menuQuestions: [
      {
        id: 'bd-what',
        question: '這裡學什麼？',
        answer:
          '智慧資訊與大數據應用組著重感測資料採集、資料庫系統管理、巨量資料統計建模、互動視覺化儀表板，以及 IoT 物聯網與資訊安全防護。',
        sourceLabel: '資訊應用學系大數據組',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'bd-courses',
        question: '有哪些課程或活動？',
        answer:
          '開設大數據視覺化、資料庫管理、物聯網邊緣運算與資安課程；【課堂示範】師生將感測器部署於宜蘭山城園區進行微氣候即時分析。',
        isDemo: true,
        sourceLabel: '課程與實作特色',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'bd-start',
        question: '從哪裡開始探索？',
        answer:
          '仰望島上的 7 根水晶柱與雙向雷達碟盤！接著完成下方「感測數據解碼任務」，體驗從原始訊號到校園永續決策的推理過程。',
        sourceLabel: '大數據組探索建議',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
    miniQuest: {
      id: 'quest-big-data',
      title: '42 節點智慧感測數據解碼',
      type: 'landmark-quiz',
      description: '波特獺剛剛從 IoT 雷達盤接收了林美山一週的溫濕度數據，請幫他選出正確的大數據處理流程！',
      questionPrompt: '將物聯網感測數據轉化為有用資訊的標準流程為何？',
      options: [
        {
          id: 'a',
          label: '感測採集 → 資料清洗與入庫 → 統計與機器學習分析 → 視覺化決策儀表板',
          isCorrect: true,
        },
        {
          id: 'b',
          label: '跳過清洗直接刪除半數欄位並隨意臆測結果',
          isCorrect: false,
        },
      ],
      interdisciplinaryTitle: '大數據科學 × 永續環境與品牌洞察',
      interdisciplinaryExplanation:
        '大數據分析組能精準捕捉環境與使用者行為背後的規律；這些洞見提供給「建築永續組」優化綠建築通風日照，也協助「廣告行銷組」擬定更貼近受眾的策略。',
      badgeName: '水晶數據解碼徽章',
    },
    knowledgeBase: [
      {
        id: 'bd-kb-1',
        keywords: ['大數據', '資料', '數據', '物聯網', 'iot', '資安', '水晶', '雷達'],
        topic: '智慧資訊與大數據應用',
        answer:
          '智慧資訊與大數據應用組培訓資料庫、資料科學分析與 IoT 感測整合人才，兼具雲端維運與資安能力。',
        sourceLabel: '資訊應用學系官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
  },
  {
    id: 'digital-media',
    order: 2,
    departmentName: '傳播學系',
    trackName: '數位媒體與智能組',
    officialFullName: '傳播學系－數位媒體與智能組',
    shortLabel: '數位媒體',
    styleTag: '楓紅膠捲影視風',
    hexPosition: p2,
    hexRadius: 6.3,
    bridgeConnections: ['campus-mountain', 'big-data', 'ad-pr'],
    themeColors: {
      grass: '#B85D56',
      grassAlt: '#D98A84',
      sand: '#F4EFE6',
      stone: '#475569',
      water: '#6C8EAD',
      foam: '#FDE8E8',
      keelDeep: '#3D1E26',
      keelMid: '#6E323A',
      treeLeaf: '#D97757',
      treeDark: '#A84B31',
      treeAccent: '#F2D894',
      primary: '#C85A53',
      accent: '#F2D894',
    },
    guardian: {
      name: '鏡光企鵝',
      title: '數位媒體島長',
      emoji: '🐧🦎',
      speciesDesc: '企鵝＋變色龍金冠混合精靈',
      greeting:
        'Action！我是金冠島長「鏡光企鵝」！歡迎來到楓紅膠捲片場島，頭頂的 6 片金色光圈葉片正在開合調焦，快來認識 4K 影視與 AI 影像敘事！',
    },
    hybridResident: {
      name: '調光蜥「拍拍」',
      species: '攝影企鵝 × 虹彩變色龍精靈',
      emoji: '🦎🎥',
      bio: '能隨片場打光色溫變換色彩，守護黑白條紋場記板步道。',
      colors: { body: '#334155', accent: '#F4EFE6', earOrWing: '#C85A53' },
    },
    landmark: {
      name: '雙曲面鏡頭穹頂',
      type: 'aperture-dome',
      description: '珊瑚磚紅攝影穹頂搭配 6 片呼吸開合的金色光圈葉片、片場探照燈柱與膠捲步道。',
    },
    officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
    creditsInfo: '畢業學分 128 學分（結合傳播理論、影視攝影實務、AI 數位內容製作與多媒體策展）',
    featuredCourses: [
      '數位攝影與 4K 非線性剪輯',
      'AI 輔助分鏡與智慧影音生成',
      '攝影棚燈光與多機位導播實作',
      '互動新聞與新媒體數位敘事',
    ],
    awardsAndHighlights: [
      '校園微電影與紀錄片作品多次入圍國內青年影展',
      '配備專業綠幕虛擬攝影棚與 4K 後期調光室',
      '結合 AI 語音與視覺工具加速新媒體產製',
    ],
    menuQuestions: [
      {
        id: 'dm-what',
        question: '這裡學什麼？',
        answer:
          '傳播學系「數位媒體與智能組」涵蓋 4K 影視攝影、燈光剪輯、多機位導播、虛擬攝影棚實作以及生成式 AI 影像分鏡創作。',
        sourceLabel: '傳播學系數位媒體與智能組',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'dm-courses',
        question: '有哪些課程或活動？',
        answer:
          '開設影視攝影、非線性剪輯、虛擬棚導播與 AI 影音創作工作坊；【課堂示範】常與流行音樂組共同製作校園 MV 與山海紀錄片。',
        isDemo: true,
        sourceLabel: '傳播學系課程與設備',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'dm-start',
        question: '從哪裡開始探索？',
        answer:
          '踏上黑白場記板步道走進雙曲面鏡頭穹頂！接著領取下方跨島任務，到「流行音樂與展演策展組」取得原創配樂母帶線索吧！',
        sourceLabel: '傳播探索指南',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
    miniQuest: {
      id: 'quest-media-music',
      title: '跨島任務：《林美山四季》微電影配樂企劃 ⭐',
      type: 'cross-island',
      description:
        '鏡光企鵝已拍好 4K 空拍畫面，還缺靈魂配樂！請前往「流行音樂與展演策展組」點擊「聲波律動貝殼劇場」取得多軌配樂母帶，再回來交付。',
      clueIslandId: 'pop-music',
      clueLandmarkName: '聲波律動貝殼劇場',
      clueItemName: 'clue-ost-master',
      clueCardText: '原創多軌配樂母帶（木吉他＋宜蘭山嵐環境音取樣）',
      questionPrompt: '拿到原創配樂母帶後，影像剪輯與聲音設計該如何搭配才能打動觀眾？',
      options: [
        {
          id: 'a',
          label: '依據音樂節拍設計鏡頭轉場，並透過環境音層次營造空間臨場感',
          isCorrect: true,
        },
        {
          id: 'b',
          label: '把配樂音量關到最小並隨意亂切鏡頭節奏',
          isCorrect: false,
        },
      ],
      interdisciplinaryTitle: '跨域解析：數位媒體影像 × 流行音樂聲音工程',
      interdisciplinaryExplanation:
        '視聽敘事的力量來自畫面節奏與聲音情緒的精準共鳴。數位媒體組負責鏡頭與燈光語言，流行音樂組則塑造聲音張力，共同完成高水準影視作品！',
      badgeName: '影音雙棲製片徽章',
    },
    knowledgeBase: [
      {
        id: 'dm-kb-1',
        keywords: ['媒體', '攝影', '電影', '剪輯', '光圈', '傳播', '4k', '攝影棚'],
        topic: '數位媒體與智能影音',
        answer:
          '數位媒體與智能組融合攝影棚實拍與 AI 輔助創作工具，訓練學生獨立企劃、拍攝與後製完整數位影音作品。',
        sourceLabel: '傳播學系官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
  },
  {
    id: 'ad-pr',
    order: 3,
    departmentName: '傳播學系',
    trackName: '廣告行銷與公關組',
    officialFullName: '傳播學系－廣告行銷與公關組',
    shortLabel: '廣告公關',
    styleTag: '暖陽琥珀品牌風',
    hexPosition: p3,
    hexRadius: 6.2,
    bridgeConnections: ['digital-media', 'pop-music'],
    themeColors: {
      grass: '#DDA15E',
      grassAlt: '#E9C46A',
      sand: '#FEFAE0',
      stone: '#E5D3B3',
      water: '#7EA8BE',
      foam: '#FFFBEB',
      keelDeep: '#7C3E24',
      keelMid: '#B55B37',
      treeLeaf: '#BC6C25',
      treeDark: '#8C4D17',
      treeAccent: '#FDE047',
      primary: '#E07A5F',
      accent: '#E9C46A',
    },
    guardian: {
      name: '曜靈赤狐',
      title: '廣告行銷島長',
      emoji: '🦊🐰',
      speciesDesc: '赤狐＋兔耳金冠混合精靈',
      greeting:
        '哈囉！我是金冠島長「曜靈赤狐」！這座暖陽琥珀與波浪飄帶交織的島嶼，是品牌提案、社群爆款企劃與金犢獎戰隊的大本營！',
    },
    hybridResident: {
      name: '提案狐兔「小麥」',
      species: '赤狐 × 垂耳兔精靈',
      emoji: '🦊📣',
      bio: '豎起長兔耳傾聽市場洞察，站在擴音廣播塔旁發想朗朗上口的品牌標語。',
      colors: { body: '#E07A5F', accent: '#FEFAE0', earOrWing: '#BC6C25' },
    },
    landmark: {
      name: '波浪摺紙飄帶館',
      type: 'ribbon-pavilion',
      description: '蜜桃橘摺曲波浪屋頂展館搭配高聳金色擴音器廣播塔與音波光環，象徵品牌聲量擴散。',
    },
    officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
    creditsInfo: '畢業學分 128 學分（涵蓋整合行銷傳播、公關策略企劃、消費者洞察與社群數據分析）',
    featuredCourses: [
      '廣告創意與文案腳本設計',
      '整合行銷傳播與品牌經營',
      '公關策略與危機處理實務',
      '數位社群行銷與流量數據分析',
    ],
    awardsAndHighlights: [
      '時報金犢獎與全國大專校園行銷競賽常勝軍',
      '在地農產與觀光品牌產學整合行銷專案',
      '創意提案結合社群短影音實戰操作',
    ],
    menuQuestions: [
      {
        id: 'ad-what',
        question: '這裡學什麼？',
        answer:
          '廣告行銷與公關組聚焦消費者行為洞察、廣告文案與腳本創意、整合行銷傳播（IMC）、社群操作以及公關危機應對。',
        sourceLabel: '傳播學系廣告行銷與公關組',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'ad-courses',
        question: '有哪些課程或活動？',
        answer:
          '課程包含廣告創意、公關策略、社群流量數據分析與品牌經營；【課堂示範】同學積極參與時報金犢獎及宜蘭在地文創品牌行銷專案。',
        isDemo: true,
        sourceLabel: '傳播學系競賽與實作',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'ad-start',
        question: '從哪裡開始探索？',
        answer:
          '走到金色擴音塔與海報牆前看看品牌策略案例，再完成下方提案小挑戰，了解行銷如何為科技與設計作品加值！',
        sourceLabel: '廣告行銷探索建議',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
    miniQuest: {
      id: 'quest-ad-pr',
      title: '金犢獎品牌故事提案挑戰',
      type: 'landmark-quiz',
      description: '小麥要替學院年度聯展打造整合宣傳企劃，請選出最符合專業行銷思維的做法！',
      questionPrompt: '為「學院跨系成果展」規劃整合行銷活動時，最重要的核心步驟為何？',
      options: [
        {
          id: 'a',
          label: '精準定位目標受眾，設計有記憶點的核心故事並串聯社群與線下體驗',
          isCorrect: true,
        },
        {
          id: 'b',
          label: '不分析受眾也不設定主題，隨意張貼純文字公告',
          isCorrect: false,
        },
      ],
      interdisciplinaryTitle: '策略傳播 × 科技與設計作品的價值放大器',
      interdisciplinaryExplanation:
        '好的軟體與產品需要被世界看見。廣告行銷與公關組能替資應與產媒的創新原型設計溝通語言與品牌舞台，讓作品真正走入市場。',
      badgeName: '品牌策略提案徽章',
    },
    knowledgeBase: [
      {
        id: 'ad-kb-1',
        keywords: ['廣告', '行銷', '公關', '品牌', '社群', '金犢獎', '擴音'],
        topic: '廣告行銷與品牌策劃',
        answer:
          '廣告行銷與公關組培養品牌說故事、社群策略、消費者洞察與公關溝通實力，產學實戰豐富。',
        sourceLabel: '傳播學系官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
  },
  {
    id: 'pop-music',
    order: 4,
    departmentName: '傳播學系',
    trackName: '流行音樂與展演策展組',
    officialFullName: '傳播學系－流行音樂與展演策展組',
    shortLabel: '流行音樂',
    styleTag: '紫羅蘭黑膠聲浪風',
    hexPosition: p4,
    hexRadius: 6.4,
    bridgeConnections: ['campus-mountain', 'ad-pr', 'industrial-design'],
    themeColors: {
      grass: '#7B689B',
      grassAlt: '#9D8BB8',
      sand: '#F3E8FF',
      stone: '#312E52',
      water: '#818CF8',
      foam: '#EDE9FE',
      keelDeep: '#2E1A47',
      keelMid: '#4C2F73',
      treeLeaf: '#9F6BA0',
      treeDark: '#6D4370',
      treeAccent: '#F472B6',
      primary: '#7C3AED',
      accent: '#F472B6',
    },
    guardian: {
      name: '弦音小熊',
      title: '展演音樂島長',
      emoji: '🐼🐦',
      speciesDesc: '小熊貓＋鳴鳥金冠混合精靈',
      greeting:
        '♪ 歡迎登上會隨著節拍呼吸的紫羅蘭音樂島！我是金冠島長「弦音小熊」，踩上黑白琴鍵步道，一起玩數位編曲、DJ 混音與舞台策展！',
    },
    hybridResident: {
      name: '黑膠熊「小調」',
      species: '小熊貓 × 鳴鳥音律精靈',
      emoji: '🐼🎵',
      bio: '掌心藏著節拍器，尾羽隨貝殼劇場的聲浪頻率閃耀粉紫光芒。',
      colors: { body: '#6D4370', accent: '#F3E8FF', earOrWing: '#F472B6' },
    },
    landmark: {
      name: '聲波律動貝殼劇場',
      type: 'acoustic-shell',
      description: '5 片層疊呼吸律動的紫羅蘭貝殼音響拱門，搭配旋轉 DJ 黑膠唱盤與黑白琴鍵階梯步道。',
    },
    officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
    creditsInfo: '畢業學分 128 學分（包含數位編曲製作、混音工程、舞台燈光音響與展演活動策劃）',
    featuredCourses: [
      '流行音樂詞曲創作與數位編曲',
      '錄音室工程與現場 PA 混音',
      '大型展演策展與舞台監督實務',
      'Podcast 聲音設計與音樂經紀行銷',
    ],
    awardsAndHighlights: [
      '舉辦校園跨夜音樂節與原創專輯發表會',
      '專業多軌錄音室與 DJ 現場混音實作設備',
      '結合聲音設計與視覺舞台燈光跨界演出',
    ],
    menuQuestions: [
      {
        id: 'pm-what',
        question: '這裡學什麼？',
        answer:
          '流行音樂與展演策展組整合詞曲創作、數位編曲（DAW）、錄音與現場 PA 混音，以及音樂祭舞台監督與藝文展演企劃。',
        sourceLabel: '傳播學系流行音樂與展演策展組',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'pm-courses',
        question: '有哪些課程或活動？',
        answer:
          '包含數位編曲、多軌混音工程、舞台燈光與大型展演策劃；【課堂示範】師生策劃校園原創音樂祭，也支援數位媒體組影片配樂製作。',
        isDemo: true,
        sourceLabel: '音樂製作與展演課程',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'pm-start',
        question: '從哪裡開始探索？',
        answer:
          '走過黑白鋼琴鍵步道欣賞 5 片律動貝殼舞台！若你替數位媒體組前來取經，點擊貝殼劇場地標即可取得「原創多軌配樂母帶」線索卡！',
        sourceLabel: '音樂展演探索指引',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
    miniQuest: {
      id: 'quest-pop-music',
      title: '山海音樂祭 PA 策展任務',
      type: 'landmark-quiz',
      description: '小調正在校對音樂會現場的舞台技術清單，請協助完成關鍵決策！',
      questionPrompt: '籌辦一場大型現場音樂展演時，除了表演者排練，還需整合哪項關鍵配置？',
      options: [
        {
          id: 'a',
          label: '現場 PA 音響調音、燈光視覺同步、觀眾動線安全與舞台監督排程',
          isCorrect: true,
        },
        {
          id: 'b',
          label: '僅憑一顆小型隨身藍牙喇叭即可支撐戶外音樂舞台',
          isCorrect: false,
        },
      ],
      interdisciplinaryTitle: '聲音工程 × 視覺舞台與互動燈光藝術',
      interdisciplinaryExplanation:
        '流行音樂與展演策展組把聲音轉化為可體驗的現場魅力，並與數位媒體、互動視覺及廣告公關組緊密串聯，打造完整的娛樂文化產業鍊。',
      badgeName: '貝殼劇場音控徽章',
    },
    knowledgeBase: [
      {
        id: 'pm-kb-1',
        keywords: ['音樂', '流行', '展演', '策展', 'dj', '編曲', '錄音', '貝殼', '黑膠'],
        topic: '流行音樂與展演策展',
        answer:
          '流行音樂與展演策展組涵蓋詞曲編曲、多軌混音與大型舞台展演企劃，兼顧音樂創作與幕後策展管理。',
        sourceLabel: '傳播學系官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
  },
  {
    id: 'industrial-design',
    order: 5,
    departmentName: '產品與媒體設計學系',
    trackName: '工業與產品設計組',
    officialFullName: '產品與媒體設計學系－工業與產品設計組',
    shortLabel: '工業設計',
    styleTag: '包浩斯紅磚創客風',
    hexPosition: p5,
    hexRadius: 6.4,
    bridgeConnections: ['pop-music', 'interactive-visual'],
    themeColors: {
      grass: '#C48A47',
      grassAlt: '#E9C46A',
      sand: '#F5E6C8',
      stone: '#A89F91',
      water: '#6C8EAD',
      foam: '#FEF3C7',
      keelDeep: '#6B2D26',
      keelMid: '#9B4238',
      treeLeaf: '#7F9142',
      treeDark: '#59692B',
      treeAccent: '#FACC15',
      primary: '#C85A53',
      accent: '#FACC15',
    },
    guardian: {
      name: '匠心石狸',
      title: '工業設計島長',
      emoji: '🐻🦫',
      speciesDesc: '棕熊＋海狸金冠混合精靈',
      greeting:
        '歡迎登上包浩斯紅磚創客島！我是金冠島長「匠心石狸」！看看這座 4 層充氣積木疊疊樂工坊，許多榮獲德國紅點設計獎的作品都在這裡打樣誕生！',
    },
    hybridResident: {
      name: '打樣狸「卡榫」',
      species: '巧手棕熊 × 河狸木工師精靈',
      emoji: '🦫🛠️',
      bio: '戴著護目鏡在 3D 列印創客亭與木工桌間穿梭，最擅長無膠精密卡榫結構。',
      colors: { body: '#A65D43', accent: '#E9C46A', earOrWing: '#2B4C7E' },
    },
    landmark: {
      name: '充氣積木疊疊樂工坊',
      type: 'puffy-blocks',
      description: '紅、黃、藍、白 4 層錯落懸挑的立體積木造型工坊，搭配戶外 3D 列印打樣涼亭與紅磚廣場。',
    },
    officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
    creditsInfo: '畢業學分 128 學分（涵蓋造形美學、人因工學、3D CAD 建模、金工木工與 3D 列印打樣）',
    featuredCourses: [
      '產品設計繪圖與 3D 電腦輔助建模',
      '人因工學與使用情境研究',
      '快速成型（3D 列印）與材料工藝',
      '國際設計競賽專題與新一代設計展',
    ],
    awardsAndHighlights: [
      '師生作品屢獲德國紅點設計獎（Red Dot）、德國 iF 設計新秀獎肯定',
      '每年進軍台北新一代設計展展現生活器物創意',
      '工坊配備 3D 列印農場、雷射切割機與實體模型打樣室',
    ],
    menuQuestions: [
      {
        id: 'id-what',
        question: '這裡學什麼？',
        answer:
          '產品與媒體設計學系「工業與產品設計組」從生活需求與人因工程出發，訓練設計繪圖、3D CAD 建模、木金工打樣與量產材料工藝。',
        sourceLabel: '產品與媒體設計學系官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'id-courses',
        question: '有哪些課程或活動？',
        answer:
          '包含產品設計工作室、3D 列印成型、金木工實作與國際設計大賽輔導；【課堂示範】師生多次榮獲德國紅點設計獎並參展新一代設計展。',
        isDemo: true,
        sourceLabel: '榮譽榜與工坊資源',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'id-start',
        question: '從哪裡開始探索？',
        answer:
          '欣賞門前紅黃藍錯落的積木工坊造型！接著接取下方跨島任務，前往「建築與永續環境設計組」取得竹木低碳材料規格卡吧！',
        sourceLabel: '工業設計探索路徑',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
    miniQuest: {
      id: 'quest-id-arch',
      title: '跨島任務：永續竹木智慧檯燈材料單 ⭐',
      type: 'cross-island',
      description:
        '匠心石狸正在設計參賽德國紅點獎的「智慧閱讀檯燈」，希望導入宜蘭在地竹木永續材質！請前往「建築與永續環境設計組」點擊「階梯梯田生態溫室」取得材料規格卡，再回來完成交付。',
      clueIslandId: 'arch-sustain',
      clueLandmarkName: '階梯梯田生態溫室',
      clueItemName: 'clue-bamboo-spec',
      clueCardText: '宜蘭永續竹木低碳結構與自然散熱規格卡',
      questionPrompt: '結合綠建築竹木材料規格後，工業設計與建築永續如何共同提升產品價值？',
      options: [
        {
          id: 'a',
          label: '工業設計掌握人因照明與精密卡榫，建築永續提供低碳自然材與節能思維',
          isCorrect: true,
        },
        {
          id: 'b',
          label: '改用完全不可分解的一次性塑膠黏死所有零件',
          isCorrect: false,
        },
      ],
      interdisciplinaryTitle: '跨域解析：工業產品工藝 × 建築永續低碳材料',
      interdisciplinaryExplanation:
        '當產品造形的人因細膩度結合建築空間對自然材料的深刻理解，設計便能同時兼顧使用者手感與地球永續，這也是紅點等國際賽事最青睞的跨界方向！',
      badgeName: '紅點永續匠心徽章',
    },
    knowledgeBase: [
      {
        id: 'id-kb-1',
        keywords: ['工業', '產品', '紅點', 'if', '3d列印', '打樣', '新一代', '積木'],
        topic: '工業與產品設計實作與紅點榮譽',
        answer:
          '工業與產品設計組注重實體打樣與人因美學，擁有 3D 列印與木金工設備，師生屢獲德國紅點設計獎及新一代設計展肯定。',
        sourceLabel: '產品與媒體設計學系官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
  },
  {
    id: 'interactive-visual',
    order: 6,
    departmentName: '產品與媒體設計學系',
    trackName: '互動媒體與視覺設計組',
    officialFullName: '產品與媒體設計學系－互動媒體與視覺設計組',
    shortLabel: '互動視覺',
    styleTag: '粉櫻畫廊調色風',
    hexPosition: p6,
    hexRadius: 6.4,
    bridgeConnections: ['campus-mountain', 'industrial-design', 'arch-sustain'],
    themeColors: {
      grass: '#E5989B',
      grassAlt: '#F4ACB7',
      sand: '#FFFDF9',
      stone: '#E8D5D8',
      water: '#7EC8E3',
      foam: '#FFE4E6',
      keelDeep: '#6D3B47',
      keelMid: '#9D5C63',
      treeLeaf: '#F48FB1',
      treeDark: '#D86C8F',
      treeAccent: '#FCE7F3',
      primary: '#D98A84',
      accent: '#38BDF8',
    },
    guardian: {
      name: '彩晶水豚',
      title: '互動視覺島長',
      emoji: '🥔🦋',
      speciesDesc: '水豚＋蝴蝶金冠混合精靈',
      greeting:
        '呼啊～我是悠閒又有創意的金冠島長「彩晶水豚」！這座粉櫻美術畫廊島結合了莫比烏斯無限迴圈 ∞ 與五色調色盤花園，專攻 UI/UX 與動態視覺！',
    },
    hybridResident: {
      name: '調色豚「虹蝶」',
      species: '淡定水豚 × 彩晶鳳蝶精靈',
      emoji: '🦋🎨',
      bio: '頭頂擺著一顆小橘子，背後展著五彩蝶翼，負責管理 UI/UX 互動色彩藍圖。',
      colors: { body: '#F4ACB7', accent: '#FFFDF9', earOrWing: '#38BDF8' },
    },
    landmark: {
      name: '莫比烏斯無限迴圈與調色盤地標',
      type: 'mobius-palette',
      description: '立體莫比烏斯 ∞ 迴圈廊懸浮彩虹八面體，前方為五色調色盤花園與櫻花視覺畫廊。',
    },
    officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
    creditsInfo: '畢業學分 128 學分（聚焦 UI/UX 互動設計、品牌視覺識別、動態圖像與 AR/VR 體驗）',
    featuredCourses: [
      'UI/UX 使用者介面與互動原型設計',
      '品牌視覺傳達與字體編排設計',
      'Motion Graphics 動態圖像與 3D 渲染',
      '沉浸式互動展覽與體感媒體實驗',
    ],
    awardsAndHighlights: [
      '跨系與資應系團隊共同完成智慧校園 App 互動原型',
      '獲獎作品橫跨德國紅點品牌與傳達設計獎、放視大賞',
      '五色調色盤花園展現系統化色彩學與無障礙規範',
    ],
    menuQuestions: [
      {
        id: 'iv-what',
        question: '這裡學什麼？',
        answer:
          '產品與媒體設計學系「互動媒體與視覺設計組」整合 UI/UX 介面原型、品牌視覺識別、平面編排、3D 動態圖像及互動展演科技。',
        sourceLabel: '產品與媒體設計學系互動組',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'iv-courses',
        question: '有哪些課程或活動？',
        answer:
          '包含 Figma 互動設計、動態圖像與跨媒體展覽創作；【課堂示範】常與資應系聯手打造校園數位服務並角逐紅點傳達獎與放視大賞。',
        isDemo: true,
        sourceLabel: '課程與跨域專案',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'iv-start',
        question: '從哪裡開始探索？',
        answer:
          '點擊島上這座「莫比烏斯無限迴圈與調色盤地標」即可取得 UI/UX 色彩藍圖線索卡送給資應系，也能挑戰本島的無障礙視覺魔法測驗！',
        sourceLabel: '互動視覺探索指南',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
    miniQuest: {
      id: 'quest-iv-ui',
      title: '調色盤花園的無障礙視覺設計',
      type: 'landmark-quiz',
      description: '彩晶水豚正在審核智慧校園導覽介面的色彩規範，請協助選出最符合專業 UI/UX 的原則！',
      questionPrompt: '為戶外校園行動導覽介面設計色彩系統時，為何重視文字與背景的明暗對比度？',
      options: [
        {
          id: 'a',
          label: '確保戶外陽光與不同視力使用者皆能清楚閱讀（WCAG 無障礙標準）並區分主次資訊',
          isCorrect: true,
        },
        {
          id: 'b',
          label: '讓按鈕與背景融為一體，考驗使用者的猜謎運氣',
          isCorrect: false,
        },
      ],
      interdisciplinaryTitle: '視覺心理學 × 資訊工程無障礙實作',
      interdisciplinaryExplanation:
        '好看的設計更要「好用」。互動媒體組建立直覺的色彩階層與動態回饋，搭配資應組的前端架構與語意標籤，讓每一位校園訪客都能無障礙探索！',
      badgeName: '莫比烏斯視覺魔法徽章',
    },
    knowledgeBase: [
      {
        id: 'iv-kb-1',
        keywords: ['互動', 'ui', 'ux', '視覺', '莫比烏斯', '調色盤', '平面', '動態', '設計', '櫻花'],
        topic: '互動媒體、UI/UX 與視覺設計',
        answer:
          '互動媒體與視覺設計組訓練 UI/UX 原型、品牌視覺識別與動態圖像創作，經常與資訊應用學系合作打造完整數位產品。',
        sourceLabel: '產品與媒體設計學系官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
  },
  {
    id: 'arch-sustain',
    order: 7,
    departmentName: '建築環境設計學程',
    trackName: '建築與永續環境設計組',
    officialFullName: '建築環境設計學程－建築與永續環境設計組',
    shortLabel: '建築永續',
    styleTag: '竹木梯田森態風',
    hexPosition: p7,
    hexRadius: 6.4,
    bridgeConnections: ['ai-sys', 'interactive-visual'],
    themeColors: {
      grass: '#6A994E',
      grassAlt: '#8AB86E',
      sand: '#E6D5B8',
      stone: '#C2B8A3',
      water: '#4EA89E',
      foam: '#DCFCE7',
      keelDeep: '#2D4F2E',
      keelMid: '#4A7844',
      treeLeaf: '#527D3B',
      treeDark: '#385C27',
      treeAccent: '#A3E635',
      primary: '#527D3B',
      accent: '#E9C46A',
    },
    guardian: {
      name: '青木森熊',
      title: '建築永續島長',
      emoji: '🐻🦉',
      speciesDesc: '棕熊＋貓頭鷹金冠混合精靈',
      greeting:
        '深呼吸林美山的清新芬多精！我是金冠島長「青木森熊」，歡迎來到階梯梯田生態溫室島，屋頂有綠建築苔蘚與自轉風力發電機喔！',
    },
    hybridResident: {
      name: '木構熊「竹羽」',
      species: '山林棕熊 × 蒼鷺貓頭鷹精靈',
      emoji: '🐻🌿',
      bio: '肩扛小小竹木梁柱模型，在梯田溫室與風力發電機之間測繪日照與風場。',
      colors: { body: '#6A994E', accent: '#E6D5B8', earOrWing: '#385C27' },
    },
    landmark: {
      name: '階梯梯田生態溫室',
      type: 'eco-terrace',
      description: '三層竹木退台式生態溫室搭配果凍苔蘚綠穹頂與自轉風力發電機，四周環繞梯田水道。',
    },
    officialUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
    creditsInfo: '畢業學分 128 學分（涵蓋建築設計工作室、環境物理與綠建築模擬、木構構造與景觀生態）',
    featuredCourses: [
      '建築設計工作室（空間尺度與基地分析）',
      '永續綠建築與微氣候日照模擬',
      '竹木構造實作與數位製造工作坊',
      '宜蘭在地社區營造與文化空間再生',
    ],
    awardsAndHighlights: [
      '結合林美山自然地形實地測繪與生態空間設計',
      '永續低碳木構與風光熱環境模擬實作',
      '與雲五館綠建築理念相呼應的環境教育場域',
    ],
    menuQuestions: [
      {
        id: 'arch-what',
        question: '這裡學什麼？',
        answer:
          '建築環境設計學程「建築與永續環境設計組」培育建築空間設計、基地地形測繪、微氣候與日照模擬、竹木構工藝與永續環境再生人才。',
        sourceLabel: '建築環境設計學程官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'arch-courses',
        question: '有哪些課程或活動？',
        answer:
          '包含建築設計工作室、綠建築環境物理、竹木構造與社區空間營造；【課堂示範】師生運用宜蘭竹木打造生態遮陽亭，並協助工設組研究永續材料。',
        isDemo: true,
        sourceLabel: '學程特色與工作坊',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
      {
        id: 'arch-start',
        question: '從哪裡開始探索？',
        answer:
          '看看溫室上方順風旋轉的風力發電機！若你替「工業與產品設計組」前來尋找竹木材料規格，點擊溫室地標即可領取規格線索卡喔！',
        sourceLabel: '建築永續探索指引',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
    miniQuest: {
      id: 'quest-arch-sustain',
      title: '林美山退台微氣候綠建築實驗',
      type: 'landmark-quiz',
      description: '竹羽正在替山城溫室設計自然通風與遮陽系統，請選出最符合永續節能的建築策略！',
      questionPrompt: '在多雨又面海的宜蘭山坡地規劃校園建築時，退台綠屋頂與深遮陽廊道有什麼優勢？',
      options: [
        {
          id: 'a',
          label: '阻擋強烈西曬與豪雨潑濺、促進自然通風降溫並保留雨水涵養植栽',
          isCorrect: true,
        },
        {
          id: 'b',
          label: '完全密封不設任何窗戶與屋簷，全天候依賴高耗能空調',
          isCorrect: false,
        },
      ],
      interdisciplinaryTitle: '永續空間架構 × 智慧感測與產品工藝',
      interdisciplinaryExplanation:
        '建築不只是造型，更是與山海氣候對話的系統。結合大數據組的微氣候感測以及工業設計組的模組材料，讓永續校園既美觀又低碳！',
      badgeName: '林美山綠建築永續徽章',
    },
    knowledgeBase: [
      {
        id: 'arch-kb-1',
        keywords: ['建築', '永續', '綠建築', '溫室', '木構', '空間', '風力', '梯田'],
        topic: '建築設計與永續環境空間',
        answer:
          '建築環境設計學程善用佛光大學林美山生態基地，訓練空間設計、微氣候日照模擬與低碳竹木構造實作。',
        sourceLabel: '建築環境設計學程官網',
        sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
      },
    ],
  },
].map((item) => ({
  ...item,
  cameraPreset: ringCam(item.hexPosition),
}));

const COLLEGE_COMMON_KB = [
  {
    id: 'common-128',
    keywords: ['128', '學分', '課綱', '畢業', '出路', '實習', '職涯'],
    topic: '128 學分課綱與跨領域實習出路',
    answer:
      '佛光大學應用科技與設計學院各學系標準畢業學分為 128 學分，涵蓋通識涵養、學院跨域基礎、專業實作工作室及企業實習；畢業可投身 AI 軟體工程師、大數據分析師、UI/UX 設計師、工業設計師、影視製作人、行銷企劃或永續建築設計師。',
    sourceLabel: '佛光大學應用科技與設計學院官網',
    sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
  },
  {
    id: 'common-campus',
    keywords: ['雲慧樓', '雲五館', '雲起樓', '十六亭橋', '滴水坊', '龜山島', '懷恩館', '射箭', '校園'],
    topic: '佛光大學實景山城五級階梯 17 大地標',
    answer:
      '中央山城依循林美山五級地形還原 17 大校園地標：Level 1 校門牌樓與百萬人興學紀念館、Level 2 雲慧樓創科學院總館與四大工坊、Level 3 十六亭橋與懷恩館及射箭場、Level 4 雲五館圖書館與德香樓操場、Level 5 雲起樓三合院與觀海露台遠眺龜山島仙境！',
    sourceLabel: '佛光大學山城導覽',
    sourceUrl: 'https://tech.fgu.edu.tw/?locale=zh_tw',
  },
];

/**
 * @param {string} rawQuery
 * @param {any} [activeIsland]
 */
export function queryIslandKnowledgeBase(rawQuery, activeIsland = null) {
  const q = rawQuery.trim().toLowerCase();

  if (activeIsland && activeIsland.knowledgeBase) {
    for (const entry of activeIsland.knowledgeBase) {
      if (entry.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
        return {
          reply: `${activeIsland.guardian.name}（${activeIsland.guardian.emoji}）回覆：「${entry.answer}」`,
          sourceLabel: entry.sourceLabel,
          sourceUrl: entry.sourceUrl,
          isOutOfScope: false,
        };
      }
    }
  }

  for (const island of ISLANDS_DATA) {
    if (activeIsland && island.id === activeIsland.id) continue;
    for (const entry of island.knowledgeBase || []) {
      if (entry.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
        const speaker = activeIsland
          ? `${activeIsland.guardian.name}為你轉接「${island.trackName}」：`
          : `${island.guardian.name}回覆：`;
        return {
          reply: `${speaker}「${entry.answer}」`,
          sourceLabel: island.officialFullName,
          sourceUrl: entry.sourceUrl,
          isOutOfScope: false,
        };
      }
    }
  }

  for (const common of COLLEGE_COMMON_KB) {
    if (common.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      return {
        reply: `${activeIsland ? activeIsland.guardian.name : '雲慧山城導覽員'}補充說明：「${common.answer}」`,
        sourceLabel: common.sourceLabel,
        sourceUrl: common.sourceUrl,
        isOutOfScope: false,
      };
    }
  }

  return {
    reply: `【課堂示範】${
      activeIsland ? activeIsland.guardian.name : '學院島長'
    }翻開手冊說：「關於『${rawQuery.trim()}』的詳細資訊目前未收錄於本地知識庫，歡迎點擊下方連結前往佛光大學應用科技與設計學院官網查詢，或試著輸入『AI』、『大數據』、『紅點』、『UI/UX』、『128學分』或『雲慧樓』！」`,
    sourceLabel: '佛光大學應用科技與設計學院官網',
    sourceUrl: COLLEGE_INFO.officialUrl,
    isOutOfScope: true,
  };
}

export const ISLANDER_PROTOTYPES = [
  { id: 'fox', label: 'AI 科技靈狐', emoji: '🦊', desc: '擅長程式邏輯與全息數據探索' },
  { id: 'bear', label: '創意建築森熊', emoji: '🐻', desc: '熱愛空間結構與永續工藝' },
  { id: 'penguin', label: '媒體創作企鵝', emoji: '🐧', desc: '對光影鏡頭與聲波節奏極度敏銳' },
  { id: 'owl', label: '知識探索貓頭鷹', emoji: '🦉', desc: '雲五館常客，精通跨領域文獻檢索' },
];

export const MACARON_COLORS = [
  { name: '學院晴藍', hex: '#7DD3FC' },
  { name: '常春藤珊瑚', hex: '#FDA4AF' },
  { name: '林美嫩綠', hex: '#86EFAC' },
  { name: '芥末奶油', hex: '#FDE047' },
  { name: '薰衣草紫', hex: '#D8B4FE' },
];

export const ISLANDER_ACCESSORIES = [
  { id: 'grad-cap', label: '學士帽', emoji: '🎓' },
  { id: 'star-crown', label: '星星皇冠', emoji: '👑' },
  { id: 'vr-goggles', label: 'VR 護目鏡', emoji: '🥽' },
  { id: 'beret', label: '畫家帽', emoji: '🎨' },
];

export const HYBRID_GENES = [
  { id: 'capybara', label: '水豚', emoji: '🥔', color: '#C89F7B', trait: '溫厚圓潤體型＋橘子頂飾' },
  { id: 'owl', label: '貓頭鷹', emoji: '🦉', color: '#64748B', trait: '智慧羽翼＋大眼星瞳' },
  { id: 'fox', label: '靈狐', emoji: '🦊', color: '#EA7B4F', trait: '尖耳＋蓬鬆雙尾' },
  { id: 'otter', label: '海獺', emoji: '🦦', color: '#8D6E63', trait: '流線身姿＋晶瑩貝殼' },
  { id: 'deer', label: '森鹿', emoji: '🦌', color: '#E2C6A6', trait: '優雅姿態＋發光枝角' },
  { id: 'whale', label: '巨鯨', emoji: '🐳', color: '#60A5FA', trait: '噴水氣孔＋星輝尾鰭' },
];

export const DECORATION_CATALOG = [
  {
    id: 'sakura-tree',
    name: '果凍櫻花樹',
    emoji: '🌸',
    cost: 2,
    desc: '半透明粉櫻體素樹冠，為島嶼增添春意。',
  },
  {
    id: 'crystal-pillar',
    name: '發光水晶柱',
    emoji: '💎',
    cost: 3,
    desc: '閃耀智慧藍光的六角水晶柱，夜間格外耀眼。',
  },
  {
    id: 'hot-air-balloon',
    name: '雲端熱氣球',
    emoji: '🎈',
    cost: 4,
    desc: '緩緩漂浮巡航的學院熱氣球，可從高空眺望龜山島。',
  },
  {
    id: 'rainbow-fountain',
    name: '彩虹許願噴泉',
    emoji: '⛲',
    cost: 5,
    desc: '七彩光環環繞的動態噴泉，為學習者帶來靈感。',
  },
];
