import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 보호된 경로들
const protectedRoutes = ["/courses", "/watch"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 관리자 페이지는 클라이언트에서 처리 (sessionStorage 사용)
  // 여기서는 추가 서버사이드 보호가 필요한 경우 처리

  // API 경로 보호 (필요시)
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
    // 추후 JWT 토큰 검증 등 추가 가능
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
