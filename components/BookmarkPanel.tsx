"use client";

import { UserBookmark } from "@/types";
import { formatDuration } from "@/lib/utils";
import { Bookmark, Trash2, X } from "lucide-react";

interface BookmarkPanelProps {
  bookmarks: UserBookmark[];
  onDeleteBookmark: (bookmarkId: string) => Promise<void>;
  onSeek: (timestamp: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarkPanel({
  bookmarks,
  onDeleteBookmark,
  onSeek,
  isOpen,
  onClose,
}: BookmarkPanelProps) {
  const sortedBookmarks = [...bookmarks].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#0d0d0d] border-l border-[#222] z-40 flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          🔖 북마크
          <span className="text-xs text-gray-400 bg-[#222] px-2 py-0.5 rounded-full">
            {bookmarks.length}
          </span>
        </h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-[#222] rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 북마크 목록 */}
      <div className="flex-1 overflow-y-auto">
        {sortedBookmarks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            아직 북마크가 없습니다.<br />
            영상 하단의 🔖 버튼을 눌러<br />
            중요한 부분을 저장하세요!
          </div>
        ) : (
          <ul className="divide-y divide-[#222]">
            {sortedBookmarks.map((bookmark) => (
              <li 
                key={bookmark.id}
                className="hover:bg-[#1a1a1a] transition-colors group"
              >
                <button
                  onClick={() => onSeek(bookmark.timestamp_seconds)}
                  className="w-full p-4 text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-5 h-5 text-[#CCFF00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {bookmark.label || `북마크 ${formatDuration(bookmark.timestamp_seconds)}`}
                    </p>
                    <p className="text-xs text-[#CCFF00] font-mono">
                      {formatDuration(bookmark.timestamp_seconds)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBookmark(bookmark.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
