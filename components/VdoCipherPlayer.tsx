"use client";

import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";

interface VdoCipherPlayerProps {
  videoId: string;
  licenseKey?: string;
  onEnded?: () => void;
  onTimeUpdate?: (seconds: number) => void;
  onReady?: () => void;
}

export interface VdoCipherPlayerRef {
  getCurrentTime: () => number;
}

const VdoCipherPlayer = forwardRef<VdoCipherPlayerRef, VdoCipherPlayerProps>(({
  videoId,
  licenseKey,
  onEnded,
  onTimeUpdate,
  onReady,
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentTimeRef = useRef(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);
  const [playbackInfo, setPlaybackInfo] = useState<string | null>(null);

  // 외부에서 현재 시간 가져오기
  useImperativeHandle(ref, () => ({
    getCurrentTime: () => currentTimeRef.current,
  }));

  // OTP 발급
  useEffect(() => {
    const fetchOTP = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/vdocipher/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, licenseKey }),
        });

        const result = await response.json();

        if (result.success) {
          setOtp(result.data.otp);
          setPlaybackInfo(result.data.playbackInfo);
          setIsLoading(false);
          onReady?.();
        } else {
          setError(result.message || "영상을 불러올 수 없습니다.");
          setIsLoading(false);
        }
      } catch (err) {
        setError("영상을 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchOTP();
    }
  }, [videoId, licenseKey]);

  // VdoCipher 메시지 수신 (시간 업데이트)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // VdoCipher에서 오는 메시지만 처리
      if (!event.origin.includes("player.vdocipher.com")) return;

      const data = event.data;
      
      if (typeof data === "object" && data !== null) {
        // 시간 업데이트
        if (data.currentTime !== undefined) {
          const time = Math.floor(data.currentTime);
          currentTimeRef.current = time;
          onTimeUpdate?.(time);
        }
        
        // ended 이벤트
        if (data.event === "ended") {
          onEnded?.();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onTimeUpdate, onEnded]);

  // 1초마다 시간 요청
  useEffect(() => {
    if (!otp || !playbackInfo) return;

    const interval = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { action: "getCurrentTime" },
          "https://player.vdocipher.com"
        );
      }
    }, 500);

    return () => clearInterval(interval);
  }, [otp, playbackInfo]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-400 hover:text-[#CCFF00] underline"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !otp || !playbackInfo) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#333] border-t-[#CCFF00] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black">
      <iframe
        ref={iframeRef}
        src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}&api=1`}
        style={{ width: "100%", height: "100%", border: 0 }}
        allow="encrypted-media"
        allowFullScreen
      />
    </div>
  );
});

VdoCipherPlayer.displayName = "VdoCipherPlayer";

export default VdoCipherPlayer;