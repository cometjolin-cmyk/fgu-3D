import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Mountain,
  RotateCcw,
  Waves,
} from 'lucide-react';
import { ISLANDS_DATA } from '../data/islandsData.js';
import { IslandData, LearningProgressState, SelectableZoneId } from '../types/island';

interface IslandDockProps {
  selectedZoneId: SelectableZoneId | null;
  progress: LearningProgressState;
  onGoOverview: () => void;
  onSelectZone: (id: SelectableZoneId) => void;
  onResetProgress: () => void;
}

export default function IslandDock({
  selectedZoneId,
  progress,
  onGoOverview,
  onSelectZone,
  onResetProgress,
}: IslandDockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const allIslands = ISLANDS_DATA as unknown as IslandData[];
  const totalIslands = allIslands.length;
  const completedCount = progress.completedQuests.length;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[97vw]">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="px-3 py-1 bg-[#F4EFE6] border-2 border-b-0 border-[#2B4C7E] text-[11px] font-bold text-[#2B4C7E] hover:text-[#C85A53] inline-flex items-center gap-1 cursor-pointer"
      >
        {collapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>
              展開群島導覽列（已探索 {progress.visitedZones.length}/10 · 任務 {completedCount}/
              {totalIslands}）
            </span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>收合群島導覽列</span>
          </>
        )}
      </button>

      {!collapsed && (
        <nav
          aria-label="雙層群島與實景山城快捷切換列"
          className="voxel-card px-2.5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full"
        >
          <button
            type="button"
            onClick={onGoOverview}
            className={`px-2.5 py-1.5 text-xs font-bold border-2 whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 transition-transform ${
              selectedZoneId === null
                ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458] -translate-y-0.5'
                : 'bg-[#FFFDF9] text-[#2B4C7E] border-[#2B4C7E]/30 hover:border-[#2B4C7E]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#E9C46A]" />
            <span>群島全景</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectZone('campus-mountain')}
            className={`px-2.5 py-1.5 text-xs font-bold border-2 whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 transition-transform ${
              selectedZoneId === 'campus-mountain'
                ? 'bg-[#527D3B] text-[#F4EFE6] border-[#385C27] -translate-y-0.5 shadow-[2px_2px_0px_#2B4C7E]'
                : 'bg-[#FFFDF9] text-[#385C27] border-[#527D3B]/40 hover:border-[#527D3B]'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>五級山城 (17地標)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectZone('guishan')}
            className={`px-2.5 py-1.5 text-xs font-bold border-2 whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 transition-transform ${
              selectedZoneId === 'guishan'
                ? 'bg-[#2D6F7D] text-[#F4EFE6] border-[#1A4B56] -translate-y-0.5 shadow-[2px_2px_0px_#2B4C7E]'
                : 'bg-[#FFFDF9] text-[#2D6F7D] border-[#4EA89E]/50 hover:border-[#2D6F7D]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>龜山島仙境</span>
          </button>

          <span className="w-px h-6 bg-[#2B4C7E]/25 shrink-0 mx-0.5" aria-hidden="true" />

          {allIslands.map((island) => {
            const active = selectedZoneId === island.id;
            const questDone = progress.completedQuests.includes(island.miniQuest.id);
            const visited = progress.visitedZones.includes(island.id);
            return (
              <button
                key={island.id}
                type="button"
                onClick={() => onSelectZone(island.id)}
                className={`px-2.5 py-1.5 text-xs font-bold border-2 whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 transition-transform ${
                  active
                    ? 'bg-[#C85A53] text-[#F4EFE6] border-[#963B35] -translate-y-0.5 shadow-[2px_2px_0px_#2B4C7E]'
                    : 'bg-[#FFFDF9] text-[#1E293B] border-[#2B4C7E]/30 hover:border-[#2B4C7E]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 inline-block border border-[#1E293B]/30 shrink-0"
                  style={{ backgroundColor: island.themeColors.primary }}
                />
                <span>{island.shortLabel}</span>
                {questDone ? (
                  <Check
                    className={`w-3.5 h-3.5 ${active ? 'text-[#F2D894]' : 'text-[#6A994E]'}`}
                  />
                ) : visited ? (
                  <span
                    className={`text-[10px] ${active ? 'text-[#F2D894]' : 'text-[#6C8EAD]'}`}
                  >
                    ●
                  </span>
                ) : null}
              </button>
            );
          })}

          <span className="w-px h-6 bg-[#2B4C7E]/25 shrink-0 mx-0.5" aria-hidden="true" />

          <button
            type="button"
            onClick={onResetProgress}
            title="重置任務與探索進度"
            className="px-2 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#C85A53] whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </nav>
      )}
    </div>
  );
}
