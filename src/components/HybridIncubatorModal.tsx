import React, { useState } from 'react';
import { Dna, Sparkles, X } from 'lucide-react';
import { HYBRID_GENES, ISLANDS_DATA } from '../data/islandsData.js';
import {
  HybridCreatureRecord,
  HybridGeneSpecies,
  TrackIslandId,
} from '../types/island';

interface HybridIncubatorModalProps {
  isOpen: boolean;
  hybrids: HybridCreatureRecord[];
  onDeployHybrid: (record: HybridCreatureRecord) => void;
  onClose: () => void;
}

export default function HybridIncubatorModal({
  isOpen,
  hybrids,
  onDeployHybrid,
  onClose,
}: HybridIncubatorModalProps) {
  const [geneA, setGeneA] = useState<HybridGeneSpecies>('capybara');
  const [geneB, setGeneB] = useState<HybridGeneSpecies>('owl');
  const [customName, setCustomName] = useState('');
  const [assignedIslandId, setAssignedIslandId] = useState<TrackIslandId>('ai-sys');

  if (!isOpen) return null;

  const infoA = HYBRID_GENES.find((g) => g.id === geneA);
  const infoB = HYBRID_GENES.find((g) => g.id === geneB);
  const previewName =
    customName.trim() || `${infoA?.label ?? ''}${infoB?.label ?? ''}小精靈`;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onDeployHybrid({
      id: `hybrid-${Date.now()}`,
      name: previewName,
      geneA,
      geneB,
      assignedIslandId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setCustomName('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E293B]/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incubator-modal-title"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col voxel-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 bg-[#2B4C7E] text-[#F4EFE6] flex items-center justify-between border-b-2 border-[#1C3458]">
          <div>
            <h2 id="incubator-modal-title" className="font-collegiate text-lg font-bold">
              🧬 雙基因混合生物培育機
            </h2>
            <p className="text-xs text-[#F2D894]">
              任選兩組基因（水豚、貓頭鷹、靈狐、海獺、森鹿、巨鯨）融合培育並部署至任一專業島嶼！
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉雙基因培育機"
            className="p-1.5 hover:bg-black/20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleCreate}
          className="flex-1 overflow-y-auto parchment-scroll p-4 space-y-4 bg-[#F4EFE6] text-xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 基因 A */}
            <div className="p-3 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 space-y-2">
              <div className="font-bold text-[#2B4C7E]">基因 A（基礎體型與主色）</div>
              <div className="grid grid-cols-2 gap-1.5">
                {HYBRID_GENES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGeneA(g.id as HybridGeneSpecies)}
                    className={`p-2 border text-left cursor-pointer ${
                      geneA === g.id
                        ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458]'
                        : 'bg-[#F4EFE6] text-[#1E293B] border-[#2B4C7E]/25'
                    }`}
                  >
                    <div className="font-bold">
                      {g.emoji} {g.label}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-[#64748B]">特徵：{infoA?.trait}</div>
            </div>

            {/* 基因 B */}
            <div className="p-3 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 space-y-2">
              <div className="font-bold text-[#C85A53]">基因 B（雙翼／頂飾與點綴色）</div>
              <div className="grid grid-cols-2 gap-1.5">
                {HYBRID_GENES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGeneB(g.id as HybridGeneSpecies)}
                    className={`p-2 border text-left cursor-pointer ${
                      geneB === g.id
                        ? 'bg-[#C85A53] text-[#F4EFE6] border-[#963B35]'
                        : 'bg-[#F4EFE6] text-[#1E293B] border-[#2B4C7E]/25'
                    }`}
                  >
                    <div className="font-bold">
                      {g.emoji} {g.label}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-[#64748B]">特徵：{infoB?.trait}</div>
            </div>
          </div>

          {/* 命名與部署目標島 */}
          <div className="p-3 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#2B4C7E] mb-1">混合精靈名稱</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`預設：${infoA?.label ?? ''}${infoB?.label ?? ''}小精靈`}
                className="w-full px-2.5 py-1.5 bg-[#F4EFE6] border-2 border-[#2B4C7E]/30 focus:border-[#2B4C7E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2B4C7E] mb-1">部署至指定學組島嶼</label>
              <select
                value={assignedIslandId}
                onChange={(e) => setAssignedIslandId(e.target.value as TrackIslandId)}
                className="w-full px-2.5 py-1.5 bg-[#F4EFE6] border-2 border-[#2B4C7E]/30 focus:border-[#2B4C7E] focus:outline-none"
              >
                {ISLANDS_DATA.map((isl) => (
                  <option key={isl.id} value={isl.id}>
                    {isl.trackName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#E9C46A]/35 border-2 border-[#D4A94B]">
            <div className="font-bold text-[#1E293B] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C85A53]" />
              <span>
                培育預覽：{infoA?.emoji}×{infoB?.emoji} 「{previewName}」
              </span>
            </div>
            <button
              type="submit"
              className="voxel-btn-brick px-4 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Dna className="w-4 h-4" />
              <span>立即融合並放上 3D 島嶼</span>
            </button>
          </div>

          {/* 已部署清冊 */}
          {hybrids.length > 0 && (
            <div className="space-y-1.5">
              <div className="font-bold text-[#2B4C7E]">
                目前已培育部署的島嶼精靈（{hybrids.length} 隻）
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hybrids.map((h) => {
                  const target = ISLANDS_DATA.find((i) => i.id === h.assignedIslandId);
                  return (
                    <div
                      key={h.id}
                      className="p-2 bg-[#FFFDF9] border border-[#2B4C7E]/25 flex items-center justify-between gap-2"
                    >
                      <span className="font-bold text-[#1E293B]">{h.name}</span>
                      <span className="text-[11px] text-[#64748B] truncate">
                        駐點：{target?.shortLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
