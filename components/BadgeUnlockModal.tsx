"use client";

import { useEffect, useState } from "react";
import { BADGE_INFO, AchievementType } from "@/types";

interface BadgeUnlockModalProps {
  achievementType: AchievementType | null;
  onClose: () => void;
}

export default function BadgeUnlockModal({ achievementType, onClose }: BadgeUnlockModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievementType) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievementType, onClose]);

  if (!achievementType) return null;

  const badge = BADGE_INFO[achievementType];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative bg-[#171717] border border-[#333] rounded-2xl p-8 text-center transform transition-all duration-500 ${
        isVisible ? 'scale-100' : 'scale-75'
      }`}>
        {/* 글로우 배경 */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
          style={{ backgroundColor: badge.color }}
        />
        
        <div className="relative">
          {/* 뱃지 아이콘 */}
          <div 
            className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-5xl badge-unlock"
            style={{ 
              backgroundColor: `${badge.color}20`,
              boxShadow: `0 0 30px ${badge.color}50`,
            }}
          >
            {badge.icon}
          </div>

          {/* 뱃지 획득 텍스트 */}
          <p className="text-[#CCFF00] text-sm font-medium mb-2 tracking-wider">
            🎉 뱃지 획득!
          </p>
          
          {/* 뱃지 이름 */}
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: badge.color }}
          >
            {badge.name}
          </h2>
          
          {/* 뱃지 설명 */}
          <p className="text-gray-400 text-sm">
            {badge.description}
          </p>
        </div>
      </div>
    </div>
  );
}
