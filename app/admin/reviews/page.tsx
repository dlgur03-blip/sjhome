"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { Review } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Star, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    setReviews(data || []);
    setIsLoading(false);
  };

  const toggleVisibility = async (review: Review) => {
    const supabase = getSupabase();
    await supabase
      .from("reviews")
      .update({ is_visible: !review.is_visible })
      .eq("id", review.id);

    toast({
      title: review.is_visible ? "후기가 비공개되었습니다" : "후기가 공개되었습니다",
    });

    fetchReviews();
  };

  const deleteReview = async (review: Review) => {
    if (!confirm("이 후기를 삭제하시겠습니까?")) return;

    const supabase = getSupabase();
    await supabase.from("reviews").delete().eq("id", review.id);

    toast({ title: "후기가 삭제되었습니다" });
    fetchReviews();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#CCFF00]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">후기 관리</h1>
          <p className="text-gray-500">
            총 {reviews.length}개 
            (공개: {reviews.filter(r => r.is_visible).length}개)
          </p>
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">등록된 후기가 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {reviews.map((review) => (
              <div key={review.id} className="p-5 hover:bg-[#1a1a1a]/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* 별점 + 상태 */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-[#CCFF00] fill-[#CCFF00]"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          review.is_visible
                            ? "bg-[#CCFF00]/20 text-[#CCFF00]"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {review.is_visible ? "공개" : "비공개"}
                      </span>
                    </div>

                    {/* 내용 */}
                    <p className="text-gray-300 mb-3 whitespace-pre-wrap">
                      {review.content}
                    </p>

                    {/* 작성자 & 날짜 */}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{review.author_name || "익명"}</span>
                      <span>•</span>
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility(review)}
                      className={`${
                        review.is_visible
                          ? "text-[#CCFF00] hover:bg-[#CCFF00]/10"
                          : "text-gray-400 hover:bg-[#222]"
                      }`}
                    >
                      {review.is_visible ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReview(review)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
