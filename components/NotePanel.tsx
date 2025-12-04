"use client";

import { useState } from "react";
import { UserNote } from "@/types";
import { formatDuration } from "@/lib/utils";
import { Plus, Trash2, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotePanelProps {
  notes: UserNote[];
  currentTime: number;
  onAddNote: (content: string, timestamp: number) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onSeek: (timestamp: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotePanel({
  notes,
  onAddNote,
  onDeleteNote,
  isOpen,
  onClose,
}: NotePanelProps) {
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAdding(true);
    const min = parseInt(minutes) || 0;
    const sec = parseInt(seconds) || 0;
    const timestamp = (min * 60) + sec;
    
    await onAddNote(newNote.trim(), timestamp);
    setNewNote("");
    setMinutes("");
    setSeconds("");
    setIsAdding(false);
  };

  const sortedNotes = [...notes].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#0d0d0d] border-l border-[#222] z-40 flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-[#222] flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          📝 메모
          <span className="text-xs text-gray-400 bg-[#222] px-2 py-0.5 rounded-full">
            {notes.length}
          </span>
        </h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-[#222] rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 메모 입력 */}
      <div className="p-4 border-b border-[#222]">
        {/* 시간 입력 */}
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#CCFF00]" />
          <span className="text-sm text-gray-400">시간:</span>
          <input
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-12 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-[#CCFF00]"
            placeholder="분"
          />
          <span className="text-gray-400">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            className="w-12 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-[#CCFF00]"
            placeholder="초"
          />
        </div>
        <p className="text-xs text-gray-500 mb-2">💡 영상에 표시된 시간을 입력하세요</p>
        
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="이 시점에 메모 남기기..."
          className="w-full h-20 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#CCFF00] transition-colors"
        />
        <Button
          onClick={handleAddNote}
          disabled={isAdding || !newNote.trim()}
          className="w-full mt-2 bg-[#CCFF00] text-black hover:bg-[#b8e600] disabled:opacity-50"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          메모 추가
        </Button>
      </div>

      {/* 메모 목록 */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            아직 메모가 없습니다.<br />
            영상을 보면서 메모를 남겨보세요!
          </div>
        ) : (
          <ul className="divide-y divide-[#222]">
            {sortedNotes.map((note) => (
              <li 
                key={note.id}
                className="p-4 hover:bg-[#1a1a1a] transition-colors group"
              >
                <div className="w-full text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#CCFF00] font-mono">
                      {formatDuration(note.timestamp_seconds)}
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}