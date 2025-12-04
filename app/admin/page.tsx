"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Instagram } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem("admin_auth", "true");
        toast({
          title: "로그인 성공",
          description: "관리자 페이지로 이동합니다.",
        });
        router.push("/admin/dashboard");
      } else {
        toast({
          title: "로그인 실패",
          description: data.message || "아이디 또는 비밀번호를 확인해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "서버 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      {/* 배경 효과 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#111] border border-[#222] rounded-2xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#CCFF00] rounded-2xl flex items-center justify-center mx-auto mb-4 lime-glow">
              <Lock className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">관리자 로그인</h1>
            <p className="text-gray-500 text-sm">관리자 계정으로 로그인해주세요</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">아이디</label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="h-12 bg-[#0a0a0a] border-[#333] text-white placeholder-gray-600 focus:border-[#CCFF00] focus:ring-[#CCFF00]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">비밀번호</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 bg-[#0a0a0a] border-[#333] text-white placeholder-gray-600 focus:border-[#CCFF00] focus:ring-[#CCFF00]/20"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#CCFF00] text-black font-semibold hover:bg-[#b8e600] lime-glow"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
