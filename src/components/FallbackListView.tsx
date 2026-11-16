import React from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Dna,
  ExternalLink,
  Mountain,
  Newspaper,
  Sparkles,
  Trophy,
  Waves,
} from 'lucide-react';
import { CAMPUS_LANDMARKS, COLLEGE_INFO, ISLANDS_DATA } from '../data/islandsData.js';
import {
  CampusLandmarkInfo,
  IslandData,
  LearningProgressState,
  SelectableZoneId,
} from '../types/island';

interface FallbackListViewProps {
  fromWebglError: boolean;
  progress: LearningProgressState;
  onSelectZone: (id: SelectableZoneId) => void;
  onOpenNewsDecor: (tab: 'news' | 'decor') => void;
  onOpenIncubator: () => void;
  onOpenWorkshop: () => void;
  onReturnTo3D: () => void;
}

export default function FallbackListView({
  fromWebglError,
  progress,
  onSelectZone,
  onOpenNewsDecor,
  onOpenIncubator,
  onOpenWorkshop,
  onReturnTo3D,
}: FallbackListViewProps) {
  const allIslands = ISLANDS_DATA as unknown as IslandData[];
  const allLandmarks = CAMPUS_LANDMARKS as unknown as CampusLandmarkInfo[];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="voxel-card p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-collegiate text-2xl font-bold text-[#2B4C7E]">
              {COLLEGE_INFO.archipelagoTitle} · 清單閱讀與互動模式
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              包含佛光大學實景山城五級階梯 17 大地標、龜山島與八大專業學組島嶼總覽
            </p>
          </div>
          {!fromWebglError && (
            <button
              type="button"
              onClick={onReturnTo3D}
              className="voxel-btn-navy px-4 py-2 text-xs font-bold cursor-pointer"
            >
              返回 3D 微縮群島
            </button>
          )}
        </div>

        {fromWebglError && (
          <div className="p-3 bg-[#F2D894] border-2 border-[#C85A53] text-[#1E293B] text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C85A53] shrink-0" />
            <span>
              目前環境無法啟用 WebGL 3D 場景，已自動切換為無障礙清單模式，所有課程問答、跨島任務、動態與培育功能皆可完整操作。
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span className="font-mono-tabular font-bold text-[#2B4C7E]">
            已探索區域 {progress.visitedZones.length}/10 · 完成任務{' '}
            {progress.completedQuests.length}/{allIslands.length} · 星能{' '}
            {progress.starEnergy} ⭐
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onOpenNewsDecor('news')}
              className="voxel-btn-navy px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Newspaper className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span>學院動態</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNewsDecor('decor')}
              className="voxel-btn-navy px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span>成就裝飾</span>
            </button>
            <button
              type="button"
              onClick={onOpenIncubator}
              className="voxel-btn-navy px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Dna className="w-3.5 h-3.5 text-[#E9C46A]" />
              <span>雙基因培育</span>
            </button>
            <button
              type="button"
              onClick={onOpenWorkshop}
              className="voxel-btn-brick px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>我的島民</span>
            </button>
          </div>
        </div>
      </div>

      {/* 中央五級山城與龜山島卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="voxel-card p-4 bg-[#FFFDF9] flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#527D3B] inline-flex items-center gap-1">
              <Mountain className="w-4 h-4" />
              <span>中央實景山城（Level 1 ～ Level 5）</span>
            </div>
            <h2 className="font-collegiate text-lg font-bold text-[#2B4C7E]">
              佛光大學實景山城 17 大校園地標
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              涵蓋校門牌樓、百萬人興學紀念館、雲慧樓創科學院總館與四大工坊、十六亭橋、滴水坊、林美射箭場、懷恩館、雲五館圖書館、德香樓操場及雲起樓觀海露台。
            </p>
            <div className="text-[11px] text-[#64748B]">
              共收錄 {allLandmarks.length} 項分級地標詳解
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectZone('campus-mountain')}
            className="voxel-btn-navy px-3 py-1.5 text-xs font-bold cursor-pointer self-end"
          >
            檢視五級山城地標清單
          </button>
        </article>

        <article className="voxel-card p-4 bg-[#FFFDF9] flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-[#2D6F7D] inline-flex items-center gap-1">
              <Waves className="w-4 h-4" />
              <span>太平洋遠眺景觀秘境</span>
            </div>
            <h2 className="font-collegiate text-lg font-bold text-[#2B4C7E]">
              龜山島仙境（翡翠果凍海龜）
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              從佛光大學 Level 5 雲起樓 360° 觀海露台東望太平洋即可欣賞的宜蘭精神地標，具備昂首龜首、龜甲火山錐與流動雲環。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectZone('guishan')}
            className="voxel-btn-navy px-3 py-1.5 text-xs font-bold cursor-pointer self-end"
          >
            開啟龜山島介紹
          </button>
        </article>
      </div>

      {/* 八大專業學組島嶼卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allIslands.map((island) => {
          const questDone = progress.completedQuests.includes(island.miniQuest.id);
          return (
            <article
              key={island.id}
              className="voxel-card p-4 bg-[#FFFDF9] flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#C85A53]">
                    {island.departmentName} · {island.styleTag}
                  </span>
                  {questDone && (
                    <span className="text-xs font-bold text-[#6A994E] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>任務完成</span>
                    </span>
                  )}
                </div>

                <h2 className="font-collegiate text-lg font-bold text-[#2B4C7E]">
                  {island.trackName}
                </h2>

                <div className="text-xs text-[#334155] space-y-1">
                  <div>
                    <strong>金冠島長：</strong>
                    {island.guardian.emoji} {island.guardian.name}
                  </div>
                  <div>
                    <strong>精靈島民：</strong>
                    {island.hybridResident.emoji} {island.hybridResident.name}（
                    {island.hybridResident.species}）
                  </div>
                  <div>
                    <strong>3D 地標：</strong>
                    {island.landmark.name}
                  </div>
                  <div className="flex items-start gap-1 pt-0.5">
                    <Award className="w-3.5 h-3.5 text-[#C85A53] shrink-0 mt-0.5" />
                    <span>迷你任務：{island.miniQuest.title}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2B4C7E]/15 flex items-center justify-between gap-2">
                <a
                  href={island.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#2B4C7E] hover:text-[#C85A53] inline-flex items-center gap-1 underline"
                >
                  <span>學院官網</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => onSelectZone(island.id)}
                  className="voxel-btn-navy px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  登陸島嶼與對話
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
