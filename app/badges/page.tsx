"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getSessionLicense } from "@/lib/device";
import { BADGE_INFO, AchievementType, UserAchievement, calculateLevel, LEVEL_THRESHOLDS } from "@/types";
import { ChevronLeft, Award, Lock, Sparkles } from "lucide-react";
import LevelProgress from "@/components/LevelProgress";

export default function BadgesPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [totalExp, setTotalExp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { key } = getSessionLicense();
    if (!key) {
      router.push("/");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const supabase = getSupabase();
    const { key } = getSessionLicense();

    const { data: licenseData } = await supabase
      .from("license_keys")
      .select("id")
      .eq("key", key)
      .single();

    if (licenseData) {
      // 업적 가져오기
      const { data: achievementsData } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("license_key_id", licenseData.id);

      if (achievementsData) {
        setAchievements(achievementsData);
      }

      // 진도율로 경험치 계산
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("license_key_id", licenseData.id);

      if (progressData) {
        const completedCount = progressData.filter(p => p.is_completed).length;
        setTotalExp(completedCount * 50);
      }
    }

    setIsLoading(false);
  };

  const allBadgeTypes = Object.keys(BADGE_INFO) as AchievementType[];
  const unlockedTypes = new Set(achievements.map(a => a.achievement_type));
  const levelInfo = calculateLevel(totalExp);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#333] border-t-[#CCFF00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* 배경 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-[#1a1a1a] sticky top-0">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">돌아가기</span>
          </button>
          <h1 className="font-semibold text-white">업적</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 레벨 카드 */}
        <div className="bg-gradient-to-br from-[#CCFF00]/10 to-transparent border border-[#CCFF00]/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-6">
            {/* 레벨 뱃지 */}
            <div className="w-24 h-24 rounded-full bg-[#CCFF00] flex items-center justify-center lime-glow">
              <span className="text-4xl font-bold text-black">{levelInfo.level}</span>
            </div>
            
            <div className="flex-1">
              <p className="text-[#CCFF00] text-sm font-medium mb-1">현재 레벨</p>
              <h2 className="text-2xl font-bold text-white mb-3">{levelInfo.name}</h2>
              <LevelProgress totalExp={totalExp} showDetails />
            </div>
          </div>
        </div>

        {/* 레벨 목록 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#CCFF00]" />
            레벨 시스템
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {LEVEL_THRESHOLDS.map((threshold) => {
              const isUnlocked = totalExp >= threshold.exp;
              const isCurrent = levelInfo.level === threshold.level;
              
              return (
                <div 
                  key={threshold.level}
                  className={`p-3 rounded-xl text-center transition-all ${
                    isCurrent 
                      ? "bg-[#CCFF00]/20 border-2 border-[#CCFF00]"
                      : isUnlocked 
                        ? "bg-[#1a1a1a] border border-[#333]" 
                        : "bg-[#111] border border-[#222] opacity-50"
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center font-bold ${
                    isCurrent 
                      ? "bg-[#CCFF00] text-black" 
                      : isUnlocked 
                        ? "bg-[#333] text-[#CCFF00]" 
                        : "bg-[#222] text-gray-600"
                  }`}>
                    {threshold.level}
                  </div>
                  <p className={`text-xs font-medium ${isCurrent ? "text-[#CCFF00]" : isUnlocked ? "text-white" : "text-gray-600"}`}>
                    {threshold.name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">{threshold.exp} XP</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 뱃지 목록 */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#CCFF00]" />
            뱃지 컬렉션
            <span className="text-sm font-normal text-gray-400">
              ({achievements.length}/{allBadgeTypes.length})
            </span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allBadgeTypes.map((type) => {
              const badge = BADGE_INFO[type];
              const isUnlocked = unlockedTypes.has(type);
              const achievement = achievements.find(a => a.achievement_type === type);
              
              return (
                <div 
                  key={type}
                  className={`relative p-5 rounded-2xl text-center transition-all ${
                    isUnlocked 
                      ? "bg-[#111] border border-[#333]" 
                      : "bg-[#0d0d0d] border border-[#1a1a1a] opacity-60"
                  }`}
                >
                  {/* 뱃지 아이콘 */}
                  <div 
                    className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl ${
                      isUnlocked ? "" : "grayscale"
                    }`}
                    style={{ 
                      backgroundColor: isUnlocked ? `${badge.color}20` : "#1a1a1a",
                      boxShadow: isUnlocked ? `0 0 20px ${badge.color}30` : "none",
                    }}
                  >
                    {isUnlocked ? badge.icon : <Lock className="w-6 h-6 text-gray-600" />}
                  </div>
                  
                  {/* 뱃지 이름 */}
                  <h4 
                    className="font-semibold mb-1"
                    style={{ color: isUnlocked ? badge.color : "#666" }}
                  >
                    {badge.name}
                  </h4>
                  
                  {/* 설명 */}
                  <p className="text-xs text-gray-500">
                    {badge.description}
                  </p>
                  
                  {/* 획득 날짜 */}
                  {achievement && (
                    <p className="text-[10px] text-gray-600 mt-2">
                      {new Date(achievement.unlocked_at).toLocaleDateString('ko-KR')} 획득
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
