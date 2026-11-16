import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Compass,
  ExternalLink,
  MapPin,
  MessageSquare,
  Mountain,
  Send,
  Sparkles,
  User,
  Waves,
  X,
} from 'lucide-react';
import {
  CAMPUS_LANDMARKS,
  COLLEGE_INFO,
  ISLANDS_DATA,
  queryIslandKnowledgeBase,
} from '../data/islandsData.js';
import {
  CampusLandmarkInfo,
  HybridCreatureRecord,
  IslandData,
  LearningProgressState,
  SelectableZoneId,
} from '../types/island';

export interface ActiveResidentSpeaker {
  zoneId: SelectableZoneId;
  speakerType: 'guardian' | 'resident' | 'hybrid';
  speakerId?: string;
  speakerName?: string;
  timestamp?: number;
}

export interface DialogueCuePayload {
  zoneId: SelectableZoneId;
  speakerType: 'guardian' | 'resident' | 'hybrid';
  speakerId?: string;
  text: string;
}

interface ChatEntry {
  id: string;
  sender: 'guardian' | 'resident' | 'hybrid' | 'user';
  speakerLabel?: string;
  text: string;
  sourceLabel?: string;
  sourceUrl?: string;
  isDemo?: boolean;
}

interface IslandDialogProps {
  selectedZoneId: SelectableZoneId | null;
  activeSpeaker: ActiveResidentSpeaker | null;
  progress: LearningProgressState;
  onCloseAndReturnOverview: () => void;
  onDismissPanelOnly: () => void;
  onSelectZone: (id: SelectableZoneId) => void;
  onSelectSpeaker: (speaker: ActiveResidentSpeaker) => void;
  onDialogueReply: (cue: DialogueCuePayload) => void;
  onCollectClue: (clueKey: string, clueTitle: string) => void;
  onCompleteQuest: (questId: string, badgeName: string) => void;
}

function buildResidentReply(
  island: IslandData,
  promptType: 'daily' | 'secret' | 'cheer' | 'free',
  rawQuery = '',
  playerNickname = '探索夥伴'
): { text: string; shortCue: string } {
  const resName = island.hybridResident.name;
  const playerGreeting = playerNickname ? `${playerNickname}` : '探索夥伴';

  if (promptType === 'daily') {
    return {
      text: `${resName}開心揮揮手：「${island.hybridResident.bio} 我每天都會在「${island.landmark.name}」旁邊陪大家實作 ${island.featuredCourses[0]} 喔！」`,
      shortCue: '在這裡實作超有趣！',
    };
  }
  if (promptType === 'secret') {
    return {
      text: `${resName}壓低聲音說：「偷偷告訴你 ${playerGreeting}～我們這組的學習秘訣是把『${island.featuredCourses[1] || island.featuredCourses[0]}』和跨系專案結合，像 ${island.awardsAndHighlights[0]} 就是這樣拼出來的！」`,
      shortCue: '秘訣就是跨域實作！',
    };
  }
  if (promptType === 'cheer') {
    return {
      text: `${resName}跳了起來：「${playerGreeting} 加油！${island.creditsInfo} 每一步探索都會讓你離夢想更近，歡迎隨時點我聊天或去完成島上的迷你任務喔！」`,
      shortCue: `${playerGreeting} 加油！`,
    };
  }

  const q = rawQuery.trim().toLowerCase();
  if (q.includes('你好') || q.includes('哈囉') || q.includes('嗨') || q.includes('hi')) {
    return {
      text: `${resName}（${island.hybridResident.emoji}）：「嗨 ${playerGreeting}！我是住在 ${island.trackName} 的 ${resName}！你想知道我在島上的日常，還是想問 ${island.landmark.name} 的故事？」`,
      shortCue: `嗨 ${playerGreeting}！`,
    };
  }
  if (q.includes('喜歡') || q.includes('日常') || q.includes('做什麼') || q.includes('誰')) {
    return {
      text: `${resName}：「我是${island.hybridResident.species}！${island.hybridResident.bio}」`,
      shortCue: '我最愛守護這裡！',
    };
  }
  const kbRes = queryIslandKnowledgeBase(rawQuery, island);
  return {
    text: `${resName}幫你翻了島上筆記：「${kbRes.reply}」`,
    shortCue: '讓我告訴你喔！',
  };
}

export default function IslandDialog({
  selectedZoneId,
  activeSpeaker,
  progress,
  onCloseAndReturnOverview,
  onDismissPanelOnly,
  onSelectZone,
  onSelectSpeaker,
  onDialogueReply,
  onCollectClue,
  onCompleteQuest,
}: IslandDialogProps) {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [wrongOptionFeedback, setWrongOptionFeedback] = useState(false);
  const [mountainLevelFilter, setMountainLevelFilter] = useState<number | 'all'>('all');

  const allIslands = ISLANDS_DATA as unknown as IslandData[];
  const allCampusLandmarks = CAMPUS_LANDMARKS as unknown as CampusLandmarkInfo[];
  const island: IslandData | null =
    selectedZoneId && selectedZoneId !== 'campus-mountain' && selectedZoneId !== 'guishan'
      ? allIslands.find((i) => i.id === selectedZoneId) ?? null
      : null;

  const islandHybrids: HybridCreatureRecord[] = island
    ? progress.hybrids.filter((h) => h.assignedIslandId === island.id)
    : [];

  const hostedClueQuests = island
    ? allIslands.filter(
        (other) =>
          other.miniQuest.type === 'cross-island' &&
          other.miniQuest.clueIslandId === island.id
      )
    : [];

  const currentSpeakerType: 'guardian' | 'resident' | 'hybrid' =
    activeSpeaker && activeSpeaker.zoneId === selectedZoneId
      ? activeSpeaker.speakerType
      : 'guardian';
  const currentHybrid: HybridCreatureRecord | undefined =
    currentSpeakerType === 'hybrid'
      ? islandHybrids.find((h) => h.id === activeSpeaker?.speakerId) || islandHybrids[0]
      : undefined;

  useEffect(() => {
    if (!selectedZoneId) {
      setMessages([]);
      return;
    }
    const playerNick = progress.playerConfig?.nickname || '探索夥伴';

    if (selectedZoneId === 'campus-mountain') {
      setMessages([
        {
          id: 'greeting-mountain',
          sender: 'guardian',
          speakerLabel: '山城導覽員',
          text: `歡迎 ${playerNick} 來到中央「佛光大學實景山城五級階梯」！依循宜蘭林美山地形由南向北步步高升，忠實呈現 17 大校園實景地標。點擊下方樓層分區或向我提問吧！`,
          sourceLabel: COLLEGE_INFO.name,
          sourceUrl: COLLEGE_INFO.officialUrl,
        },
      ]);
    } else if (selectedZoneId === 'guishan') {
      setMessages([
        {
          id: 'greeting-guishan',
          sender: 'guardian',
          speakerLabel: '海景領航員',
          text: `${playerNick}，您已飛越蘭陽海岸抵達太平洋「龜山島仙境」！這座翡翠果凍海龜仙島擁有昂首龜首、龜甲火山錐與流動雲環，天氣晴朗時從佛光大學 Level 5 雲起樓 360° 觀海露台即可遠眺喔！`,
          sourceLabel: '佛光大學山城秘境景觀',
          sourceUrl: COLLEGE_INFO.officialUrl,
        },
      ]);
    } else if (island) {
      if (currentSpeakerType === 'resident') {
        const resGreeting = `${island.hybridResident.name}開心跳了兩下：「嗨 ${playerNick}！我是${island.hybridResident.species}！${island.hybridResident.bio} 你想聊聊我在島上的日常，還是問課程問題呢？」`;
        setMessages([
          {
            id: `greeting-res-${island.id}-${activeSpeaker?.timestamp || 0}`,
            sender: 'resident',
            speakerLabel: `${island.hybridResident.emoji} ${island.hybridResident.name}`,
            text: resGreeting,
            sourceLabel: island.officialFullName,
            sourceUrl: island.officialUrl,
          },
        ]);
      } else if (currentSpeakerType === 'hybrid' && currentHybrid) {
        setMessages([
          {
            id: `greeting-hyb-${currentHybrid.id}-${activeSpeaker?.timestamp || 0}`,
            sender: 'hybrid',
            speakerLabel: `🧬 ${currentHybrid.name}`,
            text: `${currentHybrid.name}親暱地蹭了蹭 ${playerNick}：「咕嚕～謝謝你培育我並讓我住在「${island.trackName}」！我和 ${island.hybridResident.name} 已經變成好朋友囉！」`,
          },
        ]);
      } else {
        setMessages([
          {
            id: `greeting-${island.id}`,
            sender: 'guardian',
            speakerLabel: `${island.guardian.emoji} ${island.guardian.name}`,
            text: island.guardian.greeting,
            sourceLabel: island.officialFullName,
            sourceUrl: island.officialUrl,
          },
        ]);
      }
    }
    setQuestionInput('');
    setSelectedOptionId(null);
    setWrongOptionFeedback(false);
  }, [
    selectedZoneId,
    island,
    currentSpeakerType,
    currentHybrid?.id,
    activeSpeaker?.timestamp,
    progress.playerConfig?.nickname,
  ]);

  if (!selectedZoneId) return null;

  const playerNickname = progress.playerConfig?.nickname || '探索夥伴';

  const handleFreeQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questionInput.trim();
    if (!trimmed) return;

    if (island && currentSpeakerType === 'resident') {
      const reply = buildResidentReply(island, 'free', trimmed, playerNickname);
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', text: trimmed },
        {
          id: `r-${Date.now() + 1}`,
          sender: 'resident',
          speakerLabel: `${island.hybridResident.emoji} ${island.hybridResident.name}`,
          text: reply.text,
          sourceLabel: island.officialFullName,
          sourceUrl: island.officialUrl,
        },
      ]);
      onDialogueReply({
        zoneId: island.id,
        speakerType: 'resident',
        text: reply.shortCue,
      });
      setQuestionInput('');
      return;
    }

    if (island && currentSpeakerType === 'hybrid' && currentHybrid) {
      const kbRes = queryIslandKnowledgeBase(trimmed, island);
      const replyText = `${currentHybrid.name}歪著頭拍拍翅膀說：「關於『${trimmed}』，我聽 ${island.guardian.name} 提過：${kbRes.reply}」`;
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', text: trimmed },
        {
          id: `h-${Date.now() + 1}`,
          sender: 'hybrid',
          speakerLabel: `🧬 ${currentHybrid.name}`,
          text: replyText,
          sourceLabel: kbRes.sourceLabel,
          sourceUrl: kbRes.sourceUrl,
        },
      ]);
      onDialogueReply({
        zoneId: island.id,
        speakerType: 'hybrid',
        speakerId: currentHybrid.id,
        text: '咕嚕！查到筆記了！',
      });
      setQuestionInput('');
      return;
    }

    const res = queryIslandKnowledgeBase(trimmed, island);
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: trimmed },
      {
        id: `g-${Date.now() + 1}`,
        sender: 'guardian',
        speakerLabel: island ? `${island.guardian.emoji} ${island.guardian.name}` : '學院導覽員',
        text: res.reply,
        sourceLabel: res.sourceLabel,
        sourceUrl: res.sourceUrl,
        isDemo: res.isOutOfScope,
      },
    ]);
    if (island) {
      onDialogueReply({
        zoneId: island.id,
        speakerType: 'guardian',
        text: '為你解答學院知識！',
      });
    }
    setQuestionInput('');
  };

  // Mode 1: 中央佛光大學實景山城五級階梯 (17 大地標)
  if (selectedZoneId === 'campus-mountain') {
    const filteredLandmarks =
      mountainLevelFilter === 'all'
        ? allCampusLandmarks
        : allCampusLandmarks.filter((l) => l.level === mountainLevelFilter);

    return (
      <aside
        aria-label="佛光大學實景山城五級階梯導覽"
        className="fixed z-30 bottom-0 left-0 right-0 md:left-auto md:right-4 md:top-16 md:bottom-4 w-full md:w-[410px] max-h-[80vh] md:max-h-[calc(100vh-80px)] voxel-card flex flex-col overflow-hidden"
      >
        <div className="px-4 py-3 bg-[#527D3B] text-[#F4EFE6] border-b-2 border-[#385C27] flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-[#F2D894]">中央山城核心導覽</div>
            <h2 className="font-collegiate text-base sm:text-lg font-bold">
              🏔️ 佛光大學實景山城五級階梯
            </h2>
            <div className="text-[11px] text-[#E6F4EA]">
              忠實還原林美山 17 大校園實景地標與專屬 3D 招牌
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onCloseAndReturnOverview}
              className="px-2 py-1 text-[11px] font-bold bg-[#C85A53] text-[#F4EFE6] border border-[#963B35] cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>返回群島</span>
            </button>
            <button
              type="button"
              onClick={onDismissPanelOnly}
              aria-label="關閉導覽面板"
              className="p-1 hover:bg-black/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto parchment-scroll p-3.5 space-y-3 bg-[#F4EFE6] text-xs">
          <div className="flex flex-wrap gap-1">
            {(['all', 1, 2, 3, 4, 5] as const).map((lv) => (
              <button
                key={String(lv)}
                type="button"
                onClick={() => setMountainLevelFilter(lv)}
                className={`px-2 py-1 font-bold border cursor-pointer ${
                  mountainLevelFilter === lv
                    ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458]'
                    : 'bg-[#FFFDF9] text-[#2B4C7E] border-[#2B4C7E]/30'
                }`}
              >
                {lv === 'all' ? '全部 5 階' : `Level ${lv}`}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredLandmarks.map((lm) => (
              <div
                key={lm.name}
                className="p-2.5 bg-[#FFFDF9] border border-[#2B4C7E]/25 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#2B4C7E]">
                    {lm.number ? `#${lm.number} ` : '★ '}
                    {lm.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#C85A53]">{lm.levelTitle}</span>
                </div>
                <p className="text-[#475569] leading-relaxed">{lm.description}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSelectZone('guishan')}
            className="w-full voxel-btn-navy py-2 font-bold cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <Waves className="w-4 h-4 text-[#E9C46A]" />
            <span>從 Level 5 雲起樓遠眺太平洋・龜山島仙境 →</span>
          </button>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2.5 leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458] ml-6'
                  : 'bg-[#FFFDF9] text-[#1E293B] border-[#2B4C7E]/30 mr-2'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleFreeQuestion}
          className="p-2.5 bg-[#EAE2D3] border-t-2 border-[#2B4C7E]/25 flex items-center gap-2"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="詢問校園地標（雲慧樓、雲五館、十六亭橋…）"
            className="flex-1 px-2.5 py-1.5 text-xs bg-[#FFFDF9] border-2 border-[#2B4C7E]/40 focus:border-[#2B4C7E] focus:outline-none"
          />
          <button
            type="submit"
            className="voxel-btn-navy px-3 py-1.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>發送</span>
          </button>
        </form>
      </aside>
    );
  }

  // Mode 2: 龜山島仙境
  if (selectedZoneId === 'guishan') {
    return (
      <aside
        aria-label="龜山島仙境導覽"
        className="fixed z-30 bottom-0 left-0 right-0 md:left-auto md:right-4 md:top-16 md:bottom-4 w-full md:w-[400px] max-h-[78vh] md:max-h-[calc(100vh-80px)] voxel-card flex flex-col overflow-hidden"
      >
        <div className="px-4 py-3 bg-[#2D6F7D] text-[#F4EFE6] border-b-2 border-[#1A4B56] flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-[#F2D894]">太平洋海景秘境</div>
            <h2 className="font-collegiate text-base sm:text-lg font-bold">
              🐢 龜山島仙境（翡翠果凍海龜）
            </h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onCloseAndReturnOverview}
              className="px-2 py-1 text-[11px] font-bold bg-[#C85A53] text-[#F4EFE6] border border-[#963B35] cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>返回群島</span>
            </button>
            <button
              type="button"
              onClick={onDismissPanelOnly}
              aria-label="關閉導覽面板"
              className="p-1 hover:bg-black/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto parchment-scroll p-4 space-y-3 bg-[#F4EFE6] text-xs">
          <div className="p-3 bg-[#FFFDF9] border-2 border-[#2D6F7D]/30 space-y-2">
            <div className="font-bold text-[#2D6F7D]">從林美山高處遠眺的蘭陽地標</div>
            <p className="text-[#475569] leading-relaxed">
              佛光大學坐落於宜蘭礁溪林美山坡，站在海拔較高的雲起樓與 360° 觀海露台，極目東望便是這座守護蘭陽平原的「龜山島」——擁有昂首龜首、翡翠龜甲火山錐與環繞海霧白雲。
            </p>
            <button
              type="button"
              onClick={() => onSelectZone('campus-mountain')}
              className="voxel-btn-navy px-3 py-1.5 font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <Mountain className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span>飛回佛光山城雲起樓觀海露台</span>
            </button>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2.5 leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458] ml-6'
                  : 'bg-[#FFFDF9] text-[#1E293B] border-[#2B4C7E]/30 mr-2'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleFreeQuestion}
          className="p-2.5 bg-[#EAE2D3] border-t-2 border-[#2B4C7E]/25 flex items-center gap-2"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="詢問學院課程、128學分或校園建築…"
            className="flex-1 px-2.5 py-1.5 text-xs bg-[#FFFDF9] border-2 border-[#2B4C7E]/40 focus:border-[#2B4C7E] focus:outline-none"
          />
          <button
            type="submit"
            className="voxel-btn-navy px-3 py-1.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>發送</span>
          </button>
        </form>
      </aside>
    );
  }

  // Mode 3: 八大專業學組獨立六角島
  if (!island) return null;

  const quest = island.miniQuest;
  const questCompleted = progress.completedQuests.includes(quest.id);
  const clueCollected =
    quest.type !== 'cross-island' ||
    (quest.clueItemName ? progress.collectedClues.includes(quest.clueItemName) : true);

  const handleMenuQuestion = (qId: string) => {
    const qa = island.menuQuestions.find((m) => m.id === qId);
    if (!qa) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: qa.question },
      {
        id: `g-${Date.now() + 1}`,
        sender: 'guardian',
        speakerLabel: `${island.guardian.emoji} ${island.guardian.name}`,
        text: qa.answer,
        sourceLabel: qa.sourceLabel,
        sourceUrl: qa.sourceUrl,
        isDemo: qa.isDemo,
      },
    ]);
    onDialogueReply({
      zoneId: island.id,
      speakerType: 'guardian',
      text: `跟你介紹：${qa.question.replace('？', '')}`,
    });
  };

  const handleResidentQuickPrompt = (
    promptType: 'daily' | 'secret' | 'cheer',
    label: string
  ) => {
    const reply = buildResidentReply(island, promptType, '', playerNickname);
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', text: label },
      {
        id: `r-${Date.now() + 1}`,
        sender: 'resident',
        speakerLabel: `${island.hybridResident.emoji} ${island.hybridResident.name}`,
        text: reply.text,
        sourceLabel: island.officialFullName,
        sourceUrl: island.officialUrl,
      },
    ]);
    onDialogueReply({
      zoneId: island.id,
      speakerType: 'resident',
      text: reply.shortCue,
    });
  };

  const handleSubmitQuestAnswer = () => {
    if (!selectedOptionId) return;
    const opt = quest.options.find((o) => o.id === selectedOptionId);
    if (!opt) return;
    if (opt.isCorrect) {
      setWrongOptionFeedback(false);
      onCompleteQuest(quest.id, quest.badgeName);
    } else {
      setWrongOptionFeedback(true);
    }
  };

  return (
    <aside
      aria-label={`${island.officialFullName} 導覽面板`}
      className="fixed z-30 bottom-0 left-0 right-0 md:left-auto md:right-4 md:top-16 md:bottom-4 w-full md:w-[410px] max-h-[80vh] md:max-h-[calc(100vh-80px)] voxel-card flex flex-col overflow-hidden"
    >
      {/* Header styled with island color */}
      <div
        className="px-4 py-3 text-[#F4EFE6] border-b-2 border-[#1C3458] flex items-start justify-between gap-2"
        style={{ backgroundColor: island.themeColors.primary }}
      >
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-[#F2D894]">
            {island.departmentName} · {island.styleTag}
          </div>
          <h2 className="font-collegiate text-base sm:text-lg font-bold leading-snug">
            {island.trackName}
          </h2>
          <div className="text-[11px] text-[#FFFDF9]/90 mt-0.5 truncate">
            3D 地標：{island.landmark.name}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onCloseAndReturnOverview}
            className="px-2 py-1 text-[11px] font-bold bg-[#C85A53] text-[#F4EFE6] border border-[#963B35] hover:bg-[#B64B44] cursor-pointer inline-flex items-center gap-1"
            title="回到群島全景"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>返回群島</span>
          </button>
          <button
            type="button"
            onClick={onDismissPanelOnly}
            aria-label="關閉導覽面板"
            className="p-1 hover:bg-black/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto parchment-scroll p-3.5 space-y-3.5 bg-[#F4EFE6]">
        {/* 對話對象切換列（可點 3D 角色或在此切換：島長 / 混合精靈島民 / 培育生物） */}
        <div className="p-2.5 bg-[#FFFDF9] border-2 border-[#2B4C7E]/30 space-y-2 text-xs">
          <div className="font-bold text-[#2B4C7E] flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#C85A53]" />
            <span>選擇對話對象（也可直接點擊 3D 島上住民）：</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                onSelectSpeaker({
                  zoneId: island.id,
                  speakerType: 'guardian',
                  speakerName: island.guardian.name,
                  timestamp: Date.now(),
                })
              }
              className={`px-2.5 py-1 font-bold border-2 cursor-pointer ${
                currentSpeakerType === 'guardian'
                  ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458]'
                  : 'bg-[#F4EFE6] text-[#2B4C7E] border-[#2B4C7E]/30 hover:border-[#2B4C7E]'
              }`}
            >
              {island.guardian.emoji} 島長 {island.guardian.name}
            </button>

            <button
              type="button"
              onClick={() =>
                onSelectSpeaker({
                  zoneId: island.id,
                  speakerType: 'resident',
                  speakerName: island.hybridResident.name,
                  timestamp: Date.now(),
                })
              }
              className={`px-2.5 py-1 font-bold border-2 cursor-pointer ${
                currentSpeakerType === 'resident'
                  ? 'bg-[#C85A53] text-[#F4EFE6] border-[#963B35]'
                  : 'bg-[#F4EFE6] text-[#C85A53] border-[#C85A53]/40 hover:border-[#C85A53]'
              }`}
            >
              {island.hybridResident.emoji} 島民 {island.hybridResident.name.split('「')[0]}
            </button>

            {islandHybrids.map((hyb) => (
              <button
                key={hyb.id}
                type="button"
                onClick={() =>
                  onSelectSpeaker({
                    zoneId: island.id,
                    speakerType: 'hybrid',
                    speakerId: hyb.id,
                    speakerName: hyb.name,
                    timestamp: Date.now(),
                  })
                }
                className={`px-2.5 py-1 font-bold border-2 cursor-pointer ${
                  currentSpeakerType === 'hybrid' && currentHybrid?.id === hyb.id
                    ? 'bg-[#527D3B] text-[#F4EFE6] border-[#385C27]'
                    : 'bg-[#F4EFE6] text-[#527D3B] border-[#527D3B]/40 hover:border-[#527D3B]'
                }`}
              >
                🧬 {hyb.name}
              </button>
            ))}
          </div>

          <div className="pt-1.5 border-t border-[#2B4C7E]/15 text-[11px] text-[#334155] space-y-1">
            <div className="font-semibold text-[#2B4C7E]">{island.creditsInfo}</div>
            <div>
              <strong>代表課程：</strong>
              {island.featuredCourses.slice(0, 3).join('、')}
            </div>
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[#527D3B] font-semibold truncate">
                ★ {island.awardsAndHighlights[0]}
              </span>
              <a
                href={island.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2B4C7E] hover:text-[#C85A53] font-bold inline-flex items-center gap-0.5 shrink-0 underline"
              >
                <span>學院官網</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 跨島任務線索提示卡 */}
        {hostedClueQuests.map((host) => {
          const cKey = host.miniQuest.clueItemName || '';
          const alreadyGot = progress.collectedClues.includes(cKey);
          return (
            <div
              key={host.id}
              className="p-3 bg-[#F2D894]/45 border-2 border-[#C85A53] text-xs space-y-2"
            >
              <div className="font-bold text-[#963B35] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>發現跨域線索地標：「{host.miniQuest.clueLandmarkName}」</span>
              </div>
              <p className="text-[#1E293B] leading-relaxed">
                「{host.trackName}」的任務線索就在這座島上！點擊 3D 地標或下方按鈕取得線索：
              </p>
              <div className="flex flex-wrap gap-2">
                {alreadyGot ? (
                  <span className="inline-flex items-center gap-1 font-bold text-[#527D3B]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>已取得：{host.miniQuest.clueCardText}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onCollectClue(cKey, host.miniQuest.clueCardText || '跨域線索卡')
                    }
                    className="voxel-btn-brick px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    🔍 調查地標取得線索卡 (+2⭐)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectZone(host.id)}
                  className="px-2.5 py-1 text-xs font-bold bg-[#FFFDF9] border border-[#2B4C7E] text-[#2B4C7E] cursor-pointer"
                >
                  前往交付任務：{host.shortLabel} →
                </button>
              </div>
            </div>
          );
        })}

        {/* 互動提問選單：依目前對話角色顯示「官方課程問答」或「精靈島民互動聊天」 */}
        {currentSpeakerType === 'resident' ? (
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#C85A53] flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>與「{island.hybridResident.name}」聊天互動：</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleResidentQuickPrompt('daily', '你在這座島上平常都在做什麼？')
                }
                className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFDF9] text-[#C85A53] border-2 border-[#C85A53]/40 hover:bg-[#C85A53] hover:text-[#F4EFE6] cursor-pointer"
              >
                你在島上平常做什麼？
              </button>
              <button
                type="button"
                onClick={() =>
                  handleResidentQuickPrompt('secret', '這組有什麼學習小秘密嗎？')
                }
                className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFDF9] text-[#C85A53] border-2 border-[#C85A53]/40 hover:bg-[#C85A53] hover:text-[#F4EFE6] cursor-pointer"
              >
                有什麼學習小秘密嗎？
              </button>
              <button
                type="button"
                onClick={() => handleResidentQuickPrompt('cheer', '跟我加油打氣一下吧！')}
                className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFDF9] text-[#C85A53] border-2 border-[#C85A53]/40 hover:bg-[#C85A53] hover:text-[#F4EFE6] cursor-pointer"
              >
                給我一點學習鼓勵！
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#2B4C7E] flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#C85A53]" />
              <span>點選官方問題向島長提問：</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {island.menuQuestions.map((mq) => (
                <button
                  key={mq.id}
                  type="button"
                  onClick={() => handleMenuQuestion(mq.id)}
                  className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFDF9] text-[#2B4C7E] border-2 border-[#2B4C7E]/40 hover:bg-[#2B4C7E] hover:text-[#F4EFE6] transition-colors cursor-pointer"
                >
                  {mq.question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 對話紀錄 */}
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2.5 text-xs leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458] ml-6'
                  : msg.sender === 'resident'
                    ? 'bg-[#FFF7F5] text-[#1E293B] border-[#C85A53]/50 mr-2'
                    : msg.sender === 'hybrid'
                      ? 'bg-[#F4FAF0] text-[#1E293B] border-[#6A994E]/50 mr-2'
                      : 'bg-[#FFFDF9] text-[#1E293B] border-[#2B4C7E]/30 mr-2'
              }`}
            >
              {msg.speakerLabel && msg.sender !== 'user' && (
                <div className="font-bold text-[11px] text-[#2B4C7E] mb-0.5">
                  {msg.speakerLabel}
                </div>
              )}
              {msg.isDemo && (
                <span className="inline-block mr-1.5 font-bold text-[#C85A53]">
                  【課堂示範】
                </span>
              )}
              <span>{msg.text}</span>
              {msg.sourceUrl && msg.sender !== 'user' && (
                <div className="mt-1.5 pt-1 border-t border-[#2B4C7E]/15 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-[#64748B] truncate">來源：{msg.sourceLabel}</span>
                  <a
                    href={msg.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C85A53] font-bold inline-flex items-center gap-0.5 shrink-0 hover:underline"
                  >
                    <span>原始連結</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 島嶼迷你任務 */}
        <div className="p-3 bg-[#FFFDF9] border-2 border-[#2B4C7E] space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[#2B4C7E] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C85A53]" />
              <span>{quest.title}</span>
            </span>
            {questCompleted && (
              <span className="text-[#6A994E] font-bold inline-flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>已完成</span>
              </span>
            )}
          </div>

          <p className="text-[#334155] leading-relaxed">{quest.description}</p>

          {quest.type === 'cross-island' && !clueCollected && quest.clueIslandId && (
            <div className="p-2.5 bg-[#EAE2D3] border border-[#2B4C7E]/30 space-y-2">
              <div className="font-bold text-[#C85A53]">
                尚未取得線索：請先前往目標島嶼調查「{quest.clueLandmarkName}」
              </div>
              <button
                type="button"
                onClick={() => onSelectZone(quest.clueIslandId as SelectableZoneId)}
                className="voxel-btn-navy px-3 py-1.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Compass className="w-3.5 h-3.5 text-[#E9C46A]" />
                <span>乘橋飛往線索島嶼 →</span>
              </button>
            </div>
          )}

          {clueCollected && !questCompleted && (
            <div className="space-y-2 pt-1 border-t border-[#2B4C7E]/15">
              {quest.clueCardText && (
                <div className="p-2 bg-[#E9C46A]/35 border border-[#D4A94B] text-[#1E293B] font-semibold">
                  ✓ 已持有線索卡：{quest.clueCardText}
                </div>
              )}
              <div className="font-bold text-[#1E293B]">{quest.questionPrompt}</div>
              <div className="space-y-1.5">
                {quest.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`block p-2 border cursor-pointer ${
                      selectedOptionId === opt.id
                        ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458]'
                        : 'bg-[#F4EFE6] text-[#1E293B] border-[#2B4C7E]/30 hover:border-[#2B4C7E]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`quest-${quest.id}`}
                      value={opt.id}
                      checked={selectedOptionId === opt.id}
                      onChange={() => {
                        setSelectedOptionId(opt.id);
                        setWrongOptionFeedback(false);
                      }}
                      className="sr-only"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              {wrongOptionFeedback && (
                <div className="text-[#C85A53] font-bold">
                  再想一下喔！提示：思考兩項專業該如何互相配合。
                </div>
              )}
              <button
                type="button"
                disabled={!selectedOptionId}
                onClick={handleSubmitQuestAnswer}
                className={`w-full py-2 px-3 text-xs font-bold ${
                  selectedOptionId
                    ? 'voxel-btn-brick cursor-pointer'
                    : 'bg-[#EAE2D3] text-[#94A3B8] border border-[#CBD5E1] cursor-not-allowed'
                }`}
              >
                提交答案並解鎖跨域解析 (+3⭐)
              </button>
            </div>
          )}

          {questCompleted && (
            <div className="p-2.5 bg-[#6A994E]/15 border border-[#6A994E] space-y-1.5">
              <div className="font-bold text-[#3E6B48] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>獲得徽章：{quest.badgeName}</span>
              </div>
              <div className="font-bold text-[#2B4C7E]">{quest.interdisciplinaryTitle}</div>
              <p className="text-[#1E293B] leading-relaxed">
                {quest.interdisciplinaryExplanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 軌道 B：自由輸入與島長／精靈島民對話 */}
      <form
        onSubmit={handleFreeQuestion}
        className="p-2.5 bg-[#EAE2D3] border-t-2 border-[#2B4C7E]/25 flex items-center gap-2"
      >
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder={
            currentSpeakerType === 'resident'
              ? `對 ${island.hybridResident.name.split('「')[0]} 說話（如：你好、日常、AI）…`
              : currentSpeakerType === 'hybrid' && currentHybrid
                ? `對 ${currentHybrid.name} 說話…`
                : '自由提問（AI、紅點、128學分、實習…）'
          }
          className="flex-1 px-2.5 py-1.5 text-xs bg-[#FFFDF9] border-2 border-[#2B4C7E]/40 focus:border-[#2B4C7E] focus:outline-none text-[#1E293B]"
        />
        <button
          type="submit"
          aria-label="發送對話"
          className="voxel-btn-navy px-3 py-1.5 text-xs font-bold cursor-pointer inline-flex items-center gap-1 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>發送</span>
        </button>
      </form>
    </aside>
  );
}
