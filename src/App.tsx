import React, { useCallback, useEffect, useState } from 'react';
import FallbackListView from './components/FallbackListView';
import HybridIncubatorModal from './components/HybridIncubatorModal';
import IntroGuideModal from './components/IntroGuideModal';
import IslandDialog, {
  ActiveResidentSpeaker,
  DialogueCuePayload,
} from './components/IslandDialog';
import IslandDock from './components/IslandDock';
import IslanderWorkshopModal from './components/IslanderWorkshopModal';
import Navbar from './components/Navbar';
import NewsDecorModal from './components/NewsDecorModal';
import PomodoroWidget from './components/PomodoroWidget';
import {
  CAMPUS_MOUNTAIN_PRESET,
  GUISHAN_PRESET,
  ISLANDS_DATA,
  OVERVIEW_CAMERA_PRESET,
} from './data/islandsData.js';
import SceneCanvas from './three/SceneCanvas.jsx';
import {
  CameraPreset,
  DecorationType,
  HybridCreatureRecord,
  IslandData,
  LearningProgressState,
  PlayerIslanderConfig,
  SelectableZoneId,
  TrackIslandId,
} from './types/island';

const PROGRESS_STORAGE_KEY = 'fgu_learning_islands_progress_v1';
const INTRO_SEEN_KEY = 'has_seen_intro';

const DEFAULT_PROGRESS: LearningProgressState = {
  visitedZones: [],
  collectedClues: [],
  completedQuests: [],
  earnedBadges: [],
  starEnergy: 4,
  claimedNewsIds: [],
  unlockedDecorations: [],
  placedDecorations: [],
  hybrids: [],
  pomodoroCompletedCount: 0,
  playerConfig: null,
};

function loadProgress(): LearningProgressState {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<LearningProgressState>;
    return {
      visitedZones: Array.isArray(parsed.visitedZones) ? parsed.visitedZones : [],
      collectedClues: Array.isArray(parsed.collectedClues) ? parsed.collectedClues : [],
      completedQuests: Array.isArray(parsed.completedQuests) ? parsed.completedQuests : [],
      earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
      starEnergy: typeof parsed.starEnergy === 'number' ? parsed.starEnergy : 4,
      claimedNewsIds: Array.isArray(parsed.claimedNewsIds) ? parsed.claimedNewsIds : [],
      unlockedDecorations: Array.isArray(parsed.unlockedDecorations)
        ? parsed.unlockedDecorations
        : [],
      placedDecorations: Array.isArray(parsed.placedDecorations)
        ? parsed.placedDecorations
        : [],
      hybrids: Array.isArray(parsed.hybrids) ? parsed.hybrids : [],
      pomodoroCompletedCount:
        typeof parsed.pomodoroCompletedCount === 'number'
          ? parsed.pomodoroCompletedCount
          : 0,
      playerConfig: parsed.playerConfig ?? null,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function shouldShowIntroInitially(): boolean {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) !== 'true';
  } catch {
    return false;
  }
}

export default function App() {
  const [progress, setProgress] = useState<LearningProgressState>(loadProgress);
  const [selectedZoneId, setSelectedZoneId] = useState<SelectableZoneId | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<ActiveResidentSpeaker | null>(null);
  const [activeDialogueCue, setActiveDialogueCue] = useState<DialogueCuePayload | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>(OVERVIEW_CAMERA_PRESET);
  const [introVisible, setIntroVisible] = useState(true);
  const [introGuideOpen, setIntroGuideOpen] = useState<boolean>(shouldShowIntroInitially);
  const [forceFallback, setForceFallback] = useState(false);

  const [newsDecorModal, setNewsDecorModal] = useState<{
    open: boolean;
    tab: 'news' | 'decor';
    keyword: string;
  }>({ open: false, tab: 'news', keyword: '' });
  const [workshopOpen, setWorkshopOpen] = useState(false);
  const [incubatorOpen, setIncubatorOpen] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const allIslands = ISLANDS_DATA as unknown as IslandData[];

  // 入場 2 秒優雅淡出主標題
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroVisible(false);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  // localStorage 持久化進度保存
  useEffect(() => {
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore quota errors
    }
  }, [progress]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4200);
  }, []);

  const markIntroSeen = useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
    setIntroGuideOpen(false);
  }, []);

  const handleStartWorkshopFromIntro = useCallback(() => {
    markIntroSeen();
    setWorkshopOpen(true);
  }, [markIntroSeen]);

  const handleSelectZone = useCallback(
    (id: SelectableZoneId) => {
      setSelectedZoneId(id);
      if (id === 'campus-mountain') {
        setCameraPreset({
          position: [...CAMPUS_MOUNTAIN_PRESET.position],
          target: [...CAMPUS_MOUNTAIN_PRESET.target],
        });
      } else if (id === 'guishan') {
        setCameraPreset({
          position: [...GUISHAN_PRESET.position],
          target: [...GUISHAN_PRESET.target],
        });
      } else {
        const island = allIslands.find((i) => i.id === id);
        if (island) {
          setCameraPreset({
            position: [...island.cameraPreset.position],
            target: [...island.cameraPreset.target],
          });
        }
      }
      setProgress((prev) => {
        if (prev.visitedZones.includes(id)) return prev;
        return {
          ...prev,
          visitedZones: [...prev.visitedZones, id],
        };
      });
    },
    [allIslands]
  );

  const handleGoOverview = useCallback(() => {
    setSelectedZoneId(null);
    setActiveSpeaker(null);
    setCameraPreset({
      position: [...OVERVIEW_CAMERA_PRESET.position],
      target: [...OVERVIEW_CAMERA_PRESET.target],
    });
  }, []);

  const handleCollectClue = useCallback(
    (clueKey: string, clueTitle: string) => {
      let newlyAdded = false;
      setProgress((prev) => {
        if (prev.collectedClues.includes(clueKey)) return prev;
        newlyAdded = true;
        return {
          ...prev,
          collectedClues: [...prev.collectedClues, clueKey],
          starEnergy: prev.starEnergy + 2,
        };
      });
      showToast(
        newlyAdded
          ? `取得跨域線索卡：${clueTitle} (+2⭐)`
          : `已擁有線索卡：${clueTitle}`
      );
    },
    [showToast]
  );

  const handleInspectLandmark = useCallback(
    (zoneId: SelectableZoneId, landmarkName: string) => {
      setActiveSpeaker({ zoneId, speakerType: 'guardian', timestamp: Date.now() });
      const clueHolders = allIslands.filter(
        (other) =>
          other.miniQuest.type === 'cross-island' &&
          other.miniQuest.clueIslandId === zoneId
      );
      clueHolders.forEach((holder) => {
        const clueKey = holder.miniQuest.clueItemName;
        const clueTitle = holder.miniQuest.clueCardText;
        if (clueKey && clueTitle) {
          handleCollectClue(clueKey, `${landmarkName} → ${clueTitle}`);
        }
      });
    },
    [allIslands, handleCollectClue]
  );

  const handleTalkToResident = useCallback(
    (payload: ActiveResidentSpeaker) => {
      setActiveSpeaker({ ...payload, timestamp: Date.now() });
      setActiveDialogueCue({
        zoneId: payload.zoneId,
        speakerType: payload.speakerType,
        speakerId: payload.speakerId,
        text: '你好呀！歡迎跟我聊天！',
      });
      showToast(`正在與「${payload.speakerName || '島上住民'}」對話互動`);
    },
    [showToast]
  );

  const handleCompleteQuest = useCallback(
    (questId: string, badgeName: string) => {
      setProgress((prev) => {
        const alreadyDone = prev.completedQuests.includes(questId);
        const nextQuests = alreadyDone
          ? prev.completedQuests
          : [...prev.completedQuests, questId];
        const nextBadges = prev.earnedBadges.includes(badgeName)
          ? prev.earnedBadges
          : [...prev.earnedBadges, badgeName];
        return {
          ...prev,
          completedQuests: nextQuests,
          earnedBadges: nextBadges,
          starEnergy: alreadyDone ? prev.starEnergy : prev.starEnergy + 3,
        };
      });
      showToast(`任務完成！獲得徽章「${badgeName}」(+3⭐)`);
    },
    [showToast]
  );

  const handleSavePlayerConfig = useCallback(
    (config: PlayerIslanderConfig) => {
      setProgress((prev) => ({ ...prev, playerConfig: config }));
      showToast(`已召喚「${config.nickname}」登陸 3D 群島！點擊目前島嶼地面可跳躍漫步`);
    },
    [showToast]
  );

  const handleDeployHybrid = useCallback(
    (record: HybridCreatureRecord) => {
      setProgress((prev) => ({
        ...prev,
        hybrids: [...prev.hybrids, record],
      }));
      const target = allIslands.find((i) => i.id === record.assignedIslandId);
      showToast(`已培育「${record.name}」並部署至 ${target?.shortLabel ?? '學組島嶼'}！`);
    },
    [allIslands, showToast]
  );

  const handleClaimNewsStar = useCallback(
    (newsId: string, stars: number) => {
      setProgress((prev) => {
        if (prev.claimedNewsIds.includes(newsId)) return prev;
        return {
          ...prev,
          claimedNewsIds: [...prev.claimedNewsIds, newsId],
          starEnergy: prev.starEnergy + stars,
        };
      });
      showToast(`閱讀公告簽到成功！獲得 +${stars} ⭐ 星能`);
    },
    [showToast]
  );

  const handleUnlockAndPlaceDecoration = useCallback(
    (
      type: DecorationType,
      cost: number,
      targetZone: TrackIslandId | 'campus-mountain'
    ) => {
      setProgress((prev) => {
        if (prev.starEnergy < cost) return prev;
        const count = prev.placedDecorations.length;
        const angle = count * 1.45;
        const offset = [
          Number((Math.cos(angle) * 3.1).toFixed(2)),
          0,
          Number((Math.sin(angle) * 3.1).toFixed(2)),
        ];
        return {
          ...prev,
          starEnergy: prev.starEnergy - cost,
          unlockedDecorations: prev.unlockedDecorations.includes(type)
            ? prev.unlockedDecorations
            : [...prev.unlockedDecorations, type],
          placedDecorations: [
            ...prev.placedDecorations,
            {
              id: `dec-${Date.now()}`,
              type,
              targetZone,
              positionOffset: offset,
            },
          ],
        };
      });
      showToast('已兌換並將 3D 裝飾建築實例化於群島中！');
    },
    [showToast]
  );

  const handleCompletePomodoro = useCallback(
    (rewardStars: number) => {
      setProgress((prev) => ({
        ...prev,
        pomodoroCompletedCount: prev.pomodoroCompletedCount + 1,
        starEnergy: prev.starEnergy + rewardStars,
      }));
      showToast(`自習番茄鐘完成！獲得 +${rewardStars} ⭐ 學習星能`);
    },
    [showToast]
  );

  const handleResetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    setSelectedZoneId(null);
    setActiveSpeaker(null);
    setIsStudying(false);
    setCameraPreset({
      position: [...OVERVIEW_CAMERA_PRESET.position],
      target: [...OVERVIEW_CAMERA_PRESET.target],
    });
    try {
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      // Ignore
    }
    showToast('已重置學習群島探索與任務進度');
  }, [showToast]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F4EFE6]">
      <Navbar
        showBrandInNavbar={!introVisible}
        progress={progress}
        isFallbackMode={forceFallback}
        onGoOverview={handleGoOverview}
        onSelectZone={handleSelectZone}
        onOpenNewsDecor={(tab, kw = '') =>
          setNewsDecorModal({ open: true, tab, keyword: kw })
        }
        onOpenIncubator={() => setIncubatorOpen(true)}
        onOpenWorkshop={() => setWorkshopOpen(true)}
        onToggleFallback={() => setForceFallback((prev) => !prev)}
      />

      {!forceFallback && (
        <PomodoroWidget
          isStudying={isStudying}
          completedCount={progress.pomodoroCompletedCount}
          onStudyingChange={setIsStudying}
          onCompleteSession={handleCompletePomodoro}
        />
      )}

      {/* 入場 2 秒中央標題 */}
      <div
        className={`fixed inset-0 z-20 pointer-events-none flex items-center justify-center transition-all duration-700 ${
          introVisible && !introGuideOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="voxel-card px-7 py-5 text-center max-w-md mx-4 bg-[#F4EFE6]">
          <div className="text-xs font-bold tracking-widest text-[#C85A53] mb-1">
            佛光大學應用科技與設計學院
          </div>
          <h1 className="font-collegiate text-2xl sm:text-3xl font-bold text-[#2B4C7E]">
            佛光科技設計學習群島
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1.5">
            五級實景山城 × 八大專業學組體素微縮群島
          </p>
        </div>
      </div>

      {/* 通知橫幅 */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 voxel-card-brick bg-[#F2D894] px-4 py-2 text-xs sm:text-sm font-bold text-[#1E293B]"
        >
          {toastMessage}
        </div>
      )}

      <main className="w-full h-full">
        <SceneCanvas
          cameraTargetPreset={cameraPreset}
          selectedZoneId={selectedZoneId}
          playerConfig={progress.playerConfig}
          isStudying={isStudying}
          hybrids={progress.hybrids}
          placedDecorations={progress.placedDecorations}
          activeDialogueCue={activeDialogueCue}
          onSelectZone={handleSelectZone}
          onInspectLandmark={handleInspectLandmark}
          onTalkToResident={handleTalkToResident}
          forceFallback={forceFallback}
          renderFallbackView={(fromWebglError: boolean) => (
            <FallbackListView
              fromWebglError={fromWebglError}
              progress={progress}
              onSelectZone={handleSelectZone}
              onOpenNewsDecor={(tab) =>
                setNewsDecorModal({ open: true, tab, keyword: '' })
              }
              onOpenIncubator={() => setIncubatorOpen(true)}
              onOpenWorkshop={() => setWorkshopOpen(true)}
              onReturnTo3D={() => setForceFallback(false)}
            />
          )}
        />
      </main>

      {!forceFallback && (
        <IslandDock
          selectedZoneId={selectedZoneId}
          progress={progress}
          onGoOverview={handleGoOverview}
          onSelectZone={handleSelectZone}
          onResetProgress={handleResetProgress}
        />
      )}

      <IslandDialog
        selectedZoneId={selectedZoneId}
        activeSpeaker={activeSpeaker}
        progress={progress}
        onCloseAndReturnOverview={handleGoOverview}
        onDismissPanelOnly={() => {
          setSelectedZoneId(null);
          setActiveSpeaker(null);
        }}
        onSelectZone={handleSelectZone}
        onSelectSpeaker={(spk) => setActiveSpeaker(spk)}
        onDialogueReply={(cue) => setActiveDialogueCue(cue)}
        onCollectClue={handleCollectClue}
        onCompleteQuest={handleCompleteQuest}
      />

      <IntroGuideModal
        isOpen={introGuideOpen}
        onStartWorkshop={handleStartWorkshopFromIntro}
        onSkip={markIntroSeen}
      />

      <NewsDecorModal
        isOpen={newsDecorModal.open}
        initialTab={newsDecorModal.tab}
        initialKeyword={newsDecorModal.keyword}
        progress={progress}
        onClaimNewsStar={handleClaimNewsStar}
        onUnlockAndPlaceDecoration={handleUnlockAndPlaceDecoration}
        onClose={() => setNewsDecorModal({ open: false, tab: 'news', keyword: '' })}
      />

      <IslanderWorkshopModal
        isOpen={workshopOpen}
        currentConfig={progress.playerConfig}
        onSave={handleSavePlayerConfig}
        onClose={() => setWorkshopOpen(false)}
      />

      <HybridIncubatorModal
        isOpen={incubatorOpen}
        hybrids={progress.hybrids}
        onDeployHybrid={handleDeployHybrid}
        onClose={() => setIncubatorOpen(false)}
      />
    </div>
  );
}
