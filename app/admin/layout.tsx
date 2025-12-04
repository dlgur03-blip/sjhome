"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  BookOpen, 
  PlayCircle, 
  Key, 
  LogOut,
  Menu,
  X,
  Instagram,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/courses", icon: BookOpen, label: "강의 관리" },
  { href: "/admin/lessons", icon: PlayCircle, label: "레슨 관리" },
  { href: "/admin/licenses", icon: Key, label: "라이선스 관리" },
  { href: "/admin/reviews", icon: MessageSquare, label: "후기 관리" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // 로그인 페이지가 아닌 경우에만 인증 체크
    if (pathname === "/admin") {
      setIsLoading(false);
      return;
    }

    const adminAuth = sessionStorage.getItem("admin_auth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
    } else {
      router.push("/admin");
    }
    setIsLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin");
  };

  // 로그인 페이지는 레이아웃 없이 렌더링
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#333] border-t-[#CCFF00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* 모바일 헤더 */}
      <div className="lg:hidden bg-[#0d0d0d] border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-[#1a1a1a] rounded-lg text-gray-400"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-white">관리자</span>
        <div className="w-10" />
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] z-50
        transform transition-transform lg:transform-none
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#CCFF00] rounded-xl flex items-center justify-center">
              <Instagram className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-white">관리자</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-[#1a1a1a] rounded text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive 
                    ? "bg-[#CCFF00] text-black font-medium" 
                    : "text-gray-400 hover:bg-[#1a1a1a] hover:text-white"}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1a1a1a]">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent border-[#333] text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#CCFF00]"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
