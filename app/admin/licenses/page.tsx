"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabase } from "@/lib/supabase";
import { LicenseKey } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, Trash2, Loader2, X, Key, Check, Ban } from "lucide-react";

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<LicenseKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ validDays: 30, memo: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchLicenses(); }, []);

  const fetchLicenses = async () => {
    const supabase = getSupabase();
    const { data } = await supabase.from("license_keys").select("*").order("created_at", { ascending: false });
    setLicenses(data || []);
    setIsLoading(false);
  };

  const generateKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = "";
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) key += "-";
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const supabase = getSupabase();

    const newKey = generateKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + formData.validDays);

    try {
      await supabase.from("license_keys").insert({
        key: newKey,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        memo: formData.memo || null,
      });
      toast({ title: "라이선스가 생성되었습니다." });
      setIsModalOpen(false);
      setFormData({ validDays: 30, memo: "" });
      fetchLicenses();
    } catch { toast({ title: "오류", variant: "destructive" }); }
    setIsSaving(false);
  };

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "복사되었습니다!" });
  };

  const toggleActive = async (license: LicenseKey) => {
    const supabase = getSupabase();
    await supabase.from("license_keys").update({ is_active: !license.is_active }).eq("id", license.id);
    fetchLicenses();
  };

  const handleDelete = async (license: LicenseKey) => {
    if (!confirm("이 라이선스를 삭제하시겠습니까?")) return;
    const supabase = getSupabase();
    await supabase.from("license_keys").delete().eq("id", license.id);
    toast({ title: "삭제되었습니다." });
    fetchLicenses();
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("ko-KR");
  const isExpired = (date: string) => new Date(date) < new Date();

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">라이선스 관리</h1>
          <p className="text-gray-500">총 {licenses.length}개의 라이선스</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#CCFF00] text-black hover:bg-[#b8e600]">
          <Plus className="w-4 h-4 mr-2" />라이선스 발급
        </Button>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {licenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">발급된 라이선스가 없습니다</p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#CCFF00] text-black hover:bg-[#b8e600]">
              <Plus className="w-4 h-4 mr-2" />첫 번째 라이선스 발급
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#222]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">라이선스 키</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">상태</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-400 hidden md:table-cell">만료일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 hidden lg:table-cell">메모</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {licenses.map((license) => (
                  <tr key={license.id} className="hover:bg-[#1a1a1a]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#CCFF00]" />
                        <code className="font-mono text-sm text-white">{license.key}</code>
                        <button onClick={() => handleCopy(license.key, license.id)} className="p-1 hover:bg-[#222] rounded">
                          {copiedId === license.id ? <Check className="w-4 h-4 text-[#CCFF00]" /> : <Copy className="w-4 h-4 text-gray-500" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isExpired(license.expires_at) ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">만료됨</span>
                      ) : license.is_active ? (
                        <span className="px-2 py-1 bg-[#CCFF00]/20 text-[#CCFF00] text-xs rounded-full">활성</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">비활성</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400 text-sm hidden md:table-cell">{formatDate(license.expires_at)}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm hidden lg:table-cell">{license.memo || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(license)} className="text-gray-400 hover:text-white hover:bg-[#222]">
                          {license.is_active ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(license)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md mx-4 bg-[#111] border border-[#222] rounded-2xl">
            <div className="p-6 border-b border-[#222] flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">라이선스 발급</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-[#222] rounded"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">유효 기간</label>
                <select value={formData.validDays} onChange={(e) => setFormData({ ...formData, validDays: parseInt(e.target.value) })} className="w-full h-10 px-3 bg-[#0a0a0a] border border-[#333] text-white rounded-lg focus:border-[#CCFF00] focus:outline-none">
                  <option value={7}>7일</option>
                  <option value={30}>30일</option>
                  <option value={90}>90일</option>
                  <option value={180}>180일</option>
                  <option value={365}>365일</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">메모 (선택)</label>
                <Input value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} placeholder="구매자 이름 등" className="bg-[#0a0a0a] border-[#333] text-white" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1 border-[#333] text-gray-400 hover:bg-[#1a1a1a]" onClick={() => setIsModalOpen(false)}>취소</Button>
                <Button type="submit" className="flex-1 bg-[#CCFF00] text-black hover:bg-[#b8e600]" disabled={isSaving}>{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "발급하기"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
