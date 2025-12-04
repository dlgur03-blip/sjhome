"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import { getSessionLicense } from "@/lib/device";
import { getRemainingDays } from "@/lib/license";
import { Course, Lesson, UserProgress } from "@/types";
import { formatDuration } from "@/lib/utils";
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Instagram,
  Star,
  Award
} from "lucide-react";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Map<string, Lesson[]>>(new Map());
  const [progress, setProgress] = useState<Map<string, UserProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState<number>(0);

  useEffect(() => {
    const { key, expires } = getSessionLicense();

    if (!key) {
      router.push("/login");
      return;
    }

    if (expires) {
      setRemainingDays(getRemainingDays(expires));
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    const supabase = getSupabase();
    const { key } = getSessionLicense();

    // 공개된 강의 가져오기
    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("sequence", { ascending: true });

    if (coursesData) {
      setCourses(coursesData);

      // 각 강의의 레슨 가져오기
      const lessonsMap = new Map<string, Lesson[]>();
      for (const course of coursesData) {
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", course.id)
          .order("sequence", { ascending: true });

        if (lessonsData) {
          lessonsMap.set(course.id, lessonsData);
        }
      }
      setLessons(lessonsMap);
    }

    // 진도율 가져오기
    const { data: licenseData } = await supabase
      .from("license_keys")
      .select("id")
      .eq("key", key)
      .single();

    if (licenseData) {
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("license_key_id", licenseData.id);

      if (progressData) {
        const progressMap = new Map<string, UserProgress>();
        progressData.forEach((p) => {
          progressMap.set(p.lesson_id, p);
        });
        setProgress(progressMap);
      }
    }

    setIsLoading(false);
  };

  const getProgressPercent = (courseId: string) => {
    const courseLessons = lessons.get(courseId) || [];
    if (courseLessons.length === 0) return 0;

    const completedCount = courseLessons.filter(
      (l) => progress.get(l.id)?.is_completed
    ).length;

    return Math.round((completedCount / courseLessons.length) * 100);
  };

  const getTotalDuration = (courseId: string) => {
    const courseLessons = lessons.get(courseId) || [];
    return courseLessons.reduce((acc, l) => acc + l.duration, 0);
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    sessionStorage.removeItem("license_key");
    sessionStorage.removeItem("license_expires");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#333] border-t-[#CCFF00] animate-spin" />
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Instagram className="w-6 h-6 text-[#CCFF00]" />
            <span className="font-bold text-white">릴스 클래스</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3" />
              <span>{remainingDays}일 남음</span>
            </div>
            <button
              onClick={() => router.push("/reviews")}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#CCFF00] bg-[#1a1a1a] px-3 py-1.5 rounded-full transition-colors"
            >
              <Star className="w-3 h-3" />
              <span>후기</span>
            </button>
            <button
              onClick={() => router.push("/badges")}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#CCFF00] bg-[#1a1a1a] px-3 py-1.5 rounded-full transition-colors"
            >
              <Award className="w-3 h-3" />
              <span>뱃지</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">내 강의</h1>
        <p className="text-gray-400 mb-8">수강 중인 강의 목록입니다.</p>

        {/* 강의 목록 */}
        <div className="space-y-6">
          {courses.map((course) => {
            const courseLessons = lessons.get(course.id) || [];
            const progressPercent = getProgressPercent(course.id);
            const totalDuration = getTotalDuration(course.id);

            return (
              <div
                key={course.id}
                className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden hover:border-[#333] transition-colors"
              >
                {/* 썸네일 */}
                <div className="relative aspect-video bg-[#1a1a1a]">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-[#333]" />
                    </div>
                  )}
                  
                  {/* 진도율 오버레이 */}
                  {progressPercent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#333]">
                      <div
                        className="h-full bg-[#CCFF00]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}

                  {/* 완료 배지 */}
                  {progressPercent === 100 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#CCFF00] text-black px-2 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      완료
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-white mb-2">
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        {courseLessons.length}개 강의
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(totalDuration)}
                      </span>
                      <span className="text-[#CCFF00]">
                        {progressPercent}% 완료
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="px-4 py-2 bg-[#CCFF00] text-black text-sm font-medium rounded-lg hover:bg-[#b8e600] transition-colors"
                    >
                      {progressPercent > 0 ? "이어보기" : "시작하기"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">수강 중인 강의가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}