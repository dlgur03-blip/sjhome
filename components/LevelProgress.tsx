"use client";

import { calculateLevel } from "@/types";

interface LevelProgressProps {
  totalExp: number;
  showDetails?: boolean;
}

export default function LevelProgress({ totalExp, showDetails = false }: LevelProgressProps) {
  const levelInfo = calculateLevel(totalExp);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* 레벨 배지 */}
          <div className="w-8 h-8 rounded-full bg-[#CCFF00] text-black font-bold text-sm flex items-center justify-center lime-glow-sm">
            {levelInfo.level}
          </div>
          <span className="text-[#CCFF00] font-medium text-sm">
            {levelInfo.name}
          </span>
        </div>
        
        {showDetails && (
          <span className="text-gray-400 text-xs">
            {levelInfo.currentExp} / {levelInfo.nextExp} XP
          </span>
        )}
      </div>
      
      {/* 경험치 바 */}
      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88cc00] rounded-full transition-all duration-500 progress-glow"
          style={{ width: `${levelInfo.progress}%` }}
        />
      </div>
      
      {showDetails && (
        <p className="text-gray-500 text-xs mt-1">
          다음 레벨까지 {levelInfo.nextExp - levelInfo.currentExp} XP 필요
        </p>
      )}
    </div>
  );
}
