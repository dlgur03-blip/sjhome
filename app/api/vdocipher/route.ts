import { NextRequest, NextResponse } from "next/server";
import { generateVdoCipherOTP, getVdoCipherVideoInfo } from "@/lib/vdocipher";

// OTP 발급 (영상 재생용)
export async function POST(request: NextRequest) {
  try {
    const { videoId, licenseKey } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { success: false, message: "Video ID가 필요합니다." },
        { status: 400 }
      );
    }

    // OTP 발급
    const otpData = await generateVdoCipherOTP(videoId, { 
      watermark: licenseKey ? licenseKey.substring(0, 9) : undefined 
    });

    if (!otpData) {
      return NextResponse.json(
        { success: false, message: "OTP 발급에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: otpData,
    });
  } catch (error) {
    console.error("VdoCipher OTP API 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 영상 정보 조회
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
      { success: false, message: "영상 정보를 가져올 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: videoInfo,
  });
}