"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Clock, LogOut } from "lucide-react";

interface HeaderProps {
  remainingDays?: number;
  onLogout?: () => void;
}

export default function Header({ remainingDays, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/courses" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">LMS</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/courses" 
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              강의 목록
            </Link>
            
            {remainingDays !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className={remainingDays <= 7 ? "text-red-500 font-medium" : "text-slate-600"}>
                  남은 기간: {remainingDays}일
                </span>
              </div>
            )}

            {onLogout && (
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/courses" 
                className="text-slate-600 hover:text-slate-900 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                강의 목록
              </Link>
              
              {remainingDays !== undefined && (
                <div className="flex items-center gap-2 text-sm py-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className={remainingDays <= 7 ? "text-red-500 font-medium" : "text-slate-600"}>
                    남은 기간: {remainingDays}일
                  </span>
                </div>
              )}

              {onLogout && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
