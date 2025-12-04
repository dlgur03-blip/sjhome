"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
import { getSessionLicense } from "@/lib/device";
import { getRemainingDays } from "@/lib/license";
import { Lesson, Course, UserProgress, UserNote, UserStreak, AchievementType, BADGE_INFO } from "@/types";
import { formatDuration } from "@/lib/utils";
import VdoCipherPlayer from "@/components/VdoCipherPlayer";
import Confetti from "@/components/Confetti";
import BadgeUnlockModal from "@/components/BadgeUnlockModal";
import LevelProgress from "@/components/LevelProgress";
import StreakDisplay from "@/components/StreakDisplay";
import NotePanel from "@/components/NotePanel";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  List,
  X,
  Heart,
  MessageSquare,
  Clock
} from "lucide-react";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Map<string, UserProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [licenseKeyId, setLicenseKeyId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<AchievementType | null>(null);
  const [totalExp, setTotalExp] = useState(0);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [notes, setNotes] = useState<UserNote[]>([]);

  useEffect(() => {
    const { key, expires } = getSessionLicense();

    if (!key) {
      router.push("/");
      return;
    }

    if (expires) {
      setRemainingDays(getRemainingDays(expires));
    }

    fetchLessonData();
  }, [lessonId, router]);

  const fetchLessonData = async () => {
    const supabase = getSupabase();
    const { key } = getSessionLicense();

    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lessonData) {
      router.push("/courses");
      return;
    }

    setLesson(lessonData);

    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", lessonData.course_id)
      .single();

    if (courseData) {
      setCourse(courseData);
    }

    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", lessonData.course_id)
      .order("sequence", { ascending: true });

    if (lessonsData) {
      setAllLessons(lessonsData);
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
        setIsCompleted(progressMap.get(lessonId)?.is_completed || false);
        
        const completedCount = progressData.filter(p => p.is_completed).length;
        setTotalExp(completedCount * 50);
      }

      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("license_key_id", licenseData.id)
        .single();

      if (streakData) {
        setStreak(streakData);
      }

      const { data: notesData } = await supabase
        .from("user_notes")
        .select("*")
        .eq("license_key_id", licenseData.id)
        .eq("lesson_id", lessonId)
        .order("timestamp_seconds", { ascending: true });

      if (notesData) {
        setNotes(notesData);
      }
    }

    setIsLoading(false);
  };

  const updateStreak = async () => {
    if (!licenseKeyId) return;
    
    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    if (streak) {
      const lastStudy = streak.last_study_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastStudy === today) return;

      let newStreak = 1;
      if (lastStudy === yesterdayStr) {
        newStreak = streak.current_streak + 1;
      }

      const { error } = await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_study_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("id", streak.id);

      if (!error) {
        setStreak({
          ...streak,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_study_date: today,
        });

        if (newStreak === 3) checkAndUnlockBadge('streak_3');
        if (newStreak === 7) checkAndUnlockBadge('streak_7');
        if (newStreak === 30) checkAndUnlockBadge('streak_30');
      }
    } else {
      const { data, error } = await supabase
        .from("user_streaks")
        .insert({
          license_key_id: licenseKeyId,
          current_streak: 1,
          longest_streak: 1,
          last_study_date: today,
        })
        .select()
        .single();

      if (!error && data) {
        setStreak(data);
      }
    }
  };

  const checkAndUnlockBadge = async (type: AchievementType) => {
    if (!licenseKeyId) return;

    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("license_key_id", licenseKeyId)
      .eq("achievement_type", type)
      .single();

    if (existing) return;

    const { error } = await supabase
      .from("user_achievements")
      .insert({
        license_key_id: licenseKeyId,
        achievement_type: type,
        achievement_data: {},
      });

    if (!error) {
      setUnlockedBadge(type);
      toast({
        title: `🎉 ${BADGE_INFO[type].icon} 뱃지 획득!`,
        description: BADGE_INFO[type].name,
      });
    }
  };

  const handleVideoEnd = async () => {
    if (!licenseKeyId || isCompleted) return;

    const supabase = getSupabase();

    const { error } = await supabase
      .from("user_progress")
      .upsert({
        license_key_id: licenseKeyId,
        lesson_id: lessonId,
        is_completed: true,
        watch_seconds: lesson?.duration || 0,
        last_watched_at: new Date().toISOString(),
      }, {
        onConflict: "license_key_id,lesson_id",
      });

    if (!error) {
      setIsCompleted(true);
      setShowConfetti(true);
      setTotalExp(prev => prev + 50);

      // progress Map 업데이트
      setProgress(prev => {
        const newMap = new Map(prev);
        newMap.set(lessonId, {
          id: '',
          license_key_id: licenseKeyId,
          lesson_id: lessonId,
          is_completed: true,
          watch_seconds: lesson?.duration || 0,
          last_watched_at: new Date().toISOString(),
        });
        return newMap;
      });

      await updateStreak();

      if (progress.size === 0) {
        await checkAndUnlockBadge('first_lesson');
      }

      const hour = new Date().getHours();
      if (hour >= 0 && hour < 6) {
        await checkAndUnlockBadge('night_owl');
      } else if (hour >= 4 && hour < 7) {
        await checkAndUnlockBadge('early_bird');
      }

      toast({
        title: "🎉 강의 완료!",
        description: "+50 XP 획득",
      });
    }
  };

  const handleTimeUpdate = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const handleAddNote = async (content: string, timestamp: number) => {
    if (!licenseKeyId) return;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("user_notes")
      .insert({
        license_key_id: licenseKeyId,
        lesson_id: lessonId,
        content,
        timestamp_seconds: timestamp,
      })
      .select()
      .single();

    if (!error && data) {
      setNotes(prev => [...prev, data]);
      toast({ title: "📝 메모가 저장되었습니다" });

      if (notes.length + 1 >= 10) {
        await checkAndUnlockBadge('note_taker');
      }
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("user_notes")
      .delete()
      .eq("id", noteId);

    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
  };

  const handleSeek = (timestamp: number) => {
    toast({ title: `${formatDuration(timestamp)} 위치로 이동하세요` });
  };

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const completedCount = Array.from(progress.values()).filter(p => p.is_completed).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  if (isLoading || !lesson) {
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
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <BadgeUnlockModal achievementType={unlockedBadge} onClose={() => setUnlockedBadge(null)} />

      <header className="bg-[#0d0d0d] border-b border-[#1a1a1a] sticky top-0 z-30">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push(`/courses/${course?.id}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:block text-sm truncate max-w-[200px]">{course?.title}</span>
          </button>

          <div className="hidden md:flex items-center gap-4">
            <LevelProgress totalExp={totalExp} />
            {streak && <StreakDisplay currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-[#1a1a1a] px-3 py-1.5 rounded-full">
              <Clock className="w-3 h-3" />
              <span>{remainingDays}일 남음</span>
            </div>
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
              onClick={() => setShowSidebar(true)}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="relative bg-black video-container">
            <div className="aspect-video max-h-[70vh]">
              <VdoCipherPlayer
                videoId={lesson.video_id}
                licenseKey={getSessionLicense().key || undefined}
                onEnded={handleVideoEnd}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>

            {isCompleted && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#CCFF00] text-black px-3 py-1.5 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                완료
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsLiked(!isLiked)} className="group">
                <Heart className={`w-6 h-6 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 group-hover:text-white'}`} />
              </button>

              <button 
                onClick={() => setShowNotePanel(!showNotePanel)}
                className="relative"
              >
                <MessageSquare className={`w-6 h-6 transition-colors ${showNotePanel ? 'text-[#CCFF00]' : 'text-gray-400 hover:text-white'}`} />
                {notes.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#CCFF00] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notes.length}
                  </span>
                )}
              </button>

              {!isCompleted && (
                <button 
                  onClick={handleVideoEnd}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#CCFF00] hover:text-black text-gray-400 rounded-full text-sm transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>완료</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="md:hidden mb-4 p-3 bg-[#111] rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <LevelProgress totalExp={totalExp} />
              </div>
              {streak && <StreakDisplay currentStreak={streak.current_streak} longestStreak={streak.longest_streak} />}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{lesson.title}</h1>
            
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
              <span>{currentIndex + 1} / {allLessons.length}</span>
              <span>·</span>
              <span>{formatDuration(lesson.duration)}</span>
              {lesson.is_free && (
                <>
                  <span>·</span>
                  <span className="text-[#CCFF00]">무료</span>
                </>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">전체 진도율</span>
                <span className="text-[#CCFF00] font-medium">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#CCFF00] to-[#88cc00] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 bg-[#1a1a1a] border-[#333] text-white hover:bg-[#222] hover:border-[#CCFF00] transition-all"
                disabled={!prevLesson}
                onClick={() => prevLesson && router.push(`/watch/${prevLesson.id}`)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                이전 강의
              </Button>
              <Button
                className="flex-1 h-12 bg-[#CCFF00] text-black hover:bg-[#b8e600] font-medium transition-all"
                disabled={!nextLesson}
                onClick={() => nextLesson && router.push(`/watch/${nextLesson.id}`)}
              >
                다음 강의
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-80 bg-[#0d0d0d] border-l border-[#1a1a1a] overflow-y-auto">
          <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
            <h2 className="font-semibold text-white">커리큘럼</h2>
            <span className="text-xs text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-1 rounded-full">
              {completedCount}/{allLessons.length} 완료
            </span>
          </div>
          <ul>
            {allLessons.map((l, index) => {
              const lessonProgress = progress.get(l.id);
              const completed = lessonProgress?.is_completed;
              const isCurrent = l.id === lessonId;

              return (
                <li key={l.id}>
                  <button
                    className={`w-full flex items-center gap-3 p-4 text-left transition-all ${
                      isCurrent ? "bg-[#CCFF00]/10 border-l-2 border-[#CCFF00]" : "hover:bg-[#1a1a1a] border-l-2 border-transparent"
                    }`}
                    onClick={() => router.push(`/watch/${l.id}`)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium ${
                      completed ? "bg-[#CCFF00]/20 text-[#CCFF00]" : isCurrent ? "bg-[#CCFF00] text-black" : "bg-[#222] text-gray-400"
                    }`}>
                      {completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isCurrent ? "text-[#CCFF00] font-medium" : completed ? "text-gray-500" : "text-gray-300"}`}>
                        {l.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDuration(l.duration)}</p>
                    </div>
                    {l.is_free && (
                      <span className="text-[10px] text-[#CCFF00] bg-[#CCFF00]/10 px-1.5 py-0.5 rounded">무료</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {showSidebar && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0d0d0d] overflow-y-auto">
              <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
                <h2 className="font-semibold text-white">커리큘럼</h2>
                <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-[#1a1a1a] rounded">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <ul>
                {allLessons.map((l, index) => {
                  const lessonProgress = progress.get(l.id);
                  const completed = lessonProgress?.is_completed;
                  const isCurrent = l.id === lessonId;

                  return (
                    <li key={l.id}>
                      <button
                        className={`w-full flex items-center gap-3 p-4 text-left transition-all ${
                          isCurrent ? "bg-[#CCFF00]/10 border-l-2 border-[#CCFF00]" : "hover:bg-[#1a1a1a] border-l-2 border-transparent"
                        }`}
                        onClick={() => { router.push(`/watch/${l.id}`); setShowSidebar(false); }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium ${
                          completed ? "bg-[#CCFF00]/20 text-[#CCFF00]" : isCurrent ? "bg-[#CCFF00] text-black" : "bg-[#222] text-gray-400"
                        }`}>
                          {completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isCurrent ? "text-[#CCFF00] font-medium" : completed ? "text-gray-500" : "text-gray-300"}`}>
                            {l.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDuration(l.duration)}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <NotePanel
          notes={notes}
          currentTime={currentTime}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onSeek={handleSeek}
          isOpen={showNotePanel}
          onClose={() => setShowNotePanel(false)}
        />
      </div>
    </div>
  );
}