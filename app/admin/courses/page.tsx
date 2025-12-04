"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { Course } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, X } from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    is_published: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.from("courses").select("*").order("sequence", { ascending: true });
    setCourses(data || []);
    setIsLoading(false);
  };

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({ title: course.title, description: course.description || "", thumbnail_url: course.thumbnail_url || "", is_published: course.is_published });
    } else {
      setEditingCourse(null);
      setFormData({ title: "", description: "", thumbnail_url: "", is_published: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const supabase = getSupabase();

    try {
      if (editingCourse) {
        await supabase.from("courses").update(formData).eq("id", editingCourse.id);
        toast({ title: "강의가 수정되었습니다." });
      } else {
        await supabase.from("courses").insert({ ...formData, sequence: courses.length });
        toast({ title: "강의가 추가되었습니다." });
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch { toast({ title: "오류", description: "저장 실패", variant: "destructive" }); }
    setIsSaving(false);
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`"${course.title}" 강의를 삭제하시겠습니까?`)) return;
    const supabase = getSupabase();
    await supabase.from("courses").delete().eq("id", course.id);
    toast({ title: "삭제되었습니다." });
    fetchCourses();
  };

  const togglePublish = async (course: Course) => {
    const supabase = getSupabase();
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    fetchCourses();
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">강의 관리</h1>
          <p className="text-gray-500">총 {courses.length}개의 강의</p>
        </div>
        <Button onClick={() => openModal()} className="bg-[#CCFF00] text-black hover:bg-[#b8e600]">
          <Plus className="w-4 h-4 mr-2" />강의 추가
        </Button>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 강의가 없습니다</p>
            <Button onClick={() => openModal()} className="bg-[#CCFF00] text-black hover:bg-[#b8e600]">
              <Plus className="w-4 h-4 mr-2" />첫 번째 강의 추가
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#0a0a0a] border-b border-[#222]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">순서</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">제목</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 hidden md:table-cell">설명</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">상태</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {courses.map((course, index) => (
                <tr key={course.id} className="hover:bg-[#1a1a1a]">
                  <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-white">{course.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm hidden md:table-cell line-clamp-1">{course.description || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(course)} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${course.is_published ? "bg-[#CCFF00]/20 text-[#CCFF00]" : "bg-gray-800 text-gray-400"}`}>
                      {course.is_published ? <><Eye className="w-3 h-3" />공개</> : <><EyeOff className="w-3 h-3" />비공개</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(course)} className="text-gray-400 hover:text-white hover:bg-[#222]"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(course)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
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
              <h2 className="text-xl font-bold text-white">{editingCourse ? "강의 수정" : "강의 추가"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-[#222] rounded"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">제목 *</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="강의 제목" required className="bg-[#0a0a0a] border-[#333] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">설명</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="강의 설명" className="flex min-h-[80px] w-full rounded-lg border border-[#333] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-[#CCFF00] focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">썸네일 URL</label>
                <Input value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} placeholder="https://..." className="bg-[#0a0a0a] border-[#333] text-white" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="rounded bg-[#0a0a0a] border-[#333]" />
                <label htmlFor="is_published" className="text-sm text-gray-400">바로 공개</label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1 border-[#333] text-gray-400 hover:bg-[#1a1a1a]" onClick={() => setIsModalOpen(false)}>취소</Button>
                <Button type="submit" className="flex-1 bg-[#CCFF00] text-black hover:bg-[#b8e600]" disabled={isSaving || !formData.title}>{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
