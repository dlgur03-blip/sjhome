"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { Course, Lesson } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, X, Play, Download, CheckCircle, Shield } from "lucide-react";

export default function AdminLessonsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({ title: "", video_id: "", duration: 0, is_free: false });
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [infoFetched, setInfoFetched] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchLessons(); }, [selectedCourse]);

  const fetchCourses = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.from("courses").select("*").order("sequence");
    setCourses(data || []);
    if (data && data.length > 0) setSelectedCourse(data[0].id);
    setIsLoading(false);
  };

  const fetchLessons = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.from("lessons").select("*").eq("course_id", selectedCourse).order("sequence");
    setLessons(data || []);
  };

  const openModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({ 
        title: lesson.title, 
        video_id: lesson.video_id, 
        duration: lesson.duration, 
        is_free: lesson.is_free,
      });
      setInfoFetched(true);
    } else {
      setEditingLesson(null);
      setFormData({ title: "", video_id: "", duration: 0, is_free: false });
      setInfoFetched(false);
    }
    setIsModalOpen(true);
  };

  // VdoCipher API에서 영상 정보 가져오기
  const fetchVideoInfo = async () => {
    if (!formData.video_id) {
      toast({ title: "Video ID를 입력해주세요", variant: "destructive" });
      return;
    }

    setIsFetching(true);

    try {
      const response = await fetch(`/api/vdocipher/info?id=${encodeURIComponent(formData.video_id)}`);
      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          title: prev.title || result.data.title,
          duration: result.data.duration,
        }));
        setInfoFetched(true);
        toast({ title: "✅ 영상 정보를 가져왔습니다!" });
      } else {
        toast({ title: "오류", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "오류", description: "영상 정보를 가져오는데 실패했습니다.", variant: "destructive" });
    }

    setIsFetching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const supabase = getSupabase();

    try {
      if (editingLesson) {
        await supabase.from("lessons").update({
          title: formData.title,
          video_id: formData.video_id,
          duration: formData.duration,
          is_free: formData.is_free,
        }).eq("id", editingLesson.id);
        toast({ title: "레슨이 수정되었습니다." });
      } else {
        await supabase.from("lessons").insert({ 
          title: formData.title,
          video_id: formData.video_id,
          duration: formData.duration,
          is_free: formData.is_free,
          course_id: selectedCourse, 
          sequence: lessons.length 
        });
        toast({ title: "레슨이 추가되었습니다." });
      }
      setIsModalOpen(false);
      fetchLessons();
    } catch { toast({ title: "오류", variant: "destructive" }); }
    setIsSaving(false);
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`"${lesson.title}" 레슨을 삭제하시겠습니까?`)) return;
    const supabase = getSupabase();
    await supabase.from("lessons").delete().eq("id", lesson.id);
    toast({ title: "삭제되었습니다." });
    fetchLessons();
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">레슨 관리</h1>
          <p className="text-gray-500">총 {lessons.length}개의 레슨</p>
        </div>
        <Button onClick={() => openModal()} className="bg-[#CCFF00] text-black hover:bg-[#b8e600]" disabled={!selectedCourse}>
          <Plus className="w-4 h-4 mr-2" />레슨 추가
        </Button>
      </div>

      {/* VdoCipher 안내 */}
      <div className="mb-6 p-4 bg-[#111] border border-[#333] rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#CCFF00] mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">VdoCipher DRM 보호</p>
          <p className="text-xs text-gray-500 mt-1">
            영상은 VdoCipher에 업로드 후 Video ID를 입력하세요.
            <a href="https://www.vdocipher.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] ml-1 hover:underline">
              VdoCipher 대시보드 →
            </a>
          </p>
        </div>
      </div>

      {/* 강의 선택 */}
      <div className="mb-6">
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full md:w-64 h-10 px-3 bg-[#111] border border-[#333] text-white rounded-lg focus:border-[#CCFF00] focus:outline-none">
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 레슨이 없습니다</p>
            <Button onClick={() => openModal()} className="bg-[#CCFF00] text-black hover:bg-[#b8e600]">
              <Plus className="w-4 h-4 mr-2" />첫 번째 레슨 추가
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#0a0a0a] border-b border-[#222]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">순서</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">제목</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Video ID</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">시간</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">무료</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {lessons.map((lesson, index) => (
                <tr key={lesson.id} className="hover:bg-[#1a1a1a]">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-[#CCFF00]" />
                      <span className="font-medium text-white">{lesson.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm hidden md:table-cell font-mono">{lesson.video_id.substring(0, 16)}...</td>
                  <td className="px-4 py-3 text-center text-gray-400 text-sm">{formatDuration(lesson.duration)}</td>
                  <td className="px-4 py-3 text-center">
                    {lesson.is_free && <span className="px-2 py-1 bg-[#CCFF00]/20 text-[#CCFF00] text-xs rounded-full">무료</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(lesson)} className="text-gray-400 hover:text-white hover:bg-[#222]"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(lesson)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-[#111] border border-[#222] rounded-2xl">
            <div className="p-6 border-b border-[#222] flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingLesson ? "레슨 수정" : "레슨 추가"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-[#222] rounded"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* VdoCipher Video ID 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">VdoCipher Video ID *</label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.video_id} 
                    onChange={(e) => {
                      setFormData({ ...formData, video_id: e.target.value });
                      setInfoFetched(false);
                    }} 
                    placeholder="abc123xyz..." 
                    required 
                    className="bg-[#0a0a0a] border-[#333] text-white font-mono flex-1" 
                  />
                  <Button 
                    type="button" 
                    onClick={fetchVideoInfo}
                    disabled={isFetching || !formData.video_id}
                    className={`px-4 ${infoFetched ? 'bg-green-600 hover:bg-green-700' : 'bg-[#333] hover:bg-[#444]'} text-white`}
                  >
                    {isFetching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : infoFetched ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">
                  {infoFetched ? (
                    <span className="text-green-500">✅ 영상 정보가 자동으로 입력되었습니다</span>
                  ) : (
                    "VdoCipher 대시보드에서 Video ID를 복사해 붙여넣으세요"
                  )}
                </p>
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">제목 *</label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  placeholder="레슨 제목" 
                  required 
                  className="bg-[#0a0a0a] border-[#333] text-white" 
                />
              </div>

              {/* 영상 길이 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">
                  영상 길이 
                  {formData.duration > 0 && (
                    <span className="ml-2 text-[#CCFF00]">({formatDuration(formData.duration)})</span>
                  )}
                </label>
                <Input 
                  type="number" 
                  value={formData.duration} 
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })} 
                  placeholder="300" 
                  className="bg-[#0a0a0a] border-[#333] text-white" 
                />
                <p className="text-xs text-gray-600">초 단위 (VdoCipher에서 자동으로 가져옵니다)</p>
              </div>

              {/* 무료 공개 */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_free" 
                  checked={formData.is_free} 
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })} 
                  className="rounded" 
                />
                <label htmlFor="is_free" className="text-sm text-gray-400">무료 공개 (라이선스 없이 시청 가능)</label>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-[#333] text-gray-400 hover:bg-[#1a1a1a]" 
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#CCFF00] text-black hover:bg-[#b8e600]" 
                  disabled={isSaving || !formData.title || !formData.video_id}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
