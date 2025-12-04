"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { Review } from "@/types";
import { 
  Instagram, 
  Play, 
  Star, 
  CheckCircle, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Clock,
  ChevronRight,
  Zap,
  Target,
  Award,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ lessons: 0, duration: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = getSupabase();

    // 승인된 후기 가져오기
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (reviewsData) setReviews(reviewsData);

    // 강의 통계
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("duration");

    if (lessonsData) {
      const totalDuration = lessonsData.reduce((acc, l) => acc + (l.duration || 0), 0);
      setStats({
        lessons: lessonsData.length,
        duration: Math.floor(totalDuration / 60),
      });
    }
  };

  const curriculum = [
    { title: "챕터 1: 릴스의 기본 원리", lessons: ["알고리즘 완벽 이해", "도달률을 높이는 핵심 원리", "100만뷰 영상의 공통점"] },
    { title: "챕터 2: 후킹의 기술", lessons: ["1초 안에 사로잡는 법", "스크롤을 멈추게 하는 패턴", "호기심 유발 공식"] },
    { title: "챕터 3: 콘텐츠 제작", lessons: ["촬영부터 편집까지", "트렌드 활용법", "나만의 스타일 찾기"] },
    { title: "챕터 4: 성장 전략", lessons: ["팔로워 0명에서 시작하기", "바이럴 만드는 법", "수익화 전략"] },
  ];

  const features = [
    { icon: Zap, title: "즉시 적용 가능", desc: "배우면 바로 써먹는 실전 노하우" },
    { icon: Target, title: "검증된 공식", desc: "100만뷰 달성 공식 그대로" },
    { icon: Award, title: "평생 소장", desc: "한 번 구매로 평생 수강" },
    { icon: Clock, title: "무제한 복습", desc: "언제든 다시 볼 수 있는 강의" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* 배경 효과 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#CCFF00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      {/* 헤더 */}
      <header className="relative z-20 px-4 py-4 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CCFF00] rounded-xl flex items-center justify-center">
              <Instagram className="w-6 h-6 text-black" />
            </div>
            <span className="font-bold text-white text-lg">릴스 마스터</span>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              로그인
            </Link>
            <Link href="#pricing">
              <Button className="bg-[#CCFF00] text-black hover:bg-[#b8e600] text-sm h-9">
                수강 신청
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#CCFF00]/10 border border-[#CCFF00]/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-sm text-[#CCFF00]">팔로워 0명도 가능한 검증된 공식</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            릴스 하나로<br />
            <span className="text-[#CCFF00]">인생을 바꾸세요</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            100만뷰 달성 공식을 그대로 알려드립니다.<br className="hidden md:block" />
            N잡러, 사업가, 마케터라면 지금 시작하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="#pricing">
              <Button className="h-14 px-8 text-lg bg-[#CCFF00] text-black hover:bg-[#b8e600] lime-glow">
                지금 시작하기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#curriculum">
              <Button variant="outline" className="h-14 px-8 text-lg border-[#333] text-white hover:bg-[#111]">
                커리큘럼 보기
              </Button>
            </Link>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#CCFF00] mb-1">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">100만+</span>
              </div>
              <p className="text-sm text-gray-500">누적 조회수</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#CCFF00] mb-1">
                <Users className="w-5 h-5" />
                <span className="text-2xl font-bold">500+</span>
              </div>
              <p className="text-sm text-gray-500">수강생</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#CCFF00] mb-1">
                <Star className="w-5 h-5" />
                <span className="text-2xl font-bold">4.9</span>
              </div>
              <p className="text-sm text-gray-500">평점</p>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="relative z-10 px-4 py-20 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">왜 릴스 마스터인가요?</h2>
            <p className="text-gray-400">다른 강의와 차별화되는 포인트</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-[#111] border border-[#222] rounded-2xl p-6 text-center hover:border-[#CCFF00]/50 transition-colors"
              >
                <div className="w-12 h-12 bg-[#CCFF00]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-[#CCFF00]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이런 분들께 추천 */}
      <section className="relative z-10 px-4 py-20 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">이런 분들께 추천드려요</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              "팔로워가 없어서 시작을 못하고 있는 분",
              "릴스를 올려도 조회수가 안 나오는 분",
              "인스타로 수익을 만들고 싶은 분",
              "사업 홍보를 위해 릴스를 배우고 싶은 분",
              "N잡러로 부수입을 만들고 싶은 분",
              "마케팅 실력을 키우고 싶은 분",
            ].map((text, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 bg-[#111] border border-[#222] rounded-xl p-4"
              >
                <CheckCircle className="w-5 h-5 text-[#CCFF00] flex-shrink-0" />
                <span className="text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 커리큘럼 */}
      <section id="curriculum" className="relative z-10 px-4 py-20 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">커리큘럼</h2>
            <p className="text-gray-400">
              총 <span className="text-[#CCFF00]">{stats.lessons}개</span> 강의, 
              약 <span className="text-[#CCFF00]">{stats.duration}분</span> 분량
            </p>
          </div>

          <div className="space-y-4">
            {curriculum.map((chapter, i) => (
              <div 
                key={i}
                className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden"
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#CCFF00] rounded-lg flex items-center justify-center text-black font-bold">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-white">{chapter.title}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{chapter.lessons.length}강</span>
                </div>
                <div className="px-5 pb-5">
                  <div className="pl-14 space-y-2">
                    {chapter.lessons.map((lesson, j) => (
                      <div key={j} className="flex items-center gap-2 text-gray-400 text-sm">
                        <Play className="w-3 h-3" />
                        <span>{lesson}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 후기 섹션 */}
      <section className="relative z-10 px-4 py-20 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">수강생 후기</h2>
            <p className="text-gray-400">실제 수강생들의 솔직한 후기</p>
          </div>

          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <div 
                  key={review.id}
                  className="bg-[#111] border border-[#222] rounded-2xl p-6"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "text-[#CCFF00] fill-[#CCFF00]" : "text-gray-600"}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-4">{review.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {review.author_name || "익명"}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">아직 후기가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* 가격 섹션 */}
      <section id="pricing" className="relative z-10 px-4 py-20 border-t border-[#1a1a1a]">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">수강 신청</h2>
            <p className="text-gray-400">지금 시작하세요</p>
          </div>

          <div className="bg-gradient-to-b from-[#CCFF00]/10 to-transparent border-2 border-[#CCFF00]/50 rounded-3xl p-8 text-center">
            <div className="inline-flex items-center gap-2 bg-[#CCFF00] rounded-full px-4 py-1 mb-6">
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">BEST</span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">릴스 마스터 풀패키지</h3>
            <p className="text-gray-400 mb-6">전체 강의 + 평생 소장</p>

            <div className="mb-6">
              <span className="text-gray-500 line-through text-lg">199,000원</span>
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-bold text-[#CCFF00]">99,000</span>
                <span className="text-xl text-gray-400 mb-2">원</span>
              </div>
            </div>

            <ul className="text-left space-y-3 mb-8">
              {[
                `전체 ${stats.lessons}개 강의`,
                "평생 무제한 수강",
                "업데이트 강의 무료 제공",
                "메모 & 북마크 기능",
                "수료증 발급",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#CCFF00]" />
                  {item}
                </li>
              ))}
            </ul>

            <Link href="https://your-payment-link.com" target="_blank">
              <Button className="w-full h-14 text-lg bg-[#CCFF00] text-black hover:bg-[#b8e600] lime-glow">
                지금 구매하기
                <ChevronRight className="ml-1 w-5 h-5" />
              </Button>
            </Link>

            <p className="text-xs text-gray-500 mt-4">
              결제 후 라이선스 키가 이메일로 발송됩니다
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-4 py-20 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">자주 묻는 질문</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "강의는 어떻게 수강하나요?", a: "결제 후 이메일로 라이선스 키가 발송됩니다. 로그인 페이지에서 키를 입력하시면 바로 수강 가능합니다." },
              { q: "수강 기간이 있나요?", a: "아니요! 한 번 구매하시면 평생 무제한으로 수강하실 수 있습니다." },
              { q: "환불이 가능한가요?", a: "수강 시작 후 7일 이내, 진도율 20% 미만인 경우 전액 환불 가능합니다." },
              { q: "모바일에서도 볼 수 있나요?", a: "네! PC, 모바일, 태블릿 어디서든 수강 가능합니다." },
            ].map((faq, i) => (
              <div 
                key={i}
                className="bg-[#111] border border-[#222] rounded-2xl p-6"
              >
                <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 py-20 border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            더 이상 미루지 마세요
          </h2>
          <p className="text-gray-400 mb-8">
            지금 시작하면 한 달 뒤, 당신의 인스타그램은 완전히 달라져 있을 거예요.
          </p>
          <Link href="#pricing">
            <Button className="h-14 px-10 text-lg bg-[#CCFF00] text-black hover:bg-[#b8e600] lime-glow">
              지금 시작하기
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="relative z-10 px-4 py-8 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#CCFF00] rounded-lg flex items-center justify-center">
                <Instagram className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-white">릴스 마스터</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-white transition-colors">문의하기</a>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-gray-600">
            © 2025 릴스 마스터. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
