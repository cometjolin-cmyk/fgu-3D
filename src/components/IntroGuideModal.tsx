import React from 'react';
import { Compass, MessageSquareHeart, Mountain, Sparkles, X } from 'lucide-react';

interface IntroGuideModalProps {
  isOpen: boolean;
  onStartWorkshop: () => void;
  onSkip: () => void;
}

export default function IntroGuideModal({
  isOpen,
  onStartWorkshop,
  onSkip,
}: IntroGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E293B]/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-guide-title"
    >
      <div className="w-full max-w-lg voxel-card overflow-hidden">
        <div className="px-5 py-4 bg-[#2B4C7E] text-[#F4EFE6] border-b-2 border-[#1C3458] flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-[#F2D894]">
              WELCOME TO FO GUANG ARCHIPELAGO
            </div>
            <h2 id="intro-guide-title" className="font-collegiate text-xl font-bold mt-0.5">
              歡迎登陸「佛光科技設計學習群島」
            </h2>
          </div>
          <button
            type="button"
            onClick={onSkip}
            aria-label="略過新手引導"
            className="p-1 hover:bg-black/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 bg-[#F4EFE6] text-xs sm:text-sm text-[#1E293B]">
          <p className="leading-relaxed text-[#334155]">
            在開始探索<strong>佛光大學應用科技與設計學院</strong>之前，先花 10 秒鐘建立專屬你的
            <strong> 3D 虛擬果凍島民</strong>吧！設定完成後，你就能在群島間跳躍漫步、與島長和精靈島民對話，並解鎖跨島任務。
          </p>

          <div className="space-y-2.5">
            <div className="p-2.5 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 flex items-start gap-2.5">
              <Mountain className="w-4 h-4 text-[#527D3B] shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-[#2B4C7E]">實景五級山城 × 八大學組群島：</strong>
                <span>中央還原雲慧樓、雲五館、十六亭橋與龜山島；外環 8 座特色六角島等你登陸。</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 flex items-start gap-2.5">
              <MessageSquareHeart className="w-4 h-4 text-[#C85A53] shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-[#2B4C7E]">點擊島上住民即可即時對話：</strong>
                <span>點擊 3D 島長、混合精靈島民或你培育的生物，就能向他們提問與互動。</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-[#2B4C7E] shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-[#2B4C7E]">個人化分身與地面跳躍：</strong>
                <span>選擇動物原型、馬卡龍色與頭頂氣泡，點擊目前島嶼地面就能拋物線跳躍！</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#EAE2D3] border-t-2 border-[#2B4C7E]/25 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-3 py-2 text-xs font-bold text-[#475569] hover:text-[#1E293B] cursor-pointer"
          >
            先逛逛群島（稍後再設定）
          </button>
          <button
            type="button"
            onClick={onStartWorkshop}
            className="voxel-btn-brick px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>立即設定我的虛擬島民 →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
