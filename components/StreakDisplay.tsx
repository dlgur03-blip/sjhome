"use client";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#E040FB';
    if (streak >= 7) return '#FFD700';
    if (streak >= 3) return '#FF6B35';
    return '#CCFF00';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '👑';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '🔥';
    return '✨';
  };

  return (
    <div className="flex items-center gap-4">
      {/* 현재 스트릭 */}
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
        style={{ 
          borderColor: getStreakColor(currentStreak),
          backgroundColor: `${getStreakColor(currentStreak)}15`,
        }}
      >
        <span className={`text-lg ${currentStreak > 0 ? 'flame' : ''}`}>
          {getStreakEmoji(currentStreak)}
        </span>
        <span 
          className="font-bold text-sm"
          style={{ color: getStreakColor(currentStreak) }}
        >
          {currentStreak}일
        </span>
        <span className="text-gray-400 text-xs">연속</span>
      </div>

      {/* 최장 스트릭 */}
      {longestStreak > currentStreak && (
        <div className="text-gray-500 text-xs">
          최고 기록: {longestStreak}일
        </div>
      )}
    </div>
  );
}
