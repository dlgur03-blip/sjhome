"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { BookOpen, PlayCircle, Key, Users, TrendingUp, Activity } from "lucide-react";

interface DashboardStats {
  totalCourses: number;
  totalLessons: number;
  totalLicenses: number;
  activeLicenses: number;
  totalProgress: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalLessons: 0,
    totalLicenses: 0,
    activeLicenses: 0,
    totalProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const supabase = getSupabase();

    const [courses, lessons, licenses, progress] = await Promise.all([
      supabase.from("courses").select("id", { count: "exact" }),
      supabase.from("lessons").select("id", { count: "exact" }),
      supabase.from("license_keys").select("id, is_active"),
      supabase.from("user_progress").select("id", { count: "exact" }),
    ]);

    const activeLicenses = licenses.data?.filter((l: any) => l.is_active).length || 0;

    setStats({
      totalCourses: courses.count || 0,
      totalLessons: lessons.count || 0,
      totalLicenses: licenses.count || 0,
      activeLicenses,
      totalProgress: progress.count || 0,
    });

    setIsLoading(false);
  };

  const statCards = [
    {
      label: "전체 강의",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "#CCFF00",
    },
    {
      label: "전체 레슨",
      value: stats.totalLessons,
      icon: PlayCircle,
      color: "#00E676",
    },
    {
      label: "발급된 라이선스",
      value: stats.totalLicenses,
      icon: Key,
      color: "#FF6B35",
    },
    {
      label: "활성 라이선스",
      value: stats.activeLicenses,
      icon: Users,
      color: "#00BCD4",
    },
    {
      label: "총 학습 기록",
      value: stats.totalProgress,
      icon: Activity,
      color: "#E040FB",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#333] border-t-[#CCFF00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">대시보드</h1>
        <p className="text-gray-500">전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#333] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 빠른 액션 */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">빠른 액션</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a 
            href="/admin/courses"
            className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#CCFF00]/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#CCFF00]" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-[#CCFF00] transition-colors">강의 추가</p>
              <p className="text-xs text-gray-500">새로운 강의 만들기</p>
            </div>
          </a>
          
          <a 
            href="/admin/lessons"
            className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#00E676]/20 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-[#00E676]" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-[#00E676] transition-colors">레슨 추가</p>
              <p className="text-xs text-gray-500">영상 콘텐츠 등록</p>
            </div>
          </a>
          
          <a 
            href="/admin/licenses"
            className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="font-medium text-white group-hover:text-[#FF6B35] transition-colors">라이선스 발급</p>
              <p className="text-xs text-gray-500">새 라이선스 키 생성</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
