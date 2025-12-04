"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getSessionLicense } from "@/lib/device";
import { Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Star, Loader2, CheckCircle, Instagram } from "lucide-react";

export default function ReviewsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [licenseKeyId, setLicenseKeyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const { key } = getSessionLicense();
    if (!key) {
      router.push("/login");
      return;
    }
    fetchData(key);
  }, [router]);

  const fetchData = async (licenseKey: string) => {
    const supabase = getSupabase();

    // 라이선스 확인
    const { data: licenseData } = await supabase
      .from("license_keys")
      .select("id")
      .eq("key", licenseKey)
      .single();

    if (!licenseData) {
      router.push("/login");
      return;
    }

    setLicenseKeyId(licenseData.id);

    // 기존 후기 확인
    const { data: reviewData } = await supabase
      .from("reviews")
      .select("*")
      .eq("license_key_id", licenseData.id)
      .single();

    if (reviewData) {
      setExistingReview(reviewData);
      setRating(reviewData.rating);
      setContent(reviewData.content);
      setAuthorName(reviewData.author_name || "");
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({ title: "후기 내용을 입력해주세요", variant: "destructive" });
      return;
    }

    if (content.length < 10) {
      toast({ title: "후기는 10자 이상 작성해주세요", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const supabase = getSupabase();

    try {
      if (existingReview) {
        // 수정
        await supabase
          .from("reviews")
          .update({
            rating,
            content: content.trim(),
            author_name: authorName.trim() || null,
            is_visible: false, // 수정 시 재승인 필요
          })
          .eq("id", existingReview.id);

        toast({ title: "후기가 수정되었습니다", description: "관리자 승인 후 표시됩니다." });
      } else {
        // 새로 작성
        await supabase
          .from("reviews")
          .insert({
            license_key_id: licenseKeyId,
            rating,
            content: content.trim(),
            author_name: authorName.trim() || null,
            is_visible: false,
          });

        toast({ title: "후기가 등록되었습니다", description: "관리자 승인 후 표시됩니다." });
      }

      router.push("/courses");
    } catch (error) {
      toast({ title: "오류가 발생했습니다", variant: "destructive" });
    }

    setIsSubmitting(false);
  };

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
      </div>

      {/* 헤더 */}
      <header className="relative z-10 bg-[#0d0d0d]/80 backdrop-blur-xl border-b border-[#1a1a1a] sticky top-0">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">돌아가기</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#CCFF00] rounded-lg flex items-center justify-center">
              <Instagram className="w-4 h-4 text-black" />
            </div>
            <span className="font-semibold text-white">후기 작성</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {existingReview ? "후기 수정하기" : "수강 후기 남기기"}
            </h1>
            <p className="text-gray-500 text-sm">
              솔직한 후기를 남겨주세요. 다른 분들께 큰 도움이 됩니다!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 별점 */}
            <div className="text-center">
              <label className="text-sm font-medium text-gray-400 mb-3 block">만족도</label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? "text-[#CCFF00] fill-[#CCFF00]"
                          : "text-gray-600"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-[#CCFF00] mt-2">
                {rating === 5 && "최고예요! 🔥"}
                {rating === 4 && "좋아요! 👍"}
                {rating === 3 && "괜찮아요"}
                {rating === 2 && "아쉬워요"}
                {rating === 1 && "별로예요"}
              </p>
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                후기 내용 <span className="text-[#CCFF00]">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="강의를 듣고 느낀 점, 좋았던 점, 아쉬웠던 점 등을 자유롭게 작성해주세요."
                className="w-full h-40 px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#CCFF00] focus:outline-none resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>최소 10자</span>
                <span>{content.length}/500</span>
              </div>
            </div>

            {/* 작성자 이름 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                표시될 이름 <span className="text-gray-600">(선택)</span>
              </label>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="비워두면 '익명'으로 표시됩니다"
                className="bg-[#0a0a0a] border-[#333] text-white placeholder-gray-600 focus:border-[#CCFF00]"
                maxLength={20}
              />
            </div>

            {/* 안내 */}
            <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-400">
                  <p className="text-[#CCFF00] font-medium mb-1">작성 안내</p>
                  <ul className="space-y-1">
                    <li>• 후기는 관리자 승인 후 랜딩 페이지에 표시됩니다</li>
                    <li>• 부적절한 내용은 비공개 처리될 수 있습니다</li>
                    <li>• 1인 1후기만 작성 가능합니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <Button
              type="submit"
              disabled={isSubmitting || content.length < 10}
              className="w-full h-14 text-lg bg-[#CCFF00] text-black hover:bg-[#b8e600] lime-glow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  제출 중...
                </>
              ) : existingReview ? (
                "후기 수정하기"
              ) : (
                "후기 등록하기"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
