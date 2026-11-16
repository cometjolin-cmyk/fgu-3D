import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import { DECORATION_CATALOG, ISLANDS_DATA } from '../data/islandsData.js';
import { fetchCollegeNews } from '../services/newsService';
import {
  DecorationType,
  LearningProgressState,
  NewsFetchResult,
  TrackIslandId,
} from '../types/island';

const CATEGORIES = ['全部', '專題成果', '課程工作坊', '展覽活動', '產學實習'];

interface NewsDecorModalProps {
  isOpen: boolean;
  initialTab?: 'news' | 'decor';
  initialKeyword?: string;
  progress: LearningProgressState;
  onClaimNewsStar: (newsId: string, stars: number) => void;
  onUnlockAndPlaceDecoration: (
    type: DecorationType,
    cost: number,
    targetZone: TrackIslandId | 'campus-mountain'
  ) => void;
  onClose: () => void;
}

export default function NewsDecorModal({
  isOpen,
  initialTab = 'news',
  initialKeyword = '',
  progress,
  onClaimNewsStar,
  onUnlockAndPlaceDecoration,
  onClose,
}: NewsDecorModalProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'decor'>(initialTab);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetZone, setTargetZone] = useState<TrackIslandId | 'campus-mountain'>('campus-mountain');
  const [newsState, setNewsState] = useState<NewsFetchResult>({
    items: [],
    fromCache: false,
    lastSuccessSyncAt: '',
    warningMessage: null,
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (initialKeyword) setKeyword(initialKeyword);
    }
  }, [isOpen, initialTab, initialKeyword]);

  const loadNews = async (shouldFail: boolean) => {
    setLoading(true);
    const result = await fetchCollegeNews({ simulateFailure: shouldFail });
    setNewsState(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      void loadNews(simulateFailure);
    }
  }, [isOpen, simulateFailure]);

  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return newsState.items.filter((item) => {
      if (selectedCategory !== '全部' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [newsState.items, keyword, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E293B]/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-decor-modal-title"
    >
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col voxel-card overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 bg-[#2B4C7E] text-[#F4EFE6] flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1C3458]">
          <div>
            <h2 id="news-decor-modal-title" className="font-collegiate text-lg sm:text-xl font-bold">
              學院動態快報 ＆ 成就 3D 裝飾系統
            </h2>
            <p className="text-xs text-[#F2D894]">
              閱讀公告與專注自習可累積 ⭐ 星能，用於解鎖並佈置 3D 群島建築裝飾！
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#F2D894] text-[#1E293B] border border-[#1C3458] text-xs font-mono-tabular font-bold inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#C85A53] fill-[#C85A53]" />
              <span>目前星能：{progress.starEnergy} ⭐</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉學院動態與裝飾視窗"
              className="p-1.5 hover:bg-black/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b-2 border-[#2B4C7E]/25 bg-[#EAE2D3]">
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'news'
                ? 'bg-[#F4EFE6] text-[#2B4C7E] border-r-2 border-[#2B4C7E]/25'
                : 'text-[#475569] hover:text-[#2B4C7E]'
            }`}
          >
            <Newspaper className="w-4 h-4 text-[#C85A53]" />
            <span>📢 學院動態清單（可領星能 ＋ 失敗備援）</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('decor')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'decor'
                ? 'bg-[#F4EFE6] text-[#2B4C7E] border-l-2 border-[#2B4C7E]/25'
                : 'text-[#475569] hover:text-[#2B4C7E]'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#C85A53]" />
            <span>🏆 成就 3D 裝飾兌換與佈置（4 款）</span>
          </button>
        </div>

        {activeTab === 'news' ? (
          <>
            {newsState.fromCache && newsState.warningMessage && (
              <div
                role="alert"
                className="px-4 sm:px-6 py-2.5 bg-[#F2D894] border-b-2 border-[#C85A53] text-[#1E293B] text-xs font-bold flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-[#C85A53] shrink-0" />
                <span>{newsState.warningMessage}</span>
              </div>
            )}

            <div className="p-4 bg-[#EAE2D3] border-b border-[#2B4C7E]/20 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#2B4C7E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜尋公告標題、關鍵字（如紅點、AI、攝影棚、竹木構…）"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FFFDF9] border-2 border-[#2B4C7E]/40 focus:border-[#2B4C7E] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSimulateFailure((prev) => !prev)}
                  className={`px-3 py-2 text-xs font-bold border-2 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                    simulateFailure
                      ? 'bg-[#C85A53] text-[#F4EFE6] border-[#963B35]'
                      : 'bg-[#FFFDF9] text-[#2B4C7E] border-[#2B4C7E]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{simulateFailure ? '模擬官網抓取失敗：開啟' : '模擬官網抓取失敗'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-xs font-semibold border cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458]'
                          : 'bg-[#FFFDF9] text-[#334155] border-[#2B4C7E]/25'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#475569]">
                  <Database className="w-3.5 h-3.5 text-[#2B4C7E]" />
                  <span>最近更新：{newsState.lastSuccessSyncAt || '—'}</span>
                  <button
                    type="button"
                    onClick={() => void loadNews(simulateFailure)}
                    className="text-[#2B4C7E] hover:text-[#C85A53] font-sans font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>重新同步</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto parchment-scroll p-4 space-y-3 bg-[#F4EFE6]">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#475569] bg-[#FFFDF9] border border-[#2B4C7E]/25">
                  找不到符合「{keyword}」的學院消息，請嘗試其他關鍵字。
                </div>
              ) : (
                filteredItems.map((item) => {
                  const claimed = progress.claimedNewsIds.includes(item.id);
                  return (
                    <article
                      key={item.id}
                      className="p-3.5 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] font-mono-tabular">
                        <span>
                          {item.category} · 公告日期 {item.publishedAt} · 本站更新{' '}
                          {item.siteUpdatedAt}
                        </span>
                        {item.isDemo && (
                          <span className="font-sans font-bold text-[#C85A53]">課堂示範</span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-[#1E293B]">{item.title}</h3>
                      <p className="text-xs text-[#475569] leading-relaxed">{item.summary}</p>
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2B4C7E] hover:text-[#C85A53] underline underline-offset-2"
                        >
                          <span>查看官網原始來源</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {claimed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#527D3B]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>已領取 +{item.starReward} ⭐</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onClaimNewsStar(item.id, item.starReward)}
                            className="voxel-btn-brick px-3 py-1 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>簽到領取 +{item.starReward} ⭐</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto parchment-scroll p-4 space-y-4 bg-[#F4EFE6] text-xs">
            <div className="p-3 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold text-[#2B4C7E]">選擇 3D 裝飾擺放地點</div>
                <div className="text-[11px] text-[#64748B]">
                  兌換後將即時實例化並永久保存至您的 3D 群島中！
                </div>
              </div>
              <select
                value={targetZone}
                onChange={(e) =>
                  setTargetZone(e.target.value as TrackIslandId | 'campus-mountain')
                }
                className="px-3 py-1.5 bg-[#F4EFE6] border-2 border-[#2B4C7E] font-bold text-[#1E293B]"
              >
                <option value="campus-mountain">🏔️ 中央佛光實景山城（雲慧樓前）</option>
                {ISLANDS_DATA.map((isl) => (
                  <option key={isl.id} value={isl.id}>
                    🏝️ {isl.trackName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DECORATION_CATALOG.map((decor) => {
                const canAfford = progress.starEnergy >= decor.cost;
                const countPlaced = progress.placedDecorations.filter(
                  (d) => d.type === decor.id
                ).length;

                return (
                  <div
                    key={decor.id}
                    className="p-3.5 bg-[#FFFDF9] border-2 border-[#2B4C7E]/30 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#2B4C7E]">
                          {decor.emoji} {decor.name}
                        </span>
                        <span className="font-mono-tabular font-bold text-[#C85A53]">
                          {decor.cost} ⭐
                        </span>
                      </div>
                      <p className="text-[#475569] mt-1 leading-relaxed">{decor.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2B4C7E]/15">
                      <span className="text-[11px] text-[#64748B]">
                        已放置 {countPlaced} 座
                      </span>
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() =>
                          onUnlockAndPlaceDecoration(
                            decor.id as DecorationType,
                            decor.cost,
                            targetZone
                          )
                        }
                        className={`px-3 py-1.5 font-bold ${
                          canAfford
                            ? 'voxel-btn-navy cursor-pointer'
                            : 'bg-[#EAE2D3] text-[#94A3B8] border border-[#CBD5E1] cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? '兌換並放置於 3D 場景' : '星能不足'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
