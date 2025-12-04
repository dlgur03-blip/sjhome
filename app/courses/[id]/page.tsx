"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getSessionLicense } from "@/lib/device";
import { getRemainingDays } from "@/lib/license";
import { Course, Lesson, UserProgress } from "@/types";
import { formatDuration } from "@/lib/utils";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  Lock,
  Instagram,
  BookOpen,
  Award
} from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Map<string, UserProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [licenseKeyId, setLicenseKeyId] = useState<string | null>(null);

  useEffect(() => {
    const { key, expires } = getSessionLicense();

    if (!key) {
      router.push("/");
      return;
    }

    if (expires) {
      setRemainingDays(getRemainingDays(expires));
    }

    fetchCourseData();
  }, [courseId, router]);

  const fetchCourseData = async () => {
    const supabase = getSupabase();
    const { key } = getSessionLicense();

    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError || !courseData) {
      router.push("/courses");
      return;
    }

    setCourse(courseData);

    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sequence", { ascending: true });

    if (lessonsData) {
      setLessons(lessonsData);
    }

    const { data: licenseData } = await supabase
      .from("license_keys")
      .select("id")
      .eq("key", key)
      .single();

    if (licenseData) {
      setLicenseKeyId(licenseData.id);

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

  const calculateTotalDuration = () => {
    return lessons.reduce((acc, lesson) => acc + lesson.duration, 0);
  };

  const calculateProgress = () => {
    if (lessons.length === 0) return 0;
    const completed = lessons.filter((l) => progress.get(l.id)?.is_completed).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const getNextLesson = () => {
    return lessons.find(l => !progress.get(l.id)?.is_completed) || lessons[0];
  };

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#333] border-t-[#CCFF00] animate-spin" />
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  const completedCount = lessons.filter(l => progress.get(l.id)?.is_completed).length;
  const progressPercent = calculateProgress();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* 배경 효과 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[150px]" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-[#1a1a1a] sticky top-0">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">강의 목록</span>
          </button>

          <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>{remainingDays}일 남음</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 강의 정보 */}
          <div className="lg:col-span-2">
            {/* 썸네일 */}
            <div className="relative aspect-video bg-[#111] rounded-2xl overflow-hidden mb-6 border border-[#222]">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Instagram className="w-20 h-20 text-[#333]" />
                </div>
              )}
              
              {/* 재생 버튼 */}
              <button 
                onClick={() => {
                  const next = getNextLesson();
                  if (next) router.push(`/watch/${next.id}`);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="w-20 h-20 rounded-full bg-[#CCFF00] flex items-center justify-center lime-glow">
                  <Play className="w-8 h-8 text-black ml-1" />
                </div>
              </button>
            </div>
            
            {/* 제목 */}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {course.title}
            </h1>
            
            <p className="text-gray-400 leading-relaxed mb-6">
              {course.description || "강의 설명이 없습니다"}
            </p>

            {/* 통계 */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-gray-400">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">{lessons.length}개 강의</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDuration(calculateTotalDuration())}</span>
              </div>
              <div className="flex items-center gap-2 text-[#CCFF00]">
                <Award className="w-4 h-4" />
                <span className="text-sm">{completedCount}/{lessons.length} 완료</span>
              </div>
            </div>

            {/* 커리큘럼 */}
            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-[#222] flex items-center justify-between">
                <h2 className="font-semibold text-white">커리큘럼</h2>
                <span className="text-sm text-[#CCFF00]">{progressPercent}% 완료</span>
              </div>

              {lessons.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  아직 등록된 강의가 없습니다
                </div>
              ) : (
                <ul className="divide-y divide-[#1a1a1a]">
                  {lessons.map((lesson, index) => {
                    const lessonProgress = progress.get(lesson.id);
                    const isCompleted = lessonProgress?.is_completed;

                    return (
                      <li key={lesson.id}>
                        <button
                          className="w-full flex items-center gap-4 p-4 hover:bg-[#1a1a1a] transition-colors text-left group"
                          onClick={() => router.push(`/watch/${lesson.id}`)}
                        >
                          {/* 번호 또는 체크 */}
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-medium
                            ${isCompleted 
                              ? "bg-[#CCFF00]/20 text-[#CCFF00]" 
                              : "bg-[#222] text-gray-400 group-hover:bg-[#CCFF00] group-hover:text-black"}
                            transition-colors
                          `}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>

                          {/* 제목 */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium truncate ${
                              isCompleted ? "text-gray-500" : "text-white group-hover:text-[#CCFF00]"
                            } transition-colors`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(lesson.duration)}
                              </span>
                              {lesson.is_free && (
                                <span className="text-xs bg-[#CCFF00]/10 text-[#CCFF00] px-2 py-0.5 rounded-full">
                                  무료
                                </span>
                              )}
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#CCFF00] group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] border border-[#222] rounded-2xl p-6 sticky top-20">
              <h3 className="font-semibold text-white mb-4">학습 현황</h3>
              
              {/* 진도율 */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">진도율</span>
                  <span className="text-[#CCFF00] font-medium">{progressPercent}%</span>
                </div>
                <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88cc00] rounded-full transition-all duration-500 progress-glow"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 정보 */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-[#222]">
                  <span className="text-gray-400 text-sm">완료한 강의</span>
                  <span className="text-white font-medium">{completedCount}개</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#222]">
                  <span className="text-gray-400 text-sm">남은 강의</span>
                  <span className="text-white font-medium">{lessons.length - completedCount}개</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400 text-sm">총 시간</span>
                  <span className="text-white font-medium">{formatDuration(calculateTotalDuration())}</span>
                </div>
              </div>

              {/* 시작 버튼 */}
              {lessons.length > 0 && (
                <Button 
                  className="w-full h-12 bg-[#CCFF00] text-black hover:bg-[#b8e600] font-medium lime-glow"
                  onClick={() => {
                    const next = getNextLesson();
                    if (next) router.push(`/watch/${next.id}`);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {progressPercent > 0 ? "이어서 보기" : "학습 시작하기"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
