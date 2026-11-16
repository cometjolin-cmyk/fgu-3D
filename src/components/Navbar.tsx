import React, { useMemo, useState } from 'react';
import {
  Compass,
  Dna,
  LayoutList,
  Newspaper,
  Search,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { CAMPUS_LANDMARKS, ISLANDS_DATA } from '../data/islandsData.js';
import {
  CampusLandmarkInfo,
  IslandData,
  LearningProgressState,
  SelectableZoneId,
} from '../types/island';

interface NavbarProps {
  showBrandInNavbar: boolean;
  progress: LearningProgressState;
  isFallbackMode: boolean;
  onGoOverview: () => void;
  onSelectZone: (id: SelectableZoneId) => void;
  onOpenNewsDecor: (tab: 'news' | 'decor', initialKeyword?: string) => void;
  onOpenIncubator: () => void;
  onOpenWorkshop: () => void;
  onToggleFallback: () => void;
}

export default function Navbar({
  showBrandInNavbar,
  progress,
  isFallbackMode,
  onGoOverview,
  onSelectZone,
  onOpenNewsDecor,
  onOpenIncubator,
  onOpenWorkshop,
  onToggleFallback,
}: NavbarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const allIslands = ISLANDS_DATA as unknown as IslandData[];
  const allLandmarks = CAMPUS_LANDMARKS as unknown as CampusLandmarkInfo[];

  const matchedIslands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allIslands
      .filter((item) => {
        const text =
          `${item.departmentName} ${item.trackName} ${item.styleTag} ${item.landmark.name} ${item.guardian.name} ${item.hybridResident.name}`.toLowerCase();
        return text.includes(q);
      })
      .slice(0, 4);
  }, [allIslands, query]);

  const matchedCampusLandmarks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allLandmarks
      .filter((lm) => `${lm.name} ${lm.levelTitle} ${lm.description}`.toLowerCase().includes(q))
      .slice(0, 3);
  }, [allLandmarks, query]);

  const matchGuishan = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Boolean(q) && ('龜山島'.includes(q) || q.includes('龜山') || q.includes('海景'));
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchedIslands.length > 0) {
      onSelectZone(matchedIslands[0].id);
      setQuery('');
      setFocused(false);
    } else if (matchedCampusLandmarks.length > 0) {
      onSelectZone('campus-mountain');
      setQuery('');
      setFocused(false);
    } else if (matchGuishan) {
      onSelectZone('guishan');
      setQuery('');
      setFocused(false);
    } else if (query.trim()) {
      onOpenNewsDecor('news', query.trim());
      setFocused(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#F4EFE6] border-b-2 border-[#2B4C7E] px-2.5 sm:px-4 py-2">
      <div className="max-w-[1480px] mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Zone 1: Brand Title */}
        <div
          className={`flex items-center shrink-0 transition-opacity duration-500 ${
            showBrandInNavbar ? 'opacity-100' : 'opacity-0 pointer-events-none sm:opacity-45'
          }`}
        >
          <button
            type="button"
            onClick={onGoOverview}
            className="flex items-center gap-2 text-left cursor-pointer whitespace-nowrap shrink-0 group"
            title="返回群島全景"
          >
            <span className="w-8 h-8 bg-[#2B4C7E] border-2 border-[#1C3458] flex items-center justify-center text-[#E9C46A] shadow-[2px_2px_0px_#C85A53] shrink-0">
              <Compass className="w-4 h-4" />
            </span>
            <span className="font-collegiate font-bold text-sm sm:text-base text-[#2B4C7E] group-hover:text-[#C85A53] transition-colors">
              佛光科技設計學習群島
            </span>
          </button>
        </div>

        {/* Zone 2: Global Search across 8 tracks + 17 landmarks + news */}
        <div className="relative flex-1 max-w-xs hidden lg:block">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="w-3.5 h-3.5 text-[#2B4C7E] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 180)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋學組島嶼、雲慧樓、雲五館或消息…"
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#FFFDF9] border-2 border-[#2B4C7E]/40 focus:border-[#2B4C7E] focus:outline-none text-[#1E293B]"
            />
          </form>

          {focused && query.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1 voxel-card bg-[#FFFDF9] z-40 divide-y divide-[#2B4C7E]/15">
              {matchedIslands.map((isl) => (
                <button
                  key={isl.id}
                  type="button"
                  onMouseDown={() => {
                    onSelectZone(isl.id);
                    setQuery('');
                    setFocused(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#EAE2D3] cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#2B4C7E]">
                    {isl.hybridResident.emoji} {isl.trackName}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {isl.departmentName} · {isl.landmark.name}
                  </div>
                </button>
              ))}
              {matchedCampusLandmarks.map((lm) => (
                <button
                  key={lm.name}
                  type="button"
                  onMouseDown={() => {
                    onSelectZone('campus-mountain');
                    setQuery('');
                    setFocused(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#EAE2D3] cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#527D3B]">
                    🏔️ {lm.number ? `#${lm.number} ` : ''}
                    {lm.name}
                  </div>
                  <div className="text-[11px] text-[#64748B]">{lm.levelTitle}</div>
                </button>
              ))}
              {matchGuishan && (
                <button
                  type="button"
                  onMouseDown={() => {
                    onSelectZone('guishan');
                    setQuery('');
                    setFocused(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#EAE2D3] cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#2D6F7D]">🐢 龜山島仙境（太平洋海景）</div>
                </button>
              )}
              <button
                type="button"
                onMouseDown={() => {
                  onOpenNewsDecor('news', query.trim());
                  setFocused(false);
                }}
                className="w-full px-3 py-2 text-left bg-[#F4EFE6] hover:bg-[#E9C46A]/40 text-xs font-bold text-[#C85A53] cursor-pointer"
              >
                在「學院動態」搜尋「{query.trim()}」→
              </button>
            </div>
          )}
        </div>

        {/* Zone 3: Interactive Systems & Mode Switch */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onOpenNewsDecor('news')}
            className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFDF9] text-[#2B4C7E] border-2 border-[#2B4C7E] hover:bg-[#F2D894] whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
          >
            <Newspaper className="w-3.5 h-3.5 text-[#C85A53]" />
            <span className="hidden sm:inline">學院動態</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNewsDecor('decor')}
            className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFDF9] text-[#2B4C7E] border-2 border-[#2B4C7E] hover:bg-[#F2D894] whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
          >
            <Trophy className="w-3.5 h-3.5 text-[#C85A53]" />
            <span className="hidden md:inline">成就裝飾</span>
            <span className="font-mono-tabular text-[#C85A53] inline-flex items-center gap-0.5">
              {progress.starEnergy}
              <Star className="w-3 h-3 fill-[#E9C46A] text-[#C85A53]" />
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenIncubator}
            className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFDF9] text-[#2B4C7E] border-2 border-[#2B4C7E] hover:bg-[#F2D894] whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
          >
            <Dna className="w-3.5 h-3.5 text-[#C85A53]" />
            <span className="hidden md:inline">雙基因培育</span>
          </button>

          <button
            type="button"
            onClick={onOpenWorkshop}
            className="voxel-btn-brick px-2.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{progress.playerConfig ? progress.playerConfig.nickname : '我的島民'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleFallback}
            className="voxel-btn-navy px-2.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
          >
            <LayoutList className="w-3.5 h-3.5 text-[#E9C46A]" />
            <span className="hidden sm:inline">{isFallbackMode ? '3D 群島' : '清單導覽'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
