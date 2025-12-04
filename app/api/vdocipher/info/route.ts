import { NextRequest, NextResponse } from "next/server";
import { getVdoCipherVideoInfo } from "@/lib/vdocipher";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get("id");

  if (!videoId) {
    return NextResponse.json(
      { success: false, message: "Video ID가 필요합니다." },
      { status: 400 }
    );
  }

  const videoInfo = await getVdoCipherVideoInfo(videoId);

  if (!videoInfo) {
    return NextResponse.json(
      { success: false, message: "영상 정보를 가져올 수 없습니다. Video ID를 확인해주세요." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: videoInfo,
  });
}
