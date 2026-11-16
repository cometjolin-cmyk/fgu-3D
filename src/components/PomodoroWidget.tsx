import React, { useEffect, useState } from 'react';
import { Award, ChevronDown, ChevronUp, Pause, Play, RotateCcw, Timer } from 'lucide-react';

interface PomodoroWidgetProps {
  isStudying: boolean;
  completedCount: number;
  onStudyingChange: (studying: boolean) => void;
  onCompleteSession: (rewardStars: number) => void;
}

export default function PomodoroWidget({
  isStudying,
  completedCount,
  onStudyingChange,
  onCompleteSession,
}: PomodoroWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [presetMinutes, setPresetMinutes] = useState<25 | 50>(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    if (!isStudying) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onStudyingChange(false);
          onCompleteSession(presetMinutes === 50 ? 5 : 3);
          return presetMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isStudying, presetMinutes, onStudyingChange, onCompleteSession]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const switchDuration = (m: 25 | 50) => {
    onStudyingChange(false);
    setPresetMinutes(m);
    setSecondsLeft(m * 60);
  };

  return (
    <div className="fixed left-3 top-16 z-20 flex flex-col items-start">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={`px-3 py-1.5 text-xs font-bold border-2 inline-flex items-center gap-1.5 cursor-pointer ${
          isStudying
            ? 'bg-[#C85A53] text-[#F4EFE6] border-[#963B35] shadow-[2px_2px_0px_#2B4C7E]'
            : 'bg-[#F4EFE6] text-[#2B4C7E] border-[#2B4C7E] shadow-[2px_2px_0px_#2B4C7E]'
        }`}
      >
        <Timer className="w-3.5 h-3.5" />
        <span className="font-mono-tabular">
          {isStudying ? `專注自習 ${mins}:${secs}` : '🍅 雲五館番茄鐘'}
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="mt-1.5 w-64 voxel-card p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#2B4C7E]">共伴讀番茄鐘</span>
            <span className="text-[11px] font-mono-tabular text-[#64748B]">
              累計完成 {completedCount} 次
            </span>
          </div>

          <div className="text-center py-2 bg-[#FFFDF9] border-2 border-[#2B4C7E]/25">
            <div className="font-mono-tabular text-2xl font-bold text-[#2B4C7E]">
              {mins}:{secs}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">
              {isStudying ? '✨ 島民已亮起金色學習光環！' : '啟動後 3D 島民腳下將出現學習光環'}
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => switchDuration(25)}
              className={`flex-1 py-1 font-bold border cursor-pointer ${
                presetMinutes === 25
                  ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458]'
                  : 'bg-[#FFFDF9] text-[#2B4C7E] border-[#2B4C7E]/30'
              }`}
            >
              25 分鐘 (+3⭐)
            </button>
            <button
              type="button"
              onClick={() => switchDuration(50)}
              className={`flex-1 py-1 font-bold border cursor-pointer ${
                presetMinutes === 50
                  ? 'bg-[#2B4C7E] text-[#F4EFE6] border-[#1C3458]'
                  : 'bg-[#FFFDF9] text-[#2B4C7E] border-[#2B4C7E]/30'
              }`}
            >
              50 分鐘 (+5⭐)
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onStudyingChange(!isStudying)}
              className="flex-1 voxel-btn-navy py-1.5 font-bold cursor-pointer inline-flex items-center justify-center gap-1"
            >
              {isStudying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStudying ? '暫停' : '開始自習'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onStudyingChange(false);
                setSecondsLeft(presetMinutes * 60);
              }}
              aria-label="重設番茄鐘"
              className="px-2.5 py-1.5 bg-[#FFFDF9] border-2 border-[#2B4C7E]/40 text-[#2B4C7E] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onStudyingChange(false);
              setSecondsLeft(presetMinutes * 60);
              onCompleteSession(2);
            }}
            className="w-full py-1.5 bg-[#F2D894] hover:bg-[#E9C46A] border border-[#2B4C7E] font-bold text-[#1E293B] inline-flex items-center justify-center gap-1 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-[#C85A53]" />
            <span>課堂示範：完成一回合自習 (+2⭐)</span>
          </button>
        </div>
      )}
    </div>
  );
}
