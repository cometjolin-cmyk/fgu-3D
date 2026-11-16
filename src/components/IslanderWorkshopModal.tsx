import React, { useState } from 'react';
import { Sparkles, UserCheck, X } from 'lucide-react';
import {
  ISLANDER_ACCESSORIES,
  ISLANDER_PROTOTYPES,
  MACARON_COLORS,
} from '../data/islandsData.js';
import {
  IslanderAccessory,
  IslanderPrototype,
  PlayerIslanderConfig,
} from '../types/island';

interface IslanderWorkshopModalProps {
  isOpen: boolean;
  currentConfig: PlayerIslanderConfig | null;
  onSave: (config: PlayerIslanderConfig) => void;
  onClose: () => void;
}

export default function IslanderWorkshopModal({
  isOpen,
  currentConfig,
  onSave,
  onClose,
}: IslanderWorkshopModalProps) {
  const [studentId, setStudentId] = useState(currentConfig?.studentId ?? '');
  const [nickname, setNickname] = useState(currentConfig?.nickname ?? '佛光探索者');
  const [prototype, setPrototype] = useState<IslanderPrototype>(
    currentConfig?.prototype ?? 'fox'
  );
  const [bodyColor, setBodyColor] = useState(
    currentConfig?.bodyColor ?? MACARON_COLORS[0].hex
  );
  const [accessory, setAccessory] = useState<IslanderAccessory>(
    currentConfig?.accessory ?? 'grad-cap'
  );
  const [speechText, setSpeechText] = useState(
    currentConfig?.speechText ?? '準備好探索 128 學分群島囉！'
  );

  if (!isOpen) return null;

  const submitWithGuest = (isGuest: boolean) => {
    const cleanNick = nickname.trim() || (isGuest ? '訪客探索者' : '佛光新鮮人');
    onSave({
      studentId: isGuest ? 'GUEST' : studentId.trim() || '1150001',
      nickname: cleanNick,
      isGuest,
      prototype,
      bodyColor,
      accessory,
      speechText: speechText.trim() || `${cleanNick} 正在群島學習中！`,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E293B]/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workshop-modal-title"
    >
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col voxel-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 bg-[#2B4C7E] text-[#F4EFE6] flex items-center justify-between border-b-2 border-[#1C3458]">
          <div>
            <h2 id="workshop-modal-title" className="font-collegiate text-lg font-bold">
              🦊 個人果凍島民工坊
            </h2>
            <p className="text-xs text-[#F2D894]">
              自訂專屬體素分身與頭頂對話氣泡，點擊目前所在島嶼地面即可跳躍漫步！
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉島民工坊"
            className="p-1.5 hover:bg-black/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto parchment-scroll p-4 space-y-4 bg-[#F4EFE6] text-xs">
          {/* 身分登入 */}
          <div className="p-3 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#2B4C7E] mb-1">
                學號（或選一鍵訪客體驗）
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="例如：11504012"
                className="w-full px-2.5 py-1.5 bg-[#F4EFE6] border-2 border-[#2B4C7E]/30 focus:border-[#2B4C7E] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2B4C7E] mb-1">島民暱稱</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="輸入顯示名稱"
                className="w-full px-2.5 py-1.5 bg-[#F4EFE6] border-2 border-[#2B4C7E]/30 focus:border-[#2B4C7E] focus:outline-none"
              />
            </div>
          </div>

          {/* 4 種動物原型 */}
          <div>
            <div className="font-bold text-[#2B4C7E] mb-1.5">1. 選擇體素原型（4 款）</div>
            <div className="grid grid-cols-2 gap-2">
              {ISLANDER_PROTOTYPES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPrototype(p.id as IslanderPrototype)}
                  className={`p-2.5 text-left border-2 cursor-pointer transition-colors ${
                    prototype === p.id
                      ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458]'
                      : 'bg-[#FFFDF9] text-[#1E293B] border-[#2B4C7E]/30 hover:border-[#2B4C7E]'
                  }`}
                >
                  <div className="font-bold">
                    {p.emoji} {p.label}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      prototype === p.id ? 'text-[#F2D894]' : 'text-[#64748B]'
                    }`}
                  >
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 5 種馬卡龍體色 */}
          <div>
            <div className="font-bold text-[#2B4C7E] mb-1.5">2. 選擇果凍馬卡龍體色（5 色）</div>
            <div className="flex flex-wrap gap-2">
              {MACARON_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setBodyColor(c.hex)}
                  className={`px-3 py-1.5 border-2 font-bold inline-flex items-center gap-1.5 cursor-pointer ${
                    bodyColor === c.hex
                      ? 'bg-[#EAE2D3] border-[#C85A53] text-[#1E293B]'
                      : 'bg-[#FFFDF9] border-[#2B4C7E]/25 text-[#334155]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 inline-block border border-[#1E293B]/40"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4 種配件 */}
          <div>
            <div className="font-bold text-[#2B4C7E] mb-1.5">3. 選擇學院配件（4 款）</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ISLANDER_ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccessory(acc.id as IslanderAccessory)}
                  className={`p-2 border-2 font-bold text-center cursor-pointer ${
                    accessory === acc.id
                      ? 'bg-[#C85A53] text-[#F4EFE6] border-[#963B35]'
                      : 'bg-[#FFFDF9] text-[#1E293B] border-[#2B4C7E]/25 hover:border-[#2B4C7E]'
                  }`}
                >
                  <div>{acc.emoji}</div>
                  <div className="mt-0.5">{acc.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 頭頂 3D 氣泡文字 */}
          <div>
            <label className="block font-bold text-[#2B4C7E] mb-1">
              4. 頭頂 3D 氣泡文字（即時顯示於 3D 場景上方）
            </label>
            <input
              type="text"
              maxLength={24}
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              placeholder="輸入你想展示在頭頂的話..."
              className="w-full px-3 py-2 bg-[#FFFDF9] border-2 border-[#2B4C7E]/40 focus:border-[#2B4C7E] focus:outline-none"
            />
          </div>
        </div>

        <div className="px-4 py-3 bg-[#EAE2D3] border-t-2 border-[#2B4C7E]/25 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => submitWithGuest(true)}
            className="px-3.5 py-2 text-xs font-bold bg-[#FFFDF9] text-[#2B4C7E] border-2 border-[#2B4C7E] hover:bg-[#F2D894] cursor-pointer inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C85A53]" />
            <span>一鍵訪客體驗</span>
          </button>
          <button
            type="button"
            onClick={() => submitWithGuest(false)}
            className="voxel-btn-brick px-4 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>儲存島民並登陸 3D 群島</span>
          </button>
        </div>
      </div>
    </div>
  );
}
