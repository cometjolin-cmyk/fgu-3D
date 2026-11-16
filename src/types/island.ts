export type TrackIslandId =
  | 'ai-sys'
  | 'big-data'
  | 'digital-media'
  | 'ad-pr'
  | 'pop-music'
  | 'industrial-design'
  | 'interactive-visual'
  | 'arch-sustain';

export type SelectableZoneId = TrackIslandId | 'campus-mountain' | 'guishan';

export type IslanderPrototype = 'fox' | 'bear' | 'penguin' | 'owl';
export type IslanderAccessory = 'grad-cap' | 'star-crown' | 'vr-goggles' | 'beret';
export type HybridGeneSpecies = 'capybara' | 'owl' | 'fox' | 'otter' | 'deer' | 'whale';
export type DecorationType =
  | 'sakura-tree'
  | 'crystal-pillar'
  | 'hot-air-balloon'
  | 'rainbow-fountain';

export interface PlayerIslanderConfig {
  studentId: string;
  nickname: string;
  isGuest: boolean;
  prototype: IslanderPrototype;
  bodyColor: string;
  accessory: IslanderAccessory;
  speechText: string;
}

export interface HybridCreatureRecord {
  id: string;
  name: string;
  geneA: HybridGeneSpecies;
  geneB: HybridGeneSpecies;
  assignedIslandId: TrackIslandId;
  createdAt: string;
}

export interface PlacedDecoration {
  id: string;
  type: DecorationType;
  targetZone: TrackIslandId | 'campus-mountain';
  positionOffset: number[];
}

export interface CameraPreset {
  position: number[];
  target: number[];
}

export interface IslandMenuQA {
  id: string;
  question: string;
  answer: string;
  isDemo?: boolean;
  sourceLabel: string;
  sourceUrl: string;
}

export interface IslandMiniQuest {
  id: string;
  title: string;
  type: string;
  description: string;
  clueIslandId?: string;
  clueLandmarkName?: string;
  clueItemName?: string;
  clueCardText?: string;
  questionPrompt: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
  }[];
  interdisciplinaryTitle: string;
  interdisciplinaryExplanation: string;
  badgeName: string;
}

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  topic: string;
  answer: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface IslandThemeColors {
  grass: string;
  grassAlt: string;
  sand: string;
  stone: string;
  water: string;
  foam: string;
  keelDeep: string;
  keelMid: string;
  treeLeaf: string;
  treeDark: string;
  treeAccent?: string;
  primary: string;
  accent: string;
}

export interface IslandData {
  id: TrackIslandId;
  order: number;
  departmentName: string;
  trackName: string;
  officialFullName: string;
  shortLabel: string;
  styleTag: string;
  hexPosition: number[];
  hexRadius: number;
  bridgeConnections: string[];
  themeColors: IslandThemeColors;
  guardian: {
    name: string;
    title: string;
    emoji: string;
    speciesDesc: string;
    greeting: string;
  };
  hybridResident: {
    name: string;
    species: string;
    emoji: string;
    bio: string;
    colors: {
      body: string;
      accent: string;
      earOrWing: string;
    };
  };
  landmark: {
    name: string;
    type: string;
    description: string;
  };
  officialUrl: string;
  creditsInfo: string;
  featuredCourses: string[];
  awardsAndHighlights: string[];
  menuQuestions: IslandMenuQA[];
  miniQuest: IslandMiniQuest;
  knowledgeBase: KnowledgeEntry[];
  cameraPreset: CameraPreset;
}

export interface CampusLandmarkInfo {
  number: number | null;
  level: 1 | 2 | 3 | 4 | 5;
  levelTitle: string;
  name: string;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  siteUpdatedAt: string;
  sourceUrl: string;
  isDemo: boolean;
  summary: string;
  starReward: number;
}

export interface NewsFetchResult {
  items: NewsItem[];
  fromCache: boolean;
  lastSuccessSyncAt: string;
  warningMessage: string | null;
}

export interface LearningProgressState {
  visitedZones: SelectableZoneId[];
  collectedClues: string[];
  completedQuests: string[];
  earnedBadges: string[];
  starEnergy: number;
  claimedNewsIds: string[];
  unlockedDecorations: DecorationType[];
  placedDecorations: PlacedDecoration[];
  hybrids: HybridCreatureRecord[];
  pomodoroCompletedCount: number;
  playerConfig: PlayerIslanderConfig | null;
}
